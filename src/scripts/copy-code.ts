function getCodeText(pre: HTMLElement) {
	const code = pre.querySelector('code')
	return (code?.textContent ?? pre.textContent ?? '').replace(/\n$/, '')
}

function bindButton(
	button: HTMLButtonElement,
	copyLabel: string,
	copiedLabel: string,
) {
	button.setAttribute('aria-label', copyLabel)

	let resetTimer: ReturnType<typeof setTimeout> | undefined

	button.addEventListener('click', async () => {
		const pre = button.closest('pre')
		if (!pre) return

		try {
			await navigator.clipboard.writeText(getCodeText(pre))
		} catch {
			return
		}

		button.dataset.copied = ''
		button.setAttribute('aria-label', copiedLabel)

		clearTimeout(resetTimer)
		resetTimer = setTimeout(() => {
			delete button.dataset.copied
			button.setAttribute('aria-label', copyLabel)
		}, 2000)
	})
}

function enhance() {
	document
		.querySelectorAll<HTMLElement>('.copy-code pre:not([data-copy-enhanced])')
		.forEach((pre) => {
			const root = pre.closest<HTMLElement>('.copy-code')
			const template = root?.querySelector<HTMLTemplateElement>(
				'.copy-code-template',
			)
			if (!root || !template) return

			const button = template.content.firstElementChild?.cloneNode(
				true,
			) as HTMLButtonElement | null
			if (!button) return

			pre.dataset.copyEnhanced = ''
			bindButton(
				button,
				root.dataset.copyLabel ?? 'Copy',
				root.dataset.copiedLabel ?? 'Copied',
			)
			pre.append(button)
		})
}

enhance()
document.addEventListener('astro:page-load', enhance)
