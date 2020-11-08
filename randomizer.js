const random = require('random')

/**
 * Return a random element from an array.
 * @param arr {*[]} - An array of elements.
 * @returns {*} - An element randomly selected from the array provided.
 */

const randomElementFromArray = arr => arr[random.int(0, arr.length - 1)]

/**
 * Returns a value randomly selected from a normal bell curve.
 * @param mean {number=} - The average of the normal curve. (Default: `0`)
 * @param std {number=} - The standard deviation of the normal curve.
 *   (Default: `1`)
 * @returns {number} - A number randomly selected from the normal curve defined
 *   by the mean and standard deviation provided.
 */

const randomFloatFromBellCurve = (mean = 0, std = 1) => {
  const thunk = random.normal(mean, std)
  return thunk()
}

/**
 * Creates a table array from an object.
 * @param obj {object} - An object that has some arbitrary number of
 *   properties, where each property is an object.
 * @returns {object[]} - An array of objects. Each object in the array
 *   represents one of the properties in the original object, with its key
 *   saved as the added property `key`.
 */

const makeTable = obj => {
  return Object.keys(obj).map(key => Object.assign({}, { key }, obj[key]))
}

module.exports = {
  randomElementFromArray,
  randomFloatFromBellCurve,
  makeTable
}