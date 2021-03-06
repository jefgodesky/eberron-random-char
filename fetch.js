const { google } = require('googleapis')
const config = require('./config.json')

/**
 * Add a value (`val`) to an array stored in an object (`obj`) with a given
 * property name (`key`). If no such property exists, make it an empty array
 * and then add the value. This functionally gives us an "upsert" method for
 * arrays stored in an object with some arbitrary set of property names.
 * @param obj {object} - The object containing all of the arrays.
 * @param key {string} - The property name that the value should be added to.
 * @param val {*} - The item to add to the array.
 */

 const addElement = (obj, key, val) => {
  if (!obj[key]) obj[key] = []
  obj[key].push(val)
}

/**
 * Read a spreadsheet from Google Sheets.
 * @param spreadsheetId {string} - The spreadsheet ID.
 * @param range {string} - The range of the spreadsheet to read.
 * @param op {function} - A function to perform on each row.
 * @returns {Promise<unknown>} - A Promise that resolves once all of the rows
 *   have been run through `op`.
 */

const fetchSpreadsheet = (spreadsheetId, range, op) => {
  return new Promise ((resolve, reject) => {
    const sheets = google.sheets({ version: 'v4', auth: config.google.key })
    sheets.spreadsheets.values.get({ spreadsheetId, range }, (err, res) => {
      if (err) {
        console.error('Encountered an error while trying to access a spreadsheet', err)
        reject(err)
      } else {
        for (let i = 0; i < res.data.values.length; i++) op(res.data.values[i])
        resolve()
      }
    })
  })
}

/**
 * Fetch the areas from the spreadsheet into an object.
 * @returns {Promise<{}>} - A Promise that resolves with the areas object.
 */

const fetchAreas = async () => {
  const areas = {}
  await fetchSpreadsheet(config.google.id, config.google.ranges.areas, row => {
    if (row.length > 1) areas[row[0]] = parseInt(row[1])
  })
  return areas
}

/**
 * Parse the demographics info from the spreadsheet into an object.
 * @returns {Promise<{}>} - A Promise that resolves with the demographics
 *   object.
 */

const fetchDemographics = async () => {
  const demographics = {}
  await fetchSpreadsheet(config.google.id, config.google.ranges.demographics, row => {
    if (row.length > 7) {
      const area = row[0]
      const race = row[1]
      const culture = row[2]
      const religion = row[3]
      const pop = parseInt(row[7])
      addElement(demographics, area, { race, culture, religion, pop })
    }
  })
  return demographics
}

/**
 * Read race data from spreadsheet into object.
 * @returns {Promise<{}>} - A Promise that resolves with an object representing
 *   the race data from the spreadsheet.
 */

 const fetchRaces = async () => {
  const races = {}
  await fetchSpreadsheet(config.google.id, config.google.ranges.races, row => {
    if (row.length > 3) {
      const name = row[0]
      if (!races[name]) races[name] = {}
      races[name].plural = row[1]
      races[name].type = row[2]
      races[name].alignment = row[3]
    }
  })
  return races
}

/**
 * Read culture data from spreadsheet into object.
 * @returns {Promise<{}>} - A Promise that resolves with an object representing
 *   the culture data from the spreadsheet.
 */

 const fetchCultures = async () => {
  const cultures = {}
  await fetchSpreadsheet(config.google.id, config.google.ranges.cultures, row => {
    if (row.length > 7) {
      const name = row[0]
      if (!cultures[name]) cultures[name] = {}
      cultures[name].common = row[1]
      cultures[name].names = row[2]
      cultures[name].eschewsGender = row[3].length > 0
      cultures[name].religion = {
        piety: parseFloat(row[4]),
        mod: parseFloat(row[5]),
        preferred: row[6]
      }
      cultures[name].alignment = row[7]
    }
  })
  return cultures
}

/**
 * Read religion data from spreadsheet into object.
 * @returns {Promise<{}>} - A Promise that resolves with an object representing
 *   the religion data from the spreadsheet.
 */

const fetchReligions = async () => {
  const religions = {}
  await fetchSpreadsheet(config.google.id, config.google.ranges.religions, row => {
    if (row.length > 3) {
      const name = row[0]
      const follower = row[1]
      const race = row[2]
      const culture = row[3]
      const alignment = row[4]
      if (!religions[name]) religions[name] = {}
      if (follower) religions[name].follower = follower
      if (race) religions[name].race = race
      if (culture) religions[name].culture = culture
      religions[name].alignment = alignment
    }
  })
  return religions
}

