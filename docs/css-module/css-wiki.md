# 收集一些 css 用法

## 文字颜色反色

[文字颜色反色](https://www.zhangxinxu.com/study/201904/css-filter-blend/difference.php)

## padding

padding-top 是根据父元素 content-box 计算的。（父元素的内容宽度）

背景色/图 是根据父元素 border-box 计算的。（父元素的内容宽度+padding+border）

这里的盒子模型说的是有没有包括 padding 和 border。跟改变盒子模型无关。

典型用法就是：

```css
.bg-img {
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 70%;
  background-size: cover;
  /* transform-origin: top; */
}
```
