## Vue 组件通信方式
### 一、 props / $emit
父组件通过 props 的方式向子组件传递数据， 而通过 $emit 子组件可以向父组件通信
父组件通过属性传递 子组件通过 props 接收
父组件通过 v-on 将绑定的回调函数传给子组件，子组件通过 $emit 触发父组件绑定的方法并传值

> prop 只可以从上一级传到下一级，即单向数据流。而且 prop 只读不可被修改，所有修改都会失效并警告。

### 二、 $children / $parent
通过 $children 访问子组件 **列表**
通过 $parent 访问父组件 **对象**

### 三、 provide / inject
provide 提供变量，子组件通过 inject 来注入变量
> 不管多深的嵌套， 只要调用 inject 就可以注入 provide 中的数据

祖先组件
```js
export default {
    provide: {
        for: 'demo'
    }
}
```

后代组件
```js
export default {
    inject: ['for']
}
```

### 四、ref / refs
ref: 如果在普通的 DOM 元素上使用，引用指向的就是 DOM 元素；如果用在子组件上，引用就指向组件实例，可以通过实例直接调用组件的方法或访问数据，我们看一个 ref 来访问组件的例子：

```js
// 子组件
export default {
  data () {
    return {
      name: 'Vue.js'
    }
  },
  methods: {
    sayHello () {
      console.log('hello')
    }
  }
}
```
```js
<template>
  <component-a ref="comA"></component-a>
</template>
<script>
  export default {
    mounted () {
      const comA = this.$refs.comA;
      console.log(comA.name);  // Vue.js
      comA.sayHello();  // hello
    }
  }
</script>
```

### 五、eventBus
eventBus 也有不方便之处，当项目较大，就容易造成难以维护的灾难

在 Vue 的项目中怎么使用 eventBus 来实现组件之间的数据通信呢? 具体通过下面几个步骤

#### 1. 初始化
首先需要创建一个事件总线并将其导出，以便其他模块可以使用或者监听它

```js
import Vue from 'vue'
export const EventBus = new Vue()
```
#### 2.发送事件
假设你有两个组件: additionNum 和 showNum, 这两个组件可以是兄弟组件也可以是父子组件；这里我们以兄弟组件为例:

```html
<template>
  <div>
    <show-num-com></show-num-com>
    <addition-num-com></addition-num-com>
  </div>
</template>

<script>
import showNumCom from './showNum.vue'
import additionNumCom from './additionNum.vue'
export default {
  components: { showNumCom, additionNumCom }
}
</script>
```

```html
// addtionNum.vue 中发送事件

<template>
  <div>
    <button @click="additionHandle">+加法器</button>    
  </div>
</template>

<script>
import {EventBus} from './event-bus.js'
console.log(EventBus)
export default {
  data(){
    return{
      num:1
    }
  },

  methods:{
    additionHandle(){
      EventBus.$emit('addition', {
        num:this.num++
      })
    }
  }
}
</script>
```

#### 3. 接收事件
```html
// showNum.vue 中接收事件

<template>
  <div>计算和: {{count}}</div>
</template>

<script>
import { EventBus } from './event-bus.js'
export default {
  data() {
    return {
      count: 0
    }
  },

  mounted() {
    EventBus.$on('addition', param => {
      this.count = this.count + param.num;
    })
  }
}
</script>
```

#### 4. 移除事件监听者
```js
import { eventBus } from 'event-bus.js'
EventBus.$off('addition', {})
```

### 六、Vuex
#### Vuex 各个模块
1. state：用于数据的存储，是store中的唯一数据源
2. getters：如vue中的计算属性一样，基于state数据的二次包装，常用于数据的筛选和多个数据的相关性计算
3. mutations：类似函数，改变state数据的唯一途径，且不能用于处理异步事件
4. actions：类似于mutation，用于提交mutation来改变状态，而不直接变更状态，可以包含任意异步操作
5. modules：类似于命名空间，用于项目中将各个模块的状态分开定义和操作，便于维护

#### Vuex 实例应用
```html
// 父组件

<template>
  <div id="app">
    <ChildA/>
    <ChildB/>
  </div>
</template>

<script>
  import ChildA from './components/ChildA' // 导入A组件
  import ChildB from './components/ChildB' // 导入B组件

  export default {
    name: 'App',
    components: {ChildA, ChildB} // 注册A、B组件
  }
</script>
```

```html
// 子组件childA

<template>
  <div id="childA">
    <h1>我是A组件</h1>
    <button @click="transform">点我让B组件接收到数据</button>
    <p>因为你点了B，所以我的信息发生了变化：{{BMessage}}</p>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        AMessage: 'Hello，B组件，我是A组件'
      }
    },
    computed: {
      BMessage() {
        // 这里存储从store里获取的B组件的数据
        return this.$store.state.BMsg
      }
    },
    methods: {
      transform() {
        // 触发receiveAMsg，将A组件的数据存放到store里去
        this.$store.commit('receiveAMsg', {
          AMsg: this.AMessage
        })
      }
    }
  }
</script>
```
```html
// 子组件 childB

<template>
  <div id="childB">
    <h1>我是B组件</h1>
    <button @click="transform">点我让A组件接收到数据</button>
    <p>因为你点了A，所以我的信息发生了变化：{{AMessage}}</p>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        BMessage: 'Hello，A组件，我是B组件'
      }
    },
    computed: {
      AMessage() {
        // 这里存储从store里获取的A组件的数据
        return this.$store.state.AMsg
      }
    },
    methods: {
      transform() {
        // 触发receiveBMsg，将B组件的数据存放到store里去
        this.$store.commit('receiveBMsg', {
          BMsg: this.BMessage
        })
      }
    }
  }
</script>
```
vuex 的 store.js
```js
import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)
const state = {
  // 初始化A和B组件的数据，等待获取
  AMsg: '',
  BMsg: ''
}

const mutations = {
  receiveAMsg(state, payload) {
    // 将A组件的数据存放于state
    state.AMsg = payload.AMsg
  },
  receiveBMsg(state, payload) {
    // 将B组件的数据存放于state
    state.BMsg = payload.BMsg
  }
}

export default new Vuex.Store({
  state,
  mutations
})
```
## 七、localStorage / sessionStorage
这种通信比较简单，缺点就是数据和状态比较混乱，不太容易维护。通过window.localStorage.getItem(key)获取数据，通过window.setItem(key, value)存储数据
> 注意用JSON.parse() / JSON.stringify() 做数据格式的转化 localStorage / sessionStorage 可以结合 vuex，实现数据的持久化保存，同时使用 vuex 解决数据和状态混乱的问题。

## 八、 $attrs与 $listeners
