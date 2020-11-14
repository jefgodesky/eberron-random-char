const random = require('random')
const { avgAlignment } = require('./dndmath')
const {
  intersection,
  attemptIntersection,
  makeTable,
  rollTable,
  randomFloatFromBellCurve,
  randomElementFromArray
} = require('./randomizer')

class Character {
  constructor () {
    this.name = { given: null, family: null }
    this.gender = null
    this.race = null
    this.culture = null
    this.faith = { religion: null, piety: null }
    this.alignment = null
    this.lifestyle = null
    this.noble = false
    this.traits = { personality: null, ideal: null, bond: null, flaw: null }
  }

  /**
   * Sets the character's piety. Individual religious disposition is evenly
   * distributed, but different cultures modify this with an average piety score
   * that can push members of those cultures to be more or less devout.
   * @param data {object} - The full data set pulled from `fetchData`.
   */

  setPiety (data) {
    const disposition = randomFloatFromBellCurve()
    const cultural = this.culture && data.cultures && data.cultures[this.culture] && data.cultures[this.culture].religion
      ? data.cultures[this.culture].religion.piety || 0
      : 0
    this.faith.piety = disposition + cultural
  }

  /**
   * We'll consider a character "pious," meaning that religion plays a critical
   * part of hens life, if hens piety is more than 1.5 standard deviations
   * above the mean.
   * @returns {boolean} - `true` if the character is pious (e.g., hens piety is
   *   more than one standard deviation above the mean), or `false` if hen
   *   is not.
   */

  isPious () {
    return typeof this.faith.piety === 'number' && this.faith.piety > 1.5
  }

  /**
   * Choose a gender.
   * @param acceptable {string[]} - An array of acceptable gender options for
   *   this character.
   * @param eschewsGender {boolean} - Optional. If `true`, we're talking about a
   *   character from a background that eschews typical human gender norms (e.g.,
   *   warforged or elves), making non-binary, genderfluid, and agender options
   *   as common as male or female. (Default: `false`)
   */

  setGender (acceptable = [], eschewsGender = false) {
    const arr = eschewsGender
      ? [
          { gender: 'Female', pop: 30 },
          { gender: 'Male', pop: 30 },
          { gender: 'Non-binary', pop: 15 },
          { gender: 'Genderfluid', pop: 5 },
          { gender: 'Agender', pop: 20 }
        ]
      : [
          { gender: 'Female', pop: 49 },
          { gender: 'Male', pop: 49 },
          { gender: 'Non-binary', pop: 1 },
          { gender: 'Genderfluid', pop: 1 },
          { gender: 'Agender', pop: 1 }
        ]
    const filtered = arr.filter(item => acceptable.includes(item.gender))
    const options = filtered.length > 0 ? filtered : arr
    const choice = rollTable(makeTable(options))
    this.gender = choice.gender
  }

  /**
   * Sets the character's given name.
   * @param data {object} - The full data set pulled from `fetchData`.
   */

  setGivenName (data) {
    const { gender } = this
    const list = this.culture && data && data.cultures && data.cultures[this.culture] ? data.cultures[this.culture].names : null
    if (list && gender) {
      let names = []
      if (gender === 'Female') names = [ ...data.names[list].female ]
      if (gender === 'Male') names = [ ...data.names[list].male ]
      if (gender === 'Non-binary') names = attemptIntersection(data.names[list].female, data.names[list].male)
      if (gender === 'Genderfluid') names = attemptIntersection(data.names[list].female, data.names[list].male)
      if (gender === 'Agender') names = attemptIntersection(data.names[list].female, data.names[list].male)
      this.name.given = randomElementFromArray(names)
    }
  }

  /**
   * Sets a family name for the character.
   */

  setFamilyName (data) {
    const culture = this.culture && data.cultures ? data.cultures[this.culture] : null
    if (this.noble && culture.nobility && culture.nobility.families && culture.nobility.families.length > 0) {
      this.name.family = randomElementFromArray(culture.nobility.families)
      this.name.prefix = culture.nobility.prefix
    } else {
      const list = culture ? culture.names : null
      const addOccupations = ['Aundairian', 'Brelish', 'Cyran', 'Karrnathi', 'Thranish', 'Khoravar', 'Marcher', 'Reacher']
      if (addOccupations.includes(list)) {
        this.name.family = randomElementFromArray([ ...data.names[list].surname, ...data.names['Occupational surnames'].surname ])
      } else if (data.names[list].surname) {
        this.name.family = randomElementFromArray(data.names[list].surname)
      } else if (data.names[list].clans) {
        const clan = randomElementFromArray(Object.keys(data.names[list].clans))
        const family = randomElementFromArray(data.names[list].clans[clan])
        this.name.family = `${family} ${clan}`
      } else {
        this.name.family = null
      }
    }
  }

