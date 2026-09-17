#!/usr/bin/env node

const args = process.argv.slice(2)
const gapIndex = args.indexOf('--gap')
if (gapIndex < 0 || !args[gapIndex + 1]) {
	console.error(
		'Usage: rhythm-scale.mjs --gap <px> [--scale 0,0.5,1,2] <spacingPx...>',
	)
	process.exit(1)
}

const gap = Number(args[gapIndex + 1])
if (!Number.isFinite(gap) || gap <= 0)
	throw new Error('--gap must be a positive number')

const scaleIndex = args.indexOf('--scale')
const scale = (
	scaleIndex >= 0 ? args[scaleIndex + 1] : '0,0.25,0.5,0.75,1,1.5,2,3,4,6,8'
)
	.split(',')
	.map(Number)
	.filter(Number.isFinite)
const consumed = new Set([gapIndex, gapIndex + 1])
if (scaleIndex >= 0) {
	consumed.add(scaleIndex)
	consumed.add(scaleIndex + 1)
}
const values = args.filter((_, index) => !consumed.has(index)).map(Number)
if (!values.length || values.some((value) => !Number.isFinite(value))) {
	throw new Error('Provide one or more numeric spacing values in pixels')
}

const rows = values.map((px) => {
	const exact = px / gap
	const snapped = scale.reduce(
		(best, value) =>
			Math.abs(value - exact) < Math.abs(best - exact) ? value : best,
		scale[0],
	)
	return {
		px,
		exact: Number(exact.toFixed(4)),
		snapped,
		renderedPx: Number((snapped * gap).toFixed(3)),
		deltaPx: Number((snapped * gap - px).toFixed(3)),
	}
})

console.table(rows)
