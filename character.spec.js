/* global describe, it, expect, beforeAll */

const { fetchData } = require('./fetch')
const Character = require('./character')

describe('Character', () => {
  beforeAll(async () => {
    data = await fetchData()
  })

  describe('constructor', () => {
    it('returns an empty character', () => {
      const actual = new Character()
      const { name, race, culture, faith, alignment, lifestyle, gender, traits } = actual
      expect(actual).toBeDefined()
      expect(actual).toBeInstanceOf(Character)
      expect(name).toEqual({ given: null, family: null })
      expect(race).toEqual(null)
      expect(culture).toEqual(null)
      expect(faith).toEqual({ religion: null, piety: null })
      expect(alignment).toEqual(null)
      expect(lifestyle).toEqual(null)
      expect(gender).toEqual(null)
      expect(traits).toEqual({ personality: null, ideal: null, bond: null, flaw: null })
    })
  })

  describe('setPiety', () => {
    it('assigns a piety score', () => {
      const char = new Character()
      char.culture = 'Brelish'
      char.setPiety(data)
      expect(typeof char.faith.piety).toEqual('number')
    })
  })

  describe('isPious', () => {
    it('returns true if given a value more than 1.5 standard deviations above the mean', () => {
      const char = new Character()
      char.faith.piety = 2
      expect(char.isPious()).toEqual(true)
    })

    it('returns false if given a value not more than 1.5 standard deviations above the mean', () => {
      const char = new Character()
      char.faith.piety = 1
      expect(char.isPious()).toEqual(false)
    })
  })

  describe('setGender', () => {
    it('sets a random gender', () => {
      const genders = [ 'Female', 'Male', 'Non-binary', 'Genderfluid', 'Agender' ]
      const char = new Character()
      char.setGender()
      expect(genders.includes(char.gender)).toEqual(true)
    })

    it('can be restricted to a subset of genders', () => {
      const acceptable = [ 'Female' ]
      const char = new Character()
      char.setGender(acceptable)
      expect(char.gender).toEqual('Female')
    })
  })

  describe('setGivenName', () => {
    it('sets a given name', () => {
      const char = new Character()
      char.gender = 'Female'
      char.culture = 'Brelish'
      char.setGivenName(data)
      expect(data.names.Brelish.female.includes(char.name.given)).toEqual(true)
    })
  })

  describe('setFamilyName', () => {
    it('chooses a family name', () => {
      const char = new Character()
      char.culture = 'Tairnadal'
      char.setFamilyName(data)
      expect(data.names.Tairnadal.surname.includes(char.name.family)).toEqual(true)
    })

    it('might choose an occupational surname for some name lists', () => {
      const char = new Character()
      char.culture = 'Brelish'
      char.setFamilyName(data)
      const options = [ ...data.names.Brelish.surname, ...data.names['Occupational surnames'].surname ]
      expect(options.includes(char.name.family)).toEqual(true)
    })

    it('handles Zil clans', () => {
      const char = new Character()
      char.culture = 'Zil'
      char.setFamilyName(data)
      const parts = char.name.family.split(' ')
      expect(data.names.Zil.clans[parts[1]].includes(parts[0])).toEqual(true)
    })

    it('returns null if that list doesn\'t have family names', () => {
      const char = new Character()
      char.culture = 'Traveler Changeling'
      char.setFamilyName(data)
      expect(char.name.family).toEqual(null)
    })
  })

  describe('getFullName', () => {
    it('returns a full name', () => {
      const char = new Character()
      char.gender = 'Female'
      char.culture = 'Tairnadal'
      char.setGivenName(data)
      char.setFamilyName(data)
      const name = char.getFullName()
      const parts = name.split(' ')
      expect(parts).toHaveLength(2)
      expect(data.names.Tairnadal.female.includes(parts[0])).toEqual(true)
      expect(data.names.Tairnadal.surname.includes(parts[1])).toEqual(true)
    })
  })

  describe('setPersonalAlignment', () => {
    it('sets an alignment', () => {
      const alignments = [ 'LG', 'NG', 'CG', 'LN', 'N', 'CN', 'LE', 'NE', 'CE' ]
      const char = new Character()
      char.setPersonalAlignment()
      expect(alignments.includes(char.alignment)).toEqual(true)
    })
  })

  describe('setAcceptableAlignment', () => {
    it('returns an acceptable alignment', () => {
      const acceptable = [ 'LG', 'NG', 'CG' ]
      const char = new Character()
      char.race = 'Human'
      char.culture = 'Brelish'
      char.faith.piety = 0
      char.faith.religion = 'Sovereign Host'
      char.setAcceptableAlignment(data, acceptable)
      expect(acceptable.includes(char.alignment)).toEqual(true)
    })

    it('returns the specified alignment if only given one', () => {
      const acceptable = [ 'CG' ]
      const char = new Character()
      char.race = 'Human'
      char.culture = 'Brelish'
      char.faith.piety = 0
      char.faith.religion = 'Sovereign Host'
      char.setAcceptableAlignment(data, acceptable)
      expect(char.alignment).toEqual('CG')
    })
  })

  describe('setLifestyle', () => {
    it('sets lifestyle', () => {
      const lifestyles = [ 'Rich', 'Middle', 'Poor' ]
      const char = new Character()
      char.setLifestyle()
      expect(lifestyles.includes(char.lifestyle)).toEqual(true)
    })
  })

  describe('setTraits', () => {
    it('sets traits', () => {
      const char = new Character()
      char.race = 'Human'
      char.culture = 'Brelish'
      char.alignment = 'CG'
      char.setLifestyle()
      char.faith = { religion: 'Sovereign Host', piety: 0 }
      char.setTraits(data)
      expect(typeof char.traits.personality).toEqual('string')
      expect(typeof char.traits.ideal).toEqual('object')
      expect(typeof char.traits.bond).toEqual('string')
      expect(typeof char.traits.flaw).toEqual('string')
    })
  })

  describe('getIdeal', () => {
    it('returns a string for the character\'s ideal', () => {
      const char = new Character()
      char.traits.ideal = {
        ideal: 'Testing. A good developer always writes unit tests.',
        type: 'lawful'
      }
      expect(char.getIdeal()).toEqual('Testing. A good developer always writes unit tests. (Lawful)')
    })
  })

  describe('getDesc', () => {
    it('returns the character\'s parenthetical description', () => {
      const char = new Character()
      char.alignment = 'CG'
      char.culture = 'Brelish'
      char.race = 'Human'
      char.gender = 'Agender'
      expect(char.getDesc()).toEqual('(CG agender Brelish human)')
    })
  })

  describe('chooseRaceFromDemographics', () => {
    it('returns a random acceptable race', () => {
      const actual = Character.chooseRaceFromDemographics(data, 'Sharn', { race: [ 'Human' ] })
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
      expect(Character.chooseCultureFromRace(race, { culture: [ 'Brelish' ] })).toEqual('Brelish')
    })
  })

  describe('chooseReligionFromDemographics', () => {
    it('picks a religion', () => {
      const actual = Character.chooseReligionFromDemographics(data, 'Sharn', { religion: [ 'Sovereign Host' ] })
      expect(actual.name).toEqual('Sovereign Host')
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
      const actual = Character.addTraits(null, set1, 'N')
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
      const before = Character.addTraits(null, set1, 'N')

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
      const actual = Character.addTraits(before, set2, 'N')

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

  describe('parseTraits', () => {
    it('can replace a whole string', () => {
      const actual = Character.parseTraitVar(data.vars, '<PHOBIA>')
      expect(data.vars['<PHOBIA>'].includes(actual))
    })

    it('can replace part of a string', () => {
      const actual = Character.parseTraitVar(data.vars, 'I fought for <FIVENATIONS> during the war.')
      const match = actual.match(/I fought for (.*?) during the war\./)
      expect(match).toHaveLength(2)
      expect(data.vars['<FIVENATIONS>'].includes(match[1])).toEqual(true)
    })
  })

  describe('generate', () => {
    it('generates a character', () => {
      const options = { race: [], culture: [], religion: [], alignment: [], gender: [] }
      const char = Character.generate(data, 'Sharn', options)
      expect(char).toBeInstanceOf(Character)
      expect(typeof char.race).toEqual('string')
      expect(typeof char.culture).toEqual('string')
      expect(typeof char.name.given).toEqual('string')
      expect([ 'Female', 'Male', 'Non-binary', 'Genderfluid', 'Agender' ].includes(char.gender)).toEqual(true)
      expect(typeof char.faith.religion).toEqual('string')
      expect(typeof char.faith.piety).toEqual('number')
      expect([ 'LG', 'NG', 'CG', 'LN', 'N', 'CN', 'LE', 'NE', 'CE' ].includes(char.alignment)).toEqual(true)
      expect(typeof char.lifestyle).toEqual('string')
      expect(typeof char.traits).toEqual('object')
      expect(typeof char.traits.personality).toEqual('string')
      expect(typeof char.traits.ideal).toEqual('object')
      expect(typeof char.traits.ideal.ideal).toEqual('string')
      expect(typeof char.traits.ideal.type).toEqual('string')
      expect(typeof char.traits.bond).toEqual('string')
      expect(typeof char.traits.flaw).toEqual('string')
    })
  })
})