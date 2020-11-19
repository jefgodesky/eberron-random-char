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
      char.culture = 'Mror'
      char.noble = false
      char.setFamilyName(data)
      expect(data.names.Mror.surname.includes(char.name.family)).toEqual(true)
    })

    it('might choose an occupational surname for some name lists', () => {
      const char = new Character()
      char.culture = 'Brelish'
      char.noble = false
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

    it('selects from the noble families if you\'re noble', () => {
      const char = new Character()
      char.culture = 'Brelish'
      char.noble = true
      char.setFamilyName(data)
      expect(data.cultures.Brelish.nobility.families.includes(char.name.family)).toEqual(true)
      expect(char.name.prefix).toEqual('ir’')
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
      expect(data.names.Tairnadal.female.includes(name)).toEqual(true)
    })

    it('returns a noble\'s full name', () => {
      const char = new Character()
      char.gender = 'Male'
      char.culture = 'Brelish'
      char.noble = true
      char.setGivenName(data)
      char.setFamilyName(data)
      const name = char.getFullName()
      expect(name).toMatch(/ir’/)
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
      char.setLifestyle(data)
      expect(lifestyles.includes(char.lifestyle)).toEqual(true)
    })

    it('sets if you\'re a noble', () => {
      const char = new Character()
      char.setLifestyle(data)
      expect(typeof char.noble).toEqual('boolean')
    })

    it('doesn\'t return anyone rich if it\'s anchored in poverty', () => {
      const char = new Character()
      char.setLifestyle(data, 'Poor')
      expect(char.lifestyle).not.toEqual('Rich')
    })

    it('doesn\'t return a noble if it\'s anchored in the middle class', () => {
      const char = new Character()
      char.setLifestyle(data, 'Middle')
      expect(char.noble).toEqual(false)
    })

    it('doesn\'t return anyone poor if it\'s anchored in wealth', () => {
      const char = new Character()
      char.setLifestyle(data, 'Rich')
      expect(char.lifestyle).not.toEqual('Poor')
    })

    it('doesn\'t return anyone from the middle class if it\'s anchored in nobility', () => {
      const char = new Character()
      char.setLifestyle(data, 'Noble')
      expect(char.lifestyle).not.toEqual('Middle')
    })
  })

  describe('ennoble', () => {
    it('makes the character a noble', () => {
      const char = new Character()
      char.culture = 'Brelish'
      char.name.given = 'Brent'
      char.ennoble(data)
      expect(data.cultures.Brelish.nobility.families).toContain(char.name.family)
      expect(data.cultures.Brelish.nobility.prefix).toEqual(char.name.prefix)
      expect(char.noble).toEqual(true)
    })
  })

  describe('setDragonmark', () => {
    it('sets a dragonmark', () => {
      const char = new Character()
      char.race = 'Half-orc'
      char.setDragonmark(data, 'Finding')
      expect(char.mark).toEqual('Finding')
    })

    it('won\'t set a dragonmark that you can\'t have', () => {
      const char = new Character()
      char.race = 'Half-orc'
      char.setDragonmark(data, 'Scribing')
      expect(char.mark).not.toEqual('Scribing')
    })
  })

  describe('setHouse', () => {
    it('sets a house', () => {
      const char = new Character()
      char.race = 'Elf'
      char.setHouse(data, 'Thuranni')
      expect(char.house).toEqual('Thuranni')
    })
  })

  describe('setTairnadalTraits', () => {
    it('sets traits for a Tairnadal character', () => {
      const char = new Character()
      char.race = 'Elf'
      char.culture = 'Tairnadal'
      char.alignment = 'N'
      char.setTairnadalTraits(data)
      const ancestor = data.cultures.Tairnadal.ancestors.filter(ancestor => ancestor.name === char.ancestor)[0]
      expect(char.ancestor).toBeDefined()
      expect(typeof char.ancestor).toEqual('string')
      expect(ancestor.personality).toContain(char.traits.personality)
      expect(ancestor.bonds).toContain(char.traits.bond)
      expect(ancestor.flaws).toContain(char.traits.flaw)
    })
  })

  describe('setMrorTraits', () => {
    it('sets traits for a Mror character', () => {
      const char = new Character()
      char.race = 'Dwarf'
      char.culture = 'Mror'
      char.alignment = 'N'
      char.setFamilyName(data)
      char.setMrorTraits(data)
      const family = data.cultures.Mror.families[char.name.family]
      expect(char.traits.ideal.ideal).toEqual(family.ideal)
      expect(char.traits.ideal.type).toEqual(family.type)
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

  describe('getLede', () => {
    it('describes a noble', () => {
      const char = new Character()
      char.name = { given: 'Brent', family: 'Clarn', prefix: 'ir’' }
      char.culture = 'Brelish'
      char.noble = true
      expect(char.getLede(data)).toEqual('comes from the noble Clarn family of Breland.')
    })

    it('describes a noble from the Mror Holds', () => {
      const char = new Character()
      char.name = { given: 'Brent', family: 'Mrorannon' }
      char.culture = 'Mror'
      char.noble = true
      expect(char.getLede(data)).toEqual('comes from Clan Mrorannon, one of the twelve ruling clans of the Mror Holds.')
    })

    it('describes a dragonmarked heir', () => {
      const char = new Character()
      char.name = { given: 'Brent', family: 'Cannith', prefix: 'd’' }
      char.culture = 'Brelish'
      char.house = 'Cannith'
      char.mark = 'Making'
      expect(char.getLede(data)).toEqual('is a dragonmarked heir of House Cannith.')
    })

    it('describes a character with an aberrant dragonmark who is in a house', () => {
      const char = new Character()
      char.name = { given: 'Brent', family: 'Cannith', prefix: 'd’' }
      char.culture = 'Brelish'
      char.house = 'Cannith'
      char.mark = 'Aberrant'
      expect(char.getLede(data)).toEqual('is a member of House Cannith with an aberrant dragonmark.')
    })

    it('describes a character who is a member of a house but has no dragonmark', () => {
      const char = new Character()
      char.name = { given: 'Brent', family: 'Cannith', prefix: 'd’' }
      char.culture = 'Brelish'
      char.house = 'Cannith'
      expect(char.getLede(data)).toEqual('is an unmarked member of House Cannith.')
    })

    it('describes a character with a dragonmark that isn\'t a member of any house', () => {
      const char = new Character()
      char.name = { given: 'Brent', family: 'Tester' }
      char.culture = 'Brelish'
      char.mark = 'Making'
      expect(char.getLede(data)).toEqual('bears the Mark of Making, but is not a member of House Cannith.')
    })

    it('describes a character with an aberrant dragonmark', () => {
      const char = new Character()
      char.name = { given: 'Brent', family: 'Tester’' }
      char.culture = 'Brelish'
      char.mark = 'Aberrant'
      expect(char.getLede(data)).toEqual('bears an aberrant dragonmark.')
    })

    it('describes a character with no house, dragonmark, or noble line', () => {
      const char = new Character()
      char.name = { given: 'Brent', family: 'Tester’' }
      char.race = 'Human'
      char.culture = 'Brelish'
      expect(char.getLede(data)).toEqual('is a Brelish human.')
    })
  })

  describe('getReligion', () => {
    it('describes a devout character', () => {
      const char = new Character()
      char.gender = 'Female'
      char.faith = { religion: 'Sovereign Host', piety: 2 }
      expect(char.getReligion(data)).toEqual('She is a devout Vassal.')
    })

    it('returns null if the character isn\'t particularly devout', () => {
      const char = new Character()
      char.gender = 'Female'
      char.faith = { religion: 'Sovereign Host', piety: 0 }
      expect(char.getReligion(data)).toEqual(null)
    })

    it('returns null if the character is an atheist', () => {
      const char = new Character()
      char.gender = 'Female'
      char.faith = { religion: 'Atheism', piety: 2 }
      expect(char.getReligion(data)).toEqual(null)
    })
  })

  describe('getWikiCategories', () => {
    it('returns categories', () => {
      const char = new Character()
      char.name = { given: 'Fname', family: 'Lname' }
      char.race = 'Human'
      char.culture = 'Brelish'
      char.alignment = 'CG'
      const expected = '[[Category:Humans|Lname, Fname]]\n[[Category:Brelish characters|Lname, Fname]]\n[[Category:Good characters|Lname, Fname]]\n[[Category:Chaotic characters|Lname, Fname]]\n[[Category:Chaotic good characters|Lname, Fname]]'
      expect(char.getWikiCategories(data)).toEqual(expected)
    })

    it('adds members of dragonmarked houses to the corresponding category', () => {
      const char = new Character()
      char.name = { given: 'Fname', family: 'Lname' }
      char.race = 'Human'
      char.culture = 'Brelish'
      char.alignment = 'CG'
      char.house = 'Cannith'
      const expected = '[[Category:House Cannith|Lname, Fname]]\n[[Category:Humans|Lname, Fname]]\n[[Category:Brelish characters|Lname, Fname]]\n[[Category:Good characters|Lname, Fname]]\n[[Category:Chaotic characters|Lname, Fname]]\n[[Category:Chaotic good characters|Lname, Fname]]'
      expect(char.getWikiCategories(data)).toEqual(expected)
    })

    it('sorts members of dragonmarked houses who take the house\'s name by first name', () => {
      const char = new Character()
      char.name = { given: 'Fname', family: 'Cannith' }
      char.race = 'Human'
      char.culture = 'Brelish'
      char.alignment = 'CG'
      char.house = 'Cannith'
      const expected = '[[Category:House Cannith|Fname Cannith]]\n[[Category:Humans|Cannith, Fname]]\n[[Category:Brelish characters|Cannith, Fname]]\n[[Category:Good characters|Cannith, Fname]]\n[[Category:Chaotic characters|Cannith, Fname]]\n[[Category:Chaotic good characters|Cannith, Fname]]'
      expect(char.getWikiCategories(data)).toEqual(expected)
    })

    it('adds characters with dragonmarks to the corresponding category', () => {
      const char = new Character()
      char.name = { given: 'Fname', family: 'Lname' }
      char.race = 'Human'
      char.culture = 'Brelish'
      char.alignment = 'CG'
      char.mark = 'Making'
      const expected = '[[Category:Characters with the Mark of Making|Lname, Fname]]\n[[Category:Humans|Lname, Fname]]\n[[Category:Brelish characters|Lname, Fname]]\n[[Category:Good characters|Lname, Fname]]\n[[Category:Chaotic characters|Lname, Fname]]\n[[Category:Chaotic good characters|Lname, Fname]]'
      expect(char.getWikiCategories(data)).toEqual(expected)
    })

    it('sorts dragonmarked characters who take the house name by given name', () => {
      const char = new Character()
      char.name = { given: 'Fname', family: 'Cannith' }
      char.race = 'Human'
      char.culture = 'Brelish'
      char.alignment = 'CG'
      char.mark = 'Making'
      const expected = '[[Category:Characters with the Mark of Making|Fname Cannith]]\n[[Category:Humans|Cannith, Fname]]\n[[Category:Brelish characters|Cannith, Fname]]\n[[Category:Good characters|Cannith, Fname]]\n[[Category:Chaotic characters|Cannith, Fname]]\n[[Category:Chaotic good characters|Cannith, Fname]]'
      expect(char.getWikiCategories(data)).toEqual(expected)
    })

    it('categorizes members of Mror clans', () => {
      const char = new Character()
      char.name = { given: 'Fname', family: "Lname" }
      char.race = 'Dwarf'
      char.culture = 'Mror'
      char.alignment = 'CG'
      const expected = '[[Category:Clan Lname|Fname Lname]]\n[[Category:Dwarves|Lname, Fname]]\n[[Category:Mror characters|Lname, Fname]]\n[[Category:Good characters|Lname, Fname]]\n[[Category:Chaotic characters|Lname, Fname]]\n[[Category:Chaotic good characters|Lname, Fname]]'
      expect(char.getWikiCategories(data)).toEqual(expected)
    })

    it('categorizes members of noble families', () => {
      const char = new Character()
      char.race = 'Human'
      char.culture = 'Brelish'
      char.name = { given: 'Brent', family: 'Clarn', prefix: 'ir’' }
      char.noble = true
      char.alignment = 'CG'
      const expected = '[[Category:Clarn family|Brent Clarn]]\n[[Category:Humans|Clarn, Brent]]\n[[Category:Brelish characters|Clarn, Brent]]\n[[Category:Good characters|Clarn, Brent]]\n[[Category:Chaotic characters|Clarn, Brent]]\n[[Category:Chaotic good characters|Clarn, Brent]]'
      expect(char.getWikiCategories(data)).toEqual(expected)
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

  describe('chooseDemographic', () => {
    it('chooses a demographic', () => {
      expect.assertions(7)
      const options = { race: [], culture: [], religion: [] }
      const actual = Character.chooseDemographic(data.demographics['Sharn'], options)
      expect(actual).toBeDefined()
      expect(typeof actual.race).toEqual('string')
      expect(typeof actual.culture).toEqual('string')
      expect(typeof actual.religion).toEqual('string')
      expect(typeof actual.pop).toEqual('number')
      expect(actual.to).not.toBeDefined()
      expect(actual.from).not.toBeDefined()
    })

    it('respects restrictions', () => {
      expect.assertions(3)
      const options = { race: [ 'Aasimar' ], culture: [ 'Karrnathi' ], religion: [ 'Atheism' ] }
      const actual = Character.chooseDemographic(data.demographics['Sharn'], options)
      expect(actual.race).toEqual('Aasimar')
      expect(actual.culture).toEqual('Karrnathi')
      expect(actual.religion).toEqual('Atheism')
    })
  })

  describe('generate', () => {
    it('generates a character', () => {
      const options = { race: [], culture: [], religion: [], alignment: [], gender: [], num: 1 }
      const char = Character.generate(data, 'Sharn', options)
      expect(char).toHaveLength(1)
      expect(char[0]).toBeInstanceOf(Character)
      expect(typeof char[0].race).toEqual('string')
      expect(typeof char[0].culture).toEqual('string')
      expect(typeof char[0].name.given).toEqual('string')
      expect([ 'Female', 'Male', 'Non-binary', 'Genderfluid', 'Agender' ]).toContain(char[0].gender)
      expect(typeof char[0].faith.religion).toEqual('string')
      expect(typeof char[0].faith.piety).toEqual('number')
      expect([ 'LG', 'NG', 'CG', 'LN', 'N', 'CN', 'LE', 'NE', 'CE' ]).toContain(char[0].alignment)
      expect(typeof char[0].lifestyle).toEqual('string')
      expect(typeof char[0].traits).toEqual('object')
      expect(typeof char[0].traits.personality).toEqual('string')
      expect(typeof char[0].traits.ideal).toEqual('object')
      expect(typeof char[0].traits.ideal.ideal).toEqual('string')
      expect(typeof char[0].traits.ideal.type).toEqual('string')
      expect(typeof char[0].traits.bond).toEqual('string')
      expect(typeof char[0].traits.flaw).toEqual('string')
    })

    it('can create 100 characters', () => {
      const options = { race: [], culture: [], religion: [], alignment: [], gender: [], num: 100 }
      expect(Character.generate(data, 'Sharn', options)).toHaveLength(100)
    })
  })
})
