const random = require('random')

const randomElementFromArray = arr => arr[random.int(0, arr.length - 1)]

module.exports = {
  randomElementFromArray
}