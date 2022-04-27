# Vue3.x

## 与 2.x 对比改变了哪些？
1. 性能；
   1. 使用 proxy 重写了响应式的代码；
   2. 对编译器做了优化；
   3. 重写了 virtual dom，让 render 和 update 的性能有了大幅提升；
   4. 服务端渲染的性能也提升了2-3倍。
2. 源码组织方式改变，使用 ts 重写，采用 [monorepo](https://wangtunan.github.io/blog/vueNextAnalysis/monorepo/) 管理项目结构；
3. composition ap；
4. vite。

