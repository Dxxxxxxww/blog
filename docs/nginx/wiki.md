# nginx 报错整理

```shell
nginx: [emerg] host not found in upstream "localhost" in /usr/local/etc/nginx/servers/pda.conf:10
```

问题描述，当前系统无法解析 upstream 后面跟着的域名，也就是 localhost。所以只需要在 hosts 文件中加上这个域名解析就行了。

```shell
code /etc/hosts

127.0.0.1 localhost
```
