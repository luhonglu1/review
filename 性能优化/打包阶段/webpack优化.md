## 1. 构建打点
可以断言的是，大部分的执行时长应该都是消耗在编译 JS、CSS 的 Loader 以及对这两类代码执行压缩操作的 Plugin 上。

为什么会这样呢？因为在对我们的代码进行编译或者压缩的过程中，都需要执行这样的一个流程：编译器（这里可以指 webpack）需要将我们写下的字符串代码转化成 AST（语法分析树），就是如下所示的一个树形对象：

```js
// 字符串代码
var AST = "is Tree"

// 转化成的 AST （语法分析树）
{
    "type": "Program",
    "body": [
        {
            "type": "VariableDeclaration",
            "kind": "var",
            "declarations": [
                {
                    "type": "Identifier",
                    "name": "AST"
                },
                "init": {
                    "type": "Literal",
                    "value": "is Tree",
                    "raw": "\"is Tree\""
                }
            ]
        }
    ]
}
```
显而易见，编译器肯定不能用正则去显式替换字符串来实现这样一个复杂的编译流程，而编译器需要做的就是遍历这棵树，找到正确的节点并替换成编译后的值。
因此构建都需要经历"转化 AST -> 遍历树 -> 转化回代码"这样一个过程，性能也基本消耗在这里。

## 2. 优化策略
我们会从四个大方向入手：缓存、多核、抽离以及拆分

### 2.1 缓存
大部分 Loader 都提供了 cache 配置项，比如在 babel-loader 中，可以通过设置 **cacheDirectory** 来开启缓存，这样，babel-loader 就会将每次的编译结果写进硬盘文件（默认是在项目根目录下的node_modules/.cache/babel-loader目录内，当然你也可以自定义）。
但如果 loader 不支持缓存呢？我们也有方法。接下来介绍一款神器：**cache-loader** ，它所做的事情很简单，就是 babel-loader 开启 cache 后做的事情，将 loader 的编译结果写入硬盘缓存，再次构建如果文件没有发生变化则会直接拉取缓存。而使用它的方法很简单，正如官方 demo 所示，只需要把它写在代价高昂的 loader 的最前面即可：

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.ext$/,
        use: ['cache-loader', ...loaders],
        include: path.resolve('src'),
      },
    ],
  },
};
```
> **小贴士**: cache-loader 默认将缓存存放的路径是项目根目录下的 .cache-loader 目录内，我们习惯将它配置到项目根目录下的 node_modules/.cache 目录下，与 babel-loader 等其他 Plugin 或者 Loader 缓存存放在一块

同理，同样对于构建流程造成效率瓶颈的代码压缩阶段，也可以通过缓存解决大部分问题，以 uglifyjs-webpack-plugin 这款对于我们最常用的 Plugin 为例，它就提供了如下配置：
```js
module.exports = {
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
      }),
    ],
  },
};
```
我们可以通过开启 cache 配置开启我们的缓存功能，也可以通过开启 parallel 开启多核编译功能，这也是我们下一章节马上就会讲到的知识。

> **小贴士**：目前而言暂不建议将缓存逻辑集成到 CI 流程中，因为目前还仍会出现更新依赖后依旧命中缓存的情况，这显然是个 BUG，在开发机上我们可以手动删除缓存解决问题，但在编译机上过程就要麻烦的多。为了保证每次 CI 结果的纯净度，这里建议在 CI 过程中还是不要开启缓存功能。

###　2.2 多核

多核的优化自然离不开 **happypack** ，这里简单介绍一下它的使用方法 

```js
const HappyPack = require('happypack')
const os = require('os')
// 开辟一个线程池
// 拿到系统CPU的最大核数，happypack 将编译工作灌满所有线程
const happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length })