  /**
   * Return the character's full name.
   * @returns {string|null} - If the character has both a given name and a
   *   family name, a string is returned of the form `GIVEN FAMILY`. If the
   *   character has only a given name, the string is simply the given name.
   *   If the character has neither a given name nor a family name, the method
   *   returns `null`.
   */

  getFullName () {
    return this.name.family
      ? `${this.name.given} ${this.name.family}`
      : this.name.given
  }

  /**
   * Generate a random alignment. We assume that both the lawful/chaotic X axis
   * and the good/evil y axis are normally distributed, with most people being
   * neutral. This assigns values of good, evil, lawful, or chaotic to those
   * individuals who are more than one standard deviation from the mean on those
   * axes.
   */

  setPersonalAlignment () {
    const x = randomFloatFromBellCurve()
    const y = randomFloatFromBellCurve()
    const lc = x > 1 ? 'L' : x < -1 ? 'C' : 'N'
    const ge = y > 1 ? 'G' : y < -1 ? 'E' : 'N'
    const prelim = `${lc}${ge}`
    this.alignment = prelim === 'NN' ? 'N' : prelim
  }

  /**
   * Set a random alignment for this character. Each character has a personal
   * disposition, but it is weighted by hens race and culture (and, if hen is
   * a pious person, hens religion as well).
   * @param data {object} - The full data set pulled from `fetchData`.
   * @param acceptable {string[]} - An array of acceptable alignments. If no
   *   valid alignments are offered, all alignments will be considered
   *   acceptable.
   */

  setAcceptableAlignment (data, acceptable) {
    const { race, culture } = this
    const { religion, piety } = this.faith
    const raceObj = data && data.races ? data.races[race] : null
    const cultureObj = data && data.cultures ? data.cultures[culture] : null
    const religionObj = data && data.religions ? data.religions[religion] : null

    if (raceObj && cultureObj && religionObj && !isNaN(piety)) {
      const all = [ 'LG', 'NG', 'CG', 'LN', 'N', 'CN', 'LE', 'NE', 'CE' ]
      const acc = Array.isArray(acceptable) && acceptable.length > 0
        ? intersection([ 'LG', 'NG', 'CG', 'LN', 'N', 'CN', 'LE', 'NE', 'CE' ], acceptable)
        : all
      const ra = raceObj && raceObj.alignment ? raceObj.alignment : false
      const cu = cultureObj && cultureObj.alignment ? cultureObj.alignment : false
      const re = religionObj && religionObj.alignment ? religionObj.alignment : false
      const influence = this.isPious() ? avgAlignment(ra, cu, re) : avgAlignment(ra, cu)

      if (acc.length > 1) {
        let al = false
        while (!al) {
          this.setPersonalAlignment()
          al = avgAlignment(this.alignment, influence)
          if (!acc.includes(al)) al = false
        }
        this.alignment = al
      } else if (acc.length === 1) {
        this.alignment = acc[0]
      } else {
        this.alignment = this.isPious()
          ? avgAlignment(this.setPersonalAlignment(), ra, cu, re)
          : avgAlignment(this.setPersonalAlignment(), ra, cu)
      }
    }
  }

  /**
   * Sets the character's economic class. 10% are rich, 60% are poor, and 30%
   * are middle class (which seems pretty generous by comparison to real-world
   * medieval or early modern societies, but hey, this is D&D).
   */

  setLifestyle () {
    const wealth = random.int(1, 10)
    this.lifestyle = wealth === 10 ? 'Rich' : wealth < 7 ? 'Poor' : 'Middle'
    if (wealth === 10) this.noble = random.int(1, 10) === 10
  }

  /**
   * Sets the character's traits by first compiling arrays of all possible
   * traits, combining those that any character might have with those unique
   * to hens race, culture, lifestyle, and religion, and then selecting one
   * at random for each type. This method only has full effect if the
   * character's `race`, `culture`, `lifestyle`, and `faith` properties are
   * filled in first. It doesn't do anything at all unless the character's
   * `alignment` has been set.
   * @param data {object} - The full data set pulled from `fetchData`.
   */

