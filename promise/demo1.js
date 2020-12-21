// 实现promise 基本结构、状态、值
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
}
