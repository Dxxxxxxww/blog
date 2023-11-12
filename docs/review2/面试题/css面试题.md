# css 面试题

## 说一说盒子模型

盒子模型是 `css` 描述 `html` 元素的基本单位。主要由 `margin`, `border`, `padding`, `content` 组成。

盒子模型分类两类：标准盒模型，`IE` 盒模型。

主要区别就是在设置 `width` 和 `height`时，标准盒模型设置的是内容宽高，`IE` 盒模型设置的是总宽高。

## 说一说 BFC

`BFC` 块级格式化上下文，是 `web` 页面中盒模型的 `css` 渲染模式，指一个独立的渲染区域或一个隔离的容器。

`BFC` 形成条件：

- 浮动，`float` 除 `none` 以外的值
- 定位，`position（absolute，fixed）`
- `display flex inline-flex inline-block table-cell table-caption`
- `overflow` 除 `visible` 以外的值`（hidden，auto，scroll）`

`BFC` 特性：

- 内部的盒子会在垂直方向上一个接一个放置
- 不同 `BFC` 外边距不会折叠
- `BFC` 区域不会与 `float` 区域重叠。（防止浮动文字环绕）
- 计算 `BFC` 高度时，浮动元素也参与计算。（`BFC` 可以清除浮动）
- `BFC` 是一个独立的容器，容器内元素不会影响到外面元素

## 元素上下左右居中的方法

已知宽高：

- 父元素 `relative`，子元素 `absolute`。设置子元素 `left/top/bottom/right：0；margin：auto`
- 父元素 `relative`，子元素 `absolute`。设置子元素的 `left/top：50%；margin：-[子元素半高] 0 0 -[子元素半宽]`

未知宽高：

- 父元素 `relative`，子元素 `absolute`。设置子元素的 `left/top：50%；transform：translate(-50%，-50%)`
- `display flex`

## 说一说 flex，flex 1，flex auto

flex 由以下三个部分组成：

1. flex-grow：默认为 0，即 即使存在剩余空间，也不会放大。为 n 则是 1 的 n 倍放大。
2. flex-shrink：默认为 1，即 如果空间不足，该项目将缩小 为 0 不缩小。为 n，则是 1 的倍数。
3. flex-basis: 定义在分配多余空间之前，项目占据的主轴空间（main size），浏览器根据此属性计算主轴是否有多余空间。默认值为 auto，即 项目原本大小。如果要设置，这个值一定要带单位

flex 1 表示 flex-grow 为 1，flex-shrink 为 1 flex-basis 为 0

flex auto 表示 1 1 auto

[link](https://developer.mozilla.org/en-US/docs/Web/CSS/flex#formal_definition)

```css
/* Keyword values */
flex: auto;
flex: initial;
flex: none;

/* One value, unitless number: flex-grow
flex-basis is then equal to 0. */
flex: 2;

/* One value, width/height: flex-basis */
flex: 10em;
flex: 30%;
flex: min-content;

/* Two values: flex-grow | flex-basis */
flex: 1 30px;

/* Two values: flex-grow | flex-shrink */
flex: 2 2;

/* Three values: flex-grow | flex-shrink | flex-basis */
flex: 2 2 10%;
```

### 容器宽度 1000px 5 个子项每个 300px，要保持子项不收缩怎么设置

设置子项 `flex: 1 0 auto`

## margin-top: -10px margin-bottom: -20px 会怎么展示

margin-top 使元素向上偏移， margin-bottom 使下面的元素向上偏移
