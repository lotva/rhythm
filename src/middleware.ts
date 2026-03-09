import { defineMiddleware } from 'astro:middleware'
import { parseHTML } from 'linkedom'
import { transformCapitals } from './transforms/capitals'

export const onRequest = defineMiddleware(async (_, next) => {
	const response = await next()
	const html = await response.text()

	const window = parseHTML(html)

	transformCapitals(window)

	const updatedHtml = window.document.toString()

	return new Response(updatedHtml, {
		status: 200,
		headers: response.headers,
	})
})
