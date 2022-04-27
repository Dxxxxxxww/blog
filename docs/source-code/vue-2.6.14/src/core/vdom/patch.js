/**
 * Virtual DOM patching algorithm based on Snabbdom by
 * Simon Friis Vindum (@paldepind)
 * Licensed under the MIT License
 * https://github.com/paldepind/snabbdom/blob/master/LICENSE
 *
 * modified by Evan You (@yyx990803)
 *
 * Not type-checking this because this file is perf-critical and the cost
 * of making flow understand it is not worth it.
 */

import VNode, { cloneVNode } from './vnode'
import config from '../config'
import { SSR_ATTR } from 'shared/constants'
import { registerRef } from './modules/ref'
import { traverse } from '../observer/traverse'
import { activeInstance } from '../instance/lifecycle'
import { isTextInputType } from 'web/util/element'

import {
  warn,
  isDef,
  isUndef,
  isTrue,
  makeMap,
  isRegExp,
  isPrimitive
} from '../util/index'

export const emptyNode = new VNode('', {}, [])

const hooks = ['create', 'activate', 'update', 'remove', 'destroy']
/**
 * 对比是否是相同节点
 * 通过以下几个维度对比
 * key，asyncFactory，tag，isComment，data，sameInputType，isAsyncPlaceholder，asyncFactory.error。
 * 不会去判断子节点和文本节点。
 */
function sameVnode (a, b) {
  return (
    // key 是否相同
    a.key === b.key &&
    // asyncFactory：异步组件工厂函数
    a.asyncFactory === b.asyncFactory && (
      (
        // 标签是否相同
        a.tag === b.tag &&
        // 是否都是注释节点
        a.isComment === b.isComment &&
        // 是否都定义了 data
        isDef(a.data) === isDef(b.data) &&
        // 是否是相同的输入类型
        sameInputType(a, b)
      ) || (
        isTrue(a.isAsyncPlaceholder) &&
        isUndef(b.asyncFactory.error)
      )
    )
  )
}

function sameInputType (a, b) {
  if (a.tag !== 'input') return true
  let i
  const typeA = isDef(i = a.data) && isDef(i = i.attrs) && i.type
  const typeB = isDef(i = b.data) && isDef(i = i.attrs) && i.type
  return typeA === typeB || isTextInputType(typeA) && isTextInputType(typeB)
}
/**
 * 生成 {
 *    key: index
 * } 的映射
 */
