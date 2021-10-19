# el-input

查看 el-input 源码发现，el-input 是通过使用层传递的 value 直接设置 input dom value。

```js
setNativeInputValue() {
    const input = this.getInput();
    if (!input) return;
    if (input.value === this.nativeInputValue) return;
    input.value = this.nativeInputValue;
},
```

并且通过 \$emit('input') 来触发使用层的变量更新。

```js
handleInput(event) {
    // should not emit input during composition
    // see: https://github.com/ElemeFE/element/issues/10516
    if (this.isComposing) return;

    // hack for https://github.com/ElemeFE/element/issues/8548
    // should remove the following line when we don't support IE
    if (event.target.value === this.nativeInputValue) return;

    this.$emit('input', event.target.value);

    // ensure native input value is controlled
    // see: https://github.com/ElemeFE/element/issues/12850
    this.$nextTick(this.setNativeInputValue);
},
```

而且，el-input 组件内部并没有定义 model props，而是使用 model 默认值支持使用层的 v-model 操作。

从官网可知，“一个组件上的 v-model 默认会利用名为 value 的 prop 和名为 input 的事件。”
