// 二维数组，数组中保存 useEffect 的依赖数组
const preDepArgs = []
// 多次调用 useEffect 时的标志位
let effectIndex = 0

function render() {
    effectIndex = 0
    return ReactDom.render(<App/>, document.getElementById('root'))
}

function useEffect(callback, depArgs) {
    if (typeof callback !== 'function') throw new Error("useEffect's first param must be a function")
    if (typeof depArgs === 'undefined') {
      // 没有传入依赖数组时，callback 在挂载/更新时都调用
      callback()
    } else {
        if (Object.prototype.toString.call(depArgs) !== '[object Array]') throw new Error("useEffect's second param must be an array")
        // 有依赖时，只在挂载时，依赖变更时调用
        const preDepArgs = preDepArgs[effectIndex]
        // preDepArgs 不存在，说明是第一次调用，那就直接调用 callback
        // 空数组也会在这里命中
        const hasChanged = preDepArgs ? preDepArgs.every((value, index) => value === depArgs[index] )  : true;
        // 依赖改变时，调用 callback
        hasChanged && callback()
        // 同步依赖
        preDepArgs[effectIndex] = depArgs
        effectIndex++
    }
}
