// 浅拷贝
// function clone(source) {
//   var target = {}
//   for (let i in source) {
//     if (source.hasOwnProperty(i)) {
//       if (typeof source[i] === 'object') {
//         target[i] = clone(source[i])
//       } else {
//         target[i] = source[i]
//       }
//     }
//   }
//   return target
// }

/**
 * 问题
 * 1. 没对参数做检验
 * 2. 判断是否对象的逻辑不严谨
 * 3. 没考虑数组兼容问题
 */

function isObject(x) {
  return Object.prototype.toString.call(x) === '[object Object]'
}

function clone(source) {
  if (!isObject(source)) {
    return source
  }
  var target = {}
  for (let i in source) {
    if (source.hasOwnProperty(i)) {
      if (isObject(source[i])) {
        target[i] = clone(source[i])
      } else {
        target[i] = source[i]
      }
    }
  }
  return target
}

var a1 = 'aaa'
console.log(clone(a1))
