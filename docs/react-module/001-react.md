# react 初识

## 一、react hooks

1. State Hook

不管 state 是否在 jsx 中使用，只要使用了 setCount，就会触发重新渲染。

[sandbox](https://codesandbox.io/s/usecallback1-yu1sp?file=/src/App.js)

```js
const [count, setCount] = useState(0);
// 等同于 vue3 的 const count = ref(0)
// 只不过针对 count 的修改操作，需要使用 useState 返回的操作函数—— setCount。
```

如果需要在 useState 保存一个函数状态，则需要使用返回真正所需的函数的函数。

根据官方文档 <b>“initialState 参数只会在组件的初始渲染中起作用，后续渲染时会被忽略。如果初始 state 需要通过复杂计算获得，则可以传入一个函数，在函数中计算并返回初始的 state，此函数只在初始渲染时被调用。”</b> 所说，如果传入一个普通函数，则会立即执行以达到获取初始值的目的。

```js
// 需要传入一个返回函数的函数
const [cb, setCb] = useState(() => () => {});
```

2. Effect Hook

```js
useEffect(() => {
    ChatAPI.subscribeToFriendStatus(props.friend.id, handleStatusChange);
    return () => {
        ChatAPI.unsubscribeFromFriendStatus(
            props.friend.id,
            handleStatusChange
        );
    };
});
```

按照 react 官方文档的解释：

它跟 class 组件中的 componentDidMount、componentDidUpdate 和 componentWillUnmount 具有相同的用途，只不过被合并成了一个 API。
默认情况下，React 会在<b>每次渲染后(强调!!!) 调用副作用函数 —— 包括第一次渲染的时候。</b>

等同于 vue3 中的 onMounted，onUpdated, computed。

———

不同的是，useEffect 还会返回一个函数来指定如何“清除”副作用。React 会在<b>组件销毁时执行返回的函数</b>，然后在后续渲染时重新执行 useEffect。

这里类比 vue2 来理解就是，在 mounted 中使用 \$once 监听 hook:beforeDestroy 事件，这样就不需要在 beforeDestroy 写销毁逻辑。

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
    document.title = `You clicked ${count} times`;
}, [count]); // 仅在 count 更改时更新
```

```js
function FriendStatus(props) {
    // ...
    useEffect(() => {
        // ...
        ChatAPI.subscribeToFriendStatus(props.friend.id, handleStatusChange);
        return () => {
            ChatAPI.unsubscribeFromFriendStatus(
                props.friend.id,
                handleStatusChange
            );
        };
    });
}

// Mount with { friend: { id: 100 } } props
ChatAPI.subscribeToFriendStatus(100, handleStatusChange); // 运行第一个 effect

// Update with { friend: { id: 200 } } props
ChatAPI.unsubscribeFromFriendStatus(100, handleStatusChange); // 清除上一个 effect
ChatAPI.subscribeToFriendStatus(200, handleStatusChange); // 运行下一个 effect

// Update with { friend: { id: 300 } } props
ChatAPI.unsubscribeFromFriendStatus(200, handleStatusChange); // 清除上一个 effect
ChatAPI.subscribeToFriendStatus(300, handleStatusChange); // 运行下一个 effect

// Unmount
ChatAPI.unsubscribeFromFriendStatus(300, handleStatusChange); // 清除最后一个 effect
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
    const oldTitle = useRef(document.title).current;
    // const oldTitle = document.title;
    // useEffect 中如果使用了外部的变量或者状态，而没有在第二个参数中加入依赖的话，就会产生闭包的问题
    useEffect(() => {
        document.title = title;
    }, [title]);

    useEffect(() => {
        return () => {
            if (!keepOnUnmount) {
                document.title = oldTitle;
            }
        };
    }, [keepOnUnmount, oldTitle]);
};
```

4. useCallback

生成闭包