module.exports = {
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: 'happypack/loader?id=js',
      },
    ],
  },
  plugins: [
    new HappyPack({
      id: 'js',
      threadPool: happyThreadPool,
      loaders: [
        {
          loader: 'babel-loader',
        },
      ],
    }),
  ],
}
```
所以配置起来逻辑其实很简单，就是用 happypack 提供的 Plugin 为你的 Loaders 做一层包装就好了，向外暴露一个id ，而在你的 module.rules 里，就不需要写loader了，直接引用这个 id 即可。

而对于一些编译代价昂贵的 webpack 插件，一般都会提供 **parallel** 这样的配置项供你开启多核编译，因此，只要你善于去它的官网发现，一定会有意想不到的收获噢～

**PS**: 这里需要特别提及一个在 production 模式下容易遇到的坑，因为有个特殊的角色出现了 —— mini-css-extract-plugin，坑在哪呢？有两点（这也是笔者在书写本文时还未解决的问题）：

MiniCssExtractPlugin 无法与 happypack 共存，如果用 happypack 对 MiniCssExtractPlugin 进行包裹，就会触发这个问题：[github.com/amireh/happ…](https://github.com/amireh/happypack/issues/242) 。
MiniCssExtractPlugin 必须置于 cache-loader 执行之后，否则无法生效，参考issue：[github.com/webpack-con…](https://github.com/webpack-contrib/cache-loader/issues/40) 。

所以最后，在 production 模式下的 CSS Rule 配置就变成了下面这样：
```js
module.exports = {
    ...,
    module: {
        rules: [
            ...,
            {
                test: /\.css$/
                exclude: /node_modules/,
                use: [
                    _mode === 'development' ? 'style-loader' : MiniCssExtractPlugin.loader,
                    'happypack/loader?id=css'
                ]
            }
        ]
    },
    plugins: [
        new HappyPack({
          id: 'css',
          threadPool: happyThreadPool,
          loaders: [
            'cache-loader',
            'css-loader',
            'postcss-loader',
          ],
        }),
    ],
}
```

### 2.3 抽离
对于一些不常变更的静态依赖，比如我们项目中常见的 React 全家桶，亦或是用到的一些工具库，比如 lodash 等等，我们不希望这些依赖被集成进每一次构建逻辑中，*因为它们真的太少时候会被变更了，所以每次的构建的输入输出都应该是相同的*。因此，我们会设法将这些静态依赖从每一次的构建逻辑中抽离出去，以提升我们每次构建的构建效率。常见的方案有两种，一种是使用 webpack-dll-plugin 的方式，在首次构建时候就将这些静态依赖单独打包，后续只需要引用这个早就被打好的静态依赖包即可，有点类似“预编译”的概念；另一种，也是业内常见的 Externals的方式，我们将这些不需要打包的静态资源从构建逻辑中剔除出去，而使用 CDN 的方式，去引用它们。

#### 2.3.1 webpack-dll-plugin 与 Externals 的抉择

团队早期的项目脚手架使用的是 webpack-dll-plugin 进行静态资源抽离，之所以这么做的原因是因为原先也是使用的 Externals，但是由于公司早期 CDN 服务并不成熟，项目使用了线上开源的 CDN 却因为服务不稳定导致了团队项目出现问题的情况，所以在一次迭代中统一替换成了 webpack-dll-plugin，但随着公司建立起了成熟的 CDN 服务后，团队的脚手架却因为各种原因迟迟没再更新。

配置 webpack_dll.config.js 构建动态链接库

```js
const path = require('path');
const DllPlugin = require('webpack/lib/DllPlugin');

