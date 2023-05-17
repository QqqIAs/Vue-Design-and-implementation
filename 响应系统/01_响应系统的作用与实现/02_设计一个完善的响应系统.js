/**
 * 显而易见，01里面有一个弊端，就是副作用函数的命名过于草率，导致一旦副作用函数不叫这个名字
 * 那么代码就不能准确运行了，我们要实现的就是哪怕副作用函数是一个匿名函数，也能被正确收集到桶中
 * 所以我们需要一个用来注册副作用函数的机制
 */

//用一个全局变量存储被注册的副作用函数
let activeEffect

//effect用于注册副作用函数
const effect = (fn) => {
  //赋值
  activeEffect = fn
  //调用
  fn()
}

//创建基本数据
const data = {text: 'hello world'}

//创建桶收集函数
const bucket = new Set()

//创建代理
const obj = new Proxy(data, {
  get(target, propKey, proxy) {
    //判断是否存在副作用函数
    if(activeEffect) {
      bucket.add(activeEffect)
    }
    //返回值
    return target[propKey]
  },
  set(target, propKey, newVal, proxy) {
    target[propKey] = newVal
    //执行桶内的函数
    bucket.forEach(fn => fn())
    return true
  }
})

//执行部分
effect(
  //匿名函数
  () => {
    console.log('effect run') //执行了两次
    document.body.innerText = obj.text
  }
)