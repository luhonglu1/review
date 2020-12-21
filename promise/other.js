class MyPromise {
  constructor(executor) {
    this.state = 'pending' // 状态
    this.value = undefined // 成功状态的值
    this.reason = undefined // 失败状态的值
    this.onResolvedCallbacks = [] // 成功执行队列
    this.onRejectedCallbacks = [] // 失败执行队列
    let resolve = (value) => {
      if (this.state === 'pending') {
        this.state = 'fulfilled'
        this.value = value
        this.onResolvedCallbacks.forEach((fn) => fn())
      }
    }
    let reject = (reason) => {
      if (this.state === 'pending') {
        this.state = 'rejected'
        this.reason = reason
        this.onRejectedCallbacks.forEach((fn) => fn())
      }
    }
    try {
      executor(resolve, reject)
    } catch (err) {
      reject(err)
    }
  }
  then(onFulfilled, onRejected) {
    onFulfilled =
      typeof onFulfilled === 'function' ? onFulfilled : (value) => value
    onRejected =
      typeof onRejected === 'function'
        ? onRejected
        : (err) => {
            throw err
          }
    let promise2 = new MyPromise((resolve, reject) => {
      if (this.state === 'fulfilled') {
        setTimeout(() => {
          try {
            let x = onFulfilled(this.value)
            resolvePromise(promise2, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        }, 0)
      }
      if (this.state === 'rejected') {
        setTimeout(() => {
          try {
            let x = onRejected(this.reason)
            resolvePromise(promise2, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        }, 0)
      }
      if (this.state === 'pending') {
        this.onResolvedCallbacks.push(() => {
          setTimeout(() => {
            try {
              let x = onFulfilled(this.value)
              resolvePromise(promise2, x, resolve, reject)
            } catch (e) {
              reject(e)
            }
          }, 0)
        })
        this.onRejectedCallbacks.push(() => {
          setTimeout(() => {
            try {
              let x = onRejected(this.reason)
              resolvePromise(promise2, x, resolve, reject)
            } catch (e) {
              reject(e)
            }
          }, 0)
        })
      }
    })
    return promise2
  }
  catch(fn) {
    return this.then(null, fn)
  }
}
function resolvePromise(promise2, x, resolve, reject) {
  // promise2 最终返回的promise
  // x  .then 或 .catch 返回值
  // resolve reject 返回promise.then 的两个参数
  if (x === promise2) {
    // .then 或 .catch 返回值不能是 promise 本身 否则会造成死循环
    return reject(new TypeError('Chaining cycle detected for promise'))
  }
  let called
  if (x != null && (typeof x === 'object' || typeof x === 'function')) {
    try {
      let then = x.then
      if (typeof then === 'function') {
        then.call(
          x,
          (y) => {
            if (called) return
            called = true
            resolvePromise(promise2, y, resolve, reject)
          },
          (err) => {
            if (called) return
            called = true
            reject(err)
          }
        )
      } else {
        resolve(x)
      }
    } catch (e) {
      if (called) return
      called = true
      reject(e)
    }
  } else {
    resolve(x)
  }
}
//resolve方法
MyPromise.resolve = function (val) {
  return new MyPromise((resolve, reject) => {
    resolve(val)
  })
}
//reject方法
MyPromise.reject = function (val) {
  return new MyPromise((resolve, reject) => {
    reject(val)
  })
}
//race方法
MyPromise.race = function (promises) {
  return new MyPromise((resolve, reject) => {
    for (let i = 0; i < promises.length; i++) {
      promises[i].then(resolve, reject)
    }
  })
}
//all方法(获取所有的promise，都执行then，把结果放到数组，一起返回)
MyPromise.all = function (promises) {
  let arr = []
  let i = 0
  function processData(index, data) {
    arr[index] = data
    i++
    if (i == promises.length) {
      resolve(arr)
    }
  }
  return new MyPromise((resolve, reject) => {
    for (let i = 0; i < promises.length; i++) {
      promises[i].then((data) => {
        processData(i, data)
      }, reject)
    }
  })
}

let promise1 = new MyPromise((resolve, reject) => {
  setTimeout(() => {
    reject('fail')
  }, 1000)
})
promise2 = promise1
  .then((res) => res, '这里的onRejected本来是一个函数，但现在不是')
  .then(
    (res) => {
      console.log(res)
    },
    (err) => {
      console.log(err) // 1秒后打印出：fail
    }
  )
