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

## refs 使用

react 禁止在一个类组件中使用了函数式组件，并给这个函数式组件设置 ref。因为类组件是有实例，而函数组件没有实例。例如以下代码：

```jsx
// 代码来源冴羽
// 链接：https://juejin.cn/post/7161719602652086308

function Input() {
  return <input value="value" />
}

class App extends React.Component {
  constructor(props) {
    super(props)
    this.inputRef = React.createRef()
  }
  render() {
    return (
      <div>
        // 会报错
        <Input ref={this.inputRef} value="value" />
      </div>
    )
  }
}
```

对于函数组件来说只能转发 ref 给具体的 html 元素。比如说使用 `forwardRef`。

### 那如果不使用 forwardRef 还可以怎么转发 ref 呢？

可以把父组件中定义的 ref 通过 props 传给子组件，然后绑定到子组件中的元素上。

```jsx
// 代码来源冴羽
// 链接：https://juejin.cn/post/7161719602652086308

// 类组件
class Child extends React.Component {
  render() {
    const { inputRef, ...rest } = this.props
    // 3. 这里将 props 中的 inputRef 赋给 DOM 元素的 ref
    return <input ref={inputRef} {...rest} placeholder="value" />
  }
}
// 函数组件
function Child(props) {
  const { inputRef, ...rest } = props
  // 3. 这里将 props 中的 inputRef 赋给 DOM 元素的 ref
  return <input ref={inputRef} {...rest} placeholder="value" />
}

class Parent extends React.Component {
  constructor(props) {
    super(props)
    // 1. 创建 refs
    this.inputRef = React.createRef()
  }
  componentDidMount() {
    setTimeout(() => {
      // 4. 使用 this.inputRef.current 获取子组件中渲染的 DOM 节点
      this.inputRef.current.value = 'new value'
    }, 2000)
  }
  render() {
    // 2. 因为 ref 属性不能通过 this.props 获取，所以这里换了一个属性名
    return <Child inputRef={this.inputRef} />
  }
}
```

不过最好还是使用 `forwardRef` 。

## ref 的原理是什么

ref 的原理很简单，只是一个包含 `current` 属性的对象，只不过内部会对它使用 [Object.seal](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/seal) 处理，让这个对象不能添加新属性，不能删除现有属性，也不能更改枚举性和可配置性，也不能重新分配原型。

在使用 ref 时，react 并不关心 ref 是怎么来的，用 createRef、useRef 创建的，或者 forwardRef 传过来的都行，甚至普通对象也可以（只要提供了 current 属性）。

### forwardRef 的原理是什么

forwardRef 函数创建了 vdom 类型为 ForwardRef 的对象：

```jsx
// vdom 的 type 是如下的对象
var elementType = {
  $$typeof: REACT_FORWARD_REF_TYPE,
  render: render
}
```

对象本身的 `$$typeof` 是 `REACT_FORWARD_REF_TYPE` 类型，`render` 则是我们传入的函数组件。需要注意的是，当这个返回的对象被当做组件渲染时，产生的 vdom 的 `$$typeof` 的类型依然是 `REACT_ELEMENT_TYPE` 类型。因为它依然是走了 React.createElement 函数。forwardRef() 执行返回的对象在 beginWork 中会走 case ForwardRef 分支，会拿到 render 函数去执行。

在 `beginWork` 的时候，会将父组件定义在 `forwardRef` 组件上的 `ref` 给转发到 `render` 的第二个参数上。

### useImperativeHandle 的原理是什么

seImperativeHandle 的底层实现就是 useLayoutEffect。所以在 fiber 中存储的地方也就是存到 effect 存储的地方—— updateQueue。

只不过执行的函数是 react 内部的 imperativeHandleEffect，并且 bind 了 我们传入的 create 函数和 ref，这样在 layout 阶段调用 hook 的 effect 函数的时候，执行了传入的 create 函数，并把返回值赋给了 ref.current ，这样就更新 ref 了。所以其实 useImperativeHandle 的作用就是改变 ref 引用。

## context

createContext 创建了一个对象（以下简称 cco）。可以看做是一个数据中心。

