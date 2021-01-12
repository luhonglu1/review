// ECMAScript2015 规定了新的模块加载方案。
// 导出模块的方式
var firstName = 'Michael'
var lastName = 'Jackson'
var year = 1958

export { firstName, lastName, year }

// 引入模块的方式
import { firstName, lastName, year } from './profile'

// 导入语法详见 ./projectES6
// 注意！浏览器加载 ES6 模块，也使用 <script> 标签，但是要加入 type="module" 属性。

// ES6 与 CommonJS
// 它们有两个重要差距
// 1. CommonJS 模块输出的是一个值的拷贝，ES6 模块输出的是值的引用。

// 2. CommonJS 模块是运行时加载，ES6 模块是编译时输出接口。

// CommonJS 模块输出的是值的拷贝，也就是说，一旦输出一个值，模块内部的变化就影响不到这个值。
// 举个例子
// 输出模块 counter.js
var counter = 3
function incCounter() {
  counter++
}
module.exports = {
  counter: counter,
  incCounter: incCounter,
}
// 引入模块 main.js
var mod = require('./counter')

console.log(mod.counter) // 3
mod.incCounter()
console.log(mod.counter) // 3
// counter.js 模块加载以后，它的内部变化就影响不到输出的 mod.counter 了。这是因为 mod.counter 是一个原始类型的值，会被缓存。
// 但是如果修改 counter 为一个引用类型的话：
// 输出模块 counter.js
var counter = {
  value: 3,
}

function incCounter() {
  counter.value++
}
module.exports = {
  counter: counter,
  incCounter: incCounter,
}
// 引入模块 main.js
var mod = require('./counter.js')

console.log(mod.counter.value) // 3
mod.incCounter()
console.log(mod.counter.value) // 4