function createKeyToOldIdx (children, beginIdx, endIdx) {
  let i, key
  const map = {}
  for (i = beginIdx; i <= endIdx; ++i) {
    key = children[i].key
    if (isDef(key)) map[key] = i
  }
  return map
}
// 返回 patch 函数
export function createPatchFunction (backend) {
  let i, j;
  // 存储模块中的钩子函数， create, update
  const cbs = {};
  // modules：节点的属性、样式、事件的操作
  // nodeOps：dom 操作
  const { modules, nodeOps } = backend;

  for (i = 0; i < hooks.length; ++i) {
    // cbs['create'] = []
    cbs[hooks[i]] = [];
    for (j = 0; j < modules.length; ++j) {
      // 如果 modules 中定义了对应的钩子函数，则存储
      if (isDef(modules[j][hooks[i]])) {
        // cbs['create'] = [updateAttrs, updateClass, update...]
        cbs[hooks[i]].push(modules[j][hooks[i]]);
      }
    }
  }
  // 传入真实dom元素，来生成 vnode 一个只包含 tag，elm 的vnode
  function emptyNodeAt(elm) {
    return new VNode(
      nodeOps.tagName(elm).toLowerCase(),
      {},
      [],
      undefined,
      elm
    );
  }

  function createRmCb(childElm, listeners) {
    function remove() {
      if (--remove.listeners === 0) {
        removeNode(childElm);
      }
    }
    remove.listeners = listeners;
    return remove;
  }

  function removeNode(el) {
    const parent = nodeOps.parentNode(el);
    // element may have already been removed due to v-html / v-text
    if (isDef(parent)) {
      nodeOps.removeChild(parent, el);
    }
  }

  function isUnknownElement(vnode, inVPre) {
    return (
      !inVPre &&
      !vnode.ns &&
      !(
        config.ignoredElements.length &&
        config.ignoredElements.some((ignore) => {
          return isRegExp(ignore)
            ? ignore.test(vnode.tag)
            : ignore === vnode.tag;
        })
      ) &&
      config.isUnknownElement(vnode.tag)
    );
  }

  let creatingElmInVPre = 0;
  /**
   * 将元素挂载到 vnode.elm 上，调用 insert 将元素挂载到真实 dom 上
   * 在 patch 中调用时，最多只会传前四个参数
   * @param vnode 新vnode 节点
   * @param insertedVnodeQueue 新插入的 vnode 节点队列
   * @param parentElm 新vnode 转换后的 dom 节点要挂载的地方 oldVnode.elm 的父节点
   * @param refElm oldVnode.elm 的兄弟节点
   * @param nested
   * @param ownerArray 代表 vnode 是否有子节点
   * @param index
   * @returns {*}
   */
  function createElm(
    vnode,
    insertedVnodeQueue,
    parentElm,
    refElm,
    nested,
    ownerArray,
    index
  ) {
    // 如果 vnode 有 elm 属性，则说明 vnode 渲染过
    // ownerArray 代表 vnode 是否有子节点
    if (isDef(vnode.elm) && isDef(ownerArray)) {
      // This vnode was used in a previous render!
      // 这个vnode在之前的渲染中使用过
      // now it's used as a new node, overwriting its elm would cause
      // 现在它被用作一个新节点，当它被用作插入参考节点时，覆盖它的 elm 会导致潜在的 patch 错误
      // potential(潜在的) patch errors down the road when it's used as an insertion
      // reference node. Instead(代替,顶替,反而), we clone the node on-demand before creating
      // 所以，在为该节点创建相关的DOM元素之前，我们按需克隆该节点
      // associated DOM element for it.
      vnode = ownerArray[index] = cloneVNode(vnode);
    }
    // 只有在 createChildren 中调用时才传递 true
    vnode.isRootInsert = !nested; // for transition enter check
    // 是组件则调用 createComponent() 并返回
    if (createComponent(vnode, insertedVnodeQueue, parentElm, refElm)) {
      return;
    }

    const data = vnode.data;
    const children = vnode.children;
    const tag = vnode.tag;
    // 因为上面已经处理过组件的情况了，所以这里的 tag 就是普通标签元素的情况
    if (isDef(tag)) {
      if (process.env.NODE_ENV !== "production") {
        // 如果标签定义了 v-pre 的话 则 creatingElmInVPre 自增
        if (data && data.pre) {
          creatingElmInVPre++;
        }
        // 开发环境下如果是未知标签则报警
        if (isUnknownElement(vnode, creatingElmInVPre)) {
          warn(
            "Unknown custom element: <" +
              tag +
              "> - did you " +
              "register the component correctly? For recursive components, " +
              'make sure to provide the "name" option.',
            vnode.context
          );
        }
      }

      vnode.elm = vnode.ns
        // createElementNS 处理 svg
        ? nodeOps.createElementNS(vnode.ns, tag)
        : nodeOps.createElement(tag, vnode);
      // 给 vnode 对应的 dom 元素设置样式作用域
      setScope(vnode);

      /* istanbul ignore if */
      if (__WEEX__) {
        // in Weex, the default insertion order is parent-first.
        // List items can be optimized to use children-first insertion
        // with append="tree".
        const appendAsTree = isDef(data) && isTrue(data.appendAsTree);
        if (!appendAsTree) {
          if (isDef(data)) {
            invokeCreateHooks(vnode, insertedVnodeQueue);
          }
          insert(parentElm, vnode.elm, refElm);
        }
        createChildren(vnode, children, insertedVnodeQueue);
        if (appendAsTree) {
          if (isDef(data)) {
            invokeCreateHooks(vnode, insertedVnodeQueue);
          }
          insert(parentElm, vnode.elm, refElm);
        }
      } else {
        // 创建子元素的 dom 对象
        createChildren(vnode, children, insertedVnodeQueue);
        // 判断是否有 data，如果有则调用 create 钩子
        if (isDef(data)) {
          // 当前已经创建好了 vnode 对应的 dom 元素，所以触发 create 钩子函数
          invokeCreateHooks(vnode, insertedVnodeQueue);
        }
        // 把新vnode转变成的dom节点，挂载到 parentElm 上
        // 如果 parentElm 不存在，insert 啥也不做。这就是 patch() 中 oldVnode 不存在的情况，也就是 $mount() 不传参
        insert(parentElm, vnode.elm, refElm);
      }

      if (process.env.NODE_ENV !== "production" && data && data.pre) {
        creatingElmInVPre--;
      }
    } else if (isTrue(vnode.isComment)) {
    // 注释节点的情况
      vnode.elm = nodeOps.createComment(vnode.text);
      insert(parentElm, vnode.elm, refElm);
    } else {
      // 文本节点的情况
      vnode.elm = nodeOps.createTextNode(vnode.text);
      insert(parentElm, vnode.elm, refElm);
    }
  }
  // 内部通过调用 init 钩子来创建组件实例
  function createComponent(vnode, insertedVnodeQueue, parentElm, refElm) {
    let i = vnode.data;
    if (isDef(i)) {
      // 占位 vnode 才会有 hook，组件真实 vnode 没有 hook，所以不会去调用 init
      const isReactivated = isDef(vnode.componentInstance) && i.keepAlive;
      if (isDef((i = i.hook)) && isDef((i = i.init))) {
        // 获取到 init 钩子并调用，创建组件实例
        i(vnode, false /* hydrating */);
      }
      // after calling the init hook, if the vnode is a child component
      // it should've created a child instance and mounted it. the child
      // component also has set the placeholder vnode's elm.
      // in that case we can just return the element and be done.
      // 组件真实 vnode 由于不会去执行 init，所以不会有 vnode.componentInstance 属性，所以这里也不会调用，返回 false
      // 组件真实 vnode 的 tag 是 html 的标签。
      if (isDef(vnode.componentInstance)) {
        // 调用钩子函数(vnode 的钩子函数初始化属性/事件/样式等，组件的钩子函数)
        initComponent(vnode, insertedVnodeQueue);
        // 这里的插入都是将组件真实 vnode.elm 插入到父组件的 html 中
        insert(parentElm, vnode.elm, refElm);
        if (isTrue(isReactivated)) {
          reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm);
        }
        return true;
      }
    }
  }
  // 调用钩子函数(vnode 的钩子函数初始化属性/事件/样式等，组件的钩子函数)
  function initComponent(vnode, insertedVnodeQueue) {
    if (isDef(vnode.data.pendingInsert)) {
      insertedVnodeQueue.push.apply(
        insertedVnodeQueue,
        vnode.data.pendingInsert
      );
      vnode.data.pendingInsert = null;
    }
    vnode.elm = vnode.componentInstance.$el;
    if (isPatchable(vnode)) {
      invokeCreateHooks(vnode, insertedVnodeQueue);
      setScope(vnode);
    } else {
      // empty component root.
      // skip all element-related modules except for ref (#3455)
      registerRef(vnode);
      // make sure to invoke the insert hook
      insertedVnodeQueue.push(vnode);
    }
  }

  function reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm) {
    let i;
    // hack for #4339: a reactivated component with inner transition
    // does not trigger because the inner node's created hooks are not called
    // again. It's not ideal to involve module-specific logic in here but
    // there doesn't seem to be a better way to do it.
    let innerNode = vnode;
    while (innerNode.componentInstance) {
      innerNode = innerNode.componentInstance._vnode;
      if (isDef((i = innerNode.data)) && isDef((i = i.transition))) {
        for (i = 0; i < cbs.activate.length; ++i) {
          cbs.activate[i](emptyNode, innerNode);
        }
        insertedVnodeQueue.push(innerNode);
        break;
      }
    }
    // unlike a newly created component,
    // a reactivated keep-alive component doesn't insert itself
    insert(parentElm, vnode.elm, refElm);
  }
  /**
   * 将元素插入到真实dom中，有兄弟节点，优先使用 insertBefore 插入到兄弟节点之前，
   * 没有兄弟节点，则使用 appendChild
   */
  function insert(parent, elm, ref) {
    // 如果 parent 不存在，则啥也不做，
    // 只有 parent 存在了才去插入 dom 树
    if (isDef(parent)) {
      // 如果定义了兄弟节点
      if (isDef(ref)) {
        // 如果兄弟节点的父节点，与 vnode 对应的dom元素的父节点相同，
        // 兄弟节点：空text节点，换行符，div#app 下面的 script...
        if (nodeOps.parentNode(ref) === parent) {
          // 则将 vnode 对应的dom元素插入到兄弟节点之前
          nodeOps.insertBefore(parent, elm, ref);
        }
      } else {
        // 如果没有兄弟节点，则直接通过 appendChild 来添加节点
        nodeOps.appendChild(parent, elm);
      }
    }
  }
  // 如果 children 是数组，遍历 children 调用 createElm()。
  // 如果 children 是原始值，就转为string，生成文本节点并挂载到 vnode.elm 上
  function createChildren(vnode, children, insertedVnodeQueue) {
    // 判断子元素是否是数组
    if (Array.isArray(children)) {
      // 开发环境下判断是否具有相同的 key
      if (process.env.NODE_ENV !== "production") {
        checkDuplicateKeys(children);
      }
      for (let i = 0; i < children.length; ++i) {
        createElm(
          children[i],
          insertedVnodeQueue,
          vnode.elm,
          null,
          true,
          children,
          i
        );
      }
    } else if (isPrimitive(vnode.text)) {
      nodeOps.appendChild(
        vnode.elm,
        nodeOps.createTextNode(String(vnode.text))
      );
    }
  }
  // 判断 vnode 是否可 patch，遍历找到 vnode的 _vnode，判断其是否定义了 tag
  function isPatchable(vnode) {
    while (vnode.componentInstance) {
      vnode = vnode.componentInstance._vnode;
    }
    return isDef(vnode.tag);
  }
  // 遍历调用模块的钩子函数。
  // 如果 vnode 有 create 钩子函数，也执行。
  // 如果 vnode 有 insert 钩子函数，则推入到 insertedVnodeQueue 队列中
  function invokeCreateHooks(vnode, insertedVnodeQueue) {
    // 遍历调用模块的 create 钩子函数
    for (let i = 0; i < cbs.create.length; ++i) {
      cbs.create[i](emptyNode, vnode);
    }
    // 将 i 设置成 data 的 hook
    i = vnode.data.hook; // Reuse variable
    // 如果 vnode 有钩子函数
    if (isDef(i)) {
      // 有 create 钩子函数，则调用
      if (isDef(i.create)) i.create(emptyNode, vnode);
      // 有 insert 则推入到 insertedVnodeQueue 队列中
      if (isDef(i.insert)) insertedVnodeQueue.push(vnode);
    }
  }

  // set scope id attribute for scoped CSS.
  // this is implemented as a special case to avoid the overhead
  // of going through the normal attribute patching process.
  // 给样式作用域设置 scope id
  // 这是作为一种特殊情况实现的，以避免通过常规属性修补过程的开销
  function setScope(vnode) {
    let i;
    if (isDef((i = vnode.fnScopeId))) {
      nodeOps.setStyleScope(vnode.elm, i);
    } else {
      let ancestor = vnode;
      while (ancestor) {
        if (isDef((i = ancestor.context)) && isDef((i = i.$options._scopeId))) {
          nodeOps.setStyleScope(vnode.elm, i);
        }
        ancestor = ancestor.parent;
      }
    }
    // for slot content they should also get the scopeId from the host instance.
    if (
      isDef((i = activeInstance)) &&
      i !== vnode.context &&
      i !== vnode.fnContext &&
      isDef((i = i.$options._scopeId))
    ) {
      nodeOps.setStyleScope(vnode.elm, i);
    }
  }
  /**
   * 内部循环调用 createElm
   */
  function addVnodes(
    parentElm,
    refElm,
    vnodes,
    startIdx,
    endIdx,
    insertedVnodeQueue
  ) {
    for (; startIdx <= endIdx; ++startIdx) {
      createElm(
        vnodes[startIdx],
        insertedVnodeQueue,
        parentElm,
        refElm,
        false,
        vnodes,
        startIdx
      );
    }
  }

  function invokeDestroyHook(vnode) {
    let i, j;
    const data = vnode.data;
    if (isDef(data)) {
      if (isDef((i = data.hook)) && isDef((i = i.destroy))) i(vnode);
      for (i = 0; i < cbs.destroy.length; ++i) cbs.destroy[i](vnode);
    }
    if (isDef((i = vnode.children))) {
      for (j = 0; j < vnode.children.length; ++j) {
        invokeDestroyHook(vnode.children[j]);
      }
    }
  }

  /**
   * 将dom元素 从 dom 上移除，并触发模块和snabbdom的 remove 的钩子函数
   * 触发模块和snabbdom的 destroy 钩子函数
   */
  function removeVnodes(vnodes, startIdx, endIdx) {
    for (; startIdx <= endIdx; ++startIdx) {
      const ch = vnodes[startIdx];
      // 判断节点是否存在
      if (isDef(ch)) {
        // 判断是否是 页面标签
        if (isDef(ch.tag)) {
          // 将dom元素 从 dom 上移除，并触发模块和snabbdom的 remove 的钩子函数
          removeAndInvokeRemoveHook(ch);
          // 触发 destroy 钩子函数
          invokeDestroyHook(ch);
        } else {
          // Text node
          // 如果是文本节点，直接从dom上移除
          removeNode(ch.elm);
        }
      }
    }
  }
  // 将标签从 dom 上移除，并触发模块和snabbdom的 remove 的钩子函数
  function removeAndInvokeRemoveHook(vnode, rm) {
    if (isDef(rm) || isDef(vnode.data)) {
      let i;
      const listeners = cbs.remove.length + 1;
      if (isDef(rm)) {
        // we have a recursively passed down rm callback
        // increase the listeners count
        rm.listeners += listeners;
      } else {
        // directly removing
        rm = createRmCb(vnode.elm, listeners);
      }
      // recursively invoke hooks on child component root node
      if (
        isDef((i = vnode.componentInstance)) &&
        isDef((i = i._vnode)) &&
        isDef(i.data)
      ) {
        removeAndInvokeRemoveHook(i, rm);
      }
      for (i = 0; i < cbs.remove.length; ++i) {
        cbs.remove[i](vnode, rm);
      }
      if (isDef((i = vnode.data.hook)) && isDef((i = i.remove))) {
        i(vnode, rm);
      } else {
        rm();
      }
    } else {
      removeNode(vnode.elm);
    }
  }
  /**
   *
   * 在有子节点的情况下，patchVnode 和 updateChildren 相互调用
   */
  function updateChildren(
    parentElm,
    oldCh,
    newCh,
    insertedVnodeQueue,
    removeOnly
  ) {
    /** 老节点起始index */
    let oldStartIdx = 0;
    /**  新节点起始index */
    let newStartIdx = 0;
    /**  老节点末尾index */
    let oldEndIdx = oldCh.length - 1;
    /**  老节点起始子节点 */
    let oldStartVnode = oldCh[0];
    /**  老节点末尾子节点 */
    let oldEndVnode = oldCh[oldEndIdx];
    /**  新节点末尾index */
    let newEndIdx = newCh.length - 1;
    /**  新节点起始子节点 */
    let newStartVnode = newCh[0];
    /**  新节点末尾子节点 */
    let newEndVnode = newCh[newEndIdx];
    let oldKeyToIdx, idxInOld, vnodeToMove, refElm;

    // removeOnly is a special flag used only by <transition-group>
    // to ensure removed elements stay in correct relative positions
    // during leaving transitions
    const canMove = !removeOnly;
    // 新节点如果有重复的 key 会报警
    if (process.env.NODE_ENV !== "production") {
      checkDuplicateKeys(newCh);
    }
    // 循环条件 新旧节点起始index 都小于 新旧末尾index，也就是两个数组都没有遍历完
    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
      // 老节点起始子节点判空
      if (isUndef(oldStartVnode)) {
        // 如果不存在则右移index，获取下一个节点
        oldStartVnode = oldCh[++oldStartIdx]; // Vnode has been moved left
        // 老节点末尾子节点判空
      } else if (isUndef(oldEndVnode)) {
        // 如果不存在则左移index，获取上一个节点
        oldEndVnode = oldCh[--oldEndIdx];
        // 如果新旧起始子节点相同
      } else if (sameVnode(oldStartVnode, newStartVnode)) {
        // sameVnode 不会去判断子节点和文本节点，所以需要通过调用 patchVnode继续比较子节点
        // 递归判断新旧起始子节点是否相同并挂载到dom上
        patchVnode(
          oldStartVnode,
          newStartVnode,
          insertedVnodeQueue,
          newCh,
          newStartIdx
        );
        // patchVnode 结束后右移index获取下一个新旧起始节点
        oldStartVnode = oldCh[++oldStartIdx];
        newStartVnode = newCh[++newStartIdx];
        // 如果新旧末尾子节点相同
      } else if (sameVnode(oldEndVnode, newEndVnode)) {
        // sameVnode 不会去判断子节点和文本节点，所以需要通过调用 patchVnode继续比较子节点
        // 递归判断新旧末尾子节点是否相同并挂在到dom
        patchVnode(
          oldEndVnode,
          newEndVnode,
          insertedVnodeQueue,
          newCh,
          newEndIdx
        );
        // patchVnode 结束后左移index获取下一个新旧末尾节点
        oldEndVnode = oldCh[--oldEndIdx];
        newEndVnode = newCh[--newEndIdx];
        // 如果旧起始子节点 === 新末尾子节点 可能是反转了子节点
      } else if (sameVnode(oldStartVnode, newEndVnode)) {
        // Vnode moved right
        patchVnode(
          oldStartVnode,
          newEndVnode,
          insertedVnodeQueue,
          newCh,
          newEndIdx
        );
        // 将旧起始移动到旧末尾之后，这里是进行 dom 操作
        canMove &&
          nodeOps.insertBefore(
            parentElm,
            oldStartVnode.elm,
            nodeOps.nextSibling(oldEndVnode.elm)
          );
        // 这里改的是 vnode
        // 右移老起始
        oldStartVnode = oldCh[++oldStartIdx];
        // 左移新末尾
        newEndVnode = newCh[--newEndIdx];
        // 如果旧末尾子节点 === 新起始子节点 可能是反转了子节点
      } else if (sameVnode(oldEndVnode, newStartVnode)) {
        // Vnode moved left
        patchVnode(
          oldEndVnode,
          newStartVnode,
          insertedVnodeQueue,
          newCh,
          newStartIdx
        );
        // 将旧末尾移动到旧起始之前，这里是进行 dom 操作
        canMove &&
          nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);
        // 这里改的是 vnode
        // 左移旧末尾
        oldEndVnode = oldCh[--oldEndIdx];
        // 右移新起始
        newStartVnode = newCh[++newStartIdx];
      } else {
        // 上述都不匹配的话，
        // newStartVnode 依次和旧节点比较
        // 通过 key 对比
        if (isUndef(oldKeyToIdx)) {
          // 生成 key 对应 index 的 map
          oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
        }
        // 如果新起始节点定义了 key 通过 key 来查找其在老节点中的index
        // 如果没有定义key，则通过 sameVnode 进行节点对比。这里就体现出使用 key 的性能更好
        idxInOld = isDef(newStartVnode.key)
          ? oldKeyToIdx[newStartVnode.key]
          : findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx);
        // 旧节点列表中找不到对应的新节点，说明是新增的，直接创建对应的dom，并插入到 旧开始节点 oldStartVnode.elm 之前
        if (isUndef(idxInOld)) {
          // New element
          createElm(
            newStartVnode,
            insertedVnodeQueue,
            parentElm,
            oldStartVnode.elm,
            false,
            newCh,
            newStartIdx
          );
          // 旧节点列表中找到了与新起始节点相同的节点，则需要移动旧节点
        } else {
          // 拿到对应的旧节点
          vnodeToMove = oldCh[idxInOld];
          // 这里的 newStartVnode 表示是当前节点，因为循环遍历 index++
          // 这里还需要判断是否是相同节点是因为可能新旧节点是相同的key但是节点不同
          if (sameVnode(vnodeToMove, newStartVnode)) {
            // 更新子节点或文本节点
            patchVnode(
              vnodeToMove,
              newStartVnode,
              insertedVnodeQueue,
              newCh,
              newStartIdx
            );
            // 将旧节点列表对应的节点删除，此时该节点不会被回收，因为还有vnodeToMove保持引用
            oldCh[idxInOld] = undefined;
            // 将对应的节点移动到旧开始节点前
            // 这里其实不用纠结为什么是移动到旧开始节点之前，因为整个 else 分支里的操作都是移动到旧开始节点之前。
            // 一开始我觉得可能是方便 removeVnodes()，但是想想，removeVnodes 是可以按照 oldVnodes 来的，
            // 挂载是真正的 dom，跟 oldVnodes 也没啥关系。这里一定要区分好 oldVnodes dom newVnodes 的关系。
            // oldVnodes 和 newVnodes 的 elm 属性是真正的dom，移除的时候取这个属性就好了。
            // 反正总要有地方挂载的。那为什么不放后面呢？可能尤大比较喜欢 insertBefore，这种问题没必要了。
            canMove &&
              nodeOps.insertBefore(
                parentElm,
                vnodeToMove.elm,
                oldStartVnode.elm
              );
          } else {
            // 不同节点的情况
            // key 相同，但是节点不同的情况
            // 创建新的元素
            // same key but different element. treat as new element
            // 创建对应的dom，并插入到 旧开始节点 oldStartVnode.elm 之前
            createElm(
              newStartVnode,
              insertedVnodeQueue,
              parentElm,
              oldStartVnode.elm,
              false,
              newCh,
              newStartIdx
            );
          }
        }
        newStartVnode = newCh[++newStartIdx];
      }
    }
    // 老节点已经遍历完了，而新节点还没遍历完。新子节点更多的情况
    if (oldStartIdx > oldEndIdx) {
      // 如果当前末尾节点的兄弟节点不存在，就返回 null
      // 如果存在，则返回该兄弟节点的 elm
      refElm = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm;
      // 批量将剩余的新节点插入到末尾
      addVnodes(
        parentElm,
        refElm,
        newCh,
        newStartIdx,
        newEndIdx,
        insertedVnodeQueue
      );
      // 新节点已经遍历完了，而旧节点还没遍历完。旧子节点更多的情况 新旧节点一样多的情况
    } else if (newStartIdx > newEndIdx) {
      // 将多余的老节点批量删除
      removeVnodes(oldCh, oldStartIdx, oldEndIdx);
    }
  }
  // 使用对象键唯一去重的思想，遍历子元素，查找是否具有相同的 key，有重复则报警
  function checkDuplicateKeys(children) {
    const seenKeys = {};
    for (let i = 0; i < children.length; i++) {
      const vnode = children[i];
      const key = vnode.key;
      if (isDef(key)) {
        if (seenKeys[key]) {
          warn(
            `Duplicate keys detected: '${key}'. This may cause an update error.`,
            vnode.context
          );
        } else {
          seenKeys[key] = true;
        }
      }
    }
  }
  /**
   * 遍历旧节点列表，通过sameVnode对比
   */
  function findIdxInOld(node, oldCh, start, end) {
    for (let i = start; i < end; i++) {
      const c = oldCh[i];
      if (isDef(c) && sameVnode(node, c)) return i;
    }
  }

  /**
   * 对比新旧节点，控制节点、文本的增删
   * 在有子节点的情况下，patchVnode 和 updateChildren 相互调用
   */
  function patchVnode(
    oldVnode,
    vnode,
    insertedVnodeQueue,
    ownerArray,
    index,
    removeOnly
  ) {
    if (oldVnode === vnode) {
      return;
    }

    if (isDef(vnode.elm) && isDef(ownerArray)) {
      // clone reused vnode
      vnode = ownerArray[index] = cloneVNode(vnode);
    }

    const elm = (vnode.elm = oldVnode.elm);

    if (isTrue(oldVnode.isAsyncPlaceholder)) {
      if (isDef(vnode.asyncFactory.resolved)) {
        hydrate(oldVnode.elm, vnode, insertedVnodeQueue);
      } else {
        vnode.isAsyncPlaceholder = true;
      }
      return;
    }

    // reuse element for static trees.
    // note we only do this if the vnode is cloned -
    // if the new node is not cloned it means the render functions have been
    // reset by the hot-reload-api and we need to do a proper re-render.
    if (
      isTrue(vnode.isStatic) &&
      isTrue(oldVnode.isStatic) &&
      vnode.key === oldVnode.key &&
      (isTrue(vnode.isCloned) || isTrue(vnode.isOnce))
    ) {
      vnode.componentInstance = oldVnode.componentInstance;
      return;
    }

    let i;
    const data = vnode.data;
    // 获取 vnode.data.hook 中的用户定义的 prepatch 钩子函数，如果存在则调用
    if (isDef(data) && isDef((i = data.hook)) && isDef((i = i.prepatch))) {
      i(oldVnode, vnode);
    }
    // 获取新旧节点的子节点
    const oldCh = oldVnode.children;
    const ch = vnode.children;
    if (isDef(data) && isPatchable(vnode)) {
      // 执行模块的 update 钩子函数，更新节点上的属性/样式/事件等
      for (i = 0; i < cbs.update.length; ++i) cbs.update[i](oldVnode, vnode);
      // 执行用户定义的 update 钩子
      if (isDef((i = data.hook)) && isDef((i = i.update))) i(oldVnode, vnode);
    }
    // 新节点不存在文本节点
    if (isUndef(vnode.text)) {
      // 新旧子节点都存在
      if (isDef(oldCh) && isDef(ch)) {
        // 如果新旧子节点不相等则执行 updateChildren 进行 diff
        // 从这里递归就可以看出，patch 是先更新子节点，后更新父节点
        if (oldCh !== ch) {
          updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly);
        }
        // 新旧子节点相等则什么都不做
        // 只存在新子节点
      } else if (isDef(ch)) {
        // 开发环境下检查子节点是否有重复的 key
        if (process.env.NODE_ENV !== "production") {
          checkDuplicateKeys(ch);
        }
        // 如果旧节点存在文本节点则清空
        if (isDef(oldVnode.text)) nodeOps.setTextContent(elm, "");
        // 将新子节点转换成dom元素并插入到 dom 上
        addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue);
        // 如果只存在旧子节点
      } else if (isDef(oldCh)) {
        // 移除旧子节点
        removeVnodes(oldCh, 0, oldCh.length - 1);
        // 如果只存在旧子文本节点
      } else if (isDef(oldVnode.text)) {
        // 清空旧文本节点
        nodeOps.setTextContent(elm, "");
      }
      // 文本节点存在并且新老不相等
    } else if (oldVnode.text !== vnode.text) {
      // 复用旧元素节点，只更新文本节点
      nodeOps.setTextContent(elm, vnode.text);
    }
    if (isDef(data)) {
      // diff 完成后，获取 vnode.data.hook 中的snabbdom postpatch 钩子函数，存在则执行
      if (isDef((i = data.hook)) && isDef((i = i.postpatch)))
        i(oldVnode, vnode);
    }
  }

  function invokeInsertHook(vnode, queue, initial) {
    // delay insert hooks for component root nodes, invoke them after the
    // 延迟组件根节点的钩子插入，在元素真正插入后调用它们
    // element is really inserted
    // 如果 initial 是 true，并且 vnode 有 parent 父占位符节点元素
    // 不去触发 insert 钩子函数
    if (isTrue(initial) && isDef(vnode.parent)) {
      // 将当前的这个 queue 记录到 延缓插入状态中
      vnode.parent.data.pendingInsert = queue;
    } else {
      for (let i = 0; i < queue.length; ++i) {
        // 触发 insert 钩子函数
        queue[i].data.hook.insert(queue[i]);
      }
    }
  }

  let hydrationBailed = false;
  // list of modules that can skip create hook during hydration because they
  // are already rendered on the client or has no need for initialization
  // Note: style is excluded because it relies on initial clone for future
  // deep updates (#7063).
  const isRenderedModule = makeMap("attrs,class,staticClass,staticStyle,key");

  // Note: this is a browser-only function so we can assume elms are DOM nodes.
  // 这是一个仅供浏览器使用的函数，因此我们可以假设elms是DOM节点
  function hydrate(elm, vnode, insertedVnodeQueue, inVPre) {
    let i;
    const { tag, data, children } = vnode;
    inVPre = inVPre || (data && data.pre);
    vnode.elm = elm;

    if (isTrue(vnode.isComment) && isDef(vnode.asyncFactory)) {
      vnode.isAsyncPlaceholder = true;
      return true;
    }
    // assert node match
    if (process.env.NODE_ENV !== "production") {
      if (!assertNodeMatch(elm, vnode, inVPre)) {
        return false;
      }
    }
    if (isDef(data)) {
      if (isDef((i = data.hook)) && isDef((i = i.init)))
        i(vnode, true /* hydrating */);
      if (isDef((i = vnode.componentInstance))) {
        // child component. it should have hydrated its own tree.
        initComponent(vnode, insertedVnodeQueue);
        return true;
      }
    }
    if (isDef(tag)) {
      if (isDef(children)) {
        // empty element, allow client to pick up and populate children
        if (!elm.hasChildNodes()) {
          createChildren(vnode, children, insertedVnodeQueue);
        } else {
          // v-html and domProps: innerHTML
          if (
            isDef((i = data)) &&
            isDef((i = i.domProps)) &&
            isDef((i = i.innerHTML))
          ) {
            if (i !== elm.innerHTML) {
              /* istanbul ignore if */
              if (
                process.env.NODE_ENV !== "production" &&
                typeof console !== "undefined" &&
                !hydrationBailed
              ) {
                hydrationBailed = true;
                console.warn("Parent: ", elm);
                console.warn("server innerHTML: ", i);
                console.warn("client innerHTML: ", elm.innerHTML);
              }
              return false;
            }
          } else {
            // iterate and compare children lists
            let childrenMatch = true;
            let childNode = elm.firstChild;
            for (let i = 0; i < children.length; i++) {
              if (
                !childNode ||
                !hydrate(childNode, children[i], insertedVnodeQueue, inVPre)
              ) {
                childrenMatch = false;
                break;
              }
              childNode = childNode.nextSibling;
            }
            // if childNode is not null, it means the actual childNodes list is
            // longer than the virtual children list.
            if (!childrenMatch || childNode) {
              /* istanbul ignore if */
              if (
                process.env.NODE_ENV !== "production" &&
                typeof console !== "undefined" &&
                !hydrationBailed
              ) {
                hydrationBailed = true;
                console.warn("Parent: ", elm);
                console.warn(
                  "Mismatching childNodes vs. VNodes: ",
                  elm.childNodes,
                  children
                );
              }
              return false;
            }
          }
        }
      }
      if (isDef(data)) {
        let fullInvoke = false;
        for (const key in data) {
          if (!isRenderedModule(key)) {
            fullInvoke = true;
            invokeCreateHooks(vnode, insertedVnodeQueue);
            break;
          }
        }
        if (!fullInvoke && data["class"]) {
          // ensure collecting deps for deep class bindings for future updates
          traverse(data["class"]);
        }
      }
    } else if (elm.data !== vnode.text) {
      elm.data = vnode.text;
    }
    return true;
  }

  function assertNodeMatch(node, vnode, inVPre) {
    if (isDef(vnode.tag)) {
      return (
        vnode.tag.indexOf("vue-component") === 0 ||
        (!isUnknownElement(vnode, inVPre) &&
          vnode.tag.toLowerCase() ===
            (node.tagName && node.tagName.toLowerCase()))
      );
    } else {
      return node.nodeType === (vnode.isComment ? 8 : 3);
    }
  }

  // createPatchFunction 是一个科里化的函数，先处理平台相关参数，这样返回的 patch 只需要处理自身的参数

  /**
   * @param  {Vnode} oldVnode 旧vnode
   * @param {Vnode} vnode 新vnode
   * @returns {*}
   */
  return function patch(oldVnode, vnode, hydrating, removeOnly) {
    // 如果新 vnode 不存在
    if (isUndef(vnode)) {
      // 并且 oldVnode 存在，则对 oldVnode 执行 destroy 钩子函数
      if (isDef(oldVnode)) invokeDestroyHook(oldVnode);
      return;
    }

    let isInitialPatch = false;
    // 新插入的vnode 节点 队列，为了触发新节点的 insert 钩子函数
    const insertedVnodeQueue = [];
    // oldVnode 不存在。比如说调用 $mount() 时，不传参数
    if (isUndef(oldVnode)) {
      // empty mount (likely as component), create new root element
      // 标记这种节点已经创建好了，dom元素也创建好了，但是还没挂载到dom树上，仅仅只存在内存中
      isInitialPatch = true;
      // 创建真实dom
      createElm(vnode, insertedVnodeQueue);
    } else {
      // oldVnode 存在
      // 判断 oldVnode 是否有 nodeType 属性，也就是判断其是否是真实的 dom元素
      // 如果是真实的 dom 元素，则说明是首次渲染。
      // 因为如果是更新过程的话，oldVnode 就会是一个 vnode 节点
      const isRealElement = isDef(oldVnode.nodeType);
      // 如果 oldVnode 是一个 vnode 节点，并且新旧vnode 相同
      if (!isRealElement && sameVnode(oldVnode, vnode)) {
        // patch existing root node
        // 执行 patchVnode 去查看子节点
        patchVnode(oldVnode, vnode, insertedVnodeQueue, null, null, removeOnly);
      } else {
        // 如果 oldVnode 是真实dom节点
        if (isRealElement) {
          // mounting to a real element
          // check if this is server-rendered content and if we can perform
          // a successful hydration.
          // ssr 相关
          if (oldVnode.nodeType === 1 && oldVnode.hasAttribute(SSR_ATTR)) {
            oldVnode.removeAttribute(SSR_ATTR);
            hydrating = true;
          }
          // ssr 相关
          if (isTrue(hydrating)) {
            if (hydrate(oldVnode, vnode, insertedVnodeQueue)) {
              invokeInsertHook(vnode, insertedVnodeQueue, true);
              return oldVnode;
            } else if (process.env.NODE_ENV !== "production") {
              warn(
                "The client-side rendered virtual DOM tree is not matching " +
                  "server-rendered content. This is likely caused by incorrect " +
                  "HTML markup, for example nesting block-level elements inside " +
                  "<p>, or missing <tbody>. Bailing hydration and performing " +
                  "full client-side render."
              );
            }
          }
          // either not server-rendered, or hydration failed.
          // create an empty node and replace it
          // 核心就这一句。如果 oldVnode 是一个 真实dom节点，则转换为 vnode 节点
          // emptyNodeAt：传入真实dom元素，来生成 vnode 一个只包含 tag，elm 的vnode
          oldVnode = emptyNodeAt(oldVnode);
        }

        // replacing existing element
        // 获取 oldVnode 的 dom 元素
        const oldElm = oldVnode.elm;
        // 通过 oldVnode 的 dom 元素 来获取父元素
        // 获取父元素是为了将 新vnode 的 dom元素 挂载到父元素上
        const parentElm = nodeOps.parentNode(oldElm);

        // create new node
        // 创建 vnode 的 dom 元素
        createElm(
          vnode,
          // 将 vnode 记录到 insertedVnodeQueue 中
          insertedVnodeQueue,
          // extremely rare edge case: do not insert if old element is in a
          // 极其罕见的边界案例：不要在旧元素在 离开动画(leaving transition)时 插入
          // leaving transition. Only happens when combining transition +
          // 只在这几个联合使用的情况下发生 transition + keep-alive + HOCs
          // keep-alive + HOCs. (#4590)
          // 在 leaving transition 此时会把 parentElm 传递 null，这样就不会把新创建的 dom元素挂载到dom树上
          // 挂载到 parentElm 上
          oldElm._leaveCb ? null : parentElm,
          // 如果传递了这个参数，则将 vnode 的 dom 插入到 这个元素之前
          nodeOps.nextSibling(oldElm)
        );

        // update parent placeholder node element, recursively(递归地)
        // 递归地更新父占位符节点元素
        if (isDef(vnode.parent)) {
          let ancestor = vnode.parent;
          const patchable = isPatchable(vnode);
          while (ancestor) {
            for (let i = 0; i < cbs.destroy.length; ++i) {
              cbs.destroy[i](ancestor);
            }
            ancestor.elm = vnode.elm;
            if (patchable) {
              for (let i = 0; i < cbs.create.length; ++i) {
                cbs.create[i](emptyNode, ancestor);
              }
              // #6513
              // invoke insert hooks that may have been merged by create hooks.
              // e.g. for directives that uses the "inserted" hook.
              const insert = ancestor.data.hook.insert;
              if (insert.merged) {
                // start at index 1 to avoid re-invoking component mounted hook
                for (let i = 1; i < insert.fns.length; i++) {
                  insert.fns[i]();
                }
              }
            } else {
              registerRef(ancestor);
            }
            ancestor = ancestor.parent;
          }
        }

        // destroy old node
        // 移除旧节点
        // 判断从 oldVnode 中获取的 parentElm 是否存在
        if (isDef(parentElm)) {
          // 移除 oldVnode，并触发相关钩子函数
          removeVnodes([oldVnode], 0, 0);
        } else if (isDef(oldVnode.tag)) {
          // 如果 parentElm 不存在，说明 oldVnode 并不在 dom上存在，
          // 此时判断 oldVnode 是否是标签，如果是，只触发 destroy 钩子函数
          invokeDestroyHook(oldVnode);
        }
      }
    }
    // 触发 新插入的vnode 节点的 insert 钩子函数
    // isInitialPatch = true 标记这种节点已经创建好了，dom元素也创建好了，但是还没挂载到dom树上，仅仅只存在内存中
    // 如果 vnode 对应的 dom 元素没有挂载到 dom树上，则不会触发 vnode 的 insert 钩子函数
    // 全局搜索了下，insert 钩子函数应该是只有 ssr 和 weex 才有的
    invokeInsertHook(vnode, insertedVnodeQueue, isInitialPatch);
    // 返回 vnode 的 dom元素 返回，记录到 vm.$el 中
    return vnode.elm;
  };
}
