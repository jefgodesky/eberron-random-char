const express = require('express')
const bodyParser = require('body-parser')
const slugify = require('slugify')

const config = require('./config.json')
const { union } = require('./randomizer')
const { fetchData } = require('./fetch')
const Character = require('./character')

const app = express()
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.set('view engine', 'ejs')

app.get('/', (req, res) => {
  const params = {
    areas: Object.keys(app.data.demographics),
    cultures: Object.keys(app.data.cultures).map(name => ({ name, id: `culture-${slugify(name)}` })),
    races: Object.keys(app.data.races).map(name => ({ name, id: `race-${slugify(name)}` })),
    religions: Object.keys(app.data.religions).map(name => ({ name, id: `religion-${slugify(name)}` })),
    marks: union(app.data.houses.map(house => house.mark)),
    houses: app.data.houses.map(house => house.name)
  }
  res.render('index', params)
})

app.post('/generate', (req, res) => {
  if (req.body.mark === 'Random') delete req.body.mark
  if (req.body.house === 'Random') delete req.body.house
  const characters = Character.generate(app.data, req.body.area, req.body)
  res.render('generated', { data: app.data, characters })
})

app.listen(config.port, async () => {
  app.data = await fetchData()
  console.log(`Eberron Random Character Generator is running on port ${config.port}`)
})
