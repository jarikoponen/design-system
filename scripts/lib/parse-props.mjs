// Parsa en komponentfil och extrahera dess Props-interface med JSDoc-kommentarer.
// Använder ts-morph.

import { Node, SyntaxKind } from 'ts-morph';

/** Extract JSDoc description text. */
function extractJsDoc(propertyOrMember) {
	const jsDocs = propertyOrMember.getJsDocs?.() ?? [];
	const lines = [];
	for (const doc of jsDocs) {
		const text = doc.getDescription?.()?.trim() || doc.getComment?.()?.trim() || '';
		if (text) lines.push(text);
		// @default tag
		for (const tag of doc.getTags?.() ?? []) {
			if (tag.getTagName() === 'default') {
				lines.push(`@default ${tag.getCommentText()?.trim() ?? ''}`);
			}
		}
	}
	// If no JSDoc was found, harvest only the IMMEDIATELY preceding /* */ comment.
	// This avoids picking up unrelated comments earlier in the file (e.g. commented-out lines).
	if (lines.length === 0) {
		const ranges = propertyOrMember.getLeadingCommentRanges?.() ?? [];
		const last = ranges[ranges.length - 1];
		if (last) {
			const text = last.getText();
			if (!/^\/\*\*/.test(text)) {
				const cleaned = text
					.replace(/^\/\/\s*/, '')
					.replace(/^\/\*+\s*/, '')
					.replace(/\s*\*+\/$/, '')
					.trim();
				if (cleaned && !/^[a-zA-Z]+\??:\s/.test(cleaned)) lines.push(cleaned);
			}
		}
	}
	return lines.join(' ').trim();
}

/** Get the type text for a property signature, normalized. */
function getTypeText(prop) {
	const typeNode = prop.getTypeNode?.();
	if (!typeNode) return 'any';
	return typeNode.getText().replace(/\s+/g, ' ').trim();
}

/** Find an exported interface or type alias by name in a source file. */
function findExportedType(sourceFile, name) {
	for (const iface of sourceFile.getInterfaces()) {
		if (iface.isExported() && iface.getName() === name) return iface;
	}
	for (const ta of sourceFile.getTypeAliases()) {
		if (ta.isExported() && ta.getName() === name) return ta;
	}
	return null;
}

/**
 * Parse a component file and return an array of props.
 * Returns { props: [{ name, type, optional, jsDoc }], propsInterfaceName }
 */
export function parsePropsFromFile(project, filePath, interfaceName) {
	const sourceFile = project.addSourceFileAtPath(filePath);
	const iface = findExportedType(sourceFile, interfaceName);
	if (!iface) return { props: [], propsInterfaceName: interfaceName };

	const props = [];

	if (Node.isInterfaceDeclaration(iface)) {
		for (const member of iface.getMembers()) {
			if (Node.isPropertySignature(member)) {
				props.push({
					name: member.getName().replace(/^['"]|['"]$/g, ''),
					type: getTypeText(member),
					optional: member.hasQuestionToken(),
					jsDoc: extractJsDoc(member),
				});
			}
		}
	}
	// Type aliases: only handle if they alias a type literal { ... }
	if (Node.isTypeAliasDeclaration(iface)) {
		const typeNode = iface.getTypeNode();
		if (typeNode && Node.isTypeLiteral(typeNode)) {
			for (const member of typeNode.getMembers()) {
				if (Node.isPropertySignature(member)) {
					props.push({
						name: member.getName().replace(/^['"]|['"]$/g, ''),
						type: getTypeText(member),
						optional: member.hasQuestionToken(),
						jsDoc: extractJsDoc(member),
					});
				}
			}
		}
	}

	return { props, propsInterfaceName: interfaceName };
}
