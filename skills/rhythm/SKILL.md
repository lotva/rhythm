---
name: rhythm
description: Install and apply the Rhythm typography-driven CSS spacing system. Use when asked to add Rhythm to a web project, configure its spacing helpers for plain CSS, PostCSS, Tailwind CSS, or UnoCSS, migrate existing margins/padding/gaps to `--gap` units within a requested scope, or reduce font-swap layout shifts by measuring a primary typeface's x-height and setting `font-size-adjust`.
---

# Rhythm

Use the visual line gap—line height minus x-height—as the spacing module. Preserve the project's conventions and make the smallest reviewable change.

## Commands

Route the request to exactly one command unless the user explicitly combines them:

- `$rhythm install`: add the primitives and detected framework integration.
- `$rhythm migrate [scope]`: audit and migrate existing spacing within a file, directory, component, page, or whole project.
- `$rhythm match-font-metrics [font or scope]`: measure the primary typeface's x-height ratio and add a numeric `font-size-adjust` declaration.

If the command is omitted, infer it from the request. Ask only when the intended mutation or migration scope cannot be inferred safely.

## Shared rules

1. Inspect repository instructions, package manifests, build configuration, global style entry points, typography, tests, and the working-tree state before editing.
2. Preserve unrelated user changes. Do not overwrite an existing token, rule, plugin array, or configuration export.
3. Treat `--gap` as root-relative and `--gap--relative` as local-font-relative.
4. Do not convert borders, radii, icon geometry, control hit areas, media dimensions, or deliberate optical nudges merely because they use `px`, `rem`, or `em`.
5. Warn when supported browsers do not cover `text-box`, `rlh`, `rex`, and `lh`. Do not silently add a polyfill.
6. Run the project's focused style/build tests and inspect the diff. Report changed files, decisions, measurements, and remaining risks.

## Install

Read [references/install.md](references/install.md), then:

1. Locate the global stylesheet actually loaded by the application.
2. Copy [assets/spacing.css](assets/spacing.css) into the project's global styles as `spacing.css`; keep its source comment.
3. Import it once from the global style entry point, respecting existing cascade-layer and import ordering.
4. Detect PostCSS, UnoCSS, and Tailwind from both dependencies and configuration files. Apply every integration that is actually active.
5. For PostCSS, install `postcss-functions` with the project's package manager only when absent and after dependency installation is authorized. Add helpers using the module format already used by the config.
6. For UnoCSS, merge the Rhythm rule into the existing `rules` array. Never replace presets, theme, shortcuts, transformers, or existing rules.
7. For Tailwind CSS v4, add either the default `--spacing` mapping or the named `g` scale. Prefer the named scale unless the user explicitly wants every spacing utility redefined.

## Migrate

Read [references/migration.md](references/migration.md). Treat migration as measurement plus controlled refactoring:

1. Resolve the scope and inventory authored spacing declarations and utility classes. Use `scripts/audit-spacing.mjs` for CSS-like sources when helpful.
2. Establish representative viewports, themes, routes, component states, root typography, and loaded fonts.
3. Measure the rendered root gap with a browser probe when a runnable app is available. Otherwise calculate it from known root line-height and x-height metrics, state the assumptions, and avoid false precision.
4. Divide each rendered spacing value by the measured gap. Snap only to the project's agreed multiplier scale and tolerance; retain an exact multiplier or leave the value unchanged when snapping would alter intent.
5. Use `--gap--relative` only when the spacing is intentionally tied to the element's own type size/line height, such as space adjoining a display heading.
6. Present or save a value-to-multiplier map before broad replacement. Make changes in small semantic batches.
7. Compare before/after screenshots or geometry at representative viewports and run relevant tests. Fix regressions rather than normalizing them away.

## Match font metrics

Read [references/font-metrics.md](references/font-metrics.md), then:

1. Identify the actual primary face, weight, style, and variable-font axes used at the root. Identify the fallback chain for QA, but derive `font-size-adjust` only from the primary face's ex-height ratio; do not average it with fallback metrics.
2. Prefer the project's actual font file. Load it into a uniquely named `FontFace`, apply the production font size, weight/style/stretch/variation settings, and measure paired `10ex` and `10em` boxes in the same browser context. Test every material typography breakpoint when optical sizing is automatic. Use an already loaded family only when the file is unavailable and verify that it did not fall back.
3. Read the authored base `html` font size, resolve the supported viewport/container domain, and classify each continuous typography range as constant, breakpoint-switched, or fluid. Measure each distinct constant size and both actual endpoints of every fluid range. Do not treat variables named `min`/`max` as enforced bounds unless the CSS clamps or conditions the formula. Do not add runtime measurement, resize listeners, observers, or JavaScript synchronization.
4. Round measured endpoint ratios to three or four decimals and reject placeholder or inferred values. For constant sizes, assign one numeric custom property. For discrete breakpoints, override that property in the matching media queries. For each fluid range, first assign the larger endpoint ratio as the ordinary fallback, then place an adjacent `@supports (font-size-adjust: ex-height calc(1px / 1px))` block that overrides it with linear interpolation. If typed arithmetic is unsupported, the maximum ratio remains active; do not add runtime synchronization.
5. Merge the custom property and declaration into the existing root typography rule rather than creating a competing root block:

```text
:root {
	--font-size-adjust: 0.×××;
	font-size-adjust: ex-height var(--font-size-adjust);
}
```

6. Verify the fallback and loaded-font states at every range endpoint and breakpoint. Report that this matches x-height; do not claim it guarantees zero CLS. Recommend `size-adjust` and metric overrides only if residual shifts remain and the project can define fallback `@font-face` rules.

## Resources

- [references/install.md](references/install.md): framework detection and merge-safe snippets.
- [references/migration.md](references/migration.md): measurement, mapping, exclusions, and QA.
- [references/font-metrics.md](references/font-metrics.md): browser probe and validation.
- [assets/spacing.css](assets/spacing.css): canonical global stylesheet.
- [assets/postcss-functions.cjs](assets/postcss-functions.cjs): CommonJS PostCSS helpers.
- [assets/postcss-functions.mjs](assets/postcss-functions.mjs): ESM PostCSS helpers.
- [assets/uno-rhythm-rule.ts](assets/uno-rhythm-rule.ts): reusable UnoCSS rule.
- `scripts/audit-spacing.mjs`: read-only inventory of authored spacing declarations.
- `scripts/rhythm-scale.mjs`: convert measured pixel values to Rhythm multipliers.
- `scripts/measure-ex-height.js`: browser helper that measures `10ex / 10em` from an isolated `FontFace`.
