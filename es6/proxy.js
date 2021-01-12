// definePropety
// 在一个对象上定义一个新属性 或者修改对象现有属性 并返回这个对象

// 语法 Object.defineProperty(obj, prop, descriptor)
// 参数
// obj: 要在其上定义属性对象
// prop: 要定义或修改的属性名称
// descriptor: 将被定义或修改的属性的描述符

// var obj = {}
// Object.defineProperty(obj, 'num', {
//   value: 1,
//   writable: true,
//   enumerable: true,
//   configurable: true,
// })

// 属性描述符必须是数据描述符或者存取描述符两种形式之一，不能同时是两者 。
// 例如不能如下写法:
// Object.defineProperty({}, 'num', {
//   value: 1,
//   get: function () {
//     return 1
//   },
// })

// 监控数据改变的方法
// function Archiver() {
//   var value = null
//   var archives = []

//   Object.defineProperty(this, 'num', {
//     get: function () {
//       console.log('执行了 get 方法')
//       return value
//     },
//     set: function (val) {
//       console.log('执行了 set 方法')
//       value = val
//       archives.push({ val: value })
//     },
//   })

//   this.getArchive = function () {
//     return archives
//   }
// }

// let arc = new Archiver()
// arc.num
// arc.num = 11
// arc.num = 13
// console.log(arc.getArchive())

// proxy
// 语法： var proxy = new Proxy(target, handler)

// target 拦截的目标对象 handler 定制拦截的行为

// var proxy = new Proxy(
//   {},
//   {
//     get: function (obj, prop) {
//       console.log('设置 get 操作')
//       return obj[prop]
//     },
//     set: function (obj, prop, value) {
//       console.log('设置 set 操作')
//     },
//   }
// )

// console.log(proxy.name)
// proxy.name = 'zs'
