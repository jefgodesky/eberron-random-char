const {
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