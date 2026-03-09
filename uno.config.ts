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
			/^(p|m|w|h|gap)(t|r|b|l|x|y|s|e|bs|be)?-([\d.]+)g(r)?$/,
			(match) => {
				const [, property, directive, n, relative] = match

				const gapProperty = relative ? '--gap--relative' : '--gap'
				const value = `calc(var(${gapProperty}) * ${n})`

				const baseMap = {
					p: 'padding',
					m: 'margin',
					w: 'width',
					h: 'height',
					gap: 'gap',
				} as const

				const base = baseMap[property as keyof typeof baseMap]
				if (!base) return

				const directiveMap: Record<string, string[]> = {
					'': [base],
					t: [`${base}-top`],
					r: [`${base}-right`],
					b: [`${base}-bottom`],
					l: [`${base}-left`],
					x:
						property === 'gap'
							? [base]
							: [`${base}-inline-start`, `${base}-inline-end`],
					y:
						property === 'gap'
							? [base]
							: [`${base}-block-start`, `${base}-block-end`],
					s: [`${base}-inline-start`],
					e: [`${base}-inline-end`],
					bs: [`${base}-block-start`],
					be: [`${base}-block-end`],
				}

				const properties = directiveMap[directive ?? '']
				if (!properties) return

				return Object.fromEntries(properties.map((p) => [p, value]))
			},
		],
	],
})
