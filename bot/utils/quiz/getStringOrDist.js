export const getStringOrDist = (emoji, name) => {
  const miniGames = [
    { emoji: '🎰', name: 'MACHINE' },
    { emoji: '🎲', name: 'CUBE' },
    { emoji: '🎯', name: 'DARTS' },
    { emoji: '🏀', name: 'BASKET' },
    { emoji: '⚽', name: 'FOOT' },
    { emoji: '🎳', name: 'BOWLING' }
  ]

  return miniGames.map((i) => {
    if (emoji)
      if (i.emoji === emoji) return i.name
    if (name)
      if (i.name === name) return i.emoji
  }).join('')
}