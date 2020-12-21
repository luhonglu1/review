// 完善then方法
// 判断是否为函数
const isFunction = (variable) => typeof variable === 'function'
const PENDING = 'PENDING'
const FULFILLED = 'FULFILLED'
const REJECTED = 'REJECTED'

class MyPromise {
  constructor(handle) {
    if (!isFunction(handle)) {
      throw new Error('MyPromise must accept a function as a parameter')
    }

    this._status = PENDING
    this._value = undefined

    this._fulfilledQueues = []
    this._rejectedQueues = []

    try {
      handle(this._resolve.bind(this), this._reject.bind(this))
    } catch {
      this._reject(err)
    }
  }

  _resolve(val) {
    if (this._status !== PENDING) return
    this._status = FULFILLED
    this._value = val
  }
  _reject(err) {
    if (this._status !== PENDING) return
    this._status = REJECTED
    this._value = err
  }

  then(onFulfilled, onRejected) {
    const { _value, _status } = this
    // 返回一个新的Promise对象
    return new MyPromise((onFulfilledNext, onRejectedNext) => {
      // 封装一个成功时执行的函数
      let fulfilled = (value) => {
        try {
          if (!isFunction(onFulfilled)) {
            onFulfilledNext(value)
          } else {
            let res = onFulfilled(value)
            if (res instanceof MyPromise) {
              // 如果当前回调函数返回MyPromise对象，必须等待其状态改变后在执行下一个回调
              res.then(onFulfilledNext, onRejectedNext)
            } else {
              //否则会将返回结果直接作为参数，传入下一个then的回调函数，并立即执行下一个then的回调函数
              onFulfilledNext(res)
            }
          }
        } catch (error) {
          onRejectedNext(error)
        }
      }
      // 封装一个失败时执行的函数
      let rejected = (error) => {
        try {
          if (!isFunction(onRejected)) {
            onRejectedNext(error)
          } else {
            let res = onRejectedNext(error)
            if (res instanceof MyPromise) {
              // 如果当前回调函数返回MyPromise对象，必须等待其状态改变后在执行下一个回调
              res.then(onFulfilledNext, onRejectedNext)
            } else {
              //否则会将返回结果直接作为参数，传入下一个then的回调函数，并立即执行下一个then的回调函数
              onFulfilledNext(res)
            }
          }
        } catch (error) {}
      }

      switch (_status) {
        // 当状态为pending时，将then方法回调函数加入执行队列等待执行
        case PENDING:
          this._fulfilledQueues.push(fulfilled)
          this._rejectedQueues.push(rejected)
          break
        // 当状态已经改变时，立即执行对应的回调函数
        case FULFILLED:
          onFulfilled(_value)
          break
        case REJECTED:
          onRejected(_value)
          break
      }
    })
  }
}
