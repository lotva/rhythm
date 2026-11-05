const gap = (value = 1) => `calc(var(--gap) * ${value})`
const gapRelative = (value = 1) => `calc(var(--gap--relative) * ${value})`

module.exports = { gap, gapRelative }
