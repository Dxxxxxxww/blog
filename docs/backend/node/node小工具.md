# node 上的一些小工具

## tsx esno ts-node

在以前，nodejs 中想要跑 ts 都要使用 ts-node。现在 ts-node 已经落后了。

现在可以使用 tsx 或者 esno。都是基于 esbuild 的。

[tsx 简介](https://github.com/esbuild-kit/tsx)：

    TypeScript Execute (tsx): Node.js enhanced to run TypeScript & ESM files

[esno 简介](https://github.com/esbuild-kit/esno)：

    Node.js runtime enhanced with esbuild for loading TypeScript & ESM. 

    From v0.15, esno is essentially an alias of tsx, with automated CJS/ESM mode and caching.

esno tsx 的简化配置版。

以后 node 端，js 就用 node。ts 就用 tsx。

## tsup

[tsup 简介](https://github.com/egoist/tsup)：

    Bundle your TypeScript library with no config, powered by esbuild.

翻译一下，就是一个不需要配置的使用 esbuild 的 ts 打包工具。现阶段的搭配似乎是 用tsx 执行，tsup 打包。
