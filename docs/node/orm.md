# node orm 的选择

orm：Object Relational Mapping, 对象关系映射。

如果项目单纯使用 js，推荐使用 sequelize，适配主流数据库，各种查询模式相对稳定，主流开源 node + js 框架（例如：egg）的数据库默认 orm 框架。

如果项目还使用了 ts，推荐使用 typeorm，同样适配主流数据库，另外有更好的类型推导，主流开源 node + ts 框架（例如：midway）的数据库默认 orm 框架。

可以关注下 prisma，相比 typeorm，类型推导上更加出色（属性查询的实体等），简洁的实体声明语法（语法高亮提示用 vscode 插件），还免费带有 可视化桌面端应用，整个生态相对比较完备。

作者：李家良
链接：<https://www.zhihu.com/question/491654284/answer/2164593430>
来源：知乎
著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。
