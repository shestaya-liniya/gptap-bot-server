export const exceptionForHistoryLogging = (fromId, message) => {
  const exceptionIds = [
    // 963869223, // PiraJoke
    // 6221051172 // aronbergman
  ]

  if (exceptionIds.find((i) => i === fromId))
    return `${message?.length ?? 0} CONFIDENTIAL`
  else
    return `${message?.length ?? 0} ${message}`
}