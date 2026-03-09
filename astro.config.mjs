// @ts-check
import { defineConfig } from 'astro/config'

import mdx from '@astrojs/mdx'
import unocss from 'unocss/astro'

export default defineConfig({
	integrations: [mdx(), unocss()],

	markdown: {
		shikiConfig: {
			themes: {
				light: 'vitesse-light',
				dark: 'vitesse-dark',
			},
		},
	},
})
