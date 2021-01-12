// reduce Object.keys 方法
let obj = {
  a: '1',
  b: '2',
  c: '3',
  d: '4',
  e: '5',
}
let arr = Object.keys(obj)
// console.log(arr)
arr.reduce((a, b) => {
  console.log('第一个参数', a)
  console.log('第二个参数', b)
  return a + +obj[b]
}, 1)
