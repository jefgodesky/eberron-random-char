/* global describe, it, expect */

const {
  intersection,
  union,
  attemptIntersection,
  randomElementFromArray,
  randomFloatFromBellCurve,
  makeTable,
  randomRowFromTable,
  randomAcceptableRowFromTable
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

describe('union', () => {
  it('returns an empty array if not given any elements', () => {
    expect(union()).toEqual([])
  })

  it('returns an empty array if not given any arrays', () => {
    expect(union(42, '*', 3.1415)).toEqual([])
  })

  it('returns the array if only given one', () => {
    const a = [ 1, 2, 3 ]
    expect(union(a)).toEqual(a)
  })

  it('returns the union if given two', () => {
    const a = [ 1, 2, 3 ]
    const b = [ 2, 3, 4 ]
    expect(union(a, b)).toEqual([ 1, 2, 3, 4 ])
  })

  it('returns the union of any number of arrays', () => {
    const a = [ 1, 2, 3 ]
    const b = [ 2, 3, 4 ]
    const c = [ 3, 4, 5 ]
    expect(union(a, b, c)).toEqual([ 1, 2, 3, 4, 5 ])
  })

  it('ignores non-array arguments', () => {
    const a = [ 1, 2, 3 ]
    const b = [ 2, 3, 4 ]
    const c = [ 3, 4, 5 ]
    expect(union(42, a, '*', b, 3.1415, c)).toEqual([ 1, 2, 3, 4, 5 ])
  })
})

describe('attemptIntersection', () => {
  it('returns an intersection of the given arrays', () => {
    const a = [ 1, 2, 3 ]
    const b = [ 2, 3, 4 ]
    const c = [ 3, 4, 5 ]
    expect(attemptIntersection(a, b, c)).toEqual([ 3 ])
  })

  it('returns the union if the intersection is empty', () => {
    const a = [ 1, 2, 3 ]
    const b = [ 2, 3, 4 ]
    const c = [ 3, 4, 5 ]
    const d = [ 4, 5, 6 ]
    expect(attemptIntersection(a, b, c, d)).toEqual([ 1, 2, 3, 4, 5, 6 ])
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

describe('randomAcceptableRowFromTable', () => {
  it('only returns an acceptable value', () => {
    const actual = randomAcceptableRowFromTable([
      { key: 'Acceptable', percent: 50 },
      { key: 'Unacceptable', percent: 50 }
    ], [ 'Acceptable' ])
    expect(actual).toEqual({ key: 'Acceptable', percent: 50 })
  })
})