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

module.exports = {
  randomElementFromArray,
  randomFloatFromBellCurve
}