module.exports = {
    mode: 'production',
    entry: {
        // 将React相关模块放入一个动态链接库
        react: ['react','react-dom','react-router-dom','react-loadable'],
        librarys: ['wangeditor'],
        utils: ['axios','js-cookie']
    },
    output: {
        filename: '[name]-dll.js',
        path: path.resolve(__dirname, 'dll'),
        // 存放动态链接库的全局变量名，加上_dll_防止全局变量冲突
        library: '_dll_[name]'
    },
    // 动态链接库的全局变量名称，需要可output.library中保持一致，也是输出的manifest.json文件中name的字段值
    // 如react.manifest.json字段中存在"name":"_dll_react"
    plugins: [
        new DllPlugin({
            name: '_dll_[name]',
            path: path.join(__dirname, 'dll', '[name].manifest.json')
        })
    ]
}
```
**webpack.pro.config.js中使用**

```js
const DllReferencePlugin = require('webpack/lib/DllReferencePlugin');
...
plugins: [
    // 告诉webpack使用了哪些动态链接库
        new DllReferencePlugin({
            manifest: require('./dll/react.manifest.json')
        }),
        new DllReferencePlugin({
            manifest: require('./dll/librarys.manifest.json')
        }),
        new DllReferencePlugin({
            manifest: require('./dll/utils.manifest.json')
        }),
]
```
* **注意**：在webpack_dll.config.js文件中，DllPlugin中的name参数必须和output.library中的一致；因为DllPlugin的name参数影响输出的manifest.json的name；而webpack.pro.config.js中的DllReferencePlugin会读取manifest.json的name，将值作为从全局变量中获取动态链接库内容时的全局变量名

* **执行构建**
1. webpack --progress --colors --config ./webpack.dll.config.js
2. webpack --progress --colors --config ./webpack.prod.js

* html中引入dll.js文件

* 构建时间对比：["11593ms","10654ms","8334ms"]

 webpack-dll-plugin 存在一下的弊端
1. 需要配置在每次构建时都不参与编译的静态依赖，并在首次构建时为它们预编译出一份 JS 文件（后文将称其为 lib 文件），每次更新依赖需要手动进行维护，一旦增删依赖或者变更资源版本忘记更新，就会出现 Error 或者版本错误。


2. 无法接入浏览器的新特性 script type="module"，对于某些依赖库提供的原生 ES Modules 的引入方式（比如 vue 的新版引入方式）无法得到支持，没法更好地适配高版本浏览器提供的优良特性以实现更好地性能优化。


3. 将所有资源预编译成一份文件，并将这份文件显式注入项目构建的 HTML 模板中，这样的做法，在 HTTP1 时代是被推崇的，因为那样能减少资源的请求数量，但在 HTTP2 时代如果拆成多个 CDN Link，就能够更充分地利用 HTTP2 的多路复用特性。

#### 2.3.2 如何更为优雅的编写 Externals

我们都知道， 在使用 Externals 的时候，还需要同时去更新 HTML 里面的 CDN， 有时候经常会忘记这一过程导致一些错误发生。那么如何将这一过程自动化呢？

回顾一下配置 Externals 

首先， 在 webpack.config.js 配置文件内， 我们需要添加 webpack 配置项：
```js
module.exports = {
    ...,
    externals: {
       // key是我们 import 的包名，value 是CDN为我们提供的全局变量名
       // 所以最后 webpack 会把一个静态资源编译成：module.export.react = window.React
       "react": "React",
       "react-dom": "ReactDOM",
       "redux": "Redux",
       "react-router-dom": "ReactRouterDOM"
    }
}
```
与此同时，我们需要在模板 HTML 文件中同步更新我们的 CDN script 标签，一般一个常见的 CDN Link 就像这样：

https://cdn.bootcss.com/react/16.9.0/umd/react.production.min.js

这里以 BootCDN 提供的静态资源 CDN 为例（但不代表笔者推荐使用 BootCDN 提供的 CDN 服务，它上次更换域名的事件可真是让我踩了不少坑），我们可以发现，一份 CDN Link 其实主要也只是由四部分组成，它们分别是：CDN 服务 host、包名、版本号以及包路径，其他 CDN 服务也是同理。以上面的 Link 为例，这四部分对应的内容就是：

* CDN 服务 host：cdn.bootcss.com/
* 包名：react
* 版本号：16.9.0
* 包路径：umd/react.production.min.js

到了这一步，大家应该想到了吧。我们完全可以自己编写一个 webpack 插件去自动生成 CDN Link script 标签并挂载在 html-webpack-plugin 提供的事件钩子上以实现自动注入 HTML，而我们所需要的一个 CDN Link 的四部分内容，CDN 服务 host 我们只需要与公司提供的服务统一即可，包名我们可以通过 compiler.options.externals 拿到，而版本号我们只需要读取项目的 package.json 文件即可，最后的包路径，一般都是一个固定的值。

### 2.4 拆分
虽然 SPA 已经成为主流， 但我们还会有一些项目需要做成 MPA （多页应用），得益于 webpack 的多 entry 支持，因此我们可以把多页都放在一个 repo 下进行管理和维护。但随着项目的逐步深入和不断迭代，代码量必然会不断增大，有时候我们只是改了一个 entry 下的文件，但却要对 entry 执行一遍构建，因此， 这里介绍一个 **集群编译** 的概念：

什么是集群编译呢？这里的集群当然不是指我们的真实物理机，而是我们的 docker。其原理就是将单个 entry 剥离出来维护一个独立的构建流程，并在一个容器内执行，待构建完成后，将生成文件打进指定目录。为什么能这么做呢？因为我们知道，webpack 会将一个 entry 视为一个 chunk，并在最后生成文件时，将 chunk 单独生成一个文件，

因为如今团队在实践前端微服务，因此每一个子模块都被拆分成了一个单独的repo，因此我们的项目与生俱来就继承了集群编译的基因，但是如果把这些子项目以 entry 的形式打在一个 repo 中，也是一个很常见的情况，这时候，就需要进行拆分，集群编译便能发挥它的优势。因为团队里面不需要进行相关实践，因此这里笔者就不提供细节介绍了，只是为大家提供一个方向，如果大家有疑问也欢迎在评论区与我讨论。
