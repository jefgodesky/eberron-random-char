/* global describe, it, expect, beforeAll */

const {
  chooseRaceFromDemographics,
  chooseCultureFromRace,
  choosePiety
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

describe('choosePiety', () => {
  it('returns a piety score', () => {
    const actual = choosePiety(data, data.cultures.Thranish)
    expect(typeof actual).toEqual('number')
  })
})