# react 学习笔记

## ReactElement 生成 vdom 时，$$typeof 的作用是什么

作用有两个：

1. 标记节点类型
2. 安全考虑。因为 $$typeof 是一个 react 内部生成的 Symbol 属性。

比如说如下代码：

```jsx
function Hi() {
  const data = await DataFromBackend();
  return <div>{data.msg}</div>
}
```

后端返回的 msg 是一个字符串，但受到了 xss 攻击，返回的是伪造的元素，这时候因为 $$typeof 不存在或者不合规，react 就不会渲染这个元素。从而保证了安全性。

### 节点类型

组件和元素都是 REACT_ELEMENT_TYPE 类型

React.StrictMode 也是一个组件，所以它的 $$typeof 也是 REACT_ELEMENT_TYPE。

## react 元素和组件的区别

在 React 中。React 元素指的是 jsx 的**产物**，也就是 vdom。而组件，指的是**组件函数、组件类**。

当我们在 react 编写 `<Abc>` 这样的代码时，它会被 babel 编译成 `React.createElement()` 函数调用（v18 后是 jsx）。最终函数调用会生成 React 元素，即 vdom。

所以我们可以把 `<Abc>` 这种类 html 的写法看做是 `Abc()`就行。

```jsx
// 所以在 react 中 插槽slot 可以这样写

// 传入的是 react 元素
function Parent({ son }) {
  return <div>{son}</div>
}

function Son() {
  return <div>son</div>
}

;<Parent son={<Son />} />
```

```jsx
// 作用域插槽scopedSLot可以这样写

function Parent({ Son }) {
  const [name] = useState('name')
  return (
    <div>
      <Son name={name} />
    </div>
  )
}

function Son({ name }) {
  return <div>{name}</div>
}

;<Parent Son={Son} />
```

```jsx
// 作用域插槽scopedSLot还可以这样写
// 这种写法也被叫做 render props
// 这其实是一种高阶组件

function Parent({ renderSon }) {
  const [name] = useState('name')
  return <div>{renderSon(name)}</div>
}

function Son({ name }) {
  return <div>{name}</div>
}

;<Parent
  renderSon={(name) => {
    return <Son name={name} />
  }}
/>
```

```jsx
// 当然，放在 children 中也是可以的
function Parent({ children }) {
  const [name] = useState('name')
  return <div>{children(name)}</div>
}

function Son({ name }) {
  return <div>{name}</div>
}

;<Parent>
  {(name) => {
    return <Son name={name} />
  }}
</Parent>
```

## commit 阶段中三个小阶段，各对 fiber 遍历了 1 次吗

是的。

在 xxx_begin 都 执行了 while(nextEffect != null) 循环，进行深度遍历（child）。

再在 xxx_complete 中进行广度遍历（sibling），没有兄弟节点后返回父节点。

nextEffect 就是(被标记了的?存疑) fiber 节点。

### 在遍历时做一些标记要做什么事情呢？

比如设置了 ref 的节点，就会在 mutation 阶段进行 ref 清空。在 layout 阶段进行 ref 的更新。

比如 useLayoutEffect 就会在 layout 阶段（commitLayoutEffects/commitLayoutEffects_begin/commitLayoutMountEffects_complete/commitLayoutEffectOnFiber/commitHookEffectListMount）执行。

## 多次 setState update 时，是怎么根据优先级来进行 schedule 的

目前理解：
即便是多个 setState 一起触发。或者是在某个函数执行中又触发了 setState ，并且这个新的 setState 是个高优先级事件，那也没关系。因为 react 会将这个事件推到 queue 中。然后按优先级排序。在当前处理的这轮 fiber 循环中，如果有超过 5ms 的处理，会被打断，然后从 queue 中获取高优先任务执行。如果没有超过 5ms 也没事，因为 5ms 很快就执行过去了。不会延迟多少。

## useEffect 的异步是微任务还是宏任务

是宏任务，因为 useEffect 是在页面真正渲染之后才执行

## useEffect 的存储点 updateQueue 的数据结构是怎样的

每个 fiberNode 上都有一个 updateQueue 属性，它是一个环形链表。这样设计的好处是方便插入。尾结点指向头结点。

### 还有一个串行链表，记录的是 fiberNode

