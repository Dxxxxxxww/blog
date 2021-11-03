# react 零碎待整理

## 过时的生命周期

### componentWillReceiveProps

官方文档：如果父组件导致组件重新渲染，即使 props 没有更改，也会调用 componentWillReceiveProps 方法。如果只想处理更改，请确保当前值与变更值的比较。

结论：<b>componentWillReceiveProps 并不是由 props 的变化触发的，而是由父组件的更新触发的。</b>

## 类组件

类组件的事件在 render 中需要用 箭头函数包裹一层是为了确保 this 的指向。所以定义函数的时候直接使用箭头函数的话，在 render 中就不需要额外使用箭头函数包裹了。

## reducer

### reducer 需要保持同步

原因：我们要保持 reducer 的纯洁性，保持它是可预测的。因为在函数式编程中，异步是被认为是副作用(每次即使传入相同的参数，返回也可能不同)的。比如说请求可能成功，也可能失败，或者在获取信息的同时，另一个地方更新了信息，导致每次的返回也会不同。它是不可预测的。
<b>注：reducer 需要保持同步不意味着 dispatch 一定要在同步中使用，它可以在异步函数中调用。</b>

所以 reducer 必须是一个同步函数，且是纯函数。

reducer 的设计理念与 react 是相同的，它们判断数据是否变化，就是简单粗暴的通过 '===' 来判断。

dispatch 一定要在同步中使用，它可以在异步函数中调用，那么为什么还需要 redux-thunk 呢？

redux-thunk，它可以让组件不用关心异步的细节，可以像是使用同步的形式去使用异步的 dispatch。异步的细节就可以统一在专门放在异步请求的文件中做处理。

## redux

redux 是 js 可预测的状态管理容器

react-redux 作为一种桥梁，它把 redux 中的数据和 reac-component 连接在一起，把 store 中的数据变成组件中的状态。当 store 中的数据改变了，页面也会重新渲染。

## redux-thunk

用于处理在组件中的异步 dispatch(主要是用于接口请求)，这样可以让组件不用关心调用的是同步还是异步(让异步代码的调用跟同步的 action creator 一样)，异步成功还是失败也不需要额外的去处理。

当 dispatch 一个函数时，redux-thunk 会对其进行拦截，然后传入一些参数并执行这个函数。

```ts
function createThunkMiddleware<
    State = any,
    BasicAction extends Action = AnyAction,
    ExtraThunkArg = undefined
>(extraArgument?: ExtraThunkArg) {
    // Standard Redux middleware definition pattern:
    // See: https://redux.js.org/tutorials/fundamentals/part-4-store#writing-custom-middleware
    const middleware: ThunkMiddleware<State, BasicAction, ExtraThunkArg> = ({
        dispatch,
        getState
    }) => next => action => {
        // The thunk middleware looks for any functions that were passed to `store.dispatch`.
        // If this "action" is really a function, call it and return the result.
        if (typeof action === "function") {
            // Inject the store's `dispatch` and `getState` methods, as well as any "extra arg"
            return action(dispatch, getState, extraArgument);
        }

        // Otherwise, pass the action down the middleware chain as usual
        return next(action);
    };
    return middleware;
}
```
