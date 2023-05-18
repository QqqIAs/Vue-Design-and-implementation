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

const obj = new Proxy(data, {
  get(target, propKey) {
    //追踪
    track(target, propKey)
    return target[propKey]
  },
  set(target, propKey, newVal) {
    target[propKey] = newVal
    //触发
    trigger(target, propKey)
  }
})

//跟踪函数封装
function track(target, propKey) {
  if(!activeEffect) return
  let depsMap = bucket.get(target)
  if(!depsMap) {
    bucket.set(target, depsMap = new Map())
  }
  let deps = depsMap.get(propKey)
  if(!deps) {
    depsMap.set(propKey, deps = new Set())
  }
  deps.add(activeEffect)
}

//触发函数封装
function trigger(target, propKey) {
  let depsMap = bucket.get(target)
  if(!depsMap) return
  let effects = depsMap.get(propKey)
  effects && effects.forEach(fn => fn())
}
