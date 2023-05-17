//创建一个收集effect函数的桶
const bucket = new Set()

//创建基本数据
const data = {text: 'hello world'}

//创建基本数据的代理
const obj = new Proxy(data, {
  get(target, propKey, proxy) {
    //读取操作将副作用effect函数存储到bucket桶中
    bucket.add(effect)
    //返回值
    return target[propKey]
  },
  set(target, propKey, newVal, proxy) {
    //设置新值
    target[propKey] = newVal
    //更改值触发桶内函数的执行
    bucket.forEach((fn) => fn())
    //返回值
    return true
  }
})

//创建副作用函数
const effect = () => {
  document.body.innerText = obj.text
}

//触发桶收集
effect()

//更改操作
setTimeout(() => {
  obj.text = 'hello vue'
}, 1000)