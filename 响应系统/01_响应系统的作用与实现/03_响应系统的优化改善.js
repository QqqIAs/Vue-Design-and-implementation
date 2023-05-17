/**
 * 考虑到02之中存在的缺陷
 * 1.缺少一个对象属性值与副作用函数的映射  解决方法:采用map映射
 * 2.bucket桶的数据结构设计成Set存在一定的缺陷，只能够针对目前响应的单个target对象 解决方法:采用weakMap映射
 * 后续讲解为什么采用weakMap
 */

const data = {
  text: 'hello'
}

//存储副作用函数的桶
const bucket = new WeakMap()

//全局副作用函数
let activeEffect

//effect注册副作用函数，执行的时候能够对应到对象的每一个属性值，并且不会发生命名冲突
const effect = (fn) => {
  activeEffect = fn
  //执行副作用函数，即
  fn()
}

const obj = new Proxy(date, {
  //拦截读取操作
  get(target, propKey, proxy) {
    //先判断是否存在全局副作用函数，不存在的话直接返回值
    if(!activeEffect) return target[propKey]
      //拿取该对象对应的映射WeakMap
      let depsMap = bucket.get(target)
      if(!depsMap) {
        bucket.set(target, depsMap = new Map())
      }
      //获取属性值与副作用函数的映射
      let deps = depsMap.get(propKey)
      if(!deps) {
        depsMap.set(propKey, deps = new Set())
      }
      deps.add(activeEffect)
      //返回属性值 
      return target[propKey]
  },
  set(target, propKey, newVal, proxy) {
    //设置属性值
    target[propKey] = newVal
    let depsMap = bucket.get(target);
    if(!depsMap) return
    let effects = depsMap.get(propKey)
    //存在即执行副作用函数
    effects && effects.forEach((fn) => fn())
  }
}) 

/**
 * 这里解释一下为什么采用weakMap，因为weakMap相比map的区别在于没有引用的时候是否回收。若target对象没有任何引用了
 * 就代表不再需要它了，可以进行垃圾回收，而如果采用map，可能会导致内存泄露
 */