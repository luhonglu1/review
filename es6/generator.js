// 基本概念
// 通过 function 关键字后面的星号(*)来表示，函数体用 yield 关键字来控制迭代器每次 next() 返回结果：

// function* createIterator() {
//   yield 1
//   yield 2
//   yield 3
// }
// let iterator = createIterator()

// console.log(iterator.next())
// console.log(iterator.next())
// console.log(iterator.next())
// console.log(iterator.next())

// 通过生成器生成的迭代器每次调用 next()执行函数代码时 ，每次执行 yield 语句完后就会自动停止执行。直到再次调用 next() 方法才会继续执行。

// function* createIterator() {
//   console.log(1)
//   yield
//   console.log(2)
//   yield
//   console.log(3)
// }

// let iterator = createIterator()

// iterator.next() // 1
// iterator.next() // 2

// yield 关键字只能在生成器内部使用，嵌套的函数也不行：
// function* createIterator(items) {
//   items.forEach(function (item) {
//     //  SyntaxError: Unexpected identifier
//       yield item;
//   })
// }

// 在对象里面定义生成器函数：
// let obj = {
//   createIterator: function* (items) {
//     // ...
//   },
// }

// // 用es6的写法
// let obj = {
//   *createIterator(items) {
//     // ...
//   },
// }
// 生成器函数不支持箭头函数的写法

// 高级迭代器用法

// 迭代器传参
// 可以给迭代器 next() 方法传递一个参数 这个参数会替代生成器内部上一条yield语句的返回值

// function* createIterator() {
//   let first = yield 1
//   let second = yield first + 2
//   yield second + 3
// }

// let iterator = createIterator()

// console.log(iterator.next()) // { value: 1, done: false }
// console.log(iterator.next(3)) // { value: 5, done: false }
// console.log(iterator.next(5)) // { value: 8, done: false }
// console.log(iterator.next()) // { value: undefined, done: true }

// 在迭代器抛出错误
// 迭代器除了 next() 方法，还有利用 throw() 抛出一个Error对象。错误被抛出后，生成器函数的后面代码会停止执行：
// function* createIterator() {
//   let first = yield 1
//   let second = yield first + 2
//   yield second + 3
// }

// let iterator = createIterator()

// console.log(iterator.next()) // { value: 1, done: false }
// console.log(iterator.next(3)) // { value: 5, done: false }
// console.log(iterator.throw(new Error('boom'))) // 从生成器中抛出错误

// 在生成器函数内可以用 try...catch 来捕捉错误，后续代码才能继续执行：
// function* createIterator() {
//   let first = yield 1
//   let second

//   try {
//     second = yield first + 2
//   } catch (e) {
//     second = 6
//   }

//   yield second + 3
// }

// let iterator = createIterator()

// console.log(iterator.next()) // { value: 1, done: false }
// console.log(iterator.next(3)) // { value: 5, done: false }
// console.log(iterator.throw(new Error('boom'))) // { value: 9, done: false }
// console.log(iterator.next()) // { value: undefined, done: true }

// 生成器返回值
// 因为生成器也是一个函数，所以可以用 return 返回值。在 return 后，结果对象的done立即变为 true，value为返回的值。后续 yield 语句将不会执行：

// function* createIterator() {
//   yield 1
//   return 'done'
//   yield 2
// }

// let iterator = createIterator()

// console.log(iterator.next()) // { value: 1, done: false }
// console.log(iterator.next()) // { value: 'done', done: true }
// console.log(iterator.next()) // { value: undefined, done: true }
// console.log(iterator.next()) // { value: undefined, done: true }

// 异步任务执行
// 我们用 setTimeout() 来模拟一个异步任务：
function fetchData(url, cb) {
  setTimeout(() => {
    cb({ code: 0, data: url })
  }, 1000)
}
// 将上面的函数改成返回可以接收回调的函数
function fetchData(url) {
  return (cb) => {
    setTimeout(() => {
      cb({ code: 0, data: url })
    }, 1000)
  }
}
// 我们有一个异步任务生成器函数
function* gen() {
  let res1 = yield fetchData('http://www.baidu.com')
  let res2 = yield fetchData('http://www.github.com')
  console.log(res1.data + ' ' + res2.data)
}
let g = gen()

g.next().value(function (data) {
  var r2 = g.next(data)
  r2.value(function (data2) {
    g.next(data2)
  })
})

console.log(g.next())
console.log(g.next())
console.log(g.next())
