/**
 * Measure the CSS ex-height ratio of a font file in a browser.
 * Pass an ArrayBuffer or a FontFace-compatible source string.
 */
export async function measureExHeight(source, options = {}) {
	if (typeof document === 'undefined' || typeof FontFace === 'undefined') {
		throw new Error(
			'measureExHeight must run in a browser with the CSS Font Loading API',
		)
	}
	if (!document.body) throw new Error('document.body is required')

	const family = `RhythmExProbe-${Date.now()}-${Math.random().toString(36).slice(2)}`
	const face = new FontFace(family, source, {
		weight: options.faceWeight ?? options.weight ?? 'normal',
		style: options.faceStyle ?? options.style ?? 'normal',
		stretch: options.faceStretch ?? options.stretch ?? 'normal',
	})

	await face.load()
	document.fonts.add(face)

	const probe = document.createElement('div')
	Object.assign(probe.style, {
		position: 'absolute',
		visibility: 'hidden',
		pointerEvents: 'none',
		inset: '0 auto auto 0',
		fontFamily: `"${family}"`,
		fontSize: options.fontSize ?? '16px',
		fontSizeAdjust: 'none',
		fontWeight: options.weight ?? '400',
		fontStyle: options.style ?? 'normal',
		fontStretch: options.stretch ?? '100%',
		fontVariationSettings: options.variationSettings ?? 'normal',
		fontOpticalSizing: options.opticalSizing ?? 'auto',
		fontSynthesis: 'none',
	})

	const emBox = document.createElement('div')
	const exBox = document.createElement('div')
	for (const box of [emBox, exBox]) {
		Object.assign(box.style, {
			boxSizing: 'content-box',
			inlineSize: '1px',
			margin: '0',
			border: '0',
			padding: '0',
		})
	}
	emBox.style.blockSize = '10em'
	exBox.style.blockSize = '10ex'
	probe.append(emBox, exBox)
	document.body.append(probe)

	try {
		const em = emBox.getBoundingClientRect().height
		const ex = exBox.getBoundingClientRect().height
		if (!(em > 0) || !(ex > 0))
			throw new Error('The browser returned an empty font probe')

		const ratio = ex / em
		const rounded = Math.round(ratio * 1000) / 1000
		return {
			ratio,
			rounded,
			css: `font-size-adjust: ex-height ${rounded};`,
		}
	} finally {
		probe.remove()
		document.fonts.delete(face)
	}
}
