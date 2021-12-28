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
