---
sidebar: auto
---

# react hooks

记录对官方 hooks 的理解，以及记录一些 hooks 的奇技淫巧

## react hooks 出现原因

1. 类组件缺少复用机制（mixins，HOC），如果需要进行逻辑复用，都是需要在原有组件外再包一层，形成逻辑组件与渲染组件，增加了调试难度以及运行效率降低。
2. 类组件通常会变得复杂，难以维护。与 vue 类似，将逻辑拆分到不同的生命周期中，导致了同一个逻辑的代码在不同块，同一生命周期中会有不同逻辑的代码。
3. 类成员方法不能保证 this 指向的准确性，在元素上添加事件监听时，需要使用 bind，或者函数嵌套，箭头函数，提高复杂度。

## react 特点

**react hooks 依赖需要注意的点：**

1. 基本数据类型，组件状态可以放入依赖中；
2. 非基本数据类型非组件状态不可放入依赖中。

---

### 一、useState

用于给函数组件引入状态。通常来说，函数中的变量在函数执行完就会释放，而这里能保存状态的原理就是闭包。

不管 state 是否在 jsx 中使用，只要使用了 setCount，就会触发重新渲染。

---

传入函数

```js
const [count, setCount] = useState(0)
```

如果需要在 useState 保存一个函数状态，则需要使用返回真正所需的函数的函数。

根据官方文档 **“initialState 参数只会在组件的初始渲染中起作用，后续渲染时会被忽略。如果初始 state 需要通过复杂计算获得，则可以传入一个函数，在函数中计算并返回初始的 state，此函数只在初始渲染时被调用。”** 所说，如果传入一个普通函数，则会立即执行以达到获取初始值的目的。

```js
// 需要传入一个返回函数的函数
const [cb, setCb] = useState(() => () => {})
```

> **何时使用状态？官网回答如下：** > <br/>A state variable is only necessary to keep information between re-renders of a component.
> <br/>否则直接使用普通变量即可。

> State variables might look like regular JavaScript variables that you can read and write to. However, state behaves more like a snapshot. Setting it does not change the state variable you already have, but instead triggers a re-render.
> <br/>根据官网文档的意思，可以理解为设置 state 并不是修改值，而是将设置的值存到内部 fiber 节点（可以理解为 vnode）上，然后去触发重新渲染，重新渲染再从节点上获取新值。

[sandbox](https://codesandbox.io/s/usecallback1-forked-k35zr0?file=/src/App.js)

> **A state variable’s value never changes within a render** > <br/>这实际上也很好理解，因为每一次的 render 中的 state 都是一个闭包变量，在函数执行时就确立了，直到 setState 致使 re-render 才会改变 state。因此不管是否异步，同一 render 时刻的 state 都是不变的。

> **React waits until all code in the event handlers has run before processing your state updates.** > <br/> 也就是说 set 方法是一个异步的过程，应该是个微任务。所以多次调用 set 时，会存到一个 queue 中，延后执行。
> <br/> 只不过对于 set(n1 + 1) 来说，n1 是此时渲染，函数时接到的参数变量，是不变的，对于 set(n2 => n2 + 1) 来说，n2 是回调函数的参数，是内部 fiber 节点已经更新后的值重新传递。

`set(n => n+1)` **有点像是作用域的概念，如果有 n 这个局部状态，就取局部状态，没有就取组件函数初始化时的状态**

> To summarize, here’s how you can think of what you’re passing to the setNumber state setter:
> <br/>An updater function (e.g. n => n + 1) gets added to the queue.
> <br/>Any other value (e.g. number 5) adds “replace with 5” to the queue, **ignoring what’s already queued.**

```js
import { useState } from 'react'

export default function Counter() {
  const [number, setNumber] = useState(0)

  return (
    <>
      <h1>{number}</h1>
      <button
        onClick={() => {
          setNumber(number + 5)
          setNumber((n) => n + 1)
        }}
      >
        Increase the number
      </button>
    </>
  )
}

// 按钮的点击结果最终是 6
```

---

### 二、useEffect

```js
useEffect(() => {
  ChatAPI.subscribeToFriendStatus(props.friend.id, handleStatusChange)
  return () => {
    ChatAPI.unsubscribeFromFriendStatus(props.friend.id, handleStatusChange)
  }
})
```

按照 react 官方文档的解释：

它跟 class 组件中的 componentDidMount、componentDidUpdate 和 componentWillUnmount 具有相同的用途，只不过被合并成了一个 API。

等同于 vue 中的 onMounted，onUpdated, watch。

不同的是，useEffect 还会返回一个函数来指定如何“清除”副作用。React 会在**组件销毁时执行返回的函数**，然后在后续渲染时重新执行 useEffect。

这里类比 vue 来理解就是，在 mounted 中使用 \$once 监听 hook:beforeDestroy 事件，这样就不需要在 beforeDestroy 写销毁逻辑。

在 beforeDestroy 写销毁逻辑的问题有两个：

1). 它需要在这个组件实例中保存这个 picker，如果可以的话最好只有生命周期钩子可以访问到它。这并不算严重的问题，但是它可以被视为杂物。
2). 我们的建立代码独立于我们的清理代码，这使得我们比较难于程序化地清理我们建立的所有东西。

