/**
 * Finds the average of any number of alignments.
 * @param alignments {string} - Any number of alignment strings (e.g., `LG`,
 *   `N`, `CE`, etc.)
 * @returns {string|string} - The alignment that is the average of all of the
 *   alignments provided.
 */

const avgAlignment = (...alignments) => {
  const format = alignments.map(alignment => alignment === 'N' ? 'NN' : alignment)
  const lc = format.map(al => al.charAt(0)).map(al => al === 'L' ? 1 : al === 'C' ? -1 : 0)
  const ge = format.map(al => al.charAt(1)).map(al => al === 'G' ? 1 : al === 'E' ? -1 : 0)
  const lcavg = lc.reduce((acc, curr) => acc + curr, 0) / lc.length
  const geavg = ge.reduce((acc, curr) => acc + curr, 0) / ge.length
  const lcval = lcavg >= 0.33 ? 'L' : lcavg <= -0.33 ? 'C' : 'N'
  const geval = geavg >= 0.33 ? 'G' : geavg <= -0.33 ? 'E' : 'N'
  const prelim = `${lcval}${geval}`
  return prelim === 'NN' ? 'N' : prelim
}

module.exports = {
  avgAlignment
}