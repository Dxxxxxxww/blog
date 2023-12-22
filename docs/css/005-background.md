# background

## 一、原来还可以这样呀

```css
.background {
  background-repeat: no-repeat;
  // 该属性决定图片是否跟随滑动，此处设置为不跟随
  background-attachment: fixed;
  // 两个图片的属性可以放在一起
  background-position: left bottom, right bottom;
  background-size: calc(((100vw - 40rem) / 2) - 3.2rem), calc(
      ((100vw - 40rem) / 2) - 3.2rem
    ), cover;
  background-image: url('xxx/left'), url('xxx/right');
}
```

## backgroundColor background-color

backgroundColor 在 boder 的位置，会被 border-color 覆盖，如果 UI 给你 色值有透明色，这 2 个会重叠。
