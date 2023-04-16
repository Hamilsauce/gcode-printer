export const delay = (milliseconds) => {
  return new Promise(res => {
    setTimeout(res, milliseconds)
  })
}