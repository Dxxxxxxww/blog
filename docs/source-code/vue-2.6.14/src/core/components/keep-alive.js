/* @flow */

import { isRegExp, remove } from 'shared/util'
import { getFirstComponentChild } from 'core/vdom/helpers/index'

type CacheEntry = {
  name: ?string;
  tag: ?string;
  componentInstance: Component;
};

type CacheEntryMap = { [key: string]: ?CacheEntry };

// 获取组件名称，通过 options.name || options.tag
function getComponentName (opts: ?VNodeComponentOptions): ?string {
  // 去组件构造函数的 options 获取组件名称，或者使用 tag
  return opts && (opts.Ctor.options.name || opts.tag)
}

function matches (pattern: string | RegExp | Array<string>, name: string): boolean {
  // pattern === include/exclude
  // 数组形式
  if (Array.isArray(pattern)) {
    return pattern.indexOf(name) > -1
  // 字符串形式
  } else if (typeof pattern === 'string') {
    return pattern.split(',').indexOf(name) > -1
  // 正则形式
  } else if (isRegExp(pattern)) {
    return pattern.test(name)
  }
  /* istanbul ignore next */
  return false
}
// pruneCacheEntry 的一个包装
function pruneCache (keepAliveInstance: any, filter: Function) {
  const { cache, keys, _vnode } = keepAliveInstance
  for (const key in cache) {
    // 遍历 cache 去拿到节点
    const entry: ?CacheEntry = cache[key]
    if (entry) {
      // 拿到节点的名字
      const name: ?string = entry.name
      // 进行过滤判断
      if (name && !filter(name)) {
        // 不满足 filter 条件的都删除
        // 对于 include 而言，不匹配的都删除
        // 对于 exclude 而言，匹配的都删除
        pruneCacheEntry(cache, key, keys, _vnode)
      }
    }
  }
}

function pruneCacheEntry (
  cache: CacheEntryMap,
  key: string,
  keys: Array<string>,
  current?: VNode
) {
  // 获取当前 key 对应的缓存
  const entry: ?CacheEntry = cache[key]
  // 如果缓存存在，(如果没有传入当前渲染的 vnode，或者页面上渲染的组件，与该缓存不同)，则执行销毁流程
  // 如果该缓存在当前页面上渲染，那就不执行销毁。
  if (entry && (!current || entry.tag !== current.tag)) {
    entry.componentInstance.$destroy()
  }
  // 不管上面的销毁流程走不走，都要把缓存清除
  cache[key] = null
  remove(keys, key)
}

const patternTypes: Array<Function> = [String, RegExp, Array]

export default {
  name: 'keep-alive',
  // 抽象组件
  abstract: true,

  props: {
    include: patternTypes,
    exclude: patternTypes,
    max: [String, Number]
  },

  methods: {
    // 将延迟缓存的 vnode，key 保存起来
    cacheVNode() {
      const { cache, keys, vnodeToCache, keyToCache } = this
      if (vnodeToCache) {
        const { tag, componentInstance, componentOptions } = vnodeToCache
        cache[keyToCache] = {
          name: getComponentName(componentOptions),
          tag,
          componentInstance,
        }
        // 将 key 推到末尾
        keys.push(keyToCache)
        // prune oldest entry
        // 如果设置了 max，并且当前 keys 长度已经超出最大值了，就删除最老的组件缓存
        // 这么做的原因是 cache 是比较吃内存的，
        // 因为 vnode.elm 或者说 componentInstance.$el 中会保留着 dom 的引用，是非常大的。
        // 所以需要有 max 这么一个属性来控制 keep-alive 缓存的大小。
        if (this.max && keys.length > parseInt(this.max)) {
          // max 超限的时候，直接删除第一项
          pruneCacheEntry(cache, keys[0], keys, this._vnode)
        }
        this.vnodeToCache = null
      }
    }
  },

  created () {
    // 缓存 keep-alive 的 vnode
    this.cache = Object.create(null)
    // 保留缓存对应的 key 值，是一个队列
    // 其实已经有 cache 了，为什么还需要 keys 呢，难道不多余吗？
    // 这里是一个 LRU 的思想，Least Recently Used 的缩写，即最近最少使用，
    // 是一种常用的页面置换算法，选择最近最久未使用的页面予以淘汰
    this.keys = []
  },

  destroyed () {
    // keep-alive 销毁时清空所有缓存
    for (const key in this.cache) {
      pruneCacheEntry(this.cache, key, this.keys)
    }
  },

  mounted () {
    // 在挂载后进行缓存处理
    this.cacheVNode()
    this.$watch('include', val => {
      pruneCache(this, name => matches(val, name))
    })
    this.$watch('exclude', val => {
      pruneCache(this, name => !matches(val, name))
    })
  },

  updated () {
    // updated 之后进行缓存处理
    this.cacheVNode()
  },

  render () {
    // 获取默认插槽，vm.$slots 在 initRender 时解析
    const slot = this.$slots.default
    // keep-alive 针对的是组件，对普通节点是没有意义的，所以这里取获取第一个组件 vnode
    // 从子级 vnode 中拿到第一个组件 vnode
    const vnode: VNode = getFirstComponentChild(slot)
    // 获取组件 vnode 的组件选项
    const componentOptions: ?VNodeComponentOptions = vnode && vnode.componentOptions
    if (componentOptions) {
      // check pattern
      const name: ?string = getComponentName(componentOptions)
      const { include, exclude } = this
      // 判断当前组件是否不在 include 中或者在 exclude 中，如果命中直接返回该 vnode，不进行缓存处理
      if (
        // not included
        (include && (!name || !matches(include, name))) ||
        // excluded
        (exclude && name && matches(exclude, name))
      ) {
        return vnode
      }
      // 开始缓存 vnode
      const { cache, keys } = this
      // 如果 key 没有定义，则通过 cid + tag 来拼接
      const key: ?string = vnode.key == null
        // same constructor may get registered as different local components
        // 同一个构造函数可以注册为不同的本地组件
        // so cid alone is not enough (#3269)
        // 所以只有 cid 是不够的
        ? componentOptions.Ctor.cid + (componentOptions.tag ? `::${componentOptions.tag}` : '')
        : vnode.key
      // key 对应的组件 vnode 已经被缓存了，则从缓存中取出
      if (cache[key]) {
        // 通过 vnode.componentInstance 获取组件实例
        vnode.componentInstance = cache[key].componentInstance
        // make current key freshest
        // 保证当前的 key 是最新的
        // 将使用过的 key 放到队列末尾，表示最近使用过 LRU
        // 保证队列越前面，就越是不常访问的
        remove(keys, key)
        keys.push(key)
      } else {
        // delay setting the cache until update
        // 如果是第一次缓存，则先将 vnode key 保存下来，在 update 之后进行缓存
        this.vnodeToCache = vnode
        this.keyToCache = key
      }
      // 标志当前 vnode 已经缓存了
      vnode.data.keepAlive = true
    }
    return vnode || (slot && slot[0])
  }
}
