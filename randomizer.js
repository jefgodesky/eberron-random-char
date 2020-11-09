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
 * Returns the union of any given number of arrays.
 * @param arr {any[]} - The arrays to form a union from.
 * @returns {any[]} - The union of the given arrays.
 */

const union = (...arr) => {
  const arrays = arr.filter(a => Array.isArray(a))
  if (arrays.length === 1) {
    return arrays[0]
  } else if (arrays.length > 1) {
    let a = arrays[0]
    for (let i = 1; i < arrays.length; i++) a = [ ...new Set([ ...a, ...arrays[i] ]) ]
    return a
  } else {
    return []
  }
}

/**
 * Checks to see if an intersection of the given arrays includes any elements.
 * If it does, it returns the intersection. If it doesn't, it returns the
 * union.
 * @param arr {any[]} - Arrays to intersect or form a union from.
 * @returns {any[]} - The intersection of the arrays given if it has any
 *   elements, or the union of those arrays if not.
 */

const attemptIntersection = (...arr) => {
  const attempt = intersection(...arr)
  return attempt.length > 0 ? attempt : union(...arr)
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

/**
 * Returns a random element from a table, so long as that element has a `key`
 * property that is included in the whitelisted array of `acceptable` values.
 * @param table {object[]} - An array of objects to choose from. Each object
 *   must have a `key` property and a `percent` property, indicating how likely
 *   it is. This can be a float, but the sum of the `percent` properties for
 *   all objects in the array should equal 100.
 * @param acceptable {string[]} - An array of acceptable `key` values.
 * @returns {any} - A randomly selected element from the array. If any elements
 *   in the table match the criteria provided by the `acceptable` array, the
 *   returned row will meet those criteria. If no rows in the table meet these
 *   criteria, one is chosen at random, per the likelihood of each row's
 *   `percent` property.
 */

const randomAcceptableRowFromTable = (table, acceptable) => {
  const check = intersection(table.map(row => row.key), acceptable)
  if (check.length > 0) {
    let found = undefined
    while (!found) {
      const candidate = randomRowFromTable(table)
      if (acceptable.includes(candidate.key)) found = candidate
    }
    return found
  } else {
    return randomRowFromTable(table)
  }
}

module.exports = {
  intersection,
  union,
  attemptIntersection,
  randomElementFromArray,
  randomFloatFromBellCurve,
  makeTable,
  randomRowFromTable,
  randomAcceptableRowFromTable
}