## 1. 什么是 vue-loader
「vue-loader」 是一个 webpack 的 loader，它允许你以一种名为单文件组件的格式撰写 Vue 组件。

## 2. 如何使用 vue-loader
### 2.1 安装 vue-loader
```js
npm install vue-loader vue-template-compiler --save-dev
```

### 2.2 配置 webpack
```js
// webpack.config.js
const VueLoaderPlugin = require('vue-loader/lib/plugin')

module.exports = {
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      // 它会应用到普通的 `.js` 文件
      // 以及 `.vue` 文件中的 `<script>` 块
      {
        test: /\.js$/,
        loader: 'babel-loader'
      },
      // 它会应用到普通的 `.css` 文件
      // 以及 `.vue` 文件中的 `<style>` 块
      {
        test: /\.css$/,
        use: [
          'vue-style-loader',
          'css-loader'
        ]
      }
    ]
  },
  plugins: [
    // 请确保引入这个插件来施展魔法
    new VueLoaderPlugin()
  ]
}
```

### 2.3 创建一个 vue 组件
一个标准的 Vue 组件可以分为三个部分
* template： 模板
* script： 脚本
* style： 样式
```html
<template>
  <div id="app">
    <div class="title">{{msg}}</div>
  </div>
</template>

<script>
export default {
  name: 'app',
  data() {
    return {
      msg: 'Hello world',
    };
  },
}
</script>

<style lang="scss">
#app {
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
.title {
  color: red;
}
</style>
```
### 2.4 见证奇迹的时刻
打包完之后，这个 Vue 组件就会被解析到页面上
```html
<head>
  <style type="text/css">
    #app {
      text-align: center;
      color: #2c3e50;
      margin-top: 60px;
    }
    .title {
      color: red;
    }
  </style>
</head>
<body>
  <div id="app">
    <div class="title">Hello world</div>
  </div>
  <script type="text/javascript" src="/app.js"></script>
</body>
```
上面的 Vue 组件里的 &lt;template&gt; 部分解析到 &lt;body&gt; 下， css 部分解析成 &lt;style&gt; 标签，&lt;script&gt; 部分则解析到 js 文件里。

## 3. 源码解析之整体分析
我们先从入口看起，从上往下看：
```js
module.exports = function (source) {}
```
vue-loader 接收一个 source 字符串，值是 vue 文件的内容。
```js
const stringifyRequest = r => loaderUtils.stringifyRequest(loaderContext, r)
```
loaderUtils.stringifyRequest 作用是将绝对路径转换成相对路径。

接下来有一大串的声明语句，我们暂且先不看，我们先看最简单的情况。
```js
const { parse } = require('@vue/component-compiler-utils')

const descriptor = parse({
  source,
  compiler: options.compiler || loadTemplateCompiler(loaderContext),
  filename,
  sourceRoot,
  needMap: sourceMap
})
```
parse 方法是来自于 component-compiler-utils，代码简略一下是这样：
```js
// component-compiler-utils parse
function parse(options) {
  const { source, filename = '', compiler, compilerParseOptions = { pad: 'line' }, sourceRoot = '', needMap = true } = options;
  // ...
  output = compiler.parseComponent(source, compilerParseOptions);
  // ...
  return output;
}
```
可以看到，这里还不是真正 parse 的地方，实际上是调用了 compiler.parseComponent 方法，默认情况下 compiler 指的是 vue-template-compiler。
```js
// vue-template-compiler parseComponent
function parseComponent (
  content,
  options
) {
  var sfc = {
    template: null,
    script: null,
    styles: [],
    customBlocks: [],
    errors: []
  };
  // ...
  function start() {}
  function end() {}
  parseHTML(content, {
    warn: warn,
    start: start,
    end: end,
    outputSourceRange: options.outputSourceRange
  });
  return sfc;
}
```
这里可以看到，parseComponent 应该是调用了 parseHTML 方法，并且传入了两个方法：start 和 end，最终返回 sfc。

这一块的源码我们不多说，我们可以猜测 start 和 end 这两个方法应该是会根据不同的规则去修改 sfc，我们看一下 sfc 即 vue-loader 中 descriptor 是怎么样的：
```js
// vue-loader descriptor
{
  customBlocks: [],
  errors: [],
  template: {
    attrs: {},
    content: "\n<div id="app">\n  <div class="title">{{msg}}</div>\n</div>\n",
    type: "template"
  },
  script: {
    attrs: {},
    content: "... export default {} ...",
    type: "script"
  },
  style: [{
    attrs: {
      lang: "scss"
    },
    content: "... #app {} ...",
    type: "style",
    lang: "scss"
  }],
}
```
vue 文件里的内容已经分别解析到对应的 type 去了，接下来是不是只要分别处理各个部分即可。

parseHTML ~~这个命名是不是有点问题。。。~~

### vue-loader 处理不同 type
```js
// template
let templateImport = `var render, staticRenderFns`
let templateRequest
if (descriptor.template) {
  const src = descriptor.template.src || resourcePath
  const idQuery = `&id=${id}`
  const scopedQuery = hasScoped ? `&scoped=true` : ``
  const attrsQuery = attrsToQuery(descriptor.template.attrs)
  const query = `?vue&type=template${idQuery}${scopedQuery}${attrsQuery}${inheritQuery}`
  const request = templateRequest = stringifyRequest(src + query)
  templateImport = `import { render, staticRenderFns } from ${request}`
}

// script
let scriptImport = `var script = {}`
if (descriptor.script) {
  const src = descriptor.script.src || resourcePath
  const attrsQuery = attrsToQuery(descriptor.script.attrs, 'js')
  const query = `?vue&type=script${attrsQuery}${inheritQuery}`
  const request = stringifyRequest(src + query)
  scriptImport = (
    `import script from ${request}\n` +
    `export * from ${request}`// support named exports
  )
}

// styles
let stylesCode = ``
if (descriptor.styles.length) {
  stylesCode = genStylesCode(
    loaderContext,
    descriptor.styles,
    id,
    resourcePath,
    stringifyRequest,
    needsHotReload,
    isServer || isShadow // needs explicit injection?
  )
}
```
这三段代码的结构很像，最终作用是针对不同的 type 分别构造一个 import 字符串：
```js
templateImport = "import { render, staticRenderFns } from './App.vue?vue&type=template&id=7ba5bd90&'";

scriptImport = "import script from './App.vue?vue&type=script&lang=js&'
                export * from './App.vue?vue&type=script&lang=js&'";

stylesCode = "import style0 from './App.vue?vue&type=style&index=0&lang=scss&'";
```
这三个 import 语句有什么用呢， vue-loader 是这样做的：
```js
let code = `
${templateImport}
${scriptImport}
${stylesCode}`.trim() + `\n`
code += `\nexport default component.exports`
return code
```
此时， code 是这样的：
```js
code = "
import { render, staticRenderFns } from './App.vue?vue&type=template&id=7ba5bd90&'
import script from './App.vue?vue&type=script&lang=js&'
export * from './App.vue?vue&type=script&lang=js&'
import style0 from './App.vue?vue&type=style&index=0&lang=scss&'

// 省略 ...
export default component.exports"
```