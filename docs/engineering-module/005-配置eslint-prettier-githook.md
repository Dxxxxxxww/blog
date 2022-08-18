# 配置 eslint，prettier，githook

配置在 git 提交时自动格式化

## 配置

**推荐使用这种配置。**

[prettier](https://www.prettier.cn/docs//install.html)

[prettier pre-commit Hook](https://www.prettier.cn/docs/precommit.html)

1.安装 prettier；

```js
npm install --save-dev --save-exact prettier
```

2.创建 prettier 配置文件；

```js
// 在控制台
echo {}> .prettierrc.json
```

3.创建 prettier 忽略文件，并增加忽略文件目录；

```js
// .prettierignore

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
npx mrm@2 lint-staged
``` 

5. 在 package.json 文件中增加 lint-staged 配置

```js
// 这个配置会自动帮我们生成，但是如果想要增加一些文件的话可以在这里自定义
lint-staged: {
    "*.{js,jsx,css,md,ts,tsx}": [
        "prettier --write",
        "eslint --fix --catch", // --catch 会缓存文件记录，后续只针对有变更的文件执行cli
    ]
}
```

6. 将 .husky 文件夹添加到 git 提交中

7. 添加 eslint 的 prettier 插件

```js
npm i eslint-config-prettier -D

在 eslintConfig 中增加 prettier 的规则

// package.json 文件
eslintConfig: {
    "extends": {
        "react-app",
        "react-app/jest",
        "prettier"
    }
}
```

以上步骤已经完成在 git 操作时，自动格式化。

---

这里操作开始是配置 git 提交规范。

8. github 中搜索 commitlint，根据 commitlint 文档安装；

```js
// config-conventional 是一种 git 规则
npm install --save-dev @commitlint/config-conventional @commitlint/cli
```

7. 添加 commitlint 配置文件；

```js
// 在控制台
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
// 在控制台
npx husky add .husky/commit-msg 'npx --no-install commitlint --edit "$1"'
// npx husky add .husky/commit-msg 'yarn commitlint --edit $1'
// 这行命令执行完，会在 .husky 文件夹下生成一个 commit-msg 文件
```

10. 详细提交规则可在 commitlint 文档中 Shared configuration 中的 @commitlint/config-conventional 查看。

---

至此，大功告成！

## 第二种

1. 添加 husky

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

2. 在 package.json 文件中添加 husky 配置

```js
script: {
    precommit: "lint-staged"
},
"husky": {
    "hooks": {
        "pre-commit": "npm run precommit"
    }
}
```

3. 安装 lint-staged

```js
npm i lint-staged -D
```

4. 在 package.json 文件中添加 lint-staged 配置

```js
script: {
    precommit: "lint-staged"
},
"husky": {
    "hooks": {
        "pre-commit": "npm run precommit"
    }
}
lint-staged: {
    "*.js": [
        "eslint",
        "git add"
    ]
}
```

## gulp + eslint

也可以在 gulp 中检测 js 文件，使用 gulp 对应的 eslint 插件自动化的去检测 js 文件。需要注意的是，eslint 插件一定要在 babel 插件之前运行，否则 bebal 会改变代码，eslint 就检测不了源代码。

## webpack + eslint

可以使用 eslint-loader 对 js 文件进行检查。也需要在 babel 之前使用。这里介绍另一种在 babel-loader 之前使用的方式

```js
rules: [
  {
    test: /\.js$/,
    use: 'babel-loader'
  },
  {
    test: /\.js$/,
    use: 'eslint-loader',
    enfore: 'pre'
  }
]
```

### webpack + eslint + react

eslint 配置 react 需要有额外的一些操作

```js
// 第一种
// .eslintrc.js

rules: {
    'react/jsx-uses-react': 2, // 'error' 配置对 import React from 'react' 不报 React 未使用的错误
    'react/jsx-uses-vars': 2, // 'error' 配置对导入组件在 jsx 中使用了，却依然提示导入的组件未使用的错误
},
plugins: [
    'react'
]
```

```js
// 第二种
extends: [
    'plugin:react/recommended'
]
```
