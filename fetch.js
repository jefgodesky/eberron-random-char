const { google } = require('googleapis')
const config = require('./config.json')

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

module.exports = {
  fetchDemographics,
  fetchRaces,
  fetchCultures,
  fetchReligions
}
