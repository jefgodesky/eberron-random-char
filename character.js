const random = require('random')
const { avgAlignment } = require('./dndmath')
const {
  union,
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
    return this.name.family && this.name.prefix
      ? `${this.name.given} ${this.name.prefix}${this.name.family}`
      : this.name.family
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
      const influences = [ ra, cu ]
      if (this.isPious()) influences.push(re)
      if (this.lifestyle === 'Rich') influences.push('LE')
      const influence = avgAlignment(...influences)

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
   * @param data {object} - The full data set pulled from `fetchData`.
   * @param anchor {string} - Optional. A parameter to anchor the lifestyle
   *   chosen to a given point, with only some variation from it.
   */

  setLifestyle (data, anchor) {
    const wealth = random.int(1, 10)
    switch (anchor) {
      case 'Poor':
        this.lifestyle = wealth < 10 ? 'Poor' : 'Middle'
        break
      case 'Middle':
        this.lifestyle = wealth === 1 ? 'Poor' : wealth < 10 ? 'Middle' : 'Rich'
        break
      case 'Rich':
        this.lifestyle = wealth === 1 ? 'Middle' : 'Rich'
        if (random.int(1, 10) === 10) this.ennoble(data)
        break
      case 'Noble':
        this.lifestyle = 'Rich'
        if (random.int(1, 10) > 1) this.ennoble(data)
        break
      default:
        this.lifestyle = wealth < 7 ? 'Poor' : wealth < 10 ? 'Middle' : 'Rich'
        if (this.lifestyle === 'Rich' && random.int(1, 10) === 10) this.ennoble(data)
    }
  }

  /**
   * Make this character a noble. Select a noble house from the character's
   * culture and change hens name to be from that family.
   * @param data {object} - The full data set pulled from `fetchData`.
   */

  ennoble (data) {
    const culture = data.cultures[this.culture]
    const nobility = culture ? culture.nobility : null
    const families = nobility ? nobility.families : []
    if (families && Array.isArray(families) && families.length > 0) {
      this.name.family = randomElementFromArray(families)
      if (nobility.prefix) this.name.prefix = nobility.prefix
      this.noble = true
    }
  }

  /**
   * Determines if a character has a dragonmark, and if so, what type.
   * @param data {object} - The full data set pulled from `fetchData`.
   * @param mark {string} - Optional. A dragonmark that this charcter should
   *   have. If this parameter is set to a mark that a member of this race
   *   could have, then the character is set to have that mark.
   */

  setDragonmark (data, mark) {
    const eligible = union(data.houses.filter(house => house.races.includes(this.race)).map(house => house.mark))
    if (mark && eligible.includes(mark)) {
      this.mark = mark
    } else {
      eligible.forEach(mark => {
        if (random.int(1, 250) === 1) this.mark = mark
      })
    }
    if (!this.mark && random.int(1, 1000) === 1) this.mark = 'Aberrant'
  }

  /**
   * Determines if the character belongs to one of the dragonmarked houses, and
   * if so, what name she might bear as a result.
   * @param data {object} - The full data set pulled from `fetchData`.
   * @param house {string} - Optional. A house that this character should
   *   belong to. If provided, the character belongs to that house, and her
   *   name is considered accordingly.
   */

  setHouse (data, house) {
    if (house) {
      this.house = house
    } else if (this.mark) {
      // If you have a dragonmark, there's a 90% chance you belong to the
      // house that controls that mark.
      const markHouse = data.houses.filter(house => house.mark === this.mark)
      if (markHouse.length > 0 && random.int(1, 10) > 1) this.house = markHouse[0].name
    } else {
      // If you belong to one of the races that a house centers on, there's
      // about a 1 in 1,000 chance that you're a member of that house, even
      // if you don't have a dragonmark (for House Lyrandar and the half-elves,
      // that chance is even higher, 1 in 500, but that's Lyrandar).
      const raceHouses = union(data.houses.filter(house => house.races.includes(this.race)).map(house => house.name))
      raceHouses.forEach(house => {
        const chance = house === 'Lyrandar' && this.race === 'Half-elf' ? 250 : 1000
        if (!this.house && random.int(1, chance) === 1) this.house = house
      })

      // But the houses also recruit from other races, though it's much less
      // frequent. If you're not in any house yet, we loop through all of them,
      // and for each there's a 1 in 10,000 chance that you're a member anyway.
      if (!this.house) {
        data.houses.forEach(house => {
          if (!this.house && random.int(1, 5000) === 1) this.house = house.name
        })
      }
    }

    // Now you're either in a house or you're not. If you are, do you get a
    // special name? Many do, but not all, and what that special name is can
    // vary from house to house.
    const markedGetsName = Boolean(this.house) && Boolean(this.mark) && random.int(1, 10) > 1
    const unmarkedGetsName = Boolean(this.house) && random.int(1, 4) === 4
    const getsName = markedGetsName || unmarkedGetsName
    if (getsName && this.house === 'Cannith') {
      // House Cannith lets members keep their old family names and use the
      // honorific d’ prefix with it.
      this.name.prefix = 'd’'
      if(random.int(1, 3) > 1) this.name.family = 'Cannith'
    } else if (getsName && this.house === 'Tharashk') {
      // Tharashk names are all over the place. There's three clans, and most
      // of them use the clan name instead of the house name. Also, each clan
      // seems to have its own way of using its clan name?
      this.clan = randomElementFromArray([ 'Aashta', 'Torrn', 'Velderan' ])
      if (this.clan === 'Aashta') {
        this.name.display = `${this.name.given}’aashta`
      } else {
        this.name.family = this.clan
        if (random.boolean()) {
          this.name.prefix = 'd’'
        } else if (random.boolean()) {
          this.name.family = `${clan} d’Tharashk`
        }
      }
    } else if (getsName) {
      // Everyone else just follows the old rules: d’House
      this.name.family = this.house
      this.name.prefix = 'd’'
    }
  }

  /**
   * Set traits for a Tairnadal character. Tairnadal characters have an
   * ancestor that they are pledged to spend their lives emulating, so they are
   * each given an ancestor, and then draw traits from the examples of that
   * ancestor's life.
   * @param data {object} - The full data set pulled from `fetchData`.
   */

  setTairnadalTraits (data) {
    const ancestor = randomElementFromArray(data.cultures.Tairnadal.ancestors)
    this.ancestor = ancestor.name
    this.traits.personality = randomElementFromArray(ancestor.personality)
    this.traits.bond = randomElementFromArray(ancestor.bonds)
    this.traits.flaw = randomElementFromArray(ancestor.flaws)

    const isGood = this.alignment.length > 1 && this.alignment.charAt(1) == 'G'
    const isEvil = this.alignment.length > 1 && this.alignment.charAt(1) == 'E'
    const isLawful = this.alignment.charAt(0) === 'L'
    const isChaotic = this.alignment.charAt(0) === 'N'
    const isNeutral = (!isGood && !isEvil) || (!isLawful && !isChaotic)
    const candidates = [ { ideal: ancestor.ideals.any, type: 'any' } ]
    if (isGood) candidates.push({ ideal: ancestor.ideals.good, type: 'good' })
    if (isEvil) candidates.push({ ideal: ancestor.ideals.evil, type: 'evil' })
    if (isLawful) candidates.push({ ideal: ancestor.ideals.lawful, type: 'lawful' })
    if (isChaotic) candidates.push({ ideal: ancestor.ideals.chaotic, type: 'chaotic' })
    if (isNeutral) candidates.push({ ideal: ancestor.ideals.neutral, type: 'neutral' })
    this.traits.ideal = randomElementFromArray(candidates)
  }

  /**
   * Set traits for a Mror character. A Mror's ideal is set by his family.
   * This also confines the character's choices for alignment.
   * @param data {object} - The full data set pulled from `fetchData`.
   */

  setMrorTraits (data) {
    const mror = data.cultures.Mror
    this.traits.personality = randomElementFromArray(mror.traits.personality)
    this.traits.bond = randomElementFromArray(mror.traits.bonds)
    this.traits.flaw = randomElementFromArray(mror.traits.flaws)
    this.traits.ideal = mror.families[this.name.family]

    const possibilities = {
      good: [ 'LG', 'NG', 'CG' ],
      evil: [ 'LE', 'NE', 'CE' ],
      lawful: [ 'LG', 'LN', 'LE' ],
      chaotic: [ 'CG', 'CN', 'CE' ],
      neutral: [ 'NG', 'LN', 'N', 'CN', 'NE' ]
    }
    this.alignment = randomElementFromArray(possibilities[this.traits.ideal.type])
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
    const { name, race, culture, alignment, house, mark } = this
    const end = name.given && name.family
      ? `|${name.family}, ${name.given}]]`
      : ']]'
    const categories = []

    if (house) {
      const houseEnd = name.given && name.family && name.family === house
        ? `|${name.given} ${name.family}]]`
        : end
      categories.push(`[[Category:House ${house}${houseEnd}`)
    }

    if (mark) {
      const familyHouse = data.houses.filter(house => house.name === name.family)
      const markHouse = data.houses.filter(house => house.mark === mark)
      const markEnd = familyHouse.length > 0 && markHouse.length > 0 && familyHouse[0].name === markHouse[0].name
        ? `|${name.given} ${name.family}]]`
        : end
      categories.push(`[[Category:Characters with the Mark of ${mark}${markEnd}`)
    }

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
   * @param options.mark {string?} - A string providing the dragonmark that a
   *   character should have.
   * @param options.house {string?} - A string providing the dragonmarked house
   *   that a character should be a member of.
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

      char.setLifestyle(data, options.lifestyle)
      char.setGivenName(data)
      char.setFamilyName(data)
      char.setDragonmark(data, options.mark)
      char.setHouse(data, options.house)

      if (char.culture === 'Tairnadal') {
        char.setTairnadalTraits(data)
      } else if (char.culture === 'Mror') {
        char.setMrorTraits(data)
      } else {
        char.setTraits(data)
      }

      characters.push(char)
    }

    return characters
  }
}

module.exports = Character