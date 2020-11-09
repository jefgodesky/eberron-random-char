/* global describe, it, expect, beforeAll */

const Character = require('./character')

describe('Character', () => {
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
})