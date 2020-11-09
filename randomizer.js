const random = require('random')

/**
 * Returns the intersection of any given number of arrays.
 * @param arr {any[]} - The arrays to intersect.
 * @returns {any[]} - The intersection of the given arrays.
 */

const intersection = (...arr) => {
  const arrays = arr.filter(a => Array.isArray(a))
  if (arrays.length === 1) {
    return arrays[0]
  } else if (arrays.length > 1) {
    let a = arrays[0]
    for (let i = 1; i < arrays.length; i++) a = a.filter(x => arrays[i].includes(x))
    return a
  } else {
    return []
  }
}

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

/**
 * Select a random element from a table.
 * @param table {object[]} - An array of objects to choose from. Each object
 *   must have a `percent` property, indicating how likely it is. This can be
 *   a float, but the sum of the `percent` properties for all objects in the
 *   array should equal 100.
 * @returns {object} - A randomly selected element from the array.
 */

const randomRowFromTable = table => {
  const whole = random.int(0, 100)
  const part = random.int(0, 100)
  const rand = Math.min(whole + (part / 100), 100)
  let sum = 0
  let found = undefined

  table.forEach(row => {
    if (!found && row.percent) {
      sum += row.percent
      if (rand < sum) found = row
    }
  })

  return found
}

module.exports = {
  intersection,
  randomElementFromArray,
  randomFloatFromBellCurve,
  makeTable,
  randomRowFromTable
}