在 v18 中没找到这段代码了， 这段逻辑移到哪里了？

~~在 completeWork 中，会将节点冒泡一样的传递到上级，最终传到 root fiberNode

父节点的 firstEffect 中。**记录的是 fiberNode！！！**

firstEffect -> nextEffect -> lastEffect~~

## beginWork 和 completeWork 具体做了什么

beginWork：

1.在当前 fiberNode，创建子级 fiberNode，并建立联系。 2.做递的过程
completeWork：

1.创建 dom 2.做归的过程

当然里面还会涉及到标记设置和根据标记做其他工作。这里暂时先不涉及

## 简述下初次挂载时的流程

1. 因为 react 转换 fiber 的流程是在当前节点转换下一级节点，所以首先 react 会构造一个虚拟 fiber 根节点。
2. 虚拟 fiber 根节点会在 beginWork 中进入 case HostRoot，执行 `mountIndeterminateComponent`。注 1
3. 在`mountIndeterminateComponent`中，**会调用`renderWithHooks`执行函数组件，获取 reactElement（vdom）。**
4. 接着会执行 reconcileChildren，将刚刚执行函数组件获取到的 vdom 转换成 fiberNode。并把第一个子节点挂到父级 fiberNode.child 上。如果有多个子节点，会把子节点挂到前一个子节点的 sibling 上。注 2
5. 如果第 4 步返回了子级 fiber，则会继续“递”的过程。如果返回了 null。则会进入 completeWork 过程。
6. 在 completeWork 中，首先会创建 dom，其次会进行“归”的过程，也就是返回兄弟节点或者父节点本身。

> 注解解释
> 注 1：
> 虚拟 fiber 根节点会在 beginWork 中进入 case HostRoot
> React.StrictMode 节点会进入 case Mode
> App 根组件，以及其子组件会进入 case IndeterminateComponentApp
> 元素会进入 case HostComponent
> 注 2：
> 针对多个子节点的情况，在 reconcileChildrenArray 函数中会有变量存储第一个子节点和前一个子节点。多个子节点在 reconcileChildrenArray 中循环创建 fiberNode

在虚拟根节点创建严格模式节点的 fiber 这一步。 严格模式节点 vdom 是绑定在 虚拟根节点的 memoizedState.element 上的。但不知道哪一个时机从 renderWithHooks 去调用然后绑定上去。应该是 index.js

### 那么它是生成一个 vdom 就转一次 fiberNode 咯？

也并不是。因为当生成 vdom 时，它的 children 也已经转成 vdom 了。这时候已经是一棵 vdom 树了。会深度优先遍历的进行 fiberNode 转换。

### 什么时候会走 case FunctionComponent

### 函数调用轨迹

单子节点：

`reconcileChildren -> reconcileChildFibers -> reconcileSingleElement-> createFiberFromElement -> createFiberFromTypeAndProps -> createFiber`

多子节点：

`reconcileChildren -> reconcileChildFibers -> reconcileChildrenArray -> (updateSlot/createChild/updateFromMap) -> createFiberFromElement -> createFiberFromTypeAndProps -> createFiber`

## 组件生命周期

粗略版

react 组件的执行阶段分为三个阶段：

1. Trigger 触发渲染。
   - 初始化渲染是 createRoot 调用，并执行 root.render()，最终通过 appendChild 挂载到 dom 上。
   - 更新渲染则是状态修改引起的渲染。
2. Render 执行状态队列，获取新的状态，执行组件函数本体。可以理解为 vue 的 h 函数执行获取有新状态的 vnode。
3. Reconcile 会将 vdom 转为 fiber 并进行 diff。（可被打断，可调度，也就是 fiber 的 schedule）
4. Commit 拿着 render 返回的结果，去同步 DOM 更新的阶段。render 和 commit 分开以达到批量更新 DOM 的目的，也是 react 之后退出并行模式的设计基础。可以理解为 vue 的 patch。将 vnode 的修改的结果更新到 dom 上。
5. Browser paint 浏览器绘制（渲染）。
6. 执行 useEffect

## react update

对 react 来说，更重要的是组件组件在 UI 树中的位置，而不是在 jsx 中的位置。这是判断组件在重新渲染时是否复用的判断条件。
