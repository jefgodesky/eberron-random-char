/* global describe, it, expect */

const {
  fetchDemographics,
  fetchRaces
} = require('./fetch')

describe('fetchDemographics', () => {
  it('fetches demographics', async () => {
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

describe('fetchRaces', () => {
  it('fetches races', async () => {
    expect.assertions(3)
    const races = await fetchRaces()
    const keys = Object.keys(races)
    const haveTypes = keys.reduce((acc, curr) => acc && races[curr].type !== undefined, true)
    const haveAlignment = keys.reduce((acc, curr) => acc && races[curr].alignment !== undefined, true)
    expect(keys.length).toBeGreaterThan(0)
    expect(haveTypes).toEqual(true)
    expect(haveAlignment).toEqual(true)
  })
})
