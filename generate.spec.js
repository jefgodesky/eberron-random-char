/* global describe, it, expect, beforeAll */

const {
  chooseRaceFromDemographics
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