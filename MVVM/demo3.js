// proxy
const handler = {
  set(target, key, value) {
    console.log(key, 'set')
    target[key] = value
    return true
  },
}

const target = []
const proxy = new Proxy(target, handler)
proxy.push(1)
console.log(target)
