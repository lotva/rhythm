const { gap, gapRelative } = require('./src/styles/functions')

module.exports = {
	plugins: [
		require('postcss-functions')({
			functions: {
				gap,
				gapRelative,
			},
		}),
	],
}
