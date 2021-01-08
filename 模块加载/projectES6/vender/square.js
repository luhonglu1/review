console.log('加载了 square 模块')

import { multiply } from './multiply.js'
const square = (x) => {
  return multiply(x, x)
}

export { square }
