//store.js
const { reducer } = require('./reducer')
const createStore = (reducer) => {
  let currentState = {}
  let observers = [] //观察者队列
  function getState() {
    return currentState
  }
  function dispatch(action) {
    currentState = reducer(currentState, action)
    observers.forEach((fn) => fn())
  }
  function subscribe(fn) {
    observers.push(fn)
  }
  dispatch({ type: '@@REDUX_INIT' }) //初始化store数据
  return { getState, subscribe, dispatch }
}

const store = createStore(reducer) //创建store
store.subscribe(() => {
  console.log('组件1收到store的通知')
})
store.subscribe(() => {
  console.log('组件2收到store的通知')
})
store.dispatch({ type: 'plus' }) //执行dispatch，触发store的通知
console.log(store.getState()) //获取state
