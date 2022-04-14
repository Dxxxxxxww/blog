/* @flow */

/**
 * Runtime helper for rendering static trees.
 */
export function renderStatic (
  index: number,
  isInFor: boolean
): VNode | Array<VNode> {
  const cached = this._staticTrees || (this._staticTrees = [])
  // 先去缓存中找静态根节点对应的代码
  let tree = cached[index]
  // if has already-rendered static tree and not inside v-for,
  // 如果已经呈现了静态树并且不在v-for中，
  // we can reuse the same tree.
  // 我们可以使用缓存
  if (tree && !isInFor) {
    return tree
  }
  // otherwise, render a fresh tree.
  // 如果没有的话，就从 staticRenderFns 中获取静态根节点对应的代码(在 patch 中执行到 _m 时，
  // 代码已经被compileToFunctions转换成真正的代码了)，
  // 然后调用获取 vnode 节点。保存在缓存中。
  tree = cached[index] = this.$options.staticRenderFns[index].call(
    this._renderProxy,
    null,
    this // for render fns generated for functional component templates
  )
  // 把当前返回的 vnode 标记为静态的。vnode 被标记为静态的之后，
  // 在 patch 就会跳过静态的节点。因为静态节点不会发生变化，不需要处理。这是对静态节点的优化。
  markStatic(tree, `__static__${index}`, false)
  return tree
}

/**
 * Runtime helper for v-once.
 * Effectively it means marking the node as static with a unique key.
 */
export function markOnce (
  tree: VNode | Array<VNode>,
  index: number,
  key: string
) {
  markStatic(tree, `__once__${index}${key ? `_${key}` : ``}`, true)
  return tree
}

function markStatic (
  tree: VNode | Array<VNode>,
  key: string,
  isOnce: boolean
) {
  if (Array.isArray(tree)) {
    for (let i = 0; i < tree.length; i++) {
      if (tree[i] && typeof tree[i] !== 'string') {
        markStaticNode(tree[i], `${key}_${i}`, isOnce)
      }
    }
  } else {
    markStaticNode(tree, key, isOnce)
  }
}

function markStaticNode (node, key, isOnce) {
  node.isStatic = true
  node.key = key
  node.isOnce = isOnce
}
