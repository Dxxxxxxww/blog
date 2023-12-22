# vant按钮细边框原理

## 一、疑问
vant 是如何做到按钮的边框小于 1px 的？

## 二、结论
先说结论，vant 是通过 2倍大小的 css伪元素 再通过缩放来达到效果的

## 三、代码

```html
<button class="van-button van-button--primary van-button--normal van-button--plain van-button--hairline van-hairline--surround">
  ::before
  <div class="van-button__content">
    <span class="van-button__text">细边框按钮</span>
  </div>
  ::after
</button>
```

```css
.van-button {
  position: relative;
  display: inline-block;
  box-sizing: border-box;
  height: 44px;
  margin: 0;
  padding: 0;
  font-size: 16px;
  line-height: 1.2;
  text-align: center;
  border-radius: 2px;
  cursor: pointer;
  -webkit-transition: opacity 0.2s;
  transition: opacity 0.2s;
  -webkit-appearance: none;
}
/* 按钮本身的 border */
.van-button--primary {
  color: #fff;
  background-color: #07c160;
  border: 1px solid #07c160;
}

/* 伪元素的 border */
.van-button--hairline::after {
  /* 继承 button 的边框颜色 */
  border-color: inherit;
  border-radius: 4px;
}
.van-hairline--surround::after {
  /* 设置边框宽度，这里放在下面一起设置也是可以的 */
  border-width: 1px;
}

[class*='van-hairline']::after {
  position: absolute;
  box-sizing: border-box;
  content: ' ';
  pointer-events: none;
  /* 这里通过定位来放大元素宽高 */
  top: -50%;
  right: -50%;
  bottom: -50%;
  left: -50%;
  border: 0 solid #ebedf0;
  /* 再缩放回去 */
  -webkit-transform: scale(0.5);
  transform: scale(0.5);
}
```