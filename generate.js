const random = require('random')
const { avgAlignment } = require('./dndmath')
const {
  intersection,
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

const chooseReligionFromDemographics = (data, area, options) => {
  const table = data.demographics[area]
    ? makeTable(data.demographics[area].byReligion)
    : null
  const pick = table ? randomAcceptableRowFromTable(table, options.religion) : null
  return pick && data.religions[pick.key]
    ? Object.assign({}, { name: pick.key }, data.religions[pick.key])
    : null
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

/**
 * We'll consider a character "pious," meaning that religion plays a critical
 * part of hens life, if hens piety is more than one standard deviation above
 * the mean.
 * @param piety {number} - A character's piety, as provided by `choosePiety`.
 * @returns {boolean} - `true` if the character is pious (e.g., hens piety is
 *   more than one standard deviation above the mean), or `false` if hen
 *   is not.
 */

const isPious = piety => piety > 1

/**
 * Generate a random alignment. We assume that both the lawful/chaotic X axis
 * and the good/evil y axis are normally distributed, with most people being
 * neutral. This assigns values of good, evil, lawful, or chaotic to those
 * individuals who are more than one standard deviation from the mean on those
 * axes.
 * @returns {string} - An alignment selected randomly from a normally
 *   distributed population.
 */

const generateRandomAlignment = () => {
  const x = randomFloatFromBellCurve()
  const y = randomFloatFromBellCurve()
  const lc = x > 1 ? 'L' : x < -1 ? 'C' : 'N'
  const ge = y > 1 ? 'G' : y < -1 ? 'E' : 'N'
  const prelim = `${lc}${ge}`
  return prelim === 'NN' ? 'N' : prelim
}

/**
 * Generate an acceptable character alignment.
 * @param race {object} - A race object.
 * @param race.alignment {string} - A string providing the alignment that this
 *   character is pushed towards by virtue of being a member of this race.
 * @param culture {object} - A culture object.
 * @param culutre.alignment {string} - A string providing the alignment that
 *   this character is pushed towards by virtue of being a member of this
 *   culture.
 * @param religion {object} - A religion object.
 * @param religion.alignment {string} - A string providing the alignment that
 *   this character is pushed towards by virtue of following this religion.
 * @param piety {number} - The character's piety. If the character is pious
 *   (see the `isPious` method), then hens religion's alignment will influence
 *   hens alignment. If not, then the alignment of hens religion will not be
 *   a factor.
 * @param acceptable {string[]} - An array of acceptable alignments. If no
 *   valid alignments are offered, all alignments will be considered
 *   acceptable.
 * @returns {string} - An alignment for the character. This begins with hens
 *   personal disposition (see the `generateRandomAlignment` method), averaged
 *   with hens race an culture (and religion if hen is pious). If the resulting
 *   alignment is acceptable, it is returned. If not, we try again.
 */

const generateAcceptableRandomAlignment = (race, culture, religion, piety, acceptable) => {
  const all = [ 'LG', 'NG', 'CG', 'LN', 'N', 'CN', 'LE', 'NE', 'CE' ]
  const acc = Array.isArray(acceptable) && acceptable.length > 0
    ? intersection([ 'LG', 'NG', 'CG', 'LN', 'N', 'CN', 'LE', 'NE', 'CE' ], acceptable)
    : all
  const ra = race && race.alignment ? race.alignment : false
  const cu = culture && culture.alignment ? culture.alignment : false
  const re = religion && religion.alignment && isPious(piety) ? religion.alignment : false
  if (acc.length > 1) {
    let alignment = false
    while (!alignment) {
      alignment = avgAlignment(generateRandomAlignment(), ra, cu, re)
      if (!acc.includes(alignment)) alignment = false
    }
    return alignment
  } else if (acc.length === 1) {
    return acc[0]
  } else {
    return avgAlignment(generateRandomAlignment(), ra, cu, re)
  }
}

/**
 * Choose an economic class.
 * @returns {string} - A string indicating one's economic class. 10% are rich,
 *   60% are poor, and 30% are middle class (which seems pretty generous for a
 *   medieval setting, but this is D&D).
 */

const chooseLifestyle = () => {
  const wealth = random.int(1, 10)
  return wealth === 10 ? 'Rich' : wealth < 7 ? 'Poor' : 'Middle'
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

const addTraits = (existing, set, alignment) => {
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

module.exports = {
  chooseRaceFromDemographics,
  chooseCultureFromRace,
  chooseReligionFromDemographics,
  choosePiety,
  isPious,
  generateRandomAlignment,
  generateAcceptableRandomAlignment,
  chooseLifestyle,
  addTraits
}
