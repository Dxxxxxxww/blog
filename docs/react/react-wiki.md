---
sidebar: auto
---

# React 纠错本

React 使用的错误/踩坑记录

## React.memo 使用踩坑记录

在 react 上如果同时做组件的静态属性赋值及 memo 的话，要注意先后顺序。

这样使用会报错：
![image](/react/memo-error.png)
这样不会：
![image](/react/memo-success.png)

查看源码可知，memo 包裹后会返回新生成的对象，所以在 memo 之前做的所有操作都没用了。因为组件会作为新对象的属性，层级改变导致获取不到了。

```js
// ReactMemo.js
import { REACT_MEMO_TYPE } from 'shared/ReactSymbols'

import isValidElementType from 'shared/isValidElementType'

export function memo<Props>(
  type: React$ElementType,
  compare?: (oldProps: Props, newProps: Props) => boolean
) {
  if (__DEV__) {
    if (!isValidElementType(type)) {
      console.error(
        'memo: The first argument must be a component. Instead ' +
          'received: %s',
        type === null ? 'null' : typeof type
      )
    }
  }
  // 这里新建了对象
  const elementType = {
    $$typeof: REACT_MEMO_TYPE,
    // 将组件作为属性传入
    type,
    compare: compare === undefined ? null : compare
  }
  if (__DEV__) {
    let ownName
    Object.defineProperty(elementType, 'displayName', {
      enumerable: false,
      configurable: true,
      get: function () {
        return ownName
      },
      set: function (name) {
        ownName = name

        // The inner component shouldn't inherit this display name in most cases,
        // because the component may be used elsewhere.
        // But it's nice for anonymous functions to inherit the name,
        // so that our component-stack generation logic will display their frames.
        // An anonymous function generally suggests a pattern like:
        //   React.memo((props) => {...});
        // This kind of inner function is not used elsewhere so the side effect is okay.
        if (!type.name && !type.displayName) {
          type.displayName = name
        }
      }
    })
  }
  return elementType
}
```

## 受控与非受控组件

非受控组件：表单数据都是交由 dom 元素自身去管理的。特点是数据在需要时获取（不像 state 一样随时可以获取）。

```jsx
function App() {
  const userInput = useRef()
  function handleSubmit() {
    // 值是从 input 标签中获取的
    const username = userInput.current.value
  }
  return (
    <form onSubmit={handleSubmit}>
      <input type="text" ref={userInput} />
      <input type="submit" />
    </form>
  )
}
```

受控组件：表单数据交由 state 管理。特点是数据可以实时获取。

```jsx
function App() {
  // state 可以随时获取
  const [state, setState] = useState(initState)
  return (
    <form>
      <input value={state} onChange={setState} />
    </form>
  )
}
```

![image](/react/shoukong-feishoukong.png)

## 为什么使用 css in js

css 缺点：

1. 由于不支持嵌套、选择器繁琐冗长，导致写起来费时费力。
2. 层级结构不够清晰，难以区分它们之间的从属关系，是父子还是兄弟？
3. 随着项目迭代，且缺乏检查机制，后期维护困难。
4. "没有作用域概念，致使样式容易冲突、“为了避免命名污染，代码难以复用”、“缺少共用变量，无法定义全局的背景颜色、按钮颜色"等等。

---

1. 一个 react 组件中，封装了 html 结构、css 样式和 js 逻辑，这有利于组件的隔离。
2. 解决 css 的局限性：
   1. 缺乏动态功能，动态增减样式，用 js 变量控制;
   2. 作用域（用 js 的作用域来模拟 css 作用域，让 css 只用于组件内部）;
   3. 可移植性（组件文件方便迁移，不怕会有 css 文件少引入或者漏引入，以前使用 link 的方式引入可能会有缺漏的情况），但是我们现在写，还是会把 css 独立出来。

css in js 优点：上面解决局限性的 3 点。

缺点：

1. 给项目增加额外的复杂性；
2. 自动生成的选择器降低了代码的可读性。

## react 登录态

![image](/react/react-login-1.jpg)
![image](/react/react-login-2.jpg)

## umi 是什么，可以理解为加强版的 element-admin 吗？

umi 类似于 next。跟 vue-cli 不一样的，umi 的东西更多。你要对比，就跟 next 对比吧，跟 vue-cli 没啥比的。他把开发流程都给规范了，怎么请求 怎么写 router，都给包装好了。

## ssr 与 csr

csr 存在的问题：

1. 首屏等待时间长，用户需要等待浏览器发起 html 的请求，等待 css， js 文件的下载，最后在 c 端合成页面进行展示
2. 页面结构为空，不利于 seo

## immer 和 immutable

结论：immer 使用方便。 immutable 在大对象上性能好。

immer 是使用 proxy 代理，自动做了创建新对象。

immutable 内部实现了 Map，Set 数据结构，在变更时会对没有变更的节点进行复用。

### 类组件和函数组件 setState 触发重新渲染对比

1. 普通类组件只要使用 setState 就会触发重新渲染。
2. 继承了 PureComponent 的类组件，会依次按照如下标准判断。
   - 变更前后对象本身是否相等
   - 对象 key 数量是否相等
   - 对象每个 value 是否相等
3. 函数组件只会判断变更前后的对象是否相等，不会深入判断每个 key value。

所以普通类组件可以不返回新对象。PureComponent 和 函数组件必须返回新对象。但是为了保持写法统一，还是建议普通类组件也返回新对象。

究其原因就是，类组件的状态都是在实例上的同一个对象中声明的，所以还需要深入对象判断 key 和 value。

而函数组件的状态都是使用单个 useState 单独声明的，所以只需要判断其对象本身是否相等。
