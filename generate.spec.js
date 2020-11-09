/* global describe, it, expect, beforeAll */

const {
  chooseRaceFromDemographics,
  chooseCultureFromRace,
  chooseReligionFromDemographics,
  choosePiety,
  isPious,
  generateRandomAlignment,
  generateAcceptableRandomAlignment
} = require('./generate')
const { fetchData } = require('./fetch')

let data = null

beforeAll(async () => {
  data = await fetchData()
})

describe('chooseRaceFromDemographics', () => {
  it('returns a random acceptable race', () => {
    const actual = chooseRaceFromDemographics(data, 'Sharn', { race: [ 'Human' ] })
    expect(actual.key).toEqual('Human')
  })
})

describe('chooseCultureFromRace', () => {
  it('returns a random acceptable culture', () => {
    const race = {
      key: 'Human',
      cultures: {
        Brelish: { percent: 24 },
        Aundairian: { percent: 24 },
        Karrnathi: { percent: 24 },
        Thranish: { percent: 24 },
        Cyran: { percent: 4 }
      }
    }
    expect(chooseCultureFromRace(race, { culture: [ 'Brelish' ] })).toEqual('Brelish')
  })
})

describe('chooseReligionFromDemographics', () => {
  it('picks a religion', () => {
    const actual = chooseReligionFromDemographics(data, 'Sharn', { religion: [ 'Sovereign Host' ] })
    expect(actual.name).toEqual('Sovereign Host')
  })
})

describe('choosePiety', () => {
  it('returns a piety score', () => {
    const actual = choosePiety(data, data.cultures.Thranish)
    expect(typeof actual).toEqual('number')
  })
})

describe('isPious', () => {
  it('returns true if given a value more than one standard deviation above the mean', () => {
    expect(isPious(2)).toEqual(true)
  })

  it('returns false if given a value not more than one standard deviation above the mean', () => {
    expect(isPious(1)).toEqual(false)
  })
})

describe('generateRandomAlignment', () => {
  it('returns an alignment', () => {
    const alignments = [ 'LG', 'NG', 'CG', 'LN', 'N', 'CN', 'LE', 'NE', 'CE' ]
    const actual = generateRandomAlignment()
    expect(alignments.includes(actual)).toEqual(true)
  })
})

describe('generateAcceptableRandomAlignment', () => {
  it('returns an acceptable alignment', () => {
    const acceptable = [ 'LG', 'NG', 'CG' ]
    const actual = generateAcceptableRandomAlignment(acceptable)
    expect(acceptable.includes(actual)).toEqual(true)
  })

  it('returns the specified alignment if only given one', () => {
    expect(generateAcceptableRandomAlignment([ 'CG' ])).toEqual('CG')
  })
})