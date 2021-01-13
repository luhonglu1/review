## redux 实现
我们的诉求是希望公共状态既能够被全局访问到，又是私有的不能被直接修改

既然我们要存取状态，那么肯定要有getter和setter，此外当状态发生改变时，我们得进行广播，通知组件状态发生了变更。这不就和redux的三个API：getState、dispatch、subscribe对应上了吗。我们用几句代码勾勒出store的大致形状：

```js
export const createStore = () => {    
    let currentState = {}       // 公共状态    
    function getState() {}      // getter    
    function dispatch() {}      // setter    
    function subscribe() {}     // 发布订阅    
    return { getState, dispatch, subscribe }
}

```

### 1. getState 实现
getState() 的实现非常简单， 返回当前状态即可：
```js
export const createStore = () => {    
    let currentState = {}       // 公共状态    
    function getState() {       // getter        
        return currentState    
    }    
    function dispatch() {}      // setter    
    function subscribe() {}     // 发布订阅    
    return { getState, dispatch, subscribe }
}
```

### 2. dispatch 实现
我们的目标是有条件地、具名地修改store的数据，那么我们要如何实现这两点呢？我们已经知道，在使用dispatch的时候，我们会给dispatch()传入一个action对象，这个对象包括我们要修改的state以及这个操作的名字(actionType)，根据type的不同，store会修改对应的state。我们这里也沿用这种设计：

```js
export const createStore = () => {    
    let currentState = {}    
    function getState() {        
        return currentState    
    }    
    function dispatch(action) {        
        switch (action.type) {            
            case 'plus':            
            currentState = {                 
                ...state,                 
                count: currentState.count + 1            
            }        
        }    
    }    
    function subscribe() {}    
    return { getState, subscribe, dispatch }
}
```
我们把对actionType的判断写在了dispatch中，这样显得很臃肿，也很笨拙，于是我们想到把这部分修改state的规则抽离出来放到外面，这就是我们熟悉的reducer。我们修改一下代码，让reducer从外部传入：

```js
import { reducer } from './reducer'
export const createStore = (reducer) => {    
    let currentState = {}     
    function getState() {        
        return currentState    
    }    
    function dispatch(action) {         
        currentState = reducer(currentState, action)  
    }    
    function subscribe() {}    
    return { getState, dispatch, subscribe }
}
```

然后我们创建一个reducer.js文件，写我们的reducer

```js
//reducer.js
const initialState = {    
    count: 0
}
export function reducer(state = initialState, action) {    
    switch(action.type) {      
        case 'plus':        
        return {            
            ...state,                    
            count: state.count + 1        
        }      
        case 'subtract':        
        return {            
            ...state,            
            count: state.count - 1        
        }      
        default:        
        return initialState    
    }
}
```

运行代码，我们会发现，打印得到的state是：{ count: NaN }，这是由于store里初始数据为空，所以我们得先进行store数据初始化，我们在执行dispatch({ type: 'plus' })之前先进行一次初始化的dispatch，这个dispatch的actionType可以随便填，只要不和已有的type重复，让reducer里的switch能走到default去初始化store就行了：

```js
import { reducer } from './reducer'
export const createStore = (reducer) => {        
    let currentState = {}        
    function getState() {                
        return currentState        
    }        
    function dispatch(action) {                
        currentState = reducer(currentState, action)        
    }        
    function subscribe() {}    
    dispatch({ type: '@@REDUX_INIT' })  //初始化store数据        
    return { getState, subscribe, dispatch }
}

const store = createStore(reducer)      //创建store
store.dispatch({ type: 'plus' })        //执行加法操作,给count加1
console.log(store.getState())           //获取state
```

### 3. subscribe 实现
我们需要监听store的变化 这里我们应用一个设计模式——观察者模式

这里我们先跳出 redux , 写一段简单的观察者模式实现的代码
```js
//观察者
class Observer {    
    constructor (fn) {      
        this.update = fn    
    }
}
//被观察者
class Subject {    
    constructor() {        
        this.observers = []          //观察者队列    
    }    
    addObserver(observer) {          
        this.observers.push(observer)//往观察者队列添加观察者    
    }    
    notify() {                       //通知所有观察者,实际上是把观察者的update()都执行了一遍       
        this.observers.forEach(observer => {        
            observer.update()            //依次取出观察者,并执行观察者的update方法        
        })    
    }
}

var subject = new Subject()       //被观察者
const update = () => {console.log('被观察者发出通知')}  //收到广播时要执行的方法
var ob1 = new Observer(update)    //观察者1
var ob2 = new Observer(update)    //观察者2
subject.addObserver(ob1)          //观察者1订阅subject的通知
subject.addObserver(ob2)          //观察者2订阅subject的通知
subject.notify()                  //发出广播,执行所有观察者的update方法

```

有了上面观察者模式的例子，subscribe的实现应该很好理解
```js
import { reducer } from './reducer'
export const createStore = (reducer) => {        
    let currentState = {}        
    let observers = []             //观察者队列        
    function getState() {                
        return currentState        
    }        
    function dispatch(action) {                
        currentState = reducer(currentState, action)                
        observers.forEach(fn => fn())        
    }        
    function subscribe(fn) {                
        observers.push(fn)        
    }        
    dispatch({ type: '@@REDUX_INIT' })  //初始化store数据        
    return { getState, subscribe, dispatch }
}
```

具体实现见 ./redux 文件