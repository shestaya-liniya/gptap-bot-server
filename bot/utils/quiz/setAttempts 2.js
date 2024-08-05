export const setAttempts = (subscriber, promoCode) => {
  if (promoCode === 'X2PROMO') {
    return {
      quiz_subs_available: 6,
      quiz_token_available: 6
    }
  } else {
    return {
      quiz_subs_available: 3,
      quiz_token_available: 3
    }
  }
}