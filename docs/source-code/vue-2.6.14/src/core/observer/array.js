/*
 * not type checking this file because flow doesn't play well with
 * dynamically accessing methods on Array prototype
 */

import { def } from '../util/index'

const arrayProto = Array.prototype
// 使用Array.prototype 创建一个新的对象
// 增强方法集合
export const arrayMethods = Object.create(arrayProto)
// 修改数组的方法，被修改的方法都是会修改原数组的方法
const methodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
]

/**
 * Intercept mutating methods and emit events
 * 增强数组方法，在原数组方法上增加响应式，当数据改变时，就去派发更新
 */
methodsToPatch.forEach(function (method) {
  // cache original method
  // 保存数组原方法
  const original = arrayProto[method]
  // 调用 Object.defineProperty() 重新定义修改数组的方法
  def(arrayMethods, method, function mutator (...args) {
    // 执行数组的原方法
    const result = original.apply(this, args)
    // 获取数组的 observer 对象
    const ob = this.__ob__
    // 保存 某些可以对原数组新增元素的方法 的参数->新增元素
    let inserted
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args
        break
      case 'splice':
        // splice 的第三个参数是新增的元素
        inserted = args.slice(2)
        break
    }
    // 数组不做值对比我感觉是因为几乎没有这样的场景，
    // 如果是基础值，那根本不需要改变数组值，如果是对象，那指针不同，也不需要对比，必须要重新渲染。
    // 只判断对象指针相同，而不是真正的判断对象值相同，应该也是这种原因，收益低，如果对象很复杂，对比更消耗性能。
    // inserted 必定是数组，因为 args 是数组。。。。
    if (inserted) ob.observeArray(inserted)
    // notify change
    // 调用了修改数组的方法，调用数组的 observer 对象派发更新
    ob.dep.notify()
    // 返回原数组执行结果
    return result
  })
})
