# 踩坑记录

这里是新开的踩坑合集

## husky & lint-staged

在 `nodev18.16.0` 版本下使用安装 `husky & lint-staged` 时，执行 `pnpx mrm@2 lint-staged` 命令时，会报一个错误：

```shell
Installing lint-staged and husky...
npm ERR! Cannot read properties of null (reading 'matches')

npm ERR! A complete log of this run can be found in:
npm ERR!     C:\Users\38213\AppData\Local\npm-cache\_logs\2023-07-10T11_27_38_579Z-debug-0.log
husky - Git hooks installed
husky - updated .husky/pre-commit
```

没找到相关资料，于是直接分开安装 `husky & lint-staged`

```shell
pnpm add husky -D

pnpm add lint-staged -D
```

接着在 `package.json` 中记得配置

```json
// package.json
{
  "scripts": {
    "lint": "eslint ./src/**/*.{js,ts,jsx,tsx,vue} --fix"
  },
  "dependencies": {},
  "devDependencies": {},
  "lint-staged": {
    "*.{js,jsx,ts,tsx,vue}": ["npm run lint", "git add"]
  }
}
```
