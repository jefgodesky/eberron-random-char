/* global describe, it, expect */

const {
  randomElementFromArray,
  randomFloatFromBellCurve,
  makeTable
} = require('./randomizer')

describe('randomElementFromArray', () => {
  it('selects one random element from an array', () => {
    const arr = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ]
    const actual = randomElementFromArray(arr)
    expect(arr.includes(actual)).toEqual(true)
  })
})

describe('randomFloatFromBellCurve', () => {
  it('returns a random float from a bell curve', () => {
    expect(typeof randomFloatFromBellCurve()).toEqual('number')
  })
})

describe('makeTable', () => {
  it('makes a table', () => {
    const obj = {
      One: { percent: 10 },
      Two: { percent: 65 },
      Three: { percent: 25 }
    }
    const actual = makeTable(obj)
    expect(actual).toEqual([
      { key: 'One', percent: 10 },
      { key: 'Two', percent: 65 },
      { key: 'Three', percent: 25 }
    ])
  })
})