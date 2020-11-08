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
 * Parse the demographics info from the spreadsheet into an object.
 * @returns {Promise<{}>} - A Promise that resolves with the demographics
 *   object.
 */

const fetchDemographics = async () => {
  const demographics = {}

  const addRace = (area, race, percent) => {
    if (!demographics[area].byRace) demographics[area].byRace = {}
    if (!demographics[area].byRace[race]) {
      demographics[area].byRace[race] = { percent, cultures: {} }
    } else if (percent) {
      demographics[area].byRace[race].percent = percent
    }
    if (!demographics[area].byRace[race].cultures) demographics[area].byRace[race].cultures = {}
  }

  await fetchSpreadsheet(config.google.id, config.google.ranges.demographics, row => {
    if (row.length > 3) {
      const area = row[0]
      const dim = row[1]
      const demo = row[2]
      const percent = parseFloat(row[3].substr(0, row[3].length - 1))
      const match = dim.match(/Culture \((.*?)\)/)
      const race = match && match.length > 1 ? match[1] : null

      if (!demographics[area]) demographics[area] = {}

      if (race) {
        addRace(area, race)
        demographics[area].byRace[race].cultures[demo] = percent
      } else if (dim === 'Race') {
        addRace(area, demo, percent)
      } else {
        const dimension = `by${dim}`
        if (!demographics[area][dimension]) demographics[area][dimension] = {}
        demographics[area][dimension][demo] = percent
      }
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
    if (row.length > 2) {
      const name = row[0]
      if (!races[name]) races[name] = {}
      races[name].type = row[1]
      races[name].alignment = row[2]
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
    if (row.length > 6) {
      const name = row[0]
      if (!cultures[name]) cultures[name] = {}
      cultures[name].common = row[1]
      cultures[name].names = row[2]
      cultures[name].religion = {
        piety: parseFloat(row[3]),
        mod: parseFloat(row[4]),
        preferred: row[5]
      }
      cultures[name].alignment = row[6]
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
      const race = row[1]
      const culture = row[2]
      const alignment = row[3]
      if (!religions[name]) religions[name] = {}
      if (race) religions[name].race = race
      if (culture) religions[name].culture = culture
      religions[name].alignment = alignment
    }
  })
  return religions
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

module.exports = {
  fetchDemographics,
  fetchRaces,
  fetchCultures,
  fetchReligions,
  fetchNames,
  fetchVars
}
