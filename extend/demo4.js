// 寄生组合继承
function Parent(name) {
  this.name = name
  this.colors = ['red', 'blue', 'green']
}

Parent.prototype.getName = function () {
  console.log(this.name)
}

function Child(name, age) {
  Parent.call(this, name)
  this.age = age
}

// var F = function () {}
// F.prototype = Parent.prototype
// Child.prototype = new F()

// var child1 = new Child('loe', 18)
// console.log(child1)

// 封装这个继承方法
function object(o) {
  function F() {}
  F.prototype = o
  return new F()
}

function prototype(child, parent) {
  var prototype = object(parent.prototype)
  prototype.constructor = child
  child.prototype = prototype
}

prototype(Child, Parent)
var child1 = new Child('loe', 18)
console.log(child1)
l
