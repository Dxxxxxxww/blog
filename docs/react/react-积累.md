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
import { REACT_MEMO_TYPE } from "shared/ReactSymbols";

import isValidElementType from "shared/isValidElementType";

export function memo<Props>(
    type: React$ElementType,
    compare?: (oldProps: Props, newProps: Props) => boolean
) {
    if (__DEV__) {
        if (!isValidElementType(type)) {
            console.error(
                "memo: The first argument must be a component. Instead " +
                    "received: %s",
                type === null ? "null" : typeof type
            );
        }
    }
    // 这里新建了对象
    const elementType = {
        $$typeof: REACT_MEMO_TYPE,
        // 将组件作为属性传入
        type,
        compare: compare === undefined ? null : compare
    };
    if (__DEV__) {
        let ownName;
        Object.defineProperty(elementType, "displayName", {
            enumerable: false,
            configurable: true,
            get: function() {
                return ownName;
            },
            set: function(name) {
                ownName = name;

                // The inner component shouldn't inherit this display name in most cases,
                // because the component may be used elsewhere.
                // But it's nice for anonymous functions to inherit the name,
                // so that our component-stack generation logic will display their frames.
                // An anonymous function generally suggests a pattern like:
                //   React.memo((props) => {...});
                // This kind of inner function is not used elsewhere so the side effect is okay.
                if (!type.name && !type.displayName) {
                    type.displayName = name;
                }
            }
        });
    }
    return elementType;
}
```
