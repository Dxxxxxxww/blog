// useReducer 其实就是可以当做一个特殊的 useState。可以把传入的 reducer 当做是修改状态的方法，而 dispatch 就是去通知 reducer 修改状态的手段。
function useReducer(reducer, initialize) {
    const [state, setState] = useState(initState);
    function dispatch(action) {
        const newState = reducer(state, action)
        setState(newState)
    }
    return [state, dispatch]
}