而使用 \$once 这种程序化的事件侦听器 就能避免以上两个问题。

```js

mounted() {
  var picker = new Pikaday({
    field: this.$refs.input,
    format: 'YYYY-MM-DD'
  })

  this.$once('hook:beforeDestroy', function () {
    picker.destroy()
  })
}
```

useEffect 还可以传递第二个参数，旨在通过跳过 Effect 进行性能优化。当第二个参数在两次渲染中没有发生变化，则 React 会跳过对该 effect 的调用。

如果数组中有多个元素，即使只有一个元素发生变化，React 也会执行 effect。**注意：它会在调用一个新的 effect 之前对前一个 effect 进行清理（执行返回的函数）。**

究其根本，其实是组件函数重新执行时，useEffect 判断到依赖不变（因为是[]），所以跳过了执行。而非不执行。

避免将对象和函数（特殊的对象）作为依赖项，每次渲染时对象和函数都不同，会导致 effect 一直重复执行，如果有场景下一定要使用对象和函数作为依赖，需要考虑使用 useMemo 和 useCallback。依赖项需要是状态值。

状态值： props 或 state，或者在组件函数中根据这两个计算而来的值。

```js
useEffect(() => {
  document.title = `You clicked ${count} times`
}, [count]) // 仅在 count 更改时，初次挂载时更新
```

```js
function FriendStatus(props) {
  // ...
  useEffect(() => {
    // ...
    ChatAPI.subscribeToFriendStatus(props.friend.id, handleStatusChange)
    return () => {
      ChatAPI.unsubscribeFromFriendStatus(props.friend.id, handleStatusChange)
    }
  })
}

// Mount with { friend: { id: 100 } } props
ChatAPI.subscribeToFriendStatus(100, handleStatusChange) // 运行第一个 effect

// Update with { friend: { id: 200 } } props
ChatAPI.unsubscribeFromFriendStatus(100, handleStatusChange) // 清除上一个 effect
ChatAPI.subscribeToFriendStatus(200, handleStatusChange) // 运行下一个 effect

// Update with { friend: { id: 300 } } props
ChatAPI.unsubscribeFromFriendStatus(200, handleStatusChange) // 清除上一个 effect
ChatAPI.subscribeToFriendStatus(300, handleStatusChange) // 运行下一个 effect

// Unmount
ChatAPI.unsubscribeFromFriendStatus(300, handleStatusChange) // 清除最后一个 effect
```

#### useEffect 执行时机

> Effects run at the end of a commit after the screen <br/>
> Every time your component renders, React will update the screen and then run the code inside useEffect <br/>
> 也就是说，React 会在**每次页面渲染后调用副作用函数 —— 包括第一次渲染的时候。执行时机是在 commit 阶段之后，页面真正更新渲染之后才执行，是一个宏任务**

———

### 三、useRef

官方描述：useRef 返回一个可变的 ref 对象，其 .current 属性被初始化为传入的参数（initialValue）。返回的 ref 对象在组件的整个生命周期内（这里刻意强调生命周期是指组件重新渲染时的生命周期改变）一直不变。**这个 ref 对象是一个变量，不是组件状态，所以它(.current)的改变不会触发组件重新渲染。**

我对 useRef 理解就是，**它不是一个状态，只是个变量。**它生成了一个容器对象，这个容器对象在组件的整个生命周期是不变的，而它的属性 .current 的值是可变的。**常用于获取 dom 元素(可以理解为 vue 中的 ref)。**

> React sets ref.current during the **commit**. **Before updating the DOM**, React sets the affected ref.current values to **null**. **After updating the DOM**, React immediately sets them to the corresponding **DOM nodes**. <br/>

实用例子：当函数组件中存在某种非状态变量对象，并且该变量对象在整个组件生命周期中保持不变，且需要被 useEffect 所依赖，这时候可以使用 useRef 来生成这个变量对象。

