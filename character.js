const random = require('random')
const { avgAlignment } = require('./dndmath')
const {
  intersection,
  attemptIntersection,
  makeTable,
  randomAcceptableRowFromTable,
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
   * Sets the character's piety and religion.
   * @param data {object} - The full data set pulled from `fetchData`.
   * @param area {string} - The specified demographic area.
   * @param options {object} - The user's specifications, which should include
   *   a `religion` property providing an array of strings specifying what
   *   religions are acceptable options for these characters.
   */

  setFaith (data, area, options) {
    this.setPiety(data)
    let religion = false
    while (!religion) {
      religion = Character.chooseReligionFromDemographics(data, area, options)
      const { race, culture } = religion
      if ((race && this.race !== race) || (culture && this.culture !== culture)) religion = false
    }
    this.faith.religion = religion.name
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
    const table = eschewsGender
      ? [
        { key: 'Female', percent: 30 },
        { key: 'Male', percent: 30 },
        { key: 'Non-binary', percent: 15 },
        { key: 'Genderfluid', percent: 5 },
        { key: 'Agender', percent: 20 }
      ]
      : [
        { key: 'Female', percent: 49 },
        { key: 'Male', percent: 49 },
        { key: 'Non-binary', percent: 0.6 },
        { key: 'Genderfluid', percent: 0.3 },
        { key: 'Agender', percent: 0.1 }
      ]
    this.gender = randomAcceptableRowFromTable(table, acceptable).key
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
    const list = this.culture && data && data.cultures && data.cultures[this.culture] ? data.cultures[this.culture].names : null
    const addOccupations = [ 'Aundairian', 'Brelish', 'Cyran', 'Karrnathi', 'Thranish', 'Khoravar', 'Marcher', 'Reacher' ]
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
   * Choose a race based on the area's demographics and the user's
   * specifications.
   * @param data {object} - The full data set pulled from `fetchData`.
   * @param area {string} - The specified demographic area.
   * @param options {object} - The user's specifications, which should include
   *   a `race` property providing an array of strings specifying what races
   *   are acceptable options for these characters.
   * @returns {*|null} - A race object pulled from the `data` object, chosen
   *   randomly based on their prevalence in the demographic area, and limited by
   *   the user's specifications, or `null` if no valid demographic area was
   *   specified.
   */

  static chooseRaceFromDemographics (data, area, options) {
    const table = data.demographics[area]
      ? makeTable(data.demographics[area].byRace)
      : null
    return table ? randomAcceptableRowFromTable(table, options.race) : null
  }

  /**
   * Choose a culture based on the race provided.
   * @param race {object} - An object representing the character's race, as
   *   chosen by `chooseRaceFromDemographics`.
   * @param options {object} - The user's specifications, which should include
   *   a `culture` property providing an array of strings specifying what
   *   cultures are acceptable options for these characters.
   * @returns {string|null} - The name of a culture, randomly chosen based on
   *   the demographics provided by the `race` object, or `null` if the `race`
   *   object provided did not include any cultures.
   */

  static chooseCultureFromRace (race, options) {
    const table = race.cultures
      ? makeTable(race.cultures)
      : null
    const obj = table ? randomAcceptableRowFromTable(table, options.culture) : null
    return obj ? obj.key : null
  }

  /**
   * Choose a religion based on the area's demographics and the user's
   * specifications.
   * @param data {object} - The full data set pulled from `fetchData`.
   * @param area {string} - The specified demographic area.
   * @param options {object} - The user's specifications, which should include
   *   a `religion` property providing an array of strings specifying what
   *   religions are acceptable options for these characters.
   * @returns {*|null} - A religion object pulled from the `data` object, chosen
   *   randomly based on their prevalence in the demographic area, and limited by
   *   the user's specifications, or `null` if no valid demographic area was
   *   specified.
   */

  static chooseReligionFromDemographics (data, area, options) {
    const table = data.demographics[area]
      ? makeTable(data.demographics[area].byReligion)
      : null
    const pick = table ? randomAcceptableRowFromTable(table, options.religion) : null
    return pick && data.religions[pick.key]
      ? Object.assign({}, { name: pick.key }, data.religions[pick.key])
      : null
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
      const race = Character.chooseRaceFromDemographics(data, area, options)
      const culture = Character.chooseCultureFromRace(race, options)
      char.race = race.key
      char.culture = culture
      char.setFaith(data, area, options)
      char.setAcceptableAlignment(data, options.alignment)

      const eschewGender = ['Traveler Changeling', 'Stable Changeling', 'Tairnadal', 'Warforged']
      char.setGender(options.gender, eschewGender.includes(char.culture))

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