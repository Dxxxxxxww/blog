function render() {
    stateIndex = 0
    return ReactDom.render(<App/>, document.getElementById('root'))
}

const states = []
const setStates = []
// 多次调用 useState 时的标志位
let stateIndex = 0
// 要让一个函数保存状态就需要用闭包
function createState(index) {
    return function setState(newValue) {
        states[index] = newValue
        render()
    }
}

// 第二版，可以重复使用 useState
function useState(initialize) {
    // state, setState 都需要有坐标对应，否则不能拿到正确的值和方法
    states[stateIndex] = states[stateIndex] || initialize
    // setStates 不需要跟 state 一样跟 stateIndex 一一对应，毕竟 setStates 闭包中已经保存了 stateIndex
    // setStates.push(createState(stateIndex))
    setStates[stateIndex] = createState(stateIndex)
    const state = states[stateIndex]
    const setState = setStates[stateIndex]
    stateIndex++
    return [state, setState]
}


// 第一版
// function useState(initialize) {
//     let state = initialize
//     function setState(newValue) {
//         state = newValue
//         render()
//     }
//     return [state, setState]
// }