```js
export const useDocumentTitle = (
  title: string,
  keepOnUnmount: boolean = false
) => {
  // useRef 创建一个在整个 hook 生命周期中不会改变的值
  // 使用 useRef 而非闭包来保存，是为了解决 react 对没有收集 oldTitle 作为依赖的警告
  // 如果使用闭包变量并且还添加了依赖的话，那么 oldTitle 的值在每次渲染后都会变为新的 title，
  // 就失去了保存原来旧 title 的目的
  const oldTitle = useRef(document.title).current
  // const oldTitle = document.title;
  // useEffect 中如果使用了外部的变量或者状态，而没有在第二个参数中加入依赖的话，就会产生闭包的问题
  useEffect(() => {
    document.title = title
  }, [title])

  useEffect(() => {
    return () => {
      if (!keepOnUnmount) {
        document.title = oldTitle
      }
    }
  }, [keepOnUnmount, oldTitle])
}
```

### 四、useMemo

官方文档：把“创建”函数和依赖项数组作为参数传入 useMemo，它仅会在某个依赖项改变时才重新计算 memoized 值。这种优化有助于避免在每次渲染时都进行高开销的计算。

个人理解：使用 useMemo 的返回值，相当于是只在初次渲染时建立了一个缓存的公共常量对象，以后每次的修改都会取这个对象。

注：传入 useMemo 的函数会在渲染期间执行。如果没有提供依赖项数组，useMemo 在每次渲染时都会计算新的值。

**可以理解为 vue 中的 computed。计算属性**

**基本数据类型，组件状态可以放入依赖中。非基本数据类型非组件状态不可放入依赖中。如果我们定义了非基本类型想要做依赖，就要用到 useMemo。**这样就能限制住非基本类型在每次渲染时的重新创建。

### 五、useCallback

仅在以下两个方面有意义：

1. 函数作为参数传递给子组件，并且子组件通过 memo 包裹了，想要配合子组件的 memo 生效。
2. 函数作为 effect 或是其他 hook 的依赖，并且不想组件本身引起 hook 重新执行。

**请注意，useCallback 不会阻止创建函数。你总是在创建一个函数（这很好！），但是如果没有任何东西改变，React 会忽略它并返回缓存的函数。**

```js
// useCallback 在 React 内部的简化实现
function useCallback(fn, dependencies) {
  return useMemo(() => fn, dependencies)
}
```

### 六、useReducer

22/05/25 个人理解更新：

useReducer 其实就是可以当做一个特殊的 useState。可以把传入的 reducer 当做是修改状态的方法，而 dispatch 就是去通知 reducer 修改状态的手段。所以 useReducer 内部会使用 useState 或者会使用跟 useState 相同的方式来保存状态。

---

官方文档：useState 的替代方案。它接收一个形如 (state, action) => newState 的 reducer，并返回当前的 state 以及与其配套的 dispatch 方法。（如果你熟悉 Redux 的话，就已经知道它如何工作了。）在某些场景下，useReducer 会比 useState 更适用，例如 state 逻辑较复杂且包含多个子值，或者下一个 state 依赖于之前的 state 等。

个人理解：从功能上来说，useState 与 useReducer 可以互换的，用其中一个实现的功能，使用另一个也是可以实现的。useState 适合定义单个的状态，useReducer 适合定义一群/多个互相影响的状态。

### 七、useContext

可以用来替代 redux，作为跨组件状态共享的手段。

个人理解：hooks 里的局部全局状态管理。

#### 何时使用 useContext？

优先考虑如下两个方案是否满足需求：

1. props
2. 抽离组件，传递组件（也就是 slot）

### 八、useImperativeHandle

配合 useRef, forwardRef 使用，让子组件被父组件通过 ref 操控时，只暴露特定的方法。

```js
import { forwardRef, useRef, useImperativeHandle } from 'react'

const MyInput = forwardRef((props, ref) => {
  const realInputRef = useRef(null)
  useImperativeHandle(ref, () => ({
    // Only expose focus and nothing else
    focus() {
      realInputRef.current.focus()
    }
  }))
  return <input {...props} ref={realInputRef} />
})

export default function Form() {
  const inputRef = useRef(null)

  function handleClick() {
    inputRef.current.focus()
  }

  return (
    <>
      <MyInput ref={inputRef} />
      <button onClick={handleClick}>Focus the input</button>
    </>
  )
}
```

### 九、flushSync

严格来说 flushSync 不是一个 hook ，它是 react-dom 提供的一个同步修改 dom 的方法。通过该方法包裹的 setXXX 会变为同步。但是不建议使用，真要等到 dom 渲染后执行某些操作，可以使用 effect。

```js
flushSync(() => {
  setTodos([...todos, newTodo])
})
listRef.current.lastChild.scrollIntoView()
```

### 十、useLayoutEffect

