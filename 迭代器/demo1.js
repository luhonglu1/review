function createIterator(items) {
  var i = 0
  return {
    next: function () {
      var done = i >= items.length
      var value = !done ? items[i++] : undefined

      return {
        done: done,
        value: value,
      }
    },
    return: function () {
      console.log('执行了 return 方法')
      return {
        value: 23333,
        done: true,
      }
    },
  }
}

var colors = ['red', 'green', 'blue']

var iterator = createIterator([1, 2, 3])

colors[Symbol.iterator] = function () {
  return iterator
}

for (let color of colors) {
  if (color == 1) break
  console.log(color)
}
