export const createDate = () => {
  function pad(n) {
    return n < 10 ? '0' + n : n
  }

  const d = new Date()
  const dash = '.'
  const colon = ':'

  return pad(d.getDate()) + dash +
  pad(d.getMonth() + 1) + dash +
  d.getFullYear() + ' ' +
  pad(d.getHours()) + colon +
  pad(d.getMinutes()) + colon +
  pad(d.getSeconds())
}