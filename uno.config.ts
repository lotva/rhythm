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
			/^([pmwh]|gap|inset|top|right|bottom|left)(?:-?([trblxyse]|bs|be))?-([\d.]+)g(r)?$/,
			(match) => {
				const [, property, directive, multiplier, isRelative] = match

				const gapVariableName = isRelative ? '--gap--relative' : '--gap'
				const value = `calc(var(${gapVariableName}) * ${multiplier})`

				const basePropertyMap: Record<string, string> = {
					p: 'padding',
					m: 'margin',
					w: 'width',
					h: 'height',
					gap: 'gap',
					inset: 'inset',
					top: 'top',
					right: 'right',
					bottom: 'bottom',
					left: 'left',
				}

				const base = basePropertyMap[property]
				if (!base) return

				if (property === 'gap') {
					if (directive === 'x') return { 'column-gap': value }
					if (directive === 'y') return { 'row-gap': value }
					if (!directive) return { gap: value }
					return
				}

				const coordinates = ['top', 'right', 'bottom', 'left']
				if (coordinates.includes(property)) {
					return { [base]: value }
				}

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
