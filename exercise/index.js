// 一道小学题
// 题目
let title = require('./1.jpg')
const ARR_BASE = [1, 2, 3, 4, 5, 6, 7, 8, 9]
var arr = [[1], [2], [3], [4], [5], [6], [7], [8], [9]]
let soltArr = []
let res = []

function create(arr) {
  let arr2 = []
  arr.forEach((e) => {
    let temp_arr = ARR_BASE.filter((item) => !e.includes(item))
    temp_arr.forEach((v) => {
      arr2.push([...e, v])
    })
  })
  if (arr2[0] && arr2[0].length > 8) {
    soltArr = arr2
    // console.log(soltArr)
    return arr2
  } else {
    create(arr2)
  }
}

function check(arr) {
  return (
    (arr[0] / arr[1]) * arr[2] === arr[3] * 10 + arr[4] + arr[5] - arr[6] &&
    arr[3] * 10 + arr[4] + arr[5] - arr[6] === arr[7] * 10 + arr[8]
  )
}

create(arr)
soltArr.forEach((e) => {
  let resTemp = check(e)
  if (resTemp) {
    res.push(e)
  }
})
console.log(res)
