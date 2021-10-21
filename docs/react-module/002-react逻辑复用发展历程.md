# react 逻辑复用发展历程

React 团队从一开始就很注重 React 的代码复用性。

他们对代码复用性的解决方案历经：Mixin, HOC, Render Prop，直到现在的 Custom Hook。

## mixin

使用过 vue 的人都会知道 mixin，它作为一种现在不被推荐的逻辑复用的方式有着以下几种缺点：

1. 命名冲突，不同的 mixin 之间可能存在相同命名的数据/函数；
2. 隐式依赖，不同 mixin 之间可能存在相互依赖的关系，这使得使用者必须得查看 mixin 源码才能了解；
3. 难以维护。

而它的优点只有逻辑可复用这一点，明显的弊大于利。

## HOC

HOC 采用了装饰器模式来复用代码。经典案例就是 redux 中的 connect。

优点：

1. 逻辑复用；
2. 关注点分离，逻辑(数据)与渲染分开。

缺点：

1. 嵌套层过多；
2. 不直观，难以阅读。

高阶组件其实就是声明两个组件，一个是专门处理数据的(A)，一个是负责渲染不管数据从哪来的(B)。

A 会接受一个组件作为参数，在 render 渲染它，同时会将数据通过 props 的方式传递给 B。

```js
class A {
    constructor(Base) {
        // 数据处理
    }
    componentDidMount() {
        // 数据处理
    }
    render() {
        return <Base {...this.props} {...this.state} />;
    }
}

class B {
    constructor() {}
    render() {
        return <div>{this.props.xxx}</div>;
    }
}

A(B);
```

## Render props

这种模式就可以理解为 vue 的 slot。还是一个专门处理数据的(A)，只不过渲染组件(B)是以函数的形式((state) => B)，传给 A 组件的 children。然后在 A 组件的 render 中调用该函数。经典案例就是 react-router。

优点：

1. 逻辑复用；
2. 灵活。

缺点：

1. 不直观，难以阅读，难以理解。

```js
class A {
    constructor() {
        // 数据处理
    }
    componentDidMount() {
        // 数据处理
    }
    render() {
        return this.props.children(this.state);
    }
}

const B = () => {
    return <A>{value => <div> value from A is {value}</div>}</A>;
};

function SplitPane(props) {
    return (
        <div className="SplitPane">
            <div className="SplitPane-left">{props.left}</div>
            <div className="SplitPane-right">{props.right}</div>
        </div>
    );
}

function App() {
    const state = "abc";
    return (
        <SplitPane
            left={<Contacts stateA={state} />}
            right={<Chat stateA={state} />}
        />
    );
}
```

## hook

可以有自己状态的函数组件(以前的函数组件是不能有自己的状态)。目前最佳的解决方案。它的原理就是闭包。
