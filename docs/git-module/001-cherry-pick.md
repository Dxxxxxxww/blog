# cherry pick

git cherry-pick 可以理解为”挑拣”提交，它会获取某一个分支的单笔提交，并作为一个新的提交引入到你当前分支上。当我们需要在本地合入其他分支的提交时，如果我们不想对整个分支进行合并，而是只想将某一次提交合入到本地当前分支上，那么就要使用 git cherry-pick 了

## ◆ 使用方式
1. 到开发分支上 git log
2. 拿到最近提交的信息中的 hash串
```js
commit 0f55d50e1e68d719c51f4ec0eda6963e457248d9 (HEAD -> dev_dxw_0609_pda_d1_0507, origin/dev_dxw_0609_pda_d1_0507)
Author: Dxxxxxxww <gotu2018@163.com>
Date:   Wed Jun 9 17:27:05 2021 +0800

    feat: 修改注释 by dxw
```
3. 到线上分支 git cherry pick  0f55d50e1e68d719c51f4ec0eda6963e457248d9