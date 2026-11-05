# Match fallback font metrics

`font-size-adjust: ex-height <number>` preserves a chosen x-height-to-font-size ratio across fallback faces. It reduces changes in perceived size and wrapping, but matching x-height alone does not guarantee zero layout shift.

Use the primary face's ex-height ratio as the target number. Do not average primary and fallback metrics or calculate a pairwise correction: the browser compares the target with whichever face is selected and adjusts that face automatically. Inspect fallback faces only to validate wrapping and residual shift.

## Ex-height measurement

Measure the ratio as two CSS lengths rendered in the exact same font context:

```text
exHeightRatio = rendered block size of 10ex / rendered block size of 10em
```

This is the method used by Richard Rutter's metrics calculator. It measures the browser's CSS `ex` metric directly; do not measure the ink bounds or DOM box of the glyph `x`.

Use `10ex` and `10em` to enlarge the probe and reduce quantization. Do not enlarge the probe by setting an artificial font size: with `font-optical-sizing: auto`, that can select a different `opsz` instance and change x-height. Measure at the production font size or set the production `opsz` explicitly. Prefer `getBoundingClientRect().height` over `offsetHeight` because `offsetHeight` rounds to an integer CSS pixel. Round only the final ratio to three decimals for the CSS declaration; retain the unrounded value in the report.

## Preferred path: isolate the font file

Locate the primary font file from `@font-face`, static assets, package dependencies, or the build output. Load its bytes or URL into a uniquely named `FontFace`, wait for `face.load()`, add it to `document.fonts`, and measure the paired boxes. This prevents a missing primary face from silently producing the fallback's ratio.

Use [../scripts/measure-ex-height.js](../scripts/measure-ex-height.js) in a browser page or automation context:

```js
const response = await fetch('/fonts/primary.woff2')
const buffer = await response.arrayBuffer()
const result = await measureExHeight(buffer, {
	fontSize: '16px',
	weight: '450',
	style: 'normal',
	stretch: '100%',
	variationSettings: '"wght" 450, "opsz" 16',
})

console.log(result)
// { ratio: 0.475..., rounded: 0.475, css: "font-size-adjust: ex-height 0.475;" }
```

Set every production-relevant value:

- `font-weight`;
- `font-size`, because it selects the optical size when `font-optical-sizing: auto`;
- `font-style`, including an oblique angle;
- `font-stretch`;
- `font-variation-settings`, including `opsz` when explicitly controlled;
- `font-optical-sizing` when automatic optical sizing is part of production rendering.

Always set `font-size-adjust: none` on the measurement container. The property inherits; without this reset, measuring inside an application that already applies `font-size-adjust` can contaminate the result.

For a variable font, repeat at materially different production instances when an axis can change x-height. In particular, measure the actual base `html` sizes at the endpoints of every typography range when `opsz` is automatic.

## Fallback path: measure an installed family

If the font file is unavailable, create the same `10ex / 10em` boxes with the page's loaded family after `document.fonts.load()` and `document.fonts.ready`. Treat `document.fonts.check()` as a readiness check, not proof that the intended face supplied the metrics. Corroborate the result using a distinctive test, a local font-table `sxHeight / unitsPerEm` value, or a file-based measurement whenever possible.

Do not use a glyph-height probe: ordinary DOM boxes include line box geometry, while canvas bounding boxes measure ink rather than the CSS `ex` unit used by Rhythm.

## Derive CSS from the base html font size

Inspect the authored `html { font-size }` rules, variables, `clamp()`/`calc()` expressions, container conditions, and media queries. Resolve the project's supported viewport/container domain. A token named `min` or `max` is not an enforced bound when the formula can extrapolate beyond its nominal range; use the actual computed endpoint or report the missing support boundary. Build static CSS from that source; do not add runtime measurement, `resize` listeners, `ResizeObserver`, or JavaScript updates.

Treat every uninterrupted typography formula as one range. A media query that replaces one fluid formula with another starts a new range, even when both meet at the same viewport width.

### Constant font size

Measure once at the base size and store the numeric ratio in a custom property:

```css
html {
	--font-size-adjust: 0.475;
	font-size-adjust: ex-height var(--font-size-adjust);
}
```

Passing a custom property is valid because `font-size-adjust` accepts a `<number>`.

### Discrete breakpoint sizes

Measure every distinct base size and override the property in the same media queries as `font-size`:

```css
html {
	--font-size-adjust: 0.486;
	font-size-adjust: ex-height var(--font-size-adjust);
}

@media (width >= 48rem) {
	html {
		--font-size-adjust: 0.474;
	}
}
```

Keep the existing breakpoint units and conditions. Do not invent a new responsive system.

### Fluid font size

For each continuous fluid range:

1. Extract its minimum and maximum viewport or container widths.
2. Extract the corresponding minimum and maximum computed `html` font sizes.
3. Measure the primary font's ex-height ratio at those two font sizes with the production optical-sizing behavior.
4. Interpolate only the two measured ratios. Do not remeasure while the page runs.

If the endpoint ratios are equal at the chosen precision, emit one constant value even when `font-size` is fluid.

`font-size-adjust` accepts a computed `<number>`, so `var()` and `calc()` can supply it. Producing a unitless viewport progress value requires CSS typed arithmetic: division of one length by another length.

For every fluid range, first assign the numerically larger endpoint ratio as the normal fallback. Put the feature query immediately after that fallback and override the same custom property with interpolation:

```css
html {
	/* Maximum endpoint ratio: fallback without typed arithmetic. */
	--font-size-adjust: 0.486;
	font-size-adjust: ex-height var(--font-size-adjust);
}

@supports (font-size-adjust: ex-height calc(1px / 1px)) {
	html {
		--font-size-adjust__progress: clamp(
			0,
			calc((100vi - 320px) / (1440px - 320px)),
			1
		);
		--font-size-adjust: clamp(
			0.474,
			calc(0.486 + (0.474 - 0.486) * var(--font-size-adjust__progress)),
			0.486
		);
	}
}
```

Sort the outer `clamp()` bounds numerically: the smaller ratio first, even when the ratio decreases as the viewport grows. Prefer `vi` when the project's font-size formula uses the logical viewport axis; otherwise preserve its existing viewport/container unit.

For multiple fluid formulas, emit one maximum-ratio fallback per range inside the same media conditions that switch `font-size`, followed immediately by the matching `@supports` interpolation. This correctly handles discontinuities such as a mobile range ending at one size and a desktop range restarting at another. Typed length division is newer than ordinary `var()`/`calc()` support; when unsupported, the preceding maximum-ratio fallback remains active. Never require JavaScript synchronization.

If different regions use materially different primary faces or base font-size formulas, scope separate custom properties rather than forcing one root value.

## Validate fallback and loaded states

1. Capture geometry with the primary font blocked or its family temporarily removed.
2. Capture the same content after the primary face loads.
3. Compare line breaks, text box height, nearby element positions, and CLS instrumentation.
4. Test representative scripts and weights, not only Latin lowercase text.

If residual shift is material, consider a locally hosted fallback `@font-face` with `size-adjust`, `ascent-override`, `descent-override`, and `line-gap-override`. Treat that as a separate, font-specific change requiring more measurements.
