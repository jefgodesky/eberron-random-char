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
})