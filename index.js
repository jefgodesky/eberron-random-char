const express = require('express')
const bodyParser = require('body-parser')

const config = require('./config.json')

const app = express()
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.set('view engine', 'ejs')

app.get('/', (req, res) => {
  res.render('index')
})

app.listen(config.port, async () => {
  console.log(`Eberron Random Character Generator is running on port ${config.port}`)
})
