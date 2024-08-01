# git 集合

## 通过 commit hash 来查找分支

```git
git branch --contains 21c8eb3a7d412f191e0764065cd71d6704ff1572
```

## 格式化 git log 时间

git config --global log.date iso8601

## git clone

```bash
git clone --depth=1 --single-branch git@github.com:ant-design/ant-design.git
```

下载的时候加个 --single-branch 是下载单个分支， --depth=1 是下载单个 commit， 这样速度会快几十倍，是个有用的加速小技巧。
