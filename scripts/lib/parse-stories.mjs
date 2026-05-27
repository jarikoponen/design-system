// Parsa en .stories.tsx-fil och extrahera Meta-objektet + named exports.
// Använder ts-morph för AST-walk.

import { Project, SyntaxKind, Node } from 'ts-morph';

/** Resolve a Node's literal value if it is a string/number/boolean/array literal. */
function literalToJS(node) {
	if (!node) return undefined;
	if (Node.isStringLiteral(node) || Node.isNoSubstitutionTemplateLiteral(node)) return node.getLiteralValue();
	if (Node.isNumericLiteral(node)) return Number(node.getText());
	if (Node.isTrueLiteral(node)) return true;
	if (Node.isFalseLiteral(node)) return false;
	if (node.getKind() === SyntaxKind.NullKeyword) return null;
	if (Node.isIdentifier(node) && node.getText() === 'undefined') return undefined;
	if (Node.isArrayLiteralExpression(node)) {
		return node.getElements().map((el) => literalToJS(el));
	}
	if (Node.isObjectLiteralExpression(node)) {
		const obj = {};
		for (const prop of node.getProperties()) {
			if (Node.isPropertyAssignment(prop)) {
				const key = prop.getName().replace(/^['"]|['"]$/g, '');
				obj[key] = literalToJS(prop.getInitializer());
			}
		}
		return obj;
	}
	// Fallback: return raw text (for things like function calls, JSX, etc.)
	return { __raw: node.getText() };
}

/** Find the default-exported object literal in a stories file. */
function findDefaultExportObject(sourceFile) {
	for (const stmt of sourceFile.getStatements()) {
		if (Node.isExportAssignment(stmt) && !stmt.isExportEquals()) {
			let expr = stmt.getExpression();
			// Handle: export default { ... } as Meta<typeof X>
			if (Node.isAsExpression(expr)) expr = expr.getExpression();
			// Handle: export default { ... } satisfies Meta<...>
			if (Node.isSatisfiesExpression?.(expr)) expr = expr.getExpression();
			if (Node.isObjectLiteralExpression(expr)) return expr;
		}
	}
	return null;
}

/** Parse a single .stories.tsx file. */
export function parseStoriesFile(project, filePath) {
	const sourceFile = project.addSourceFileAtPath(filePath);
	const meta = {
		title: undefined,
		component: undefined,
		tags: [],
		args: {},
		argTypes: {},
		parameters: {},
	};

	const defaultExport = findDefaultExportObject(sourceFile);
	if (defaultExport) {
		for (const prop of defaultExport.getProperties()) {
			if (!Node.isPropertyAssignment(prop)) continue;
			const key = prop.getName().replace(/^['"]|['"]$/g, '');
			const init = prop.getInitializer();
			if (!init) continue;
			if (key === 'title') meta.title = literalToJS(init);
			else if (key === 'component') meta.component = init.getText();
			else if (key === 'tags') meta.tags = literalToJS(init) || [];
			else if (key === 'args') meta.args = literalToJS(init) || {};
			else if (key === 'argTypes') meta.argTypes = literalToJS(init) || {};
			else if (key === 'parameters') meta.parameters = literalToJS(init) || {};
		}
	}

	// Named exports = story variants
	const variants = [];
	for (const decl of sourceFile.getVariableDeclarations()) {
		if (!decl.isExported()) continue;
		const name = decl.getName();
		if (name === 'default') continue;
		const init = decl.getInitializer();
		// Look for: export const X = Template.bind({}); X.args = { ... }
		// Or simpler: export const X = (args) => <Component {...args} />
		const args = {};
		// Find sibling: ExpressionStatement of `<name>.args = { ... }`
		const stmts = sourceFile.getStatements();
		for (const stmt of stmts) {
			if (Node.isExpressionStatement(stmt)) {
				const expr = stmt.getExpression();
				if (Node.isBinaryExpression(expr) && expr.getOperatorToken().getText() === '=') {
					const left = expr.getLeft();
					if (Node.isPropertyAccessExpression(left)) {
						if (left.getExpression().getText() === name && left.getName() === 'args') {
							const right = expr.getRight();
							Object.assign(args, literalToJS(right) || {});
						}
					}
				}
			}
		}
		variants.push({ name, args });
	}

	return { meta, variants, filePath };
}

/** Create a ts-morph project with permissive settings for parsing only. */
export function createProject() {
	return new Project({
		skipAddingFilesFromTsConfig: true,
		skipFileDependencyResolution: true,
		compilerOptions: {
			allowJs: true,
			jsx: 2, // Preserve
			noEmit: true,
			isolatedModules: true,
		},
	});
}
