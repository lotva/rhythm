const { gap, gapRelative } = require('./src/styles/functions')

module.exports = {
	plugins: [
		require('postcss-mixins')({
			mixinsFiles: 'src/styles/globals/mixins.pcss',
		}),

		require('postcss-functions')({
			functions: {
				gap,
				gapRelative,
			},
		}),
	],
}