/**
 * Fetch dragonmarked houses from the spreadsheet.
 * @returns {Promise<void>} - A Promise that resolves with an array of objects
 *   representing the dragonmarked houses fetched from the spreadsheet.
 */

const fetchHouses = async () => {
  const houses = []
  await fetchSpreadsheet(config.google.id, config.google.ranges.houses, row => {
    if (row.length > 2) {
      houses.push({
        name: row[0],
        mark: row[1],
        races: {
          mark: row[2].split(',').map(race => race.trim()),
          house: row[3].split(',').map(race => race.trim())
        }
      })
    }
  })
  return houses
}

/**
 * Read names from spreadsheet into object.
 * @returns {Promise<{}>} - A Promise that resolves with an object representing
 *   the names from the spreadsheet.
 */

 const fetchNames = async () => {
  const names = {}

  const map = {
    'Male given name': [ 'male' ],
    'Female given name': [ 'female' ],
    'Unisex given name': [ 'male', 'female' ],
    'Family name': [ 'surname' ]
  }

  await fetchSpreadsheet(config.google.id, config.google.ranges.names, row => {
    if (row.length > 2) {
      const name = row[0]
      const list = row[1]
      const types = map[row[2]]
      if (!names[list]) names[list] = {}
      types.forEach(type => { addElement(names[list], type, name) })
    }
  })

  return names
}

/**
 * Read variables from spreadsheet into object.
 * @returns {Promise<{}>} - A Promise that resolves with an object representing
 *   the variables from the spreadsheet.
 */

 const fetchVars = async () => {
  const vars = {}
  await fetchSpreadsheet(config.google.id, config.google.ranges.vars, row => {
    if (row.length > 1) addElement(vars, row[0], row[1])
  })
  return vars
}

/**
 * Read Zil clans and their families from spreadsheet into object.
 * @param obj {object} - The object that should be populated with Zil clans.
 * @returns {Promise<{}>} - A Promise that resolves when the given object has
 *   been populated with Zil clans and families from the spreadsheet. The
 *   object will have a property named for each clan, that will be equal to an
 *   array of strings providing the names of the families in that clan.
 */

 const fetchZilClans = async (obj) => {
  await fetchSpreadsheet(config.google.id, config.google.ranges.zil, row => {
    if (row.length > 1) addElement(obj, row[1], row[0])
  })
}

/**
 * Fetch noble families from spreadsheet.
 * @param data {object} - The existing data object.
 * @returns {Promise<void>} - A Promise that resolves when noble families have
 *   been fetched from the spreadsheet and parsed into the appropriate culture
 *   objects.
 */

const fetchNobleFamilies = async (data) => {
  await fetchSpreadsheet(config.google.id, config.google.ranges.nobility, row => {
    if (row.length > 3) {
      const culture = row[1]
      if (!data.cultures[culture].nobility) data.cultures[culture].nobility = { families: [] }
      data.cultures[culture].nobility.families.push({ family: row[0], race: row[3] })
      data.cultures[culture].nobility.prefix = row[2]
    }
  })
}

