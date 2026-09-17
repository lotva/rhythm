# Migrate spacing to Rhythm

## 1. Inventory and classify

Resolve the requested scope before editing. Inventory authored values in `margin*`, `padding*`, `gap`, `row-gap`, `column-gap`, and positional inset properties. Include framework utilities and CSS-in-JS. Exclude generated output and vendored code.

Classify each occurrence:

- layout spacing: migrate to root `--gap`;
- spacing tied to local typography: consider `--gap--relative`;
- fixed geometry or optical correction: keep unchanged;
- unknown or state-dependent: measure before deciding.

Run the audit helper when appropriate:

```sh
node path/to/rhythm/scripts/audit-spacing.mjs <scope> --format table
```

The script is an inventory, not a parser or auto-migrator. Confirm every candidate in context.

## 2. Measure the rendered module

Prefer a browser running the actual app with the production font loading path. Create a temporary probe after fonts settle:

```js
await document.fonts.ready
const probe = document.createElement('div')
Object.assign(probe.style, {
	position: 'absolute',
	visibility: 'hidden',
	inlineSize: 'var(--gap)',
	blockSize: '1px',
})
document.body.append(probe)
const gapPx = probe.getBoundingClientRect().width
probe.remove()
```

Measure at every root typography breakpoint. For local-relative candidates, place the probe inside the relevant element and use `var(--gap--relative)`.

If a browser is unavailable and root line-height plus x-height are known:

```text
gapPx = rootLineHeightPx - (rootFontSizePx × xHeightRatio)
multiplier = renderedSpacingPx / gapPx
```

Record assumptions, especially when `normal` line-height or font fallback makes the calculation uncertain.

## 3. Build a mapping

Use the scale helper:

```sh
node path/to/rhythm/scripts/rhythm-scale.mjs --gap 7.84 4 8 12 16 24 32
```

Default preferred multipliers are `0, 0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4, 6, 8`. A snap is acceptable only when the rendered difference is within both the agreed visual tolerance and component constraints. A useful starting tolerance is `min(1px, 0.08 × gapPx)`, not a universal rule.

Examples:

```css
margin-block: calc(var(--gap) * 2);
padding-inline: calc(var(--gap) * 1.5);
margin-block-start: var(--gap--relative);
```

Prefer `var(--gap)` over multiplication by one. Preserve zero as `0`.

## 4. Refactor safely

- Change tokens before consumers when a design-token layer exists.
- Avoid replacing the same literal globally when it represents multiple semantics.
- Keep responsive differences unless measurements prove they collapse naturally.
- For utility frameworks, use the installed Rhythm integration rather than arbitrary-value syntax where possible.
- Migrate a small component family first, inspect the diff, then expand.

## 5. Validate

Capture before/after geometry or screenshots at representative widths, loaded and fallback font states, themes, and interactive states. Compare bounding boxes and wrapping, not only pixel diffs. Run style, unit, visual, and build checks available in the project. Report unmigrated values with reasons.
