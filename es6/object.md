# Object 新增方法
## 1. Object.is()
```js
// 判断值相等 与 === 行为基本一致
// 不同之处 
// 1. +0 不等于 -0 
// 2. NaN 等于自身
```
## 2. Object.assign(target, source1, source2, ...)
```
第一个参数是目标对象 后面的参数是源对象
```
### 注意点
#### (1) 浅拷贝
Object.assign()方法实行的是浅拷贝，而不是深拷贝
#### (2) 同名属性替换
对于属性相同的数据 处理方法是替换而不是添加
#### (3) 首参数非对象处理
```
如果首参数不是对象会先转成对象 再处理 (undefined, null 是首参数会直接报错)

但除了字符串会以数组的形式拷贝入目标对象, 其他值都不会产生效果
```
```js
const v1 = 'abc'
const v2 = true
const v3 = 10

const obj = Object.assign({}, v1, v2, v3)
console.log(obj) // {"0", "a", "1": "b", "2": "c"}
```
```
这是因为只有字符串的包装对象，会产生可枚举属性。

Symbol 值的属性也会被拷贝
```
#### (4) 数组的处理
Object.assign()可以用来处理数组，但是会把数组视为对象。
```js
Object.assign([1, 2, 3], [4, 5])
// [4, 5, 3]
```
上面代码中，Object.assign()把数组视为属性名为 0、1、2 的对象，因此源数组的 0 号属性4覆盖了目标数组的 0 号属性1

#### (5) 取值函数的处理
Object.assign()只能进行值的复制，如果要复制的值是一个取值函数，那么将求值后再复制。
```js
const source = {
  get foo() { return 1 }
};
const target = {};

Object.assign(target, source)
// { foo: 1 }
```
### 常见用途
#### (1) 为对象添加属性
```js
class Point {
  constructor(x, y) {
    Object.assign(this, {x, y});
  }
}
```
上面方法通过Object.assign()方法，将x属性和y属性添加到Point类的对象实例。
#### (2) 为对象添加方法
```js
Object.assign(SomeClass.prototype, {
  someMethod(arg1, arg2) {
    ···
  },
  anotherMethod() {
    ···
  }
});

// 等同于下面的写法
SomeClass.prototype.someMethod = function (arg1, arg2) {
  ···
};
SomeClass.prototype.anotherMethod = function () {
  ···
};
```
#### (3) 克隆对象(浅克隆)
```js
function clone(origin) {
  return Object.assign({}, origin);
}
```
上述代码只能克隆对象自身的值 不能克隆他继承的值 如果想保持继承链 可以采用以下代码
```js
function clone(origin) {
  let originProto = Object.getPrototypeOf(origin);
  return Object.assign(Object.create(originProto), origin);
}
```
#### (4) 合并多个对象
```js
const merge = (...sources) => Object.assign({}, ...sources);
```
#### (5) 为属性指定默认值
```js
const DEFAULTS = {
  logLevel: 0,
  outputFormat: 'html'
};

function processContent(options) {
  options = Object.assign({}, DEFAULTS, options);
  console.log(options);
  // ...
}
```
注意由于是浅拷贝 属性值不要指向一个引用类型
## 3. Object.getOwnPropertyDescriptors()
ES5 的Object.getOwnPropertyDescriptor()方法会返回某个对象属性的描述对象（descriptor）。ES2017 引入了Object.getOwnPropertyDescriptors()方法，返回指定对象所有自身属性（非继承属性）的描述对象。
```js
const obj = {
  foo: 123,
  get bar() { return 'abc' }
};

Object.getOwnPropertyDescriptors(obj)
// { foo:
//    { value: 123,
//      writable: true,
//      enumerable: true,
//      configurable: true },
//   bar:
//    { get: [Function: get bar],
//      set: undefined,
//      enumerable: true,
//      configurable: true 
//    } 
// }
```

es5实现该方法
```js
function getOwnPropertyDescriptors(obj) {
  const result = {};
  for (let key of Reflect.ownKeys(obj)) {
    result[key] = Object.getOwnPropertyDescriptor(obj, key);
  }
  return result;
}
```

### 解决Object.assign()无法正确拷贝get属性和set属性的问题。
```js
const source = {
  set foo(value) {
    console.log(value);
  }
};

const target1 = {};
Object.assign(target1, source);

Object.getOwnPropertyDescriptor(target1, 'foo')
// { value: undefined,
//   writable: true,
//   enumerable: true,
//   configurable: true }
```
上面代码中，source对象的foo属性的值是一个赋值函数，Object.assign方法将这个属性拷贝给target1对象，结果该属性的值变成了undefined。这是因为Object.assign方法总是拷贝一个属性的值，而不会拷贝它背后的赋值方法或取值方法。

这时，Object.getOwnPropertyDescriptors()方法配合Object.defineProperties()方法，就可以实现正确拷贝
```js
const source = {
  set foo(value) {
    console.log(value);
  }
};

const target2 = {};
Object.defineProperties(target2, Object.getOwnPropertyDescriptors(source));
Object.getOwnPropertyDescriptor(target2, 'foo')
// { get: undefined,
//   set: [Function: set foo],
//   enumerable: true,
//   configurable: true }
```
### 配合Object.create()方法，将对象属性克隆到一个新对象。这属于浅拷贝。
```js
const clone = Object.create(Object.getPrototypeOf(obj),
  Object.getOwnPropertyDescriptors(obj));

// 或者

const shallowClone = (obj) => Object.create(
  Object.getPrototypeOf(obj),
  Object.getOwnPropertyDescriptors(obj)
);
```
### 对象继承另一个对象
```js
const obj = Object.create(
  prot,
  Object.getOwnPropertyDescriptors({
    foo: 123,
  })
);
```
### 实现 Mixin(混入)模式
```js
let mix = (object) => ({
  with: (...mixins) => mixins.reduce(
    (c, mixin) => Object.create(
      c, Object.getOwnPropertyDescriptors(mixin)
    ), object)
});

// multiple mixins example
let a = {a: 'a'};
let b = {b: 'b'};
let c = {c: 'c'};
let d = mix(c).with(a, b);

d.c // "c"
d.b // "b"
d.a // "a"
```
## 4. __proto__属性，Object.setPrototypeOf()，Object.getPrototypeOf()

### __proto__属性
```js
// es5 的写法
const obj = {
  method: function() { ... }
};
obj.__proto__ = someOtherObj;

// es6 的写法
var obj = Object.create(someOtherObj);
obj.method = function() { ... };
```
__proto__是个内部属性只是由于浏览器广泛支持，才被加入了 ES6

无论从语义的角度，还是从兼容性的角度，都不要使用这个属性，而是使用下面的Object.setPrototypeOf()（写操作）、Object.getPrototypeOf()（读操作）、Object.create()（生成操作）代替。
### Object.setPrototypeOf()
用来设置一个对象的原型对象（prototype），返回参数对象本身。它是 ES6 正式推荐的设置原型对象的方法
```js
// 格式
Object.setPrototypeOf(object, prototype)

// 用法
const o = Object.setPrototypeOf({}, null);

// 等同于
function setPrototypeOf(obj, proto) {
  obj.__proto__ = proto;
  return obj;
}
```