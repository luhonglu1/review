// 实现promise 增加队列 then方法
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
    switch (_status) {
      case PENDING:
        this._fulfilledQueues.push(onFulfilled)
        this._rejectedQueues.push(onRejected)
        break
      case FULFILLED:
        onFulfilled(_value)
        break
      case REJECTED:
        onRejected(_value)
        break
    }

    return new MyPromise((onFulfilledNext, onRejectedNext) => {})
  }
}
