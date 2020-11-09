const random = require('random')
const { avgAlignment } = require('./dndmath')
const {
  intersection,
  makeTable,
  randomAcceptableRowFromTable,
  randomFloatFromBellCurve
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
        let count = 0
        while (!al) {
          this.setPersonalAlignment()
          al = avgAlignment(this.alignment, influence)
          if (!acc.includes(al) && count < 10) { al = false; count++ }
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
    this.lifestyle = wealth === 10 ? 'Rich' : wealth < 7 ? 'Poor' : 'Miiddle'
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
}

module.exports = Character