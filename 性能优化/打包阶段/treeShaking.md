## Tree-Shaking
### 什么是 tree-shaking
将没有使用的模块摇掉，这样来达到删除无用代码的目的。

### tree-shaking 的原理
Tree-shaking的本质是消除无用的js代码。无用代码消除在广泛存在于传统的编程语言编译器中，编译器可以判断出某些代码根本不影响输出，然后消除这些代码，这个称之为DCE（dead code elimination）。

Tree-shaking 是 DCE 的一种新的实现，Javascript同传统的编程语言不同的是，javascript绝大多数情况需要通过网络进行加载，然后执行，加载的文件大小越小，整体执行时间更短，所以去除无用代码以减少文件体积，对javascript来说更有意义。

Tree-shaking 和传统的 DCE的方法又不太一样，传统的DCE 消灭不可能执行的代码，而Tree-shaking 更关注于消除没有用到的代码。下面详细介绍一下DCE和Tree-shaking。

#### 1. 先来看一下 DCE 消除大法
dead code 
* 代码不会被执行，不可到达
* 代码执行的结果不会被用到
* 代码只会影响死变量 （只写不读）

```js
let foo = () => {
    // 死码 ----------------------- 开始
    let x = 1
    if(false) {
        console.log('never reached')
    }
    // 死码 ----------------------- 结束
    let a = 3
    return a
}

let baz = () => {
    var x = 1
    console.log(x)
    // 死码 ----------------------- 开始
    function unused() {
        return 5
    }
    // 死码 ----------------------- 结束
    return x
    // 死码 ----------------------- 开始
    let c = x + 3
    return c
    // 死码 ----------------------- 结束
}

baz()
```

传统编译型的语言中，都是由编译器将Dead Code从AST（抽象语法树）中删除，那javascript中是由谁做DCE呢？

首先肯定不是浏览器做DCE，因为当我们的代码送到浏览器，那还谈什么消除无法执行的代码来优化呢，所以肯定是送到浏览器之前的步骤进行优化。

其实也不是上面提到的三个工具，rollup，webpack，cc做的，而是著名的代码压缩优化工具uglify，uglify完成了javascript的DCE，下面通过一个实验来验证一下。

分别用rollup 和 webpack 将上面代码进行打包
```js
// rollup
'use strict'

var baz = function baz() {
    var x = 1;
    console.log(x);
    return x;
    var c = x + 3;
    return c;
}

baz()
```

```js
// webpack
var foo = function foo() {
    var x = 1
    if(false) {
        console.log('never reached')
    }
    var a = 3
    return a
}

var baz = function baz() {
    var x = 1
    console.log(x)
    function unused() {
        return 5
    }
    return x
    var c = x + 3
    return c
}

baz()
```
可以发现，rollup将无用的代码foo函数和unused函数消除了，但是仍然保留了不会执行到的代码，而webpack完整的保留了所有的无用代码和不会执行到的代码。

rollup/webpack + uglify
去除了无法执行到的代码

#### 2. 再来看一下 tree-shaking 消除大法

其实 tree-shaking 的消除原理是依赖于 ES6 的模块特性

ES6 module 特点：
* 只能作为模块顶层的语句出现
* import 的模块只能是字符串常量
* import binding 是 immutable 的

ES6 模块依赖关系是确定的，和运行时的状态无关，可以进行可靠的静态分析，这就是tree-shaking的基础。

所谓静态分析就是不执行代码，从字面量上对代码进行分析，ES6之前的模块化，比如我们可以动态require一个模块，只有执行后才知道引用的什么模块，这个就不能通过静态分析去做优化。

这是 ES6 modules 在设计时的一个重要考量，也是为什么没有直接采用 CommonJS，正是基于这个基础上，才使得 tree-shaking 成为可能，这也是为什么 rollup 和 webpack 2 都要用 ES6 module syntax 才能 tree-shaking。

通过列子来了解一下 

面向过程编程函数和面向对象编程是javascript最常用的编程模式和代码组织方式，从这两个方面来实验：

* 函数消除实验
* 类消除实验

**先看下函数消除实验**

utils 中 get 方法没有被使用到， 我们期望 get 方法被消除。
```js
// main.js
import { post } from './util.js'

let baz = () => {
    post()
    let x = 1
    console.log(x)
    function unused () {
        return 5
    }
    return x
}

baz()

// util.js
export function post() {
    console.log('do post')
}

export function get() {
    console.log('do get')
}
```
注意， uglify 目前不会跨文件去做 DCE， 所以上面这种情况，uglify 是不能优化的。

**先看看 Rollup 的打包结果**
```js
"use strict";function post(){console.log("do post")}var baz=function(){post();return console.log(1),1};baz();
```

完全符合预期， 最终结果中没有 get 方法 

**再看看 webpack 的打包结果**
```js
...function(e,n,t){"use strict";function o(){console.log("do post")}}...
```
也符合预期，最终结果没有 get 方法

可以看到 Rollup 打包的结果比 webpack 更优化

> 函数消除实验中， rollup 和 webpack 都通过，符合预期

**再来看下类消除实验**

增加了对 menu.js 的引用，但其实代码中并没有用到 menu 的任何方法和变量， 所以我们的期望是， 最终代码中 menu.js 里的内容被消除

```js
// main.js
import { post } from './util.js'
import Menu from './menu.js'

let baz = () => {
    post()
    let x = 1
    console.log(x)
    function unused () {
        return 5
    }
    return x
}

baz()

// menu.js
export default class Menu {
    constructor () {
        this.display = "none"
    }
    show () {
        this.display = "block"
    }
    hide () {
        this.display = "none"
    }
    isShow () {
        return this.display === "block"
    }
}
```

rollup 打包结果包含了 menu.js 全部代码

webpack 打包结果也包含了 menu.js　全部代码

> 消除实验中 rollup webpack 全军覆没，都没有达到预期

```js
var Person = (function() {
    var Person = function () {}
    Person.prototype.run = function run() { console.log("run") }
    Person.prototype.jump = function jump() { console.log("jump") }
    return Person
}());
var p = new Person()
p.jump();

p[ Math.random() > 0.5 ? "run" : "jump"]();
```

* rollup只处理函数和顶层的import/export变量，不能把没用到的类的方法消除掉
* javascript动态语言的特性使得静态分析比较困难
* 上述代码就是副作用的一个例子，如果静态分析的时候删除里run或者jump，程序运行时就可能报错，那就本末倒置了，我们的目的是优化，肯定不能影响执行

再举个例子说明下为什么不能消除menu.js，比如下面这个场景

```js
function Menu () {
}

Menu.prototype.show = function () {
}

Arrary.prototype.unique = function () {
    // 将 array 中的重复元素去除
}

export default Menu;
```
如果删除里menu.js，那对Array的扩展也会被删除，就会影响功能。那也许你会问，难道rollup，webpack不能区分是定义Menu的proptotype 还是定义Array的proptotype吗？当然如果代码写成上面这种形式是可以区分的，如果我写成这样呢？

```js
function Menu() {
}

Menu.prototype.show = function() {
}

var a = 'Arr' + 'ay'
var b
if(a == 'Array') {
    b = Array
} else {
    b = Menu
}

b.prototype.unique = function() {
    // 将 array 中的重复元素去除
}

export default Menu;
```