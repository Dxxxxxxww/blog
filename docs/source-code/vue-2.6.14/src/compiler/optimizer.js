/* @flow */

import { makeMap, isBuiltInTag, cached, no } from 'shared/util'

let isStaticKey
let isPlatformReservedTag

const genStaticKeysCached = cached(genStaticKeys)

/**
 * Goal of the optimizer: walk the generated template AST tree
 * and detect sub-trees that are purely static, i.e. parts of
 * the DOM that never needs to change.
 * 优化的目标:遍历生成的模板AST树，并检测静态节点。静态节点：对应的dom子树永远不会发生变化。
 *
 * Once we detect these sub-trees, we can:
 * 一旦我们发现了这些子树，我们就能
 * 1. Hoist them into constants, so that we no longer need to
 *    create fresh nodes for them on each re-render;
 *    将它们提升为常量，这样我们就不再需要在每次重新渲染时为它们创建新的节点
 * 2. Completely skip them in the patching process.
 * 在 patch 的过程中完全跳过它们
 */
export function optimize (root: ?ASTElement, options: CompilerOptions) {
  // 没有传递 ast 就直接返回。
  if (!root) return
  isStaticKey = genStaticKeysCached(options.staticKeys || '')
  isPlatformReservedTag = options.isReservedTag || no
  // first pass: mark all non-static nodes.
  // 标记静态节点
  markStatic(root)
  // second pass: mark static roots.
  // 标记静态根节点
  markStaticRoots(root, false)
}

function genStaticKeys (keys: string): Function {
  return makeMap(
    'type,tag,attrsList,attrsMap,plain,parent,children,attrs,start,end,rawAttrsMap' +
    (keys ? ',' + keys : '')
  )
}
// 标记静态节点
function markStatic (node: ASTNode) {
  // 判断节点是否为静态节点
  node.static = isStatic(node)
  // 如果是 ast 是元素节点，则要去处理子节点
  if (node.type === 1) {
    // do not make component slot content static. this avoids
    // 不把组件 slot 内容变成静态，这可以避免以下两点
    // 1. components not able to mutate slot nodes
    // 组件不能改变 slot 节点
    // 2. static slot content fails for hot-reloading
    // 静态 slot 内容的热更新(加载)会失败

    // 非平台保留标签(即组件)，不是slot，没有inline-template
    // 不去把组件中的 slot 标记成静态节点
    if (
      !isPlatformReservedTag(node.tag) &&
      node.tag !== 'slot' &&
      node.attrsMap['inline-template'] == null
    ) {
      return
    }
    // 遍历子节点
    for (let i = 0, l = node.children.length; i < l; i++) {
      const child = node.children[i]
      // 递归标记静态节点
      markStatic(child)
      // 如果当前子节点不是静态节点，则当前节点就不是静态节点
      if (!child.static) {
        node.static = false
      }
    }
    // 处理条件渲染中的ast，流程与上面一样
    if (node.ifConditions) {
      for (let i = 1, l = node.ifConditions.length; i < l; i++) {
        const block = node.ifConditions[i].block
        markStatic(block)
        if (!block.static) {
          node.static = false
        }
      }
    }
  }
}
// 标记静态根节点。
// 静态根节点：节点是静态节点，节点的子节点不能只有一个静态文本节点
function markStaticRoots (node: ASTNode, isInFor: boolean) {
  // 判断是否为元素节点
  if (node.type === 1) {
    // 如果该节点是静态的 || 只渲染一次
    if (node.static || node.once) {
      // 则标记该节点在 for 循环中是静态的
      node.staticInFor = isInFor
    }
    // For a node to qualify as a static root, it should have children that
    // are not just static text. Otherwise the cost of hoisting out will
    // outweigh the benefits and it's better off to just always render it fresh.
    // 静态根节点条件，节点是静态节点，节点的子节点不能只有一个静态文本节点。否则，它的优化成本大于收益，最好总是让它保持新鲜。
    if (node.static && node.children.length && !(
      node.children.length === 1 &&
      node.children[0].type === 3
    )) {
      node.staticRoot = true
      return
    } else {
      node.staticRoot = false
    }
    // 遍历当前节点的子节点，检测是否有静态根节点
    if (node.children) {
      for (let i = 0, l = node.children.length; i < l; i++) {
        // 递归
        markStaticRoots(node.children[i], isInFor || !!node.for)
      }
    }
    // 遍历当前节点的条件渲染节点，流程与上面相同
    if (node.ifConditions) {
      for (let i = 1, l = node.ifConditions.length; i < l; i++) {
        markStaticRoots(node.ifConditions[i].block, isInFor)
      }
    }
  }
}

function isStatic (node: ASTNode): boolean {
  // 表达式，内容会发生变化，不是静态节点
  if (node.type === 2) { // expression
    return false
  }
  // 文本，内容已经固定，则为静态节点
  if (node.type === 3) { // text
    return true
  }
  // 以下条件都满足，则为静态节点
  return !!(node.pre || ( // pre
    !node.hasBindings && // no dynamic bindings 没有动态绑定
    !node.if && !node.for && // not v-if or v-for or v-else 不是 if for else 指令
    !isBuiltInTag(node.tag) && // not a built-in 不是内置组件
    isPlatformReservedTag(node.tag) && // not a component 不能是组件，是平台保留标签
    !isDirectChildOfTemplateFor(node) && // 不是 v-for 下的直接子节点
    Object.keys(node).every(isStaticKey)
  ))
}

function isDirectChildOfTemplateFor (node: ASTElement): boolean {
  while (node.parent) {
    node = node.parent
    if (node.tag !== 'template') {
      return false
    }
    if (node.for) {
      return true
    }
  }
  return false
}
