import { type Config } from 'prettier'

const config: Config = {
	trailingComma: 'all',
	singleQuote: true,
	semi: false,

	htmlWhitespaceSensitivity: 'ignore',
	singleAttributePerLine: true,

	plugins: ['prettier-plugin-astro'],
	overrides: [
		{
			files: '*.astro',
			options: {
				parser: 'astro',
			},
		},
	],
}

export default config
