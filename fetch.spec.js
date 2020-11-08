/* global describe, it, expect */

const { fetchDemographics } = require('./fetch')

describe('fetchDemographics', () => {
  it('returns something', async () => {
    expect.assertions(1)
    const demographics = await fetchDemographics()
    expect(demographics).toBeDefined()
  })
})
