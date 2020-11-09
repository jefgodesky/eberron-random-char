const express = require('express')
const bodyParser = require('body-parser')
const slugify = require('slugify')

const config = require('./config.json')
const { fetchData } = require('./fetch')

const app = express()
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.set('view engine', 'ejs')

app.get('/', (req, res) => {
  const params = {
    areas: Object.keys(app.data.demographics),
    cultures: Object.keys(app.data.cultures).map(name => ({ name, id: `culture-${slugify(name)}` })),
    races: Object.keys(app.data.races).map(name => ({ name, id: `race-${slugify(name)}` }))
  }
  res.render('index', params)
})

app.listen(config.port, async () => {
  app.data = await fetchData()
  console.log(`Eberron Random Character Generator is running on port ${config.port}`)
})
