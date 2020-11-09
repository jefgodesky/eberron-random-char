const {
  makeTable,
  randomAcceptableRowFromTable
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
}

module.exports = Character