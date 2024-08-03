## refs 使用

react 禁止在一个类组件中使用了函数式组件，并给这个函数式组件设置 ref。因为类组件是有实例，而函数组件没有实例。例如以下代码：


```jsx
// 代码来源冴羽
// 链接：https://juejin.cn/post/7161719602652086308

function Input() {
  return <input value='value' />
}

class App extends React.Component {
    constructor(props) {
        super(props)
        this.inputRef = React.createRef();
    }
    render() {
        return (
            <div>
              // 会报错
              <Input ref={this.inputRef} value='value' />
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
        const {inputRef, ...rest} = this.props;
        // 3. 这里将 props 中的 inputRef 赋给 DOM 元素的 ref
        return <input ref={inputRef} {...rest} placeholder="value" />
    }
}
// 函数组件
function Child(props) {
      const {inputRef, ...rest} = props;
      // 3. 这里将 props 中的 inputRef 赋给 DOM 元素的 ref
      return <input ref={inputRef} {...rest} placeholder="value" />
}

class Parent extends React.Component {
    constructor(props) {
        super(props)
        // 1. 创建 refs
        this.inputRef = React.createRef();
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

### forwardRef 的原理是什么

forwardRef 函数会返回一个对象：

```jsx
var elementType = {
  $$typeof: REACT_FORWARD_REF_TYPE,
  render: render
};
```

对象本身的 `$$typeof` 是 `REACT_FORWARD_REF_TYPE` 类型，`render` 则是我们传入的函数组件。需要注意的是，当这个返回的对象被当做组件渲染时，产生的 vdom 的 `$$typeof` 的类型依然是 `REACT_ELEMENT_TYPE` 类型。因为它依然是走了 React.createElement 函数。

在 `beginWork` 的时候，会将父组件定义在 `forwardRef` 组件上的 `ref` 给转发到 `render` 的第二个参数上。