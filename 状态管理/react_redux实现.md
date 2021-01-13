尽管 ./redux实现 实现了 redux 基本功能。 但如需使用，要在每个组件中引入store，然后 getState，然后 dispatch，还有 subscribe，代码比较冗余，我们需要合并一些复杂操作，其中一种就是react-redux

## react-redux 的实现
react-redux 提供了一种合并操作的方案：react-redux 提供 Provider 和 connect 两个 API ， Provider 将 store 放进 this.context 里， 省去了import 这一步 connect 将 getState dispatch 合并进了this.props, 并自动订阅更新，简化了另外散步， 下面我们来看一下如何实现这两个API：

### 1. Provider 实现
创建Provider组件，并把store放进context里
```js
import React from 'react'
import PropTypes from 'prop-types'
export class Provider extends React.Component {  
    // 需要声明静态属性childContextTypes来指定context对象的属性,是context的固定写法  
    static childContextTypes = {    
        store: PropTypes.object  
    } 

    // 实现getChildContext方法,返回context对象,也是固定写法  
    getChildContext() {    
        return { store: this.store }  
    }  

    constructor(props, context) {    
        super(props, context)    
        this.store = props.store  
    }  

    // 渲染被Provider包裹的组件  
    render() {    
        return this.props.children  
    }
}
```

### 2. connect 实现
connect 的使用方法
```js
connect(mapStateToProps, mapDispatchToProps)(App)
```

connect 接收 mapStateToProps , mapDispatchToProps 两个方法， 返回一个高阶函数，这个函数接收一个组件， 返回一个高阶组件（给传入的组件增加一些属性和功能）connect 根据传入的map， 将state和dispatch(action)挂载子组件的props上。
```js
export function connect(mapStateToProps, mapDispatchToProps) {    
    return function(Component) {      
        class Connect extends React.Component {        
            componentDidMount() {          
                //从context获取store并订阅更新          
                this.context.store.subscribe(this.handleStoreChange.bind(this));        
            }       
            handleStoreChange() {          
                // 触发更新          
                // 触发的方法有多种,这里为了简洁起见,直接forceUpdate强制更新,读者也可以通过setState来触发子组件更新          
                this.forceUpdate()        
            }        
            render() {          
                return (            
                    <Component              
                        // 传入该组件的props,需要由connect这个高阶组件原样传回原组件              
                        { ...this.props }              
                        // 根据mapStateToProps把state挂到this.props上              
                        { ...mapStateToProps(this.context.store.getState()) }               
                        // 根据mapDispatchToProps把dispatch(action)挂到this.props上              
                        { ...mapDispatchToProps(this.context.store.dispatch) }                 
                    />              
                )        
            }      
        }      
        //接收context的固定写法      
        Connect.contextTypes = {        
            store: PropTypes.object      
        }      
        return Connect    
    }
}
```