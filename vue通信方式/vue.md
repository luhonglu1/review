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