  setTraits (data) {
    if (this.alignment) {
      const any = data && data.traits ? data.traits.any : null
      const race = this.race && data && data.races && data.races[this.race] ? data.races[this.race].traits : null
      const culture = this.culture && data && data.cultures && data.cultures[this.culture] ? data.cultures[this.culture].traits : null
      const lifestyle = this.lifestyle && data && data.traits && data.traits.lifestyle ? data.traits.lifestyle[this.lifestyle] : null
      const religion = this.faith.religion && data && data.religions && data.religions[this.faith.religion] ? data.religions[this.faith.religion].traits : null

      let set = Character.addTraits(null, any, this.alignment)
      if (race) set = Character.addTraits(set, race, this.alignment)
      if (culture) set = Character.addTraits(set, culture, this.alignment)
      if (lifestyle) set = Character.addTraits(set, lifestyle, this.alignment)
      if (religion && this.isPious()) set = Character.addTraits(set, religion, this.alignment)

      if (set && set.personality && set.ideals && set.bonds && set.flaws) {
        this.traits.personality = Character.parseTraitVar(data.vars, randomElementFromArray(set.personality))
        this.traits.bond = Character.parseTraitVar(data.vars, randomElementFromArray(set.bonds))
        this.traits.flaw = Character.parseTraitVar(data.vars, randomElementFromArray(set.flaws))

        this.traits.ideal = randomElementFromArray(set.ideals)
        this.traits.ideal.ideal = Character.parseTraitVar(data.vars, this.traits.ideal.ideal)
      }
    }
  }

  /**
   * Write the character's ideal as a string.
   * @returns {string} - A string communicating the character's ideal and its
   *   type.
   */

  getIdeal () {
    const { ideal, type } = this.traits.ideal
    const t = type.charAt(0).toUpperCase() + type.slice(1)
    return `${ideal} (${t})`
  }

  /**
   * Return the character's parenthetical description
   * (e.g., `(CG female Brelish human)`).
   * @returns {string} - The character's parenthetical description.
   */

  getDesc () {
    return `(${this.alignment} ${this.gender.toLowerCase()} ${this.culture} ${this.race.toLowerCase()})`
  }

  /**
   * Return a string describing the character's religious beliefs.
   * @param data {object} - The full data set pulled from `fetchData`.
   * @returns {string} - A string describing the character's religious beliefs.
   */

  getReligionDesc (data) {
    const follower = data.religions[this.faith.religion].follower
    return this.isPious()
      ? `is a pious ${follower}`
      : this.faith.piety < -1.5
        ? `is a nominal ${follower}`
        : `is a ${follower}`
  }

  /**
   * Render wiki categories for a randomly-generated character.
   * @param data {object} - The full data set pulled from `fetchData`.
   * @returns {string} - A string with the character's wiki categories.
   */

  getWikiCategories (data) {
    const { name, race, culture, alignment } = this
    const end = name.given && name.family
      ? `|${name.family}, ${name.given}]]`
      : ']]'
    const categories = []
    categories.push(`[[Category:${data.races[race].plural}${end}`)
    categories.push(`[[Category:${culture} characters${end}`)

    const map = {
      LG: 'Lawful good', NG: 'Neutral good', CG: 'Chaotic good',
      LN: 'Lawful neutral', N: 'True neutral', CN: 'Chaotic neutral',
      LE: 'Lawful evil', NE: 'Neutral evil', CE: 'Chaotic evil'
    }

    const isGood = alignment.length === 2 && alignment.charAt(1) === 'G'
    const isEvil = alignment.length === 2 && alignment.charAt(1) === 'E'
    const isLawful = alignment.charAt(0) === 'L'
    const isChaotic = alignment.charAt(0) === 'C'
    const isNeutral = (!isGood && !isEvil) || (!isLawful && !isChaotic)

    if (isGood) categories.push(`[[Category:Good characters${end}`)
    if (isEvil) categories.push(`[[Category:Evil characters${end}`)
    if (isLawful) categories.push(`[[Category:Lawful characters${end}`)
    if (isChaotic) categories.push(`[[Category:Chaotic characters${end}`)
    if (isNeutral) categories.push(`[[Category:Neutral characters${end}`)
    categories.push(`[[Category:${map[this.alignment]} characters${end}`)
    return categories.join('\n')
  }

  /**
   * Add two sets of potential traits together.
   * @param existing {{ personality: string[], ideals: string[], bonds: string[],
   *   flaws: string[] }} - An object that provides a set of potential traits.
   * @param set {{ personality: string[], ideals: { any: string[],
   *   good: string[], evil: string[], lawful: string[], chaotic: string[],
   *   neutral: string[] }, bonds: string[], flaws: string[] }} - An object that
   *   provides a set of traits.
   * @param alignment {string} - An alignment.
   * @returns {{ personality: string[], ideals: string[], bonds: string[],
   *   flaws: string[] }} - An object providing the potential traits from
   *   `existing` and `set` concatenated together.
   */

