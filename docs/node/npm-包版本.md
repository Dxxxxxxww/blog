# npm 包版本相关

## 查看 npm 版本

```shell
npm -v
```

## 统一项目以及第三方包中某个依赖的版本

在 package.json 文件中添加 overrides 字段。这样就能锁死项目和第三方库的依赖版本。yarn 使用 resolutions 字段。npm 使用 overrides 字段。

```json
{
  "dependencies": {
    "@cubejs-backend/prestodb-driver": "^0.29.25"
  },
  "overrides": {
    "@cubejs-backend/query-orchestrator": "0.29.7"
  }
}
```
