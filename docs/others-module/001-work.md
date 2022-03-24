# 工作中遇到的问题记录

## 关于 cordova 热更新的问题

第一次在 A 环境上的代码，build 时误用了 B 环境的方式后部署。第二次在 B 环境上更新了代码，正常 build B 环境部署。会影响到在 A 环境上的用户更新到了 B 环境的代码。

### cordova 热更新

[chcp.json](https://www.cnblogs.com/sunylat/p/9896938.html)

cordova 项目打包后会在包下生成一个 chcp.json 的文件，

```js
{
    "update": "start",
    "content_url": "https://xx.xx.xx/www",
    "release": "2021.12.07-15.02.29"
}
```

软件热更新会通过这个文件里的域名去找对应的文件。而不是直接使用包里的文件。这就是为什么上面的问题中 A 环境会被 B 环境的代码更新影响，因为在第一次部署后，A 环境中的 chcp.json 文件的 content_url 指向的是 B 环境的代码。所以当 B 环境更新时，A 环境也会去找 B 环境上的最新代码。

### 浏览器环境

如果在浏览器环境下我们打包了一个项目，部署到服务器后，浏览器访问到的直接是包下的资源。

## 配置保存通过 mixin 全局代理问题

由于项目中的用户配置比较杂乱，且嵌套太深，所以想通过使用 mixin 的方式，在一个统一的地方进行命名约定，以及 created 时进行代理，用来解决：1。比较杂乱；2.嵌套太深。两个问题。以下是代码：

```js
import { mapActions } from 'vuex'
import { mapGetters } from 'vuex'

export const configMixin = {
  computed: {
    ...mapGetters(['staffInfo'])
  },
  methods: {
    ...mapActions(['get_staff_info']),
    setStaffInfo(key, params) {
      const staffInfo = this.staffInfo
      staffInfo.extConfig[key] = params
      return this.get_staff_info({ ...staffInfo, type: 1 })
    },
    proxyStaffInfoTarget(key) {
      this[key + 'Mixin'] = this.staffInfo.extConfig[key]
    }
  }
}
```

然而后续发现，以这种方式进行代理，this.xxMixin 是不具备响应式的，当我们配置保存后，vuex 的数据更新，this.xxMixin 不会自动更新。并且如果在组件中，在 computed 中使用 this.xxMixin.xx 的话，会在组件初始化时报错（不能从 undefined 上获取 xx）。这是因为 initComputed 执行在 created 之前。所以最后放弃了这种办法。

## 页头组件抽离

由于在每个组件中都需要写页头和配置，太麻烦了，可以将其抽到 router-view 上面，作为一个全局的组件。如果有些页面不需要页头，也可以通过 vuex 来传参进行隐藏。

这里想了两个方法来做：

1. hoc
2. 路由命名视图

为什么不用 hoc？

因为对于 vue 中的 hoc 的话，如果我们不用 jsx 的方式，通过 slots，component 的方式也需要每个组件内部写一个父级的套层。又或者是新起一个页面作为存放套好的 hoc 的地放，这样也挺麻烦，不如用命名视图来的好。

用命名视图来做，标题这些属性可以直接用路由进行匹配，也方便。