  static addTraits (existing, set, alignment) {
    const base = existing ? existing : {
      personality: [],
      ideals: [],
      bonds: [],
      flaws: []
    }

    const isGood = alignment.length === 2 && alignment.charAt(1) === 'G'
    const isEvil = alignment.length === 2 && alignment.charAt(1) === 'E'
    const isLawful = alignment.charAt(0) === 'L'
    const isChaotic = alignment.charAt(0) === 'C'
    const isNeutral = (!isGood && !isEvil) || (!isLawful && !isChaotic)

    const idealTypes = [ 'any' ]
    if (isGood) idealTypes.push('good')
    if (isEvil) idealTypes.push('evil')
    if (isLawful) idealTypes.push('lawful')
    if (isChaotic) idealTypes.push('chaotic')
    if (isNeutral) idealTypes.push('neutral')

    idealTypes.forEach(type => {
      const map = set.ideals[type].map(ideal => ({ ideal, type }))
      base.ideals = [ ...base.ideals, ...map ]
    })

    base.personality = [ ...base.personality, ...set.personality ]
    base.bonds = [ ...base.bonds, ...set.bonds ]
    base.flaws = [ ...base.flaws, ...set.flaws ]

    return base
  }

  /**
   * Parse any trait variables.
   * @param vars {object} - An object containing trait variables to replace.
   * @param orig {string} - The original string.
   * @returns {string} - The original string with any variables replaced with
   *   randomly chosen variables.
   */

  static parseTraitVar (vars, orig) {
    let str = orig
    Object.keys(vars).forEach(key => {
      str = str.replace(key, randomElementFromArray(vars[key]))
    })
    return str
  }

  /**
   * Choose a demographic at random.
   * @param arr {object[]} - An array of objects representing the various
   *   demographics that could be chosen.
   * @param arr[].race {string} - The race of this demographic (e.g., for
   *   Brelish human followers of the Sovereign Host, this would be "human").
   * @param arr[].culture {string} - The culture of this demographic (e.g., for
   *   Brelish human followers of the Sovereign Host, this would be "Brelish").
   * @param arr[].religion {string} - The religion of this demographic (e.g.,
   *   for Brelish human followers of the Sovereign Host, this would be
   *   "Sovereign Host").
   * @param arr[].pop {number} - The number of people in this demographic.
   * @param options {object[]} - An object defining acceptable parameters for
   *   this character.
   * @param options[].race {string[]} - An array of strings establishing which
   *   races are acceptable choices.
   * @param options[].culture {string[]} - An array of strings establishing
   *   which cultures are acceptable choices.
   * @param options[].religion {string[]} - An array of strings establishing
   *   which religions are acceptable choices.
   * @returns {{ race: string, culture: string, religion: string,
   *   pop: number }} - An object representing the demographic chosen. If
   *   any options with the race, culture, and religion restrictions set in
   *   the `options` parameter exist, a set matching those restrictions is
   *   chosen, weighting the choice by population. If no demographics meet the
   *   criteria given, then one is chosen from the full set, still weighting
   *   by population. The `race`, `culture`, and `religion` properties provide
   *   the race, culture, and religion of the demographic, respectively. The
   *   `pop` property provides the population of this demographic.
   */

  static chooseDemographic (arr, options) {
    const filtered = arr.filter(demo => {
      const ra = options.race.includes(demo.race)
      const cu = options.culture.includes(demo.culture)
      const re = options.religion.includes(demo.religion)
      return ra && cu && re
    })
    const demos = filtered.length > 0 ? filtered : arr
    const demo = rollTable(makeTable(demos))
    delete demo.from
    delete demo.to
    return demo
  }

  /**
   * Generate a character.
   * @param data {object} - The full data set pulled from `fetchData`.
   * @param area {string} - The area that this character comes from. This
   *   string must match one of the properties in `data.demographics`.
   * @param options {object} - An object specifying parameters for the
   *   character being generated.
   * @param options.race {string[]} - An array of strings specifying the
   *   acceptable races for this character.
   * @param options.culture {string[]} - An array of strings specifying the
   *   acceptable cultures for this character.
   * @param options.religion {string[]} - An array of string specifying the
   *   acceptable religions for this character.
   * @param options.alignment {string[]} - An array of string specifying the
   *   acceptable alignments for this character.
   * @param options.gender {string[]} -  An array of string specifying the
   *   acceptable genders for this character.
   * @param options.num {number} - How many characters to create.
   * @returns {Character} - A randomly generated character, with probabilities
   *   drawn from the demographics of the area specified, and restricted to the
   *   possibilities defined by the `options` object.
   */

  static generate (data, area, options) {
    const parsed = options.num ? parseInt(options.num) : 1
    const num = parsed ? Math.min(Math.max(parsed, 0), 100) : 1
    const characters = []
    for (let i = 0; i < num; i++) {
      const char = new Character()
      const { race, culture, religion } = Character.chooseDemographic(data.demographics[area], options)
      char.race = race
      char.culture = culture
      char.faith.religion = religion
      char.setPiety(data)
      char.setAcceptableAlignment(data, options.alignment)
      char.setGender(options.gender, data.cultures[char.culture].eschewsGender)

      char.setLifestyle()
      char.setTraits(data)

      char.setGivenName(data)
      char.setFamilyName(data)
      characters.push(char)
    }
    return characters
  }
}

module.exports = Character