// @ts-check
import { defineConfig } from 'astro/config'

import mdx from '@astrojs/mdx'
import typograf from 'astro-typograf'
import unocss from 'unocss/astro'

export default defineConfig({
	integrations: [
		mdx(),
		unocss(),

		process.env.NODE_ENV === 'production'
			? typograf({
					typografOptions: {
						locale: ['ru', 'en-US'],
						disableRule: ['common/space/trimLeft', 'common/space/trimRight'],
					},
				})
			: null,
	],

	vite: {
		build: {
			assetsInlineLimit: 16384,
		},
	},

	i18n: {
		locales: ['en', 'ru'],
		defaultLocale: 'en',
	},

	site: process.env.BASE_URL || undefined,

	markdown: {
		shikiConfig: {
			themes: {
				light: 'vitesse-light',
				dark: 'vitesse-dark',
			},
		},
	},
})
