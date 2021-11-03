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

HOC 可以当做是 vue 中的作用域 slot。

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

Render props 可以当做是 vue 中的作用域 slot。

这种模式把 children(其他属性也可以) 当做函数来传递和执行，状态通过参数传递，然后返回一个组件。经典案例就是 react-router。

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

优点：

1. 便于提取逻辑；
2. 易于组合；
3. 可读性强；
4. 没有名字冲突问题。

缺点：

1. hook 自身使用限制，只能在 组件顶层/hook 中使用；
2. 原理为闭包，内存开销会大。少数情况下会出现难以理解的问题(无限渲染)。
