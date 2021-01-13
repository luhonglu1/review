## redux Middleware 实现
所谓中间件，我们可以理解为拦截器，用于对某些过程进行拦截和处理，且中间件之间能够串联使用。在redux中，我们中间件拦截的是dispatch提交到reducer这个过程，从而增强dispatch的功能。

### 1. 在每次 dispatch 之后手动打印 store
```js
store.dispatch({ type: 'plus' })
console.log('next state', store.getState())
```
把这部分功能提取出来

### 2. 封装 dispatch
```js
function dispatchAndLog(store, action) {    
    store.dispatch(action)    
    console.log('next state', store.getState())
}
```

### 3. 替换 dispatch
```js
let next = store.dispatch
store.dispatch = function dispatchAndLog(action) {  
    let result = next(action)  
    console.log('next state', store.getState())  
    return result
}
```
但我们希望不同的功能是独立的可拔插的模块。

### 4. 模块化
```js
// 打印日志中间件
function patchStoreToAddLogging(store) {    
    let next = store.dispatch    //此处也可以写成匿名函数    
    store.dispatch = function dispatchAndLog(action) {      
        let result = next(action)      
        console.log('next state', store.getState())      
        return result    
    }
}  

// 监控错误中间件
function patchStoreToAddCrashReporting(store) {    
    //这里取到的dispatch已经是被上一个中间件包装过的dispatch, 从而实现中间件串联    
    let next = store.dispatch    
    store.dispatch = function dispatchAndReportErrors(action) {        
        try {            
            return next(action)        
        } catch (err) {            
            console.error('捕获一个异常!', err)            
            throw err        
        }    
    }
}
```

### 5. applyMiddleware
改造一下中间件， 使其返回新的 dispatch 而不是替换原 dispatch
```js
function logger(store) {    
    let next = store.dispatch     
 
    // 我们之前的做法(在方法内直接替换dispatch):    
    // store.dispatch = function dispatchAndLog(action) {    
    //         ...    
    // }    
  
    return function dispatchAndLog(action) {        
        let result = next(action)        
        console.log('next state', store.getState())        
        return result    
    }
}
```
在 Redux 中增加一个辅助方法 applyMiddleware， 用于添加中间件
```js
function applyMiddleware(store, middlewares) {    
    middlewares = [ ...middlewares ]    //浅拷贝数组, 避免下面reserve()影响原数组    
    middlewares.reverse()               //由于循环替换dispatch时,前面的中间件在最里层,因此需要翻转数组才能保证中间件的调用顺序      
    // 循环替换dispatch   
    middlewares.forEach(middleware =>      
        store.dispatch = middleware(store)    
    )
}
```
然后我们就能以这种形式增加中间件了：
```js
applyMiddleware(store, [logger, crashReporter])
```

### 6. 纯函数
之前函数在函数体内修改了store自身的dispatch，产生了所谓的“副作用”，借鉴react-redux的实现思路，我们可以把applyMiddleware作为高阶函数，用于增强store，而不是替换dispatch：

先对createStore进行一个小改造，传入heightener（即applyMiddleware），heightener接收并强化createStore。
```js
// store.js
export const createStore = (reducer, heightener) => {    
    // heightener是一个高阶函数,用于增强createStore    
    //如果存在heightener,则执行增强后的createStore    
    if (heightener) {        
        return heightener(createStore)(reducer)    
    }        
    let currentState = {}    
    let observers = []             //观察者队列    
    function getState() {        
        return currentState    
    }    
    function dispatch(action) {        
        currentState = reducer(currentState, action);        
        observers.forEach(fn => fn())    
    }    
    function subscribe(fn) {        
        observers.push(fn)    
    }    
    dispatch({ type: '@@REDUX_INIT' })//初始化store数据    
    return { getState, subscribe, dispatch }
}
```

中间件进一步柯里化，让next通过参数传入
```js
const logger = store => next => action => {    
    console.log('log1')    
    let result = next(action)    
    return result
}

const thunk = store => next =>action => {
    console.log('thunk')    
    const { dispatch, getState } = store    
    return typeof action === 'function' ? action(store.dispatch) : next(action)
}

const logger2 = store => next => action => {    
    console.log('log2')    
    let result = next(action)    
    return result
}
```

改造applyMiddleware
```js
const applyMiddleware = (...middlewares) => createStore => reducer => {    
    const store = createStore(reducer)    
    let { getState, dispatch } = store    
    const params = {      
        getState,      
        dispatch: (action) => dispatch(action)      
        //解释一下这里为什么不直接 dispatch: dispatch      
        //因为直接使用dispatch会产生闭包,导致所有中间件都共享同一个dispatch,如果有中间件修改了dispatch或者进行异步dispatch就可能出错    
    }    

    const middlewareArr = middlewares.map(middleware => middleware(params)) 
   
    dispatch = compose(...middlewareArr)(dispatch)    
    return { ...store, dispatch }
}

//compose这一步对应了middlewares.reverse(),是函数式编程一种常见的组合方法
function compose(...fns) {
    if (fns.length === 0) return arg => arg    
    if (fns.length === 1) return fns[0]    
    return fns.reduce((res, cur) =>(...args) => res(cur(...args)))
}
```
代码应该不难看懂，在上一个例子的基础上，我们主要做了两个改造

1. 使用compose方法取代了middlewares.reverse()，compose是函数式编程中常用的一种组合函数的方式，compose内部使用reduce巧妙地组合了中间件函数，使传入的中间件函数变成(...arg) => mid1(mid2(mid3(...arg)))这种形式
2. 不直接替换dispatch，而是作为高阶函数增强createStore，最后return的是一个新的store

### 7. 洋葱圈模型
话不多说直接上代码
```js
const logger1 = store => next => action => {    
    console.log('进入log1')    
    let result = next(action)    
    console.log('离开log1')    
    return result
}

const logger2 = store => next => action => {    
    console.log('进入log2')    
    let result = next(action)    
    console.log('离开log2')    
    return result
}

const logger3 = store => next => action => {    
    console.log('进入log3')    
    let result = next(action)    
    console.log('离开log3')    
    return result
}
```
执行结果

进入log1
进入log2
进入log3
离开log3
离开log2
离开log1

因此我们可以看到，中间件的执行顺序实际上是这样的：进入log1 -> 执行next -> 进入log2 -> 执行next -> 进入log3 -> 执行next -> next执行完毕 -> 离开log3 -> 回到上一层中间件,执行上层中间件next之后的语句 -> 离开log2 -> 回到中间件log1, 执行log1的next之后的语句 -> 离开log1

[掘金链接](https://juejin.cn/post/6844904036013965325#heading-0)