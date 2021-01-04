//实现简单的双向数据绑定
// Object.defineProperty 方式
// const obj = {}
// Object.defineProperty(obj, 'text', {
//   get: function () {
//     console.log('get val')
//   },
//   set: function (newVal) {
//     console.log('set val:' + newVal)
//     document.getElementById('input').value = newVal
//     document.getElementById('p').innerHTML = newVal
//   },
// })

// const input = document.getElementById('input')
// input.addEventListener('keyup', function (e) {
//   obj.text = e.target.value
// })

// Proxy 方式
const input = document.getElementById('input')
const p = document.getElementById('p')
const obj = {}

const newObj = new Proxy(obj, {
  get: function (target, key, receiver) {
    console.log(`getting ${key}!`)
    return Reflect.get(target, key, receiver)
  },
  set: function (target, key, value, receiver) {
    console.log(target, key, value, receiver)
    if (key === 'text') {
      input.value = value
      p.innerHTML = value
    }
    return Reflect.set(target, key, value, receiver)
  },
})

input.addEventListener('keyup', function (e) {
  newObj.text = e.target.value
})
