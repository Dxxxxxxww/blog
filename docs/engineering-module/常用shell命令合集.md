# 常用 shell 命令合集

## 查看环境变量

echo \$path

然后就可以 cd 返回的 环境变量

然后 ls 查看文件

![image](/engineering/whereis.png)

## 新增环境变量

vi ~/.bash_profile

code ~/.bash_profile

然后编写 export software_home = '' export path=$path:$software_home/bin

## 查找文件位置

whereis xxx

---

[全局 npm 包环境变量](https://www.jianshu.com/p/64c175476acc?utm_source=gold_browser_extension)

## zsh: command not found: 解决方法

open ~/.zshrc

source ~/.bash_profile

source ~/.zshrc    
