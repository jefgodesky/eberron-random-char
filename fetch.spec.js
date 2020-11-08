/* global describe, it, expect */

const { fetchDemographics } = require('./fetch')

describe('fetchDemographics', () => {
  it('returns something', async () => {
    expect.assertions(4)
    const demographics = await fetchDemographics()
    const areas = Object.keys(demographics)
    const first = demographics[areas[0]]
    expect(demographics).toBeDefined()
    expect(areas.length).toBeGreaterThan(0)
    expect(Object.keys(first.byRace).length).toBeGreaterThan(0)
    expect(Object.keys(first.byReligion).length).toBeGreaterThan(0)
  })
})
