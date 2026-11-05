function getCodeText(pre: HTMLElement) {
	const code = pre.querySelector('code')
	return (code?.textContent ?? pre.textContent ?? '').replace(/\n$/, '')
}

function bindButton(button: HTMLButtonElement) {
	const copyLabel = button.dataset.copyLabel ?? 'Copy'
	const copiedLabel = button.dataset.copiedLabel ?? 'Copied'

	let resetTimer: ReturnType<typeof setTimeout> | undefined

	button.addEventListener('click', async () => {
		const pre = button.closest('.copy-code')?.querySelector('pre')
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
		.querySelectorAll<HTMLButtonElement>(
			'.copy-code-button:not([data-copy-bound])',
		)
		.forEach((button) => {
			button.dataset.copyBound = ''
			bindButton(button)
		})
}

enhance()
document.addEventListener('astro:page-load', enhance)
