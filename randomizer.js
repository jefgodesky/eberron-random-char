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
 * Given a population array, create a rollable table.
 * @param arr {object[]} - Each object in this array should have a `pop`
 *   property. This should be a number, providing the population for the
 *   group that this object describes.
 * @returns {{max: number, table: []}} - An object with two properties. The
 *   `table` property is an array that is identical to the `arr` argument that
 *   was provided, except that each element now has `from` and `to` properties.
 *   These are numbers that allow it to be used as a rollable table. The `max`
 *   property provides the value of the largest `to` property in the array,
 *   making it easier to generate a random number between 1 and `max`.
 */

const makeTable = arr => {
  let curr = 0
  const table = []
  arr.forEach(item => {
    curr++
    table.push(Object.assign({}, { from: curr, to: curr + item.pop }, item))
    curr += item.pop
  })
  return { table, max: curr }
}

/**
 * Roll for a random element from a rollable table.
 * @param src {object} - The rollable table.
 * @param src.table {object[]} - An array of objects. Each object in this array
 *   should have two properties: `from` and `to`. Both of these properties
 *   should be numbers, defining a range that expresses how likely this option
 *   is to be chosen relative to the others. There should be no overlap in
 *   these ranges, comparing amongst all objects in the array.
 * @param src.max {number} - The value of the highest `to` property in the
 *   `src.table` array.
 * @returns {object} - The object randomly selected from the table.
 */

const rollTable = src => {
  const rand = random.int(1, src.max)
  const match = src.table.filter(row => rand >= row.from && rand <= row.to)
  return match.length > 0 ? match[0] : randomElementFromArray(src.table)
}

module.exports = {
  intersection,
  union,
  attemptIntersection,
  randomElementFromArray,
  randomFloatFromBellCurve,
  makeTable,
  rollTable
}