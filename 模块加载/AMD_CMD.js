// require.js 使用方式
// 详情看 ./project 项目
// requirejs 为全局添加了define函数 你只要按照这种约定的方式书写这个模块即可 （AMD）
// sea.js 详情看 ./projectS 项目

// AMD 是 RequireJS 在推广过程中对模块定义的规范化产出
// 与 AMD 一样 CMD 其实就是 seaJS 在推广过程中对模块定义的规范化产出

// AMD 与 CMD 的区别
// 1.CMD 推崇依赖就近，AMD 推崇依赖前置。看两个项目中的 main.js：
// 2.对于依赖的模块，AMD 是提前执行，CMD 是延迟执行。看两个项目中的打印顺序：
// AMD 是将需要使用的模块先加载完再执行代码，而 CMD 是在 require 的时候才去加载模块文件，加载完再接着执行。
