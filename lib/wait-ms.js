export const waitMs = (milliseconds) => {
  return new Promise(res => {
    setTimeout(res, milliseconds)
  })
}