然后 provider 是一个特殊的组件，作用就是接收传进来的 value ，在内部对 cco 的值(\_currentValue)进行修改。所以其实我们也可以不利用 provider ，直接通过 cco 就能修改，当然这是不推荐的。

最后是 useContext，它其实就是返回了 cco.\_currentValue。对于类组件上的 Consumer，也是一样的。只不过它需要调用组件 render(value) 把值传进去。

当然了，如果仅仅只是一个全局数据中心，那我们自己也可以实现，或者 hack。而 react 对 context 还有一个处理就是，provider 中的修改，只会对子组件造成影响。而不会对父级造成影响。

这是怎么做到的呢？

在 react 内部，有两个函数叫作，pushProvider, popProvider。他俩会对当前的 fiber 和 context 维护了 value 栈和 fiber 栈。也就是说，在每一个 provider 使用的地方，都会对栈 push（fiber 栈和 value 栈中， fiber 和 value 的 index 是对应的），
再在使用 useContext 获取值的地方通过 pop 来获取栈顶的值。这样一来，假如说现在有一个 A->B->C 三层组件，A 和 B 都使用了 provider，那么在 C 中获取的值就是 B 推入栈的值。而在其他树节点中，使用的都是 A 组件的值。

push 是在 beginWork/updateContextProvider 中调用的。 pop 是在 completeWork 中调用的。

## 竞态条件 race condition

## Suspense

Suspense 组件是一个字符串常量。

```jsx
;<Suspense fallback={'loading data'}>
  <Content />
</Suspense>

// 转译后为：

React.createElement(
  Suspense,
  {
    fallback: 'loading data'
  },
  React.createElement(Content, null)
)
```

## scheduler 和时间分片

### 什么是 scheduler

### 为什么要有 scheduler 和时间分片

### scheduler 原理

### react 为什么要用最小堆？

x >>> 1 表示的就是除以 2 后取整。

sortIndex 就是过期时间，通过任务开始时间 + 优先级对应时间得来，sortIndex 越小，优先级越高，在最小堆中越靠近根节点。

halfLength

### 如何划分优先级，任务怎么排序的？

shouldYeild 之后，任务会根据最小堆来判断优先级进行 schedule。

目前理解：
即便是多个 setState 一起触发。或者是在某个函数执行中又触发了 setState ，并且这个新的 setState 是个高优先级事件，那也没关系。因为 react 会将这个事件推到 queue 中。然后按优先级排序。在当前处理的这轮 fiber 循环中，如果有超过 5ms 的处理，会被打断，然后从 queue 中获取高优先任务执行。如果没有超过 5ms 也没事，因为 5ms 很快就执行过去了。不会延迟多少。

### continuationCallback 任务中断如何恢复的？

首先，一个函数在执行过程中肯定是不可以打断的，

### schedule 的执行流程是怎样的

## diff

## commit 阶段中三个小阶段，各对 fiber 遍历了 1 次吗

是的。

在 xxx_begin 都 执行了 while(nextEffect != null) 循环，进行深度遍历（child）。

再在 xxx_complete 中进行广度遍历（sibling），没有兄弟节点后返回父节点。

nextEffect 就是(被标记了的?存疑) fiber 节点。

### 在遍历时做一些标记要做什么事情呢？

比如设置了 ref 的节点，就会在 mutation 阶段进行 ref 清空。在 layout 阶段进行 ref 的更新。

比如 useLayoutEffect 就会在 layout 阶段（commitLayoutEffects/commitLayoutEffects_begin/commitLayoutMountEffects_complete/commitLayoutEffectOnFiber/commitHookEffectListMount）执行。

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
3. 在`mountIndeterminateComponent`中，**会调用`renderWithHooks`执行函数组件，获取 ReactElement（vdom）。**注 2
4. 接着会执行 reconcileChildren，将刚刚执行函数组件获取到的 vdom 转换成 fiberNode。并把第一个子节点挂到父级 fiberNode.child 上。如果有多个子节点，会把子节点挂到前一个子节点的 sibling 上。注 3
5. 如果第 4 步返回了子级 fiber，则会继续“递”的过程。如果返回了 null。则会进入 completeWork 过程。
6. 在 completeWork 中，首先会创建 dom，其次会进行“归”的过程，也就是返回兄弟节点或者父节点本身。

