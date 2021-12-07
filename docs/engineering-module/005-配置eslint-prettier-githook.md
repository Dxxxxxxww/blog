# 配置 eslint，prettier，githook

## 一、配置

[prettier](https://www.prettier.cn/docs//install.html)

[prettier pre-commit Hook](https://www.prettier.cn/docs/precommit.html)

1.安装 prettier；

```js
npm install --save-dev --save-exact prettier
```

2.创建 prettier 配置文件；

```js
echo {}> .prettierrc.json
```

3.创建 prettier 忽略文件，并增加忽略文件目录；

```js
# Ignore artifacts:
build
coverage
```

4.设置 Git hooks（使用 eslint 的模式）。在 git commit 时自动格式化代码；

```js
npx mrm lint-staged

// 如果有以下报错：
// npx mrm lint-staged
// npx: installed 298 in 9.141s
// Preset “default” not found.
// We’ve tried to load “mrm-preset-default” and “default” npm packages.

// 解决方案：
// The problem is within mrm which is currently in version 3 that seems to be incompatible with lint-staged, to fix this you got to specify mrm version 2 by running npx mrm@2 lint-staged
```

5. github 中搜索 commitlint；
6. 根据 commitlint 文档安装；

```js
npm install --save-dev @commitlint/config-conventional @commitlint/cli
```

7. 添加 commitlint 配置文件；

```js
echo "module.exports = {extends: ['@commitlint/config-conventional']}" > commitlint.config.js
```

8. 添加 husky（这一步在 mrm lint-staged 安装时附带安装了，所以可以跳过）

```js
# Install Husky v6
npm install husky --save-dev
# or
yarn add husky --dev

# Activate hooks
npx husky install
# or
yarn husky install
```

9. 添加 git commit 钩子，在 git 提交时，确保 commit-msg 是合规的；

```js
npx husky add .husky/commit-msg 'npx --no-install commitlint --edit "$1"'
// npx husky add .husky/commit-msg 'yarn commitlint --edit $1'
```

10. 详细提交规则可在 commitlint 文档中 Shared configuration 中的 @commitlint/config-conventional 查看。

---

至此，大功告成！
