const {
  makeTable,
  randomAcceptableRowFromTable,
  randomFloatFromBellCurve
} = require('./randomizer')

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

const chooseRaceFromDemographics = (data, area, options) => {
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

const chooseCultureFromRace = (race, options) => {
  const table = race.cultures
    ? makeTable(race.cultures)
    : null
  const obj = table ? randomAcceptableRowFromTable(table, options.culture) : null
  return obj ? obj.key : null
}

/**
 * Determines a character's piety. Individual religious disposition is evenly
 * distributed, but different cultures modify this with an average piety score
 * that can push members of those cultures to be more or less devout.
 * @param data {object} - The full data set pulled from `fetchData`.
 * @param culture {object} - The culture object for this character.
 * @returns {number} - The character's piety.
 */

const choosePiety = (data, culture) => {
  const disposition = randomFloatFromBellCurve()
  const cultural = culture.religion.piety
  return disposition + cultural
}

module.exports = {
  chooseRaceFromDemographics,
  chooseCultureFromRace,
  choosePiety
}
