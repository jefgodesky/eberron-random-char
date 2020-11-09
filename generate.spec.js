/* global describe, it, expect, beforeAll */

const {
  chooseRaceFromDemographics,
  chooseCultureFromRace,
  chooseReligionFromDemographics,
  choosePiety,
  isPious,
  generateRandomAlignment,
  generateAcceptableRandomAlignment,
  chooseLifestyle,
  addTraits
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
    const race = { alignment: 'CN' }
    const culture = { alignment: 'N' }
    const religion = { alignment: 'LG' }
    const actual = generateAcceptableRandomAlignment(race, culture, religion, 2, acceptable)
    expect(acceptable.includes(actual)).toEqual(true)
  })

  it('returns the specified alignment if only given one', () => {
    const acceptable = [ 'CG' ]
    const race = { alignment: 'CN' }
    const culture = { alignment: 'N' }
    const religion = { alignment: 'LG' }
    const actual = generateAcceptableRandomAlignment(race, culture, religion, 2, acceptable)
    expect(actual).toEqual('CG')
  })
})

describe('chooseLifestyle', () => {
  it('chooses a lifestyle', () => {
    const lifestyles = [ 'Rich', 'Middle', 'Poor' ]
    expect(lifestyles.includes(chooseLifestyle())).toEqual(true)
  })
})

describe('addTraits', () => {
  it('selects traits from the given set if you don\'t provide an existing set', () => {
    const set1 = {
      personality: [ 'Personality 1' ],
      ideals: {
        good: [ 'Good 1' ],
        evil: [ 'Evil 1' ],
        lawful: [ 'Lawful 1' ],
        chaotic: [ 'Chaotic 1' ],
        neutral: [ 'Neutral 1' ],
        any: [ 'Any 1' ]
      },
      bonds: [ 'Bond 1' ],
      flaws: [ 'Flaw 1' ]
    }
    const actual = addTraits(null, set1, 'N')
    const expected = {
      personality: [ 'Personality 1' ],
      ideals: [
        { ideal: 'Any 1', type: 'any' },
        { ideal: 'Neutral 1', type: 'neutral' }
      ],
      bonds: [ 'Bond 1' ],
      flaws: [ 'Flaw 1' ]
    }
    expect(actual).toEqual(expected)
  })

  it('adds a new set of traits to an existing one', () => {
    const set1 = {
      personality: [ 'Personality 1' ],
      ideals: {
        good: [ 'Good 1' ],
        evil: [ 'Evil 1' ],
        lawful: [ 'Lawful 1' ],
        chaotic: [ 'Chaotic 1' ],
        neutral: [ 'Neutral 1' ],
        any: [ 'Any 1' ]
      },
      bonds: [ 'Bond 1' ],
      flaws: [ 'Flaw 1' ]
    }
    const before = addTraits(null, set1, 'N')

    const set2 = {
      personality: [ 'Personality 2' ],
      ideals: {
        good: [ 'Good 2' ],
        evil: [ 'Evil 2' ],
        lawful: [ 'Lawful 2' ],
        chaotic: [ 'Chaotic 2' ],
        neutral: [ 'Neutral 2' ],
        any: [ 'Any 2' ]
      },
      bonds: [ 'Bond 2' ],
      flaws: [ 'Flaw 2' ]
    }
    const actual = addTraits(before, set2, 'N')

    const expected = {
      personality: [ 'Personality 1', 'Personality 2' ],
      ideals: [
        { ideal: 'Any 1', type: 'any' },
        { ideal: 'Neutral 1', type: 'neutral' },
        { ideal: 'Any 2', type: 'any' },
        { ideal: 'Neutral 2', type: 'neutral' }
      ],
      bonds: [ 'Bond 1', 'Bond 2' ],
      flaws: [ 'Flaw 1', 'Flaw 2' ]
    }
    expect(actual).toEqual(expected)
  })
})
