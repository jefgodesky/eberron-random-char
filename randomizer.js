const random = require('random')

/**
 * Return a random element from an array.
 * @param arr {*[]} - An array of elements.
 * @returns {*} - An element randomly selected from the array provided.
 */

const randomElementFromArray = arr => arr[random.int(0, arr.length - 1)]

module.exports = {
  randomElementFromArray
}