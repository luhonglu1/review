// 原型链继承
// function Parent() {
//   this.name = 'loe'
// }

// Parent.prototype.getName = function () {
//   console.log(this.name)
// }

// function Child() {}

// Child.prototype = new Parent()

// var child1 = new Child()

// child1.getName()

// 问题：
// 1. 引用类型的属性被所有实例共享，举个例子:
function Parent() {
  this.name = ['zs', 'ls']
}

Parent.prototype.getName = function () {
  console.log(this.name)
}

function Child() {}

Child.prototype = new Parent()

var child1 = new Child()

child1.name.push('ww')

var child2 = new Child()

child2.getName()