/**
 * Get traits from spreadsheet.
 * @param data {object} - The existing data object.
 * @returns {Promise<void>} - A Promise that resolves when traits have been
 *   fetched from the spreadsheet and added to the `data` object. Cultural
 *   traits are added to cultures, while all others are added to a `traits`
 *   property.
 */

 const fetchTraits = async (data) => {
  const scratch = {}
  await fetchSpreadsheet(config.google.id, config.google.ranges.traits, row => {
    if (row.length > 3) {
      const faction = row[2]
      const factype = row[3]

      if (!scratch[factype]) scratch[factype] = {}
      if (!scratch[factype][faction]) {
        scratch[factype][faction] = {
          personality: [],
          ideals: { good: [], evil: [], lawful: [], chaotic: [], neutral: [], any: [] },
          bonds: [],
          flaws: []
        }
      }

      const map = {
        'Personality trait': scratch[factype][faction].personality,
        'Ideal (Good)': scratch[factype][faction].ideals.good,
        'Ideal (Evil)': scratch[factype][faction].ideals.evil,
        'Ideal (Lawful)': scratch[factype][faction].ideals.lawful,
        'Ideal (Chaotic)': scratch[factype][faction].ideals.chaotic,
        'Ideal (Neutral)': scratch[factype][faction].ideals.neutral,
        'Ideal (Any)': scratch[factype][faction].ideals.any,
        'Bond': scratch[factype][faction].bonds,
        'Flaw': scratch[factype][faction].flaws
      }
      if (row[0].length > 0) map[row[1]].push(row[0])
    }
  })

  data.traits = {
    any: scratch.Any.Any,
    lifestyle: scratch.Lifestyle
  }

  if (data.cultures && scratch.Culture) {
    Object.keys(scratch.Culture).forEach(culture => {
      data.cultures[culture].traits = scratch.Culture[culture]
    })
  }

  if (data.races && scratch.Race) {
    Object.keys(scratch.Race).forEach(group => {
      if (data.races[group]) {
        data.races[group].traits = scratch.Race[group]
      } else {
        Object.keys(data.races).filter(race => race.type === group && !race.traits).forEach(race => {
          data.races[race].traits = scratch.Race[group]
        })
      }
    })
  }

  if (data.religions && scratch.Religion) {
    Object.keys(scratch.Religion).forEach(religion => {
      data.religions[religion].traits = scratch.Religion[religion]
    })
  }

  if (data.houses && scratch['Dragonmarked house']) {
    data.houses.forEach(house => {
      const key = `House ${house.name}`
      if (scratch['Dragonmarked house'][key]) house.traits = scratch['Dragonmarked house'][key]
    })
  }

  if (data.cultures.Tairnadal && scratch['Tairnadal ancestor']) {
    data.cultures.Tairnadal.ancestors = Object.keys(scratch['Tairnadal ancestor']).map(name => ({
      name,
      personality: scratch['Tairnadal ancestor'][name].personality,
      ideals: {
        good: scratch['Tairnadal ancestor'][name].ideals.good[0],
        evil: scratch['Tairnadal ancestor'][name].ideals.evil[0],
        lawful: scratch['Tairnadal ancestor'][name].ideals.lawful[0],
        chaotic: scratch['Tairnadal ancestor'][name].ideals.chaotic[0],
        neutral: scratch['Tairnadal ancestor'][name].ideals.neutral[0],
        any: scratch['Tairnadal ancestor'][name].ideals.any[0]
      },
      bonds: scratch['Tairnadal ancestor'][name].bonds,
      flaws: scratch['Tairnadal ancestor'][name].flaws
    }))
  }

  if (data.cultures.Mror && scratch['Mror family']) {
    const checkIdealType = (family, type) => {
      return family.ideals && family.ideals[type] && Array.isArray(family.ideals[type]) && family.ideals[type].length > 0
        ? {ideal: family.ideals[type][0], type}
        : null
    }
    const getIdeal = family => {
       const types = ['good', 'evil', 'lawful', 'chaotic', 'neutral']
      const checks = types.map(type => checkIdealType(family, type)).filter(ideal => ideal !== null)
      return checks.length > 0 ? checks[0] : null
    }
    delete data.cultures.Mror.traits.ideals
    data.cultures.Mror.families = {}
    Object.keys(scratch['Mror family']).forEach(name => {
      data.cultures.Mror.families[name] = getIdeal(scratch['Mror family'][name])
    })
  }
}

/**
 * Parse data from the spreadsheet into an object.
 * @returns {Promise<{demographics: {}, races: {}, cultures: {}, vars: {}}>} -
 *   A Promise that resolves with an object containing the data from the
 *   spreadsheet, organized into an object that will be easier to use in
 *   character generation.
 */

 const fetchData = async () => {
  const data = {
    areas: await fetchAreas(),
    demographics: await fetchDemographics(),
    races: await fetchRaces(),
    cultures: await fetchCultures(),
    religions: await fetchReligions(),
    houses: await fetchHouses(),
    names: await fetchNames(),
    vars: await fetchVars()
  }

  await fetchNobleFamilies(data)
  await fetchTraits(data)
  if (data.names && data.names.Zil) {
    data.names.Zil.clans = {}
    await fetchZilClans(data.names.Zil.clans)
  }
  return data
}

module.exports = {
  fetchAreas,
  fetchDemographics,
  fetchRaces,
  fetchCultures,
  fetchReligions,
  fetchHouses,
  fetchNames,
  fetchVars,
  fetchZilClans,
  fetchNobleFamilies,
  fetchTraits,
  fetchData
}
