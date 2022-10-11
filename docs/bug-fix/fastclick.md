# fastClick 的 bug

```js
// 从 chrome 33 版本开始,
// chrome 浏览器只支持获取 type 为 text, search, URL, tel and password
// 的 input 元素的 selectionStart, selectionEnd 和 setSelectionRange 属性,
// 在其余类型中尝试获取这些属性 chrome 会提示错误。
FastClick.prototype.focus = function (targetElement) {
  let length
  if (
    targetElement.setSelectionRange &&
    targetElement.type.indexOf('date') !== 0 &&
    targetElement.type !== 'time' &&
    targetElement.type !== 'month' &&
    targetElement.type !== 'number'
  ) {
    length = targetElement.value.length
    targetElement.focus()
    targetElement.setSelectionRange(length, length)
  } else {
    targetElement.focus()
  }
}
FastClick.attach(document.body)
```
