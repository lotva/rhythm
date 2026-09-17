# Install Rhythm

## Detect the project

Check manifests and configuration rather than relying on filenames alone:

- PostCSS: `postcss`, `postcss-load-config`, or a `postcss.config.*` file.
- UnoCSS: `unocss`, `@unocss/*`, `uno.config.*`, or a framework plugin registration.
- Tailwind CSS: `tailwindcss`, `@tailwindcss/*`, or an imported Tailwind stylesheet.

Confirm that the detected tool is active in the build before changing it.

## Global CSS

Copy `assets/spacing.css` to the project's global style directory and import it exactly once. If the project uses cascade layers, place Rhythm primitives in the token/foundation layer. Keep `text-box` out of component-scoped CSS.

`text-box` is a progressive enhancement with a visible geometry effect. Check the project's browser policy before applying it globally. If unsupported browsers matter, explain the fallback and offer the X-Size approach documented at https://rhythm.lotva.ru; do not fetch or install it automatically.

## PostCSS

Install `postcss-functions` as a development dependency with the repository's package manager if it is missing. Copy the helper matching the repository's module system, then merge this plugin into the existing plugin list:

```js
require('postcss-functions')({
	functions: { gap, gapRelative },
})
```

For ESM configs, import `postcss-functions` and the `.mjs` helpers instead. Preserve plugin order. Put function expansion before plugins that need to inspect the resulting `calc()` values.

Usage:

```css
.card {
	padding: gap(2);
	margin-block-start: gapRelative(1);
}
```

## UnoCSS

Copy or adapt `assets/uno-rhythm-rule.ts`, import `rhythmRule`, and append it to the existing `rules` array. If the config is small, the tuple may be inserted directly. The syntax includes:

- spacing: `p-1g`, `mt-2.5g`, `gap-x-1g`, `mbs-2gr`
- dimensions: `w-20g`, `min-w-12g`, `max-w-40g`, `min-h-8g`, `max-h-30g`, `size-4g`, `basis-12g`
- positioning: `inset-x-1g`, `top-2g`, `start-1g`, `end-1gr`
- UnoCSS negative variants: `-m-0.5g`, `-start-1g`

Do not parse or calculate the leading negative prefix in the custom rule; UnoCSS handles it automatically as a variant. Do not allow directional suffixes on dimensions, `basis`, `top`, `right`, `bottom`, `left`, `start`, or `end`. Support logical `inset-s/e/bs/be/x/y`, but reject redundant physical `inset-t/r/b/l`; use `top/right/bottom/left` instead. Preserve all existing config keys.

## Tailwind CSS v4

Prefer named Rhythm values so existing numeric utilities retain their meaning:

```css
@theme {
	--spacing-0\.5g: calc(var(--gap) * 0.5);
	--spacing-0\.75g: calc(var(--gap) * 0.75);
	--spacing-1g: var(--gap);
	--spacing-1\.5g: calc(var(--gap) * 1.5);
	--spacing-2g: calc(var(--gap) * 2);
	--spacing-3g: calc(var(--gap) * 3);
	--spacing-4g: calc(var(--gap) * 4);
	--spacing-1gr: var(--gap--relative);
}
```

Use `--spacing: var(--gap)` only when the user deliberately wants every numeric spacing utility to change. Verify the exact custom-key escaping against the installed Tailwind version; if dotted token names are awkward, use integer aliases such as `05g` and document them.
