# flex-grid

## 一、使用场景区分

grid 和 flex 各自的使用场景：

1. 要考虑是一维布局(只有横向/纵向)还是二维布局(横纵皆有)  
   一般来说，一维用 flex ，二维用 grid
2. 是从内容出发还是从布局出发？  
   从内容出发：flex。先有一组内容(数量一般不固定)，通过内容自身的
   从布局出发：grid。先规划网格(数量比较固定)，再把元素往里填充
