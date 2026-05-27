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

/** Extract PropertySignature members from a typeLiteralNode or interface body. */
function membersToProps(members) {
	const props = [];
	for (const member of members) {
		if (Node.isPropertySignature(member)) {
			props.push({
				name: member.getName().replace(/^['"]|['"]$/g, ''),
				type: getTypeText(member),
				optional: member.hasQuestionToken(),
				jsDoc: extractJsDoc(member),
			});
		}
	}
	return props;
}

/** Dedupe props by name, keeping the first occurrence. */
function dedupe(props) {
	const seen = new Set();
	return props.filter((p) => (seen.has(p.name) ? false : (seen.add(p.name), true)));
}

/**
 * Resolve a type node into a list of props. Handles:
 * - Type literal { ... }
 * - Type reference (e.g. AnotherInterface) – follows into same source file
 * - Intersection type A & B – merges members from both sides
 * - Union type A | B – merges members from both sides (lossy but better than nothing)
 *
 * Returns props, possibly empty if the type can't be resolved.
 */
function resolveTypeToProps(typeNode, sourceFile, depth = 0) {
	if (!typeNode || depth > 4) return [];
	const kind = typeNode.getKind();

	if (kind === SyntaxKind.TypeLiteral) {
		return membersToProps(typeNode.getMembers());
	}

	if (kind === SyntaxKind.IntersectionType || kind === SyntaxKind.UnionType) {
		const collected = [];
		for (const part of typeNode.getTypeNodes()) {
			collected.push(...resolveTypeToProps(part, sourceFile, depth + 1));
		}
		return dedupe(collected);
	}

	if (kind === SyntaxKind.TypeReference) {
		const refName = typeNode.getTypeName().getText();
		const ref = findExportedType(sourceFile, refName) || sourceFile.getInterface(refName) || sourceFile.getTypeAlias(refName);
		if (ref) {
			if (Node.isInterfaceDeclaration(ref)) {
				const members = membersToProps(ref.getMembers());
				const extended = [];
				for (const ext of ref.getExtends()) {
					const extName = ext.getExpression().getText();
					const extRef = findExportedType(sourceFile, extName) || sourceFile.getInterface(extName);
					if (extRef && Node.isInterfaceDeclaration(extRef)) {
						extended.push(...membersToProps(extRef.getMembers()));
					}
				}
				return dedupe([...members, ...extended]);
			}
			if (Node.isTypeAliasDeclaration(ref)) {
				return resolveTypeToProps(ref.getTypeNode(), sourceFile, depth + 1);
			}
		}
	}

	return [];
}

/**
 * Parse a component file and try every candidate interface name.
 * Returns { props, propsInterfaceName } where propsInterfaceName is the one that resolved.
 */
export function parsePropsFromFile(project, filePath, candidateNames) {
	const names = Array.isArray(candidateNames) ? candidateNames : [candidateNames];
	const sourceFile = project.addSourceFileAtPath(filePath);

	for (const name of names) {
		const iface = findExportedType(sourceFile, name);
		if (!iface) continue;

		let props = [];

		if (Node.isInterfaceDeclaration(iface)) {
			props = membersToProps(iface.getMembers());
			// Follow extends clauses one level deep to pick up DefaultProps members.
			for (const ext of iface.getExtends()) {
				const extName = ext.getExpression().getText();
				const extRef = findExportedType(sourceFile, extName) || sourceFile.getInterface(extName);
				if (extRef && Node.isInterfaceDeclaration(extRef)) {
					props.push(...membersToProps(extRef.getMembers()));
				}
			}
			props = dedupe(props);
		} else if (Node.isTypeAliasDeclaration(iface)) {
			props = resolveTypeToProps(iface.getTypeNode(), sourceFile);
		}

		if (props.length) return { props, propsInterfaceName: name };
	}

	return { props: [], propsInterfaceName: names[0] };
}
