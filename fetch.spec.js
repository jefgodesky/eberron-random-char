/* global describe, it, expect */

const {
  fetchDemographics,
  fetchRaces,
  fetchCultures,
  fetchReligions
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

describe('fetchCultures', () => {
  it('fetches cultures', async () => {
    expect.assertions(7)
    const cultures = await fetchCultures()
    const keys = Object.keys(cultures)
    const haveCommon = keys.reduce((acc, curr) => acc && cultures[curr].common !== undefined, true)
    const haveNames = keys.reduce((acc, curr) => acc && cultures[curr].names !== undefined, true)
    const havePiety = keys.reduce((acc, curr) => acc && cultures[curr].religion.piety !== undefined, true)
    const haveMod = keys.reduce((acc, curr) => acc && cultures[curr].religion.mod !== undefined, true)
    const havePreferred = keys.reduce((acc, curr) => acc && cultures[curr].religion.preferred !== undefined, true)
    const haveAlignment = keys.reduce((acc, curr) => acc && cultures[curr].alignment !== undefined, true)
    expect(keys.length).toBeGreaterThan(0)
    expect(haveCommon).toEqual(true)
    expect(haveNames).toEqual(true)
    expect(havePiety).toEqual(true)
    expect(haveMod).toEqual(true)
    expect(havePreferred).toEqual(true)
    expect(haveAlignment).toEqual(true)
  })
})

describe('fetchReligions', () => {
  it('fetches religions', async () => {
    expect.assertions(6)
    const religions = await fetchReligions()
    const keys = Object.keys(religions)
    const haveRaces = keys.reduce((acc, curr) => acc && religions[curr].race !== undefined, true)
    const noRaces = keys.reduce((acc, curr) => acc && religions[curr].race === undefined, true)
    const haveCultures = keys.reduce((acc, curr) => acc && religions[curr].culture !== undefined, true)
    const noCultures = keys.reduce((acc, curr) => acc && religions[curr].culture === undefined, true)
    const haveAlignment = keys.reduce((acc, curr) => acc && religions[curr].alignment !== undefined, true)
    expect(keys.length).toBeGreaterThan(0)
    expect(haveRaces).toEqual(false)
    expect(noRaces).toEqual(false)
    expect(haveCultures).toEqual(false)
    expect(noCultures).toEqual(false)
    expect(haveAlignment).toEqual(true)
  })
})
