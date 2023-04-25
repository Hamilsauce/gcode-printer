const testArray = new Array(10)
  .fill(null)
  .map((_, i) => Math.random() * i)

console.log('testArray', testArray)
let cnt = 0

testArray.sort((a, b) => {
  console.log('ITERATION #: ', ++cnt);
  return a - b
})