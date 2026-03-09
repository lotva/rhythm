export function transformCapitals(window: Window) {
	const capitals = /\p{Lu}[\p{Lu}\d]+/gu
	const { document } = window

	const SHOW_TEXT = 4 // NodeFilter.SHOW_TEXT

	const walker = document.createTreeWalker(document.body, SHOW_TEXT)

	let node

	while ((node = walker.nextNode())) {
		const text = node.nodeValue

		capitals.lastIndex = 0
		if (!text?.match(capitals)) continue

		const parent = node.parentNode

		const updatedHtml = text.replace(capitals, (match) => {
			const head = match.slice(0, -1)
			const tail = match.slice(-1)

			return `<span class="caps">${head}</span>${tail}`
		})

		const temp = document.createElement('div')
		temp.innerHTML = updatedHtml

		while (temp.firstChild) {
			parent?.insertBefore(temp.firstChild, node)
		}

		parent?.removeChild(node)
	}
}
