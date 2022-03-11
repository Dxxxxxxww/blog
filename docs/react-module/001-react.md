# react 初识

## react hooks

react hooks 依赖需要注意的点：

1. 基本数据类型，组件状态可以放入依赖中；
2. 非基本数据类型非组件状态不可放入依赖中。

---

1. State Hook

不管 state 是否在 jsx 中使用，只要使用了 setCount，就会触发重新渲染。

[sandbox](https://codesandbox.io/s/usecallback1-yu1sp?file=/src/App.js)

```js
const [count, setCount] = useState(0)
// 等同于 vue3 的 const count = ref(0)
// 只不过针对 count 的修改操作，需要使用 useState 返回的操作函数—— setCount。
```

如果需要在 useState 保存一个函数状态，则需要使用返回真正所需的函数的函数。

根据官方文档 <b>“initialState 参数只会在组件的初始渲染中起作用，后续渲染时会被忽略。如果初始 state 需要通过复杂计算获得，则可以传入一个函数，在函数中计算并返回初始的 state，此函数只在初始渲染时被调用。”</b> 所说，如果传入一个普通函数，则会立即执行以达到获取初始值的目的。

```js
// 需要传入一个返回函数的函数
const [cb, setCb] = useState(() => () => {})
```

2. Effect Hook

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
默认情况下，React 会在<b>每次渲染后(强调!!!) 调用副作用函数 —— 包括第一次渲染的时候。</b>

等同于 vue 中的 onMounted，onUpdated, watch。

———

不同的是，useEffect 还会返回一个函数来指定如何“清除”副作用。React 会在<b>组件销毁时执行返回的函数</b>，然后在后续渲染时重新执行 useEffect。

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

如果数组中有多个元素，即使只有一个元素发生变化，React 也会执行 effect。<b>注意：它会在调用一个新的 effect 之前对前一个 effect 进行清理（执行返回的函数）。</b>

```js
useEffect(() => {
  document.title = `You clicked ${count} times`
}, [count]) // 仅在 count 更改时更新
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

3. useRef

官方描述：useRef 返回一个可变的 ref 对象，其 .current 属性被初始化为传入的参数（initialValue）。返回的 ref 对象在组件的整个生命周期内持续存在。<b>这个 ref 对象是一个变量，不是组件状态，所以它(.current)的改变不会触发组件重新渲染。</b>

我对 useRef 理解就是，生成了一个容器对象，这个容器对象在组件的整个生命周期是不变的，而它的属性 .current 的值是可变的。

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

4. useMemo

官方文档：把“创建”函数和依赖项数组作为参数传入 useMemo，它仅会在某个依赖项改变时才重新计算 memoized 值。这种优化有助于避免在每次渲染时都进行高开销的计算。

个人理解：使用 useMemo 的返回值，相当于是只在初次渲染时建立了一个缓存的公共常量对象，以后每次的修改都会取这个对象。

注：传入 useMemo 的函数会在渲染期间执行。如果没有提供依赖项数组，useMemo 在每次渲染时都会计算新的值。

可以理解为 vue 中的 computed。

<b>
基本数据类型，组件状态可以放入依赖中。非基本数据类型非组件状态不可放入依赖中。如果我们定义了非基本类型想要做依赖，就要用到 useMemo。
</b>这样就能限制住非基本类型在每次渲染时的重新创建。

5. useCallback

官方文档：把内联回调函数及依赖项数组作为参数传入 useCallback，它将返回该回调函数的 memoized 版本，该回调函数仅在某个依赖项改变时才会更新。

个人理解：可以理解为特殊版本的 useMemo，专门用于函数的情况。当自定义 hook 需要向外返回函数的时候，使用 useCallback 包裹。

<b>如果使用的是非原生 dom 节点(自定义组件)，那么回调函数都应该用 useCallback 进行封装。</b>

6. useReducer

官方文档：useState 的替代方案。它接收一个形如 (state, action) => newState 的 reducer，并返回当前的 state 以及与其配套的 dispatch 方法。（如果你熟悉 Redux 的话，就已经知道它如何工作了。）在某些场景下，useReducer 会比 useState 更适用，例如 state 逻辑较复杂且包含多个子值，或者下一个 state 依赖于之前的 state 等。

个人理解：从功能上来说，useState 与 useReducer 可以互换的，用其中一个实现的功能，使用另一个也是可以实现的。useState 适合定义单个的状态，useReducer 适合定义一群/多个互相影响的状态。

7. useContext

个人理解：hooks 里的局部全局状态管理

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
