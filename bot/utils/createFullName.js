export const createFullName = (from) => {
  let fullName = [];
  if (from?.first_name) {
    fullName.push(from.first_name)
  }
  if (from?.last_name) {
    fullName.push(from.last_name)
  }
  console.log(`🐥 ${fullName.join(' ')}`)
  return fullName.join(' ');
}