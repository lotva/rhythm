import type { Config } from 'stylelint'

export default {
	extends: [
		'stylelint-config-recommended',
		'stylelint-config-clean-order',
		'stylelint-plugin-logical-css/configs/recommended',
		'stylelint-config-astro',
	],

	plugins: ['stylelint-plugin-logical-css'],

	rules: {
		'at-rule-no-unknown': [
			true,
			{
				ignoreAtRules: ['mixin', 'define-mixin', 'mixin-content'],
			},
		],

		'color-function-notation': 'modern',

		'custom-property-pattern': [
			/^[a-z][\da-z]*(?:-[\da-z]+)*(?:__[a-z][\da-z]*(?:-[\da-z]+)*)?(?:--[a-z][\da-z]*(?:-[\da-z]+)*)?$/,
			'Сustom properties should follow the BEM naming convention',
		],

		'declaration-property-value-no-unknown': null,

		'no-descending-specificity': [true, { severity: 'warning' }],

		'order/order': [
			[
				'custom-properties',
				{ name: 'mixin', type: 'at-rule' },
				'declarations',
				'at-rules',
				{ hasBlock: true, name: 'media', type: 'at-rule' },
				'rules',
			],
		],

		'property-no-unknown': [
			true,
			{
				ignoreProperties: ['corner-shape'],
			},
		],

		'rule-empty-line-before': [
			'always',
			{
				except: ['first-nested'],
			},
		],

		'selector-class-pattern': [
			/^(?!.*--)(?:[a-z][\da-z]*(?:-[\da-z]+)*|_[a-z][\da-z]*(?:-[\da-z]+)*)$/,
			{
				message:
					'Selector should be written in kebab-case and modifiers should start with _',
			},
		],
	},
} satisfies Config
