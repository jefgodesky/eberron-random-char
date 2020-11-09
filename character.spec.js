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