> 注解解释
> 注 1：
> 这里只看函数组件的逻辑
> 虚拟 fiber 根节点会在 beginWork 中进入 case HostRoot
> React.StrictMode 节点会进入 case Mode
> App 根组件，以及其子组件会进入 case IndeterminateComponentApp
> 元素会进入 case HostComponent
> 注 2：
> ReactElement（vdom）的生成时机。如果是函数组件，则是在 renderWithHooks 中调用组件函数时，如果是类组件，则是在 instance.render() 执行时。
> 比如 \<App/\> 组件，它本身的 fiberNode 是在其父组件执行时创建的。而它组件函数则是在 wip 等于它自己的 fiberNode 时去执行，产生子级的 vdom。
> 在组件函数执行完后，\<App/\> 产生了子级 vdom ，它的根节点（假设是 div 元素）的 vdom 上的 props 属性会包含 children（也就是 div 的子级）。
> \<App/\> 生成完子级 vdom 然后进行子级 fiber 转换。
> 当下一轮递归，wip === div fiberNode 时，经过 beginWork 进入 case HostComponent，会从 fiberNode.pendingProps.children 上拿到子级 vdom ，去生成子级的 fiberNode。
> fiberNode.pendingProps === vdom.props ，是在生成 fiberNode 时传递的。
> 无论是 html 元素，还是组件，在 react 中都会生成 vdom 对象。区别只是 html 元素的 vdom type 是字符串，而组件则是组件函数。
> 注 3：
> 针对多个子节点的情况，在 reconcileChildrenArray 函数中会有变量存储第一个子节点和前一个子节点。多个子节点在 reconcileChildrenArray 中循环创建 fiberNode

在虚拟根节点创建严格模式节点的 fiber 这一步。 严格模式节点 vdom 是绑定在 虚拟根节点的 memoizedState.element 上的。但不知道哪一个时机从 renderWithHooks 去调用然后绑定上去。应该是 index.js

### 那么它是生成一个 vdom 就转一次 fiberNode 咯？

也并不是。因为当生成 vdom 时，它的 children 也已经转成 vdom 了。这时候已经是一棵 vdom 树了。会深度优先遍历的进行 fiberNode 转换。

### 什么时候会走 case FunctionComponent

在初次挂载的时候，react 并不知道一个组件是类组件还是函数组件，所以会先走 case IndeterminateComponent ，表示不确定的组件。

在 `case IndeterminateComponent` 中调用了 `mountIndeterminateComponent` ，会判断是函数组件还是类组件。会对 `wip.tag` 打上不同的标记。对函数组件会执行 `renderWithHooks` ，对类组件会执行 `finishClassComponent` 。并在后续的调用中，走 `case FunctionComponent` 或 `case ClassComponent` 。

### 那么是怎么判断的呢

在 mountIndeterminateComponent 中 react 会先执行一次 renderWithHooks 查看返回值。

如果返回值是对象（value），并且有 render 方法，并且$$typeof 是 undefined 则是类组件。

如果是类组件，则还需要调用 `finishClassComponent` ，最终调用 `value.render()` 执行真正的函数渲染。

如果是函数组件，则此时已经获得了函数组件的 vdom。只需要给 wip.tag 打上 FunctionComponent 的标记。

此外，如果是严格模式，在这时候还会再执行一次 `renderWithHooks`。

### 函数调用轨迹

单子节点：

`reconcileChildren -> reconcileChildFibers -> reconcileSingleElement-> createFiberFromElement -> createFiberFromTypeAndProps -> createFiber`

多子节点：

`reconcileChildren -> reconcileChildFibers -> reconcileChildrenArray -> (updateSlot/createChild/updateFromMap) -> createFiberFromElement -> createFiberFromTypeAndProps -> createFiber`

### fiber 的 tag 是什么时候生成的

在生成 `fiberNode` 时生成，在 `createFiberFromTypeAndProps` 函数中通过不同的条件判断来设置值。

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
