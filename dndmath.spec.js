/* global describe, it, expect */

const {
  avgAlignment
} = require('./dndmath')

describe('avgAlignment', () => {
  it('averages two alignments', () => {
    expect(avgAlignment('CG', 'LE')).toEqual('N')
  })

  it('averages more than two alignments', () => {
    expect(avgAlignment('CG', 'NG', 'LE')).toEqual('NG')
  })
})