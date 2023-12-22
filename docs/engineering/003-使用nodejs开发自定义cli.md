# 使用 nodejs 开发自定义 cli

## 脚手架工作过程

1. 通过命令行交互询问用户；
2. 根据用户回答结果生成文件。

## 步骤

1. npm init，并在 package.json 中增加 <code>"bin": "cli.js"</code>；
2. 根目录下创建 cli.js 文件，这里可以增加测试代码；
3. npm link 到全局，这时候在命令行工具中可以测试 cli 是否可以成功执行；
4. 安装 inquirer 模块来询问用户；
5. 根据模板来生成项目文件，在根目录下创建 templates 文件夹；
6. 明确模板目录与目标目录；
7. 通过 fs 读取文件将模板文件输出到目标目录；
8. 通过模板引擎(这里使用 ejs，比如 vue 使用的 mustache，其他的还有 handlebar 等等)渲染路径所对应的文件；

```js
#!/usr/bin/env node

// node cli 应用入口文件必须要有这样的文件头
// 如果是 linux/macos 需要修改文件的读写权限为755 => chmod -R 777

// 脚手架工作过程
// 1. 通过命令行交互询问用户；
// 2. 根据用户回答结果生成文件。

const inquirer = require("inquirer");
const path = require("path");
const fs = require("fs");
const ejs = require("ejs");
const { ifError } = require("assert");

// 发起询问的方法, 参数就是发起的问题
inquirer
    .prompt([
        {
            type: "input", // 输入方式
            name: "name", // 问题返回值的 key
            message: "Project name?" // 问题
        }
    ]) // 通过 then 来获取答案
    .then(anwsers => {
        // console.log(anwsers); // 输入1，输出 { name: '1' }
        // 获得模板目录
        const temDir = path.join(__dirname, "templates");
        // 目标目录，也就是当前工作目录
        // cwd 也即 current working directory
        const destDir = process.cwd();
        // 通过 fs 读取文件将模板文件输出到目标目录
        // readdir 会扫描给定目录下的所有文件，通过 files 可以拿到所有文件列表
        fs.readdir(temDir, (err, files) => {
            if (err) throw err;
            files.forEach(file => {
                // console.log(file); // 每个 file 就是相对于 temDir 的相对路径
                // 通过模板引擎渲染路径所对应的文件
                // renderFile 渲染绝对路径所对应的文件
                ejs.renderFile(path.join(temDir, file), anwsers, (err, res) => {
                    if (err) throw err;
                    // console.log(res);
                    // 将结果写入绝对路径
                    fs.writeFileSync((destDir, file), res);
                });
            });
        });
    });
```
