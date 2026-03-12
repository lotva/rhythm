import { defineConfig, presetMini } from 'unocss'

export default defineConfig({
	presets: [
		presetMini({
			preflight: 'on-demand',
		}),
	],

	theme: {
		colors: {
			rule: 'var(--color__rule)',
		},
	},

	rules: [
		[
			/^(min-[wh]|max-[wh]|size|basis|[pmwh]|gap|inset|top|right|bottom|left|start|end)(?:-?([trblxyse]|bs|be))?-(\d*\.?\d+)g(r)?$/,
			(match) => {
				const [, property, directive, multiplier, isRelative] = match

				const gapVariableName = isRelative ? '--gap--relative' : '--gap'
				const value = `calc(var(${gapVariableName}) * ${multiplier})`

				const basePropertyMap: Record<string, string> = {
					p: 'padding',
					m: 'margin',
					w: 'width',
					h: 'height',
					'min-w': 'min-width',
					'max-w': 'max-width',
					'min-h': 'min-height',
					'max-h': 'max-height',
					basis: 'flex-basis',
					gap: 'gap',
					inset: 'inset',
					top: 'top',
					right: 'right',
					bottom: 'bottom',
					left: 'left',
					start: 'inset-inline-start',
					end: 'inset-inline-end',
				}

				const base = basePropertyMap[property]

				if (property === 'gap') {
					if (directive === 'x') return { 'column-gap': value }
					if (directive === 'y') return { 'row-gap': value }
					if (!directive) return { gap: value }
					return
				}

				if (property === 'size') {
					return directive ? undefined : { width: value, height: value }
				}

				if (directive && !['p', 'm', 'inset'].includes(property)) return

				if (
					property === 'inset' &&
					directive &&
					['t', 'r', 'b', 'l'].includes(directive)
				)
					return

				if (!base) return

				const directiveMap: Record<string, string[]> = {
					'': [base],
					t: [`${base}-top`],
					r: [`${base}-right`],
					b: [`${base}-bottom`],
					l: [`${base}-left`],
					s: [`${base}-inline-start`],
					e: [`${base}-inline-end`],
					bs: [`${base}-block-start`],
					be: [`${base}-block-end`],
					x: [`${base}-inline-start`, `${base}-inline-end`],
					y: [`${base}-block-start`, `${base}-block-end`],
				}

				const properties = directiveMap[directive ?? '']
				if (!properties) return

				return Object.fromEntries(properties.map((p) => [p, value]))
			},
		],
	],
})
