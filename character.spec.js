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
      const { name, race, culture, faith, alignment, gender, traits } = actual
      expect(actual).toBeDefined()
      expect(actual).toBeInstanceOf(Character)
      expect(name).toEqual({ given: null, family: null })
      expect(race).toEqual(null)
      expect(culture).toEqual(null)
      expect(faith).toEqual({ religion: null, piety: null })
      expect(alignment).toEqual(null)
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

  describe('setPersonalAlignment', () => {
    it('sets an alignment', () => {
      const alignments = [ 'LG', 'NG', 'CG', 'LN', 'N', 'CN', 'LE', 'NE', 'CE' ]
      const char = new Character()
      char.setPersonalAlignment()
      expect(alignments.includes(char.alignment)).toEqual(true)
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
})