useLayoutEffect 的使用方式，参数都与 useEffect 类似，唯一差别就是执行时机。

#### 执行时机

useLayoutEffect 的执行时机是在 commit 之后，页面真正渲染之前，是一个同步任务。

useEffect 的**默认**执行时机是在页面真正页面渲染之后，是一个宏任务。

useLayoutEffect 始终会比 useEffect 先执行。

[If your Effect wasn’t caused by an interaction](https://react.dev/reference/react/useEffect#caveats)

useEffect 的执行时机还会收到事件影响（离散型事件和非离散型事件）。

当一个组件受到事件驱动时，并且它的渲染时间长时，useEffect 会在页面渲染后执行。当组件渲染时间短时，useEffect 会同步执行。

这里的时间长短，经过测试，在 react v18 下判断标准为 2ms 。

测试代码：

```js
import { useEffect, useState, useLayoutEffect } from 'react'

const UseEffectTest = () => {
  const [count, setCount] = useState(0)

  console.log(1)

  const flag = Date.now()
  while (Date.now() - flag < 2000) {
    /* empty */
  }

  useEffect(() => {
    console.log(2, 'useEffect')
  }, [count])

  useLayoutEffect(() => {
    console.log(3, 'useLayoutEffect')
  }, [count])

  Promise.resolve().then(() => console.log(4, 'Promise'))

  setTimeout(() => console.log(5, 'setTimeout'), 0)

  const handleClick = () => {
    setCount((preC) => preC + 1)
  }
  const handleMouseEnter = () => {
    setCount((preC) => preC + 1)
  }

  return (
    <div onClick={handleClick} onMouseEnter={handleMouseEnter}>
      useEFfect 执行时机
    </div>
  )
}

export default UseEffectTest
```

##### 离散型事件和非离散型事件

离散型事件即 click 这种用户有意为之的事件。也就是高优先级事件。**高优先级事件即便时间再长，也会是同步执行**

非离散型事件即 mouseenter 这种用户可能只是鼠标滑过的非有意的事件。也是持续输入的事件。也就是非高优先级事件。

## react 事件

react 原生事件原理：合成事件（Synthetic Events）。

实现原理：react 利用浏览器事件冒泡，可以通过事件的 srcElement 属性得知是哪个节点触发的事件。

由于虚拟 dom 存在，在 react 中即便绑定一个事件到原生 dom 节点上，也会被挪到根节点上(在 react17 前是 document。 17 之后是 App，考虑同个应用可能出现多版本 react)，然后由 react 统一监听和管理，获取事件后分发到具体虚拟 dom 节点上。

所以 react 中无法使用 event.stopPropagation()阻止冒泡。事件处理器的执行前提是事件达到 document 被 React 接收到，然后 React 将事件派发到 button 组件。既然在按钮的事件处理器执行之前，事件已经达到 document 了，那当然就无法在按钮的事件处理器进行阻止了。

原因：

1. 虚拟 dom render 的时候， dom 还没有真实的渲染到页面上，无法绑定事件；
2. react 可以屏蔽底层事件细节，避免浏览器兼容问题，同事对于 rn 这种跨端运行也能提供一致的 api。

react 中想要阻止冒泡的办法：

1. 使用 window.addEventListener 来代替 document.addEventListener (v17 之前)，因为 event.stopPropagation() 可以停止事件传播到 window；
2. e.nativeEvent.stopImmediatePropagation()。组件中事件处理器接收到的 event 事件对象是 React 包装后的 SyntheticEvent 事件对象。但可通过它的 nativeEvent 属性获取到原生的 DOM 事件对象。通过调用这个原生的事件对象上的 stopImmediatePropagation() 方法可达到阻止冒泡的目的；
3. 绕开 react 直接在元素上绑定事件。通过 useRef 和 addEventListener 实现。

## react 受控/非受控组件

受控组件统一了表单元素的处理，但是容易有性能问题，因为每次输入字符触发 onChange，react 状态都会变化，进而重新渲染整个组件。这个时候就可以使用非受控组件去实现一些表单元素。

受控组件：指状态都由 react 接管的组件。

```js
const form = () => {
  const [value, setValue] = useState('')
  const handleChange = (evt) => {
    setValue(evt.target.value)
  }
  return <input value={value} onChange={handleChange} />
}
```

非受控组件：状态由 html 标签内部保存。缺点就是无法动态的去更改 UI。

```js
const form = () => {
  const iptRef = useRef()
  const handleSubmit = (evt) => {
    evt.preventDefault()
    alert(iptRef.current.value)
  }
  return (
    <form onSubmit={handleSubmit}>
      <input ref={iptRef} />
    </form>
  )
}
```

# hooks 记录
