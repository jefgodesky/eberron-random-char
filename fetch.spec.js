/* global describe, it, expect */

const {
  fetchAreas,
  fetchDemographics,
  fetchRaces,
  fetchCultures,
  fetchReligions,
  fetchHouses,
  fetchNames,
  fetchVars,
  fetchZilClans,
  fetchNobleFamilies,
  fetchTraits,
  fetchData
} = require('./fetch')

describe('fetchAreas', () => {
  it('fetches areas', async () => {
    expect.assertions(2)
    const areas = await fetchAreas()
    const keys = Object.keys(areas)
    expect(keys.length).toBeGreaterThan(0)
    expect(typeof areas[keys[0]]).toEqual('number')
  })
})

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
    expect.assertions(8)
    const cultures = await fetchCultures()
    const keys = Object.keys(cultures)
    const haveCommon = keys.reduce((acc, curr) => acc && cultures[curr].common !== undefined, true)
    const haveNames = keys.reduce((acc, curr) => acc && cultures[curr].names !== undefined, true)
    const haveGenderNorms = keys.reduce((acc, curr) => acc && typeof cultures[curr].eschewsGender === 'boolean', true)
    const havePiety = keys.reduce((acc, curr) => acc && cultures[curr].religion.piety !== undefined, true)
    const haveMod = keys.reduce((acc, curr) => acc && cultures[curr].religion.mod !== undefined, true)
    const havePreferred = keys.reduce((acc, curr) => acc && cultures[curr].religion.preferred !== undefined, true)
    const haveAlignment = keys.reduce((acc, curr) => acc && cultures[curr].alignment !== undefined, true)
    expect(keys.length).toBeGreaterThan(0)
    expect(haveCommon).toEqual(true)
    expect(haveNames).toEqual(true)
    expect(haveGenderNorms).toEqual(true)
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

describe('fetchHouses', () => {
  it('fetches dragonmarked houses', async () => {
    expect.assertions(4)
    const houses = await fetchHouses()
    console.log(houses)
    const hasName = houses.reduce((acc, curr) => acc && typeof curr.name === 'string', true)
    const hasMark = houses.reduce((acc, curr) => acc && typeof curr.mark === 'string', true)
    const hasRaces = houses.reduce((acc, curr) => acc && Array.isArray(curr.races) && curr.races.length > 0, true)
    expect(houses).toHaveLength(13)
    expect(hasName).toEqual(true)
    expect(hasMark).toEqual(true)
    expect(hasRaces).toEqual(true)
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

describe('fetchNobleFamilies', () => {
  it('fetches noble families', async () => {
    expect.assertions(5)
    const data = {
      cultures: await fetchCultures()
    }
    await fetchNobleFamilies(data)
    const clarns = data.cultures.Brelish.nobility.families.filter(fam => fam.family === 'Clarn')
    expect(data.cultures.Brelish.nobility).toBeDefined()
    expect(data.cultures.Brelish.nobility.prefix).toEqual('ir’')
    expect(clarns).toHaveLength(1)
    expect(clarns[0].family).toEqual('Clarn')
    expect(clarns[0].race).toEqual('Human')
  })
})

describe('fetchTraits', () => {
  it('fetches traits', async () => {
    expect.assertions(9)
    const data = {
      cultures: await fetchCultures(),
      races: await fetchRaces(),
      religions: await fetchReligions(),
      houses: await fetchHouses()
    }
    await fetchTraits(data)
    const lyrandar = data.houses.filter(house => house.name === 'Lyrandar')[0]
    expect(data.cultures.Brelish.traits.personality).toHaveLength(10)
    expect(data.cultures.Aundairian.traits.ideals.good).toHaveLength(6)
    expect(data.cultures.Cyran.traits.ideals.evil).toHaveLength(6)
    expect(data.cultures.Karrnathi.traits.ideals.lawful).toHaveLength(6)
    expect(data.cultures.Thranish.traits.ideals.chaotic).toHaveLength(6)
    expect(data.races.Human.traits.ideals.neutral).toHaveLength(6)
    expect(data.religions['Sovereign Host'].traits.ideals.any).toHaveLength(6)
    expect(lyrandar.traits.bonds).toHaveLength(5)
    expect(data.traits.lifestyle.Rich.flaws).toHaveLength(10)
  })

  it('fetches Tairnadal ancestor traits', async () => {
    expect.assertions(11)
    const data = {
      cultures: await fetchCultures(),
      races: await fetchRaces(),
      religions: await fetchReligions(),
      houses: await fetchHouses()
    }
    await fetchTraits(data)
    expect(data.cultures.Tairnadal.ancestors.length).toBeGreaterThan(0)
    expect(typeof data.cultures.Tairnadal.ancestors[0].name).toEqual('string')
    expect(data.cultures.Tairnadal.ancestors[0].personality).toHaveLength(3)
    expect(typeof data.cultures.Tairnadal.ancestors[0].ideals.good).toEqual('string')
    expect(typeof data.cultures.Tairnadal.ancestors[0].ideals.evil).toEqual('string')
    expect(typeof data.cultures.Tairnadal.ancestors[0].ideals.lawful).toEqual('string')
    expect(typeof data.cultures.Tairnadal.ancestors[0].ideals.chaotic).toEqual('string')
    expect(typeof data.cultures.Tairnadal.ancestors[0].ideals.neutral).toEqual('string')
    expect(typeof data.cultures.Tairnadal.ancestors[0].ideals.any).toEqual('string')
    expect(data.cultures.Tairnadal.ancestors[0].bonds).toHaveLength(3)
    expect(data.cultures.Tairnadal.ancestors[0].flaws).toHaveLength(3)
  })

  it('fetches Mror families and their ideals', async () => {
    expect.assertions(4)
    const data = {
      cultures: await fetchCultures(),
      races: await fetchRaces(),
      religions: await fetchReligions(),
      houses: await fetchHouses()
    }
    await fetchTraits(data)
    const families = Object.keys(data.cultures.Mror.families)
    const haveIdeals = families.reduce((acc, curr) => {
      const family = data.cultures.Mror.families[curr]
      const possibilities = [ 'good', 'evil', 'lawful', 'chaotic', 'neutral' ]
      return acc && typeof family.ideal === 'string' && possibilities.includes(family.type)
    }, true)
    expect(data.cultures.Mror.traits).toBeDefined()
    expect(data.cultures.Mror.traits.ideals).not.toBeDefined()
    expect(families.length).toBeGreaterThan(0)
    expect(haveIdeals).toEqual(true)
  })
})

describe('fetchData', () => {
  it('fetches all the data in one object', async () => {
    expect.assertions(10)
    const data = await fetchData()
    expect(data.areas).toBeDefined()
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
