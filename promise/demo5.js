// 完善_resolve 和 _reject resolve方法传入如果是一个promise对象 该promise对象的状态决定当前promise的状态
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
      console.log('走了try')
      handle(this._resolve.bind(this), this._reject.bind(this))
    } catch {
      this._reject(err)
    }
  }

  _resolve(val) {
    const run = () => {
      if (this._status !== PENDING) return

      // 依次执行成功队列中的函数，并清空队列
      const runFulfilled = (value) => {
        let cb
        while ((cb = this._fulfilledQueues.shift())) {
          cb(value)
        }
      }

      // 依次执行失败队列中的函数，并清空队列
      const runRejected = (error) => {
        let cb
        while ((cb = this._rejectedQueues.shift())) {
          cb(error)
        }
      }

      /* 如果resolve的参数为Promise对象，则必须等待该Promise对象状态改变后,
        当前Promsie的状态才会改变，且状态取决于参数Promsie对象的状态
      */
      if (val instanceof MyPromise) {
        val.then(
          (value) => {
            this._value = _value
            this._status = FULFILLED
            runFulfilled(value)
          },
          (error) => {
            this._value = error
            this._status = REJECTED
            runRejected(error)
          }
        )
      } else {
        this._value = val
        this._status = FULFILLED
        let cb
        while ((cb = this._fulfilledQueues.shift())) {
          cb(val)
        }
      }
    }
    // 为了支持同步的Promise, 这里采用异步调用
    setTimeout(run, 0)
  }
  _reject(err) {
    if (this._status !== PENDING) return
    const run = () => {
      this._status = REJECTED
      this._value = err
      let cb
      while ((cb = this._rejectedQueues.shift())) {
        cb(err)
      }
    }
    setTimeout(() => {
      run()
    }, 0)
  }

  then(onFulfilled, onRejected) {
    console.log('走了then---')
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
              console.log(33333)
              // 如果当前回调函数返回MyPromise对象，必须等待其状态改变后在执行下一个回调
              res.then(onFulfilledNext, onRejectedNext)
            } else {
              //否则会将返回结果直接作为参数，传入下一个then的回调函数，并立即执行下一个then的回调函数
              onRejectedNext(res)
            }
          }
        } catch (error) {
          onRejectedNext(error)
        }
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
      console.log('aaaaa')
      console.log(err) // 1秒后打印出：fail
    }
  )
