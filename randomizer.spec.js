/* global describe, it, expect */

const {
  intersection,
  randomElementFromArray,
  randomFloatFromBellCurve,
  makeTable,
  randomRowFromTable
} = require('./randomizer')

describe('intersection', () => {
  it('returns an empty array if not given any elements', () => {
    expect(intersection()).toEqual([])
  })

  it('returns an empty array if not given any arrays', () => {
    expect(intersection(42, '*', 3.1415)).toEqual([])
  })

  it('returns the array if only given one', () => {
    const a = [ 1, 2, 3 ]
    expect(intersection(a)).toEqual(a)
  })

  it('returns the intersection if given two', () => {
    const a = [ 1, 2, 3 ]
    const b = [ 2, 3, 4 ]
    expect(intersection(a, b)).toEqual([ 2, 3 ])
  })

  it('returns the intersection of any number of arrays', () => {
    const a = [ 1, 2, 3 ]
    const b = [ 2, 3, 4 ]
    const c = [ 3, 4, 5 ]
    expect(intersection(a, b, c)).toEqual([ 3 ])
  })

  it('ignores non-array arguments', () => {
    const a = [ 1, 2, 3 ]
    const b = [ 2, 3, 4 ]
    const c = [ 3, 4, 5 ]
    expect(intersection(42, a, '*', b, 3.1415, c)).toEqual([ 3 ])
  })
})

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

describe('randomRowFromTable', () => {
  it('chooses a random row from a table', () => {
    const actual = randomRowFromTable([
      { key: 'No', percent: 0 },
      { key: 'Yes', percent: 100 },
      { key: 'No', percent: 0 },
    ])
    expect(actual).toEqual({ key: 'Yes', percent: 100 })
  })
})