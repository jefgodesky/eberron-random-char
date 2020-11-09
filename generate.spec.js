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
  addTraits,
  chooseTraits,
  chooseGender,
  chooseGivenName,
  chooseFamilyName
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

describe('chooseTraits', () => {
  it('chooses traits randomly from a set', () => {
    const set = {
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
    const actual = chooseTraits(set)
    expect(actual).toBeDefined()
    expect(set.personality.includes(actual.personality)).toEqual(true)
    expect(set.ideals.map(ideal => ideal.ideal).includes(actual.ideal.ideal)).toEqual(true)
    expect(set.bonds.includes(actual.bond)).toEqual(true)
    expect(set.flaws.includes(actual.flaw)).toEqual(true)
  })
})

describe('chooseGender', () => {
  it('chooses a gender', () => {
    const possibilities = [ 'Female', 'Male', 'Non-binary', 'Genderfluid', 'Agender' ]
    const actual = chooseGender(possibilities)
    expect(possibilities.includes(actual)).toEqual(true)
  })
})

describe('chooseGivenName', () => {
  it('chooses a name', () => {
    const name = chooseGivenName(data, 'Brelish', 'Female')
    expect(data.names.Brelish.female.includes(name)).toEqual(true)
  })
})

describe('chooseFamilyName', () => {
  it('chooses a family name', () => {
    const name = chooseFamilyName(data, 'Tairnadal')
    expect(data.names.Tairnadal.surname.includes(name)).toEqual(true)
  })

  it('might choose an occupational surname for some name lists', () => {
    const name = chooseFamilyName(data, 'Brelish')
    const options = [ ...data.names.Brelish.surname, ...data.names['Occupational surnames'].surname ]
    expect(options.includes(name)).toEqual(true)
  })

  it('handles Zil clans', () => {
    const name = chooseFamilyName(data, 'Zil')
    const parts = name.split(' ')
    expect(data.names.Zil.clans[parts[1]].includes(parts[0])).toEqual(true)
  })

  it('returns null if that list doesn\'t have family names', () => {
    const name = chooseFamilyName(data, 'Changeling')
    expect(name).toEqual(null)
  })
})
