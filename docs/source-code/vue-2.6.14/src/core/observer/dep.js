/* @flow */

import type Watcher from './watcher'
import { remove } from '../util/index'
import config from '../config'

let uid = 0

/**
 * A dep is an observable that can have multiple
 * directives subscribing to it.
 */
export default class Dep {
  // 静态属性，Watcher 对象
  static target: ?Watcher;
  // dep 实例 id 自增计数，每创建一个 dep 就会自增，由于是先赋值后自增，所以 dep 的id 初始为0
  // $attrs 使用defineReactive定义，这时候会生成第一个dep，id为0,
  // $listeners 使用defineReactive定义，这时候会生成第一个dep，id为1,
  // 所以对于 data 的dep，其实是从 id === 2 开始的
  // 所以一般来说，对象的 dep 是偶数，key 是基数。并且深度优先
  id: number;
  // dep 实例对应的 watcher 对象池/观察者池<数组>
  subs: Array<Watcher>;

  constructor () {
    this.id = uid++
    this.subs = []
  }
  // 把 watcher 添加到 观察者池 中
  addSub (sub: Watcher) {
    this.subs.push(sub)
  }
  // 将传入的 watcher 从观察者池中移除
  removeSub (sub: Watcher) {
    // 相同watcher引用，可以删除  shared/util.js
    remove(this.subs, sub)
  }
  // 内部调用 watcher 的 addDep 方法
  // 将观察对象与 watcher 建立依赖关系
  depend () {
    if (Dep.target) {
      Dep.target.addDep(this)
    }
  }

  notify () {
    // stabilize the subscriber list first
    // 拷贝一份 subs
    const subs = this.subs.slice()
    if (process.env.NODE_ENV !== 'production' && !config.async) {
      // subs aren't sorted in scheduler if not running async
      // 如果不是异步运行，sub在调度器中不会排序
      // we need to sort them now to make sure they fire in correct
      // 我们需要现在排序，以确保他们在正确的执行
      // order
      // 开发环境下按 id 排序
      subs.sort((a, b) => a.id - b.id)
    }
    // 遍历调用 watcher 的 update 方法
    // 由于遍历的是拷贝的 subs，所以在执行 update 时如果有新的 watcher 产生，添加到 this.subs，
    // 而新增加的 watcher 在这次 notify 循坏中是不作处理的
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update()
    }
  }
}

// The current target watcher being evaluated.
// This is globally unique because only one watcher
// can be evaluated at a time.
// Dep.target 用来存放目前正在使用的 watcher 全局唯一，
// 并且一次也只能有一个 watcher 被使用
// vue 中渲染父子组件是
// parent beforeMount()
// child beforeMount()
// child mounted()
// parent mounted()
// 也就是后进先出，所以需要用栈的形式
// 这样做的目的是因为组件是可以嵌套的，使用栈数组进行压栈/出栈的操作是为了在组件渲染的过程中，保持正确的依赖。
// 这里可以查看三汪的父子组件demo
// https://wangtunan.github.io/blog/vueAnalysis/reactive/dep.html#dep-target%E5%92%8Cwatcher
Dep.target = null
const targetStack = []

// 把当前的 watcher 对象推入栈 并将 Dep.target 设置成当前的 watcher
export function pushTarget (target: ?Watcher) {
  // 每一个组件都会进行 mountComponent，都会生成自己的 渲染watcher，所以每个组件都对应一个 渲染watcher
  // 在组件嵌套时，比如说子组件先渲染，再渲染父组件，这时候就需要将父组件先存储起来，就需要使用栈这么一个数据结构
  targetStack.push(target)
  Dep.target = target
}
// 把当前的 watcher 对象推出栈 并将 Dep.target 设置成栈中上一个 watcher
export function popTarget () {
  targetStack.pop()
  Dep.target = targetStack[targetStack.length - 1]
}
