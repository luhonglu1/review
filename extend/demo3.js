// 组合继承
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

Child.prototype = new Parent()
Child.prototype.constructor = Child

var child1 = new Child('loe', 18)

child1.colors.push('black')

console.log(child1.name)
console.log(child1.age)
console.log(child1.colors)

var child2 = new Child('max', 24)

console.log(child2.name)
console.log(child2.age)
console.log(child2.colors)
