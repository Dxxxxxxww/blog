# react 初识

# ◆ react hooks
一、State Hook
```js
const [count, setCount] = useState(0);
// 等同于 vue3 的 const count = ref(0)
// 只不过针对 count 的修改操作，需要使用 useState 返回的操作函数—— setCount。
```
二、Effect Hook
```js
useEffect(() => {
  ChatAPI.subscribeToFriendStatus(props.friend.id, handleStatusChange);
  return () => {
    ChatAPI.unsubscribeFromFriendStatus(props.friend.id, handleStatusChange);
  };
});
```
按照 react 官方文档的解释：

它跟 class 组件中的 componentDidMount、componentDidUpdate 和 componentWillUnmount 具有相同的用途，只不过被合并成了一个 API。
默认情况下，React 会在每次 渲染后(强调!!!) 调用副作用函数 —— 包括第一次渲染的时候。

等同于 vue3 中的 onMounted，onUpdated, computed。

———

不同的是，useEffect 还会返回一个函数来指定如何“清除”副作用。React 会在组件销毁时执行返回的函数，然后在后续渲染时重新执行 useEffect。

这里类比 vue2 来理解就是，在 mounted 中使用 $once 监听 hook:beforeDestroy 事件，这样就不需要在 beforeDestroy 写销毁逻辑。

在 beforeDestroy 写销毁逻辑的问题有两个：

1. 它需要在这个组件实例中保存这个 picker，如果可以的话最好只有生命周期钩子可以访问到它。这并不算严重的问题，但是它可以被视为杂物。
2. 我们的建立代码独立于我们的清理代码，这使得我们比较难于程序化地清理我们建立的所有东西。

而使用 $once 这种程序化的事件侦听器 就能避免以上两个问题。
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

如果数组中有多个元素，即使只有一个元素发生变化，React 也会执行 effect。
```js
useEffect(() => {
  document.title = `You clicked ${count} times`;
}, [count]); // 仅在 count 更改时更新
```