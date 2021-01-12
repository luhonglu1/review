// 破解递归爆栈
// 消除尾递归
// 循环实现
const { createData } = require('./createData.js')

function cloneLoop(x) {
  const uniqueList = [] // 用来去重

  const root = {}
  const loopList = [
    {
      parent: root,
      key: undefined,
      data: x,
    },
  ]

  while (loopList.length) {
    const node = loopList.pop()
    const parent = node.parent
    const key = node.key
    const data = node.data

    let res = parent
    if (typeof key !== 'undefined') {
      res = parent[key] = {}
    }

    let uniqueData = find(uniqueList, data)
    if (uniqueData) {
      parent[key] = uniqueData.target
      continue
    }

    uniqueList.push({
      source: data,
      target: res,
    })

    for (let k in data) {
      if (data.hasOwnProperty(k)) {
        if (typeof data[k] === 'object') {
          // 下一次循环
          loopList.push({
            parent: res,
            key: k,
            data: data[k],
          })
        } else {
          res[k] = data[k]
        }
      }
    }
  }
  return root
}

function find(arr, item) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].source === item) {
      return arr[i]
    }
  }

  return null
}

// let x = createData(2, 1)
var b = {}
var a = { a1: b, a2: b }
console.log(cloneLoop(a))
