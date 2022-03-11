#!/usr/bin/env sh

# 确保脚本抛出遇到的错误
set -e

# 生成静态文件
npm run docs:build

# 进入生成的文件夹
cd docs/.vuepress/dist

git init
git add -A
git commit -m 'deploy'

git remote add origin https://github.com/Dxxxxxxww/blog.git
# git push <远程主机名> <本地分支名>:<远程分支名>
git push -f origin main:gh-pages

cd -