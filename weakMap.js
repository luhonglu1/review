// let key = new Array(5 * 1024 * 1024)
// let arr = [key, 1]
// key = null
// console.log(key) // null
// console.log(arr) // [ [ <5242880 empty items> ], 1 ]
// Map 类型也是类似：
// let map = new Map()
// let key = new Array(5 * 1024 * 1024)

// map.set(key, 1)
// key = null
// console.log(map)

// weakMap
let wm = new WeakMap()
let key = new Array(5 * 1024 * 1024)
wm.set(key, 1)
// 建立了一个对key的弱引用 如果只有弱引用
key = null
// 垃圾回收的时候会将被引用的对象回收
console.log(wm.has(key))
// WeakMap 不像 Map，一是没有遍历操作（即没有keys()、values()和entries()方法），也没有 size 属性，也不支持 clear 方法
// 所以 WeakMap只有四个方法可用：get()、set()、has()、delete()。

// 应用 ==============================
// 1. 在dom对象上保存相关数据
// let wm = new WeakMap()
// let element = document.querySelector('.element')
// wm.set(element, 'data')

// let value = wm.get(element)
// console.log(value)

// element.parentNode.removeChild(element)
// element = null

// 2. 数据缓存
// const cache = new WeakMap()
// function countOwnKeys(obj) {
//   if (cache.has(obj)) {
//     console.log('Cached')
//     return cache.get(obj)
//   } else {
//     console.log('Computed')
//     const count = Object.keys(obj).length
//     cache.set(obj, count)
//     return count
//   }
// }

// 3. 私有属性
const privateData = new WeakMap()

class Person {
  constructor(name, age) {
    privateData.set(this, { name: name, age: age })
  }

  getName() {
    return privateData.get(this).name
  }

  getAge() {
    return privateData.get(this).age
  }
}

export default Person
