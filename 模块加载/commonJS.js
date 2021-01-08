// CommonJS
// AMD 和 CMD 都是用于浏览器端的模块规范 而在服务器端比如node 采用的是 CommonJS 规范
// 导出模块的方式
// var add = function (x, y) {
//   return x + y
// }

// module.exports.add = add

// 模块引入的方式
// var add = require('./add.js')
// console.log(add.add(1, 1))

// CommonJS 与 AMD

// CommonJS 规范加载模块是同步的，也就是说，只有加载完成，才能执行后面的操作。

// AMD规范则是非同步加载模块，允许指定回调函数。

// 由于 Node.js 主要用于服务器编程，模块文件一般都已经存在于本地硬盘，所以加载起来比较快，不用考虑非同步加载的方式，所以 CommonJS 规范比较适用。

// 但是，如果是浏览器环境，要从服务器端加载模块，这时就必须采用非同步模式，因此浏览器端一般采用 AMD 规范。
