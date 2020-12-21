// 借用构造函数
// function Parent() {
//   this.name = ['zs', 'ls']
// }

// function Child() {
//   Parent.call(this)
// }

// var child1 = new Child()

// child1.name.push('ww')

// var child2 = new Child()

// console.log(child2.name)

// 优点：

// 1.避免了引用类型的属性被所有实例共享
// 2.可以在 Child 中向 Parent 传参

function Parent(name) {
  this.name = name
}

function Child(name) {
  Parent.call(this, name)
}

var child1 = new Child('loe')

var child2 = new Child('max')

console.log(child1.name)
console.log(child2.name)

// 缺点

// 方法都在构造函数中定义 每次创建实例都会创建一遍方法
