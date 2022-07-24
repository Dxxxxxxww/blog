# nginx 报错整理

```shell
nginx: [emerg] host not found in upstream "localhost" in /usr/local/etc/nginx/servers/pda.conf:10
```

问题描述，当前系统无法解析 upstream 后面跟着的域名，也就是 localhost。所以只需要在 hosts 文件中加上这个域名解析就行了。

```shell
code /etc/hosts

127.0.0.1 localhost
```

chrome inspect ==》 source map

## cookies 安全相关

secure，不限制 localhost，也就是说 localhost 下测试不出来，只能是网址。所以可以修改 host 来测试。指只有 https 才会发送 cookies
httponly，设置为 ture 的时候，浏览器会自动带上。
samesite

## node 框架中使用 typescript

1. ts-node
2. ts-node-register esbuild-register @babel/register 这些插件的原理就是去重写 model.\_load。node 模块原理。
