/* global describe, it, expect */

const {
  fetchDemographics,
  fetchRaces,
  fetchCultures,
  fetchReligions,
  fetchNames,
  fetchVars,
  fetchZilClans,
  fetchTraits,
  fetchData
} = require('./fetch')

describe('fetchDemographics', () => {
  it('fetches demographics', async () => {
    expect.assertions(3)
    const demographics = await fetchDemographics()
    const areas = Object.keys(demographics)
    expect(demographics).toBeDefined()
    expect(areas.length).toBeGreaterThan(0)
    expect(demographics[areas[0]].length).toBeGreaterThan(0)
  })
})

describe('fetchRaces', () => {
  it('fetches races', async () => {
    expect.assertions(4)
    const races = await fetchRaces()
    const keys = Object.keys(races)
    const havePlurals = keys.reduce((acc, curr) => acc && races[curr].plural !== undefined, true)
    const haveTypes = keys.reduce((acc, curr) => acc && races[curr].type !== undefined, true)
    const haveAlignment = keys.reduce((acc, curr) => acc && races[curr].alignment !== undefined, true)
    expect(keys.length).toBeGreaterThan(0)
    expect(havePlurals).toEqual(true)
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
    expect.assertions(7)
    const religions = await fetchReligions()
    const keys = Object.keys(religions)
    const haveFollowers = keys.reduce((acc, curr) => acc && religions[curr].follower !== undefined, true)
    const haveRaces = keys.reduce((acc, curr) => acc && religions[curr].race !== undefined, true)
    const noRaces = keys.reduce((acc, curr) => acc && religions[curr].race === undefined, true)
    const haveCultures = keys.reduce((acc, curr) => acc && religions[curr].culture !== undefined, true)
    const noCultures = keys.reduce((acc, curr) => acc && religions[curr].culture === undefined, true)
    const haveAlignment = keys.reduce((acc, curr) => acc && religions[curr].alignment !== undefined, true)
    expect(keys.length).toBeGreaterThan(0)
    expect(haveFollowers).toEqual(true)
    expect(haveRaces).toEqual(false)
    expect(noRaces).toEqual(false)
    expect(haveCultures).toEqual(false)
    expect(noCultures).toEqual(false)
    expect(haveAlignment).toEqual(true)
  })
})

describe('fetchNames', () => {
  it('fetches names', async () => {
    expect.assertions(3)
    const names = await fetchNames()
    const keys = Object.keys(names)
    const haveSurnames = keys.reduce((acc, curr) => acc && names[curr].surname !== undefined, true)
    const noSurnames = keys.reduce((acc, curr) => acc && names[curr].surname === undefined, true)
    expect(keys.length).toBeGreaterThan(0)
    expect(haveSurnames).toEqual(false)
    expect(noSurnames).toEqual(false)
  })
})

describe('fetchVars', () => {
  it('fetches variables', async () => {
    expect.assertions(2)
    const vars = await fetchVars()
    const keys = Object.keys(vars)
    const haveArrays = keys.reduce((acc, curr) => acc && Array.isArray(vars[curr]) && (vars[curr].length > 0), true)
    expect(keys.length).toBeGreaterThan(0)
    expect(haveArrays).toEqual(true)
  })
})

describe('fetchZilClans', () => {
  it('fetches Zil clans and families', async () => {
    expect.assertions(2)
    const clans = {}
    await fetchZilClans(clans)
    const keys = Object.keys(clans)
    const haveArrays = keys.reduce((acc, curr) => acc && Array.isArray(clans[curr]) && (clans[curr].length > 0), true)
    expect(keys.length).toBeGreaterThan(0)
    expect(haveArrays).toEqual(true)
  })
})

describe('fetchTraits', () => {
  it('fetches traits', async () => {
    expect.assertions(5)
    const data = {
      cultures: await fetchCultures(),
      races: await fetchRaces(),
      religions: await fetchReligions()
    }
    await fetchTraits(data)

    const isPopulatedArray = arr => Array.isArray(arr)
    // Once traits are finished, check that all arrays actually have something
    // const isPopulatedArray = arr => Array.isArray(arr) && arr.length > 0
    const hasTraitSet = obj => {
      return isPopulatedArray(obj.personality)
        && obj.ideals
        && isPopulatedArray(obj.ideals.good)
        && isPopulatedArray(obj.ideals.evil)
        && isPopulatedArray(obj.ideals.lawful)
        && isPopulatedArray(obj.ideals.chaotic)
        && isPopulatedArray(obj.ideals.neutral)
        && isPopulatedArray(obj.ideals.any)
        && isPopulatedArray(obj.bonds)
        && isPopulatedArray(obj.flaws)
    }

    const cultures = Object.keys(data.cultures).reduce((acc, curr) => hasTraitSet(data.cultures[curr].traits), true)
    const races = Object.keys(data.races).reduce((acc, curr) => data.races[curr].traits ? hasTraitSet(data.races[curr].traits) : true, true)
    const religions = Object.keys(data.religions).reduce((acc, curr) => data.religions[curr].traits ? hasTraitSet(data.religions[curr].traits) : true, true)
    const any = hasTraitSet(data.traits.any)
    const lifestyles = Object.keys(data.traits.lifestyle).reduce((acc, curr) => hasTraitSet(data.traits.lifestyle[curr]), true)

    expect(cultures).toEqual(true)
    expect(races).toEqual(true)
    expect(religions).toEqual(true)
    expect(any).toEqual(true)
    expect(lifestyles).toEqual(true)
  })
})

describe('fetchData', () => {
  it('fetches all the data in one object', async () => {
    expect.assertions(9)
    const data = await fetchData()
    expect(data.demographics).toBeDefined()
    expect(data.races).toBeDefined()
    expect(data.cultures).toBeDefined()
    expect(data.religions).toBeDefined()
    expect(data.names).toBeDefined()
    expect(data.vars).toBeDefined()
    expect(data.traits.any).toBeDefined()
    expect(data.traits.lifestyle).toBeDefined()
    expect(data.names.Zil.clans).toBeDefined()
  })
})
