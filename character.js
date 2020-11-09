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
}

module.exports = Character