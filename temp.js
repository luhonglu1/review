function foo() {
  console.log(a) // 报错 没有声明关键字
  a = 1
}

foo()

fetch('http://local.shicai56.com:4051/test-pms-api/stock/rule/queryList', {
  method: 'POST',
  body: JSON.stringify({ storeId: '', valid: '' }),
  headers: {
    'Content-Type': 'application/json',
  },
})
  .then((res) => res.json())
  .then((data) => {
    console.log(data)
  })
  .catch((e) => {
    console.log(e)
  })
