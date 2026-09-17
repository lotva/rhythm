#!/usr/bin/env node

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { extname, resolve } from 'node:path'

const args = process.argv.slice(2)
let scopeArgument = '.'
let format = 'table'
for (let index = 0; index < args.length; index += 1) {
	if (args[index] === '--format') {
		format = args[index + 1] ?? 'table'
		index += 1
	} else if (args[index].startsWith('--')) {
		throw new Error(`Unknown option: ${args[index]}`)
	} else {
		scopeArgument = args[index]
	}
}
if (!['table', 'json'].includes(format)) {
	throw new Error('--format must be table or json')
}
const scope = resolve(scopeArgument)
const extensions = new Set([
	'.css',
	'.pcss',
	'.scss',
	'.sass',
	'.less',
	'.vue',
	'.svelte',
	'.astro',
	'.jsx',
	'.tsx',
	'.js',
	'.ts',
])
const ignored = new Set([
	'.git',
	'node_modules',
	'dist',
	'build',
	'.next',
	'.nuxt',
	'.svelte-kit',
	'coverage',
])
const property = String.raw`(?:margin|padding)(?:-(?:top|right|bottom|left|block(?:-(?:start|end))?|inline(?:-(?:start|end))?))?|(?:row-|column-)?gap|inset(?:-(?:block|inline)(?:-(?:start|end))?)?|top|right|bottom|left`
const declaration = new RegExp(
	String.raw`(?<![-\w])(${property})\s*:\s*([^;}{]+)`,
	'gi',
)
const dimension =
	/-?(?:\d*\.)?\d+(?:px|r?em|lh|rlh|ex|rex|ch|vw|vh|vmin|vmax|%)/gi

function filesAt(path) {
	const stat = statSync(path)
	if (stat.isFile()) return extensions.has(extname(path)) ? [path] : []
	return readdirSync(path, { withFileTypes: true }).flatMap((entry) => {
		if (ignored.has(entry.name)) return []
		return filesAt(resolve(path, entry.name))
	})
}

const rows = []
for (const file of filesAt(scope)) {
	const source = readFileSync(file, 'utf8')
	for (const match of source.matchAll(declaration)) {
		const values = match[2].match(dimension)
		if (!values) continue
		const line = source.slice(0, match.index).split('\n').length
		rows.push({
			file,
			line,
			property: match[1],
			value: match[2].trim(),
			dimensions: values,
		})
	}
}

if (format === 'json') {
	console.log(JSON.stringify(rows, null, 2))
} else {
	console.table(
		rows.map((row) => ({
			location: `${row.file}:${row.line}`,
			property: row.property,
			value: row.value,
			dimensions: row.dimensions.join(', '),
		})),
	)
}
