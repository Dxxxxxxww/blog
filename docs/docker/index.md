## docker 拥有一个自己的 github

docker run -it -p80:80 --name=gitlab gitlab/gitlab-ce

## mysql

Docker

建立 docker mysql 容器
// 这个命令你开启 docker 之后执行一下，直接就能启动一个 mysql 了
// 他自动帮你下载一个安装好的镜像了
docker run -it -p 3306:3306 -e MYSQL_ROOT_PASSWORD=123456 --name=mysql mysql:8

-e 是 ENVIROMENT 给 docker 指定一个环境 变量，这个变量就是给 MYSQL 添加一个初始化密码 123456
-p 端口
—name 起名字
-it 分配一个 TTY 终端设备就是执行完之后你可以进入 docker 内部执行命令

下次启动 docker 的话，你要执行 docker restart mysql 用来重启数据库

docker exec -it mysql /bin/bash
mysql -uroot -p123456
执行了之后你就可以进去 mysql 的容器里了

### 修改数据库时间

进入数据库后，执行 show variables like'%time_zone'; 可查看当前数据库时区。

set time_zone='+08:00'; 可将时区改为北京时间。

### 退出容器

control + p + q

msyql 所在的 linux 的操作系统中

docker stop mysql

docker rm mysql

## 修改容器时间方法 2

复制宿主机上的 zoneinfo 文件夹到容器下的/usr/share/

```shell
docker cp /usr/share/zoneinfo [容器 id] : /usr/share/
```

进入容器内部

```shell
docker exec -it [容器id] bash
```

ln -s 源文件 目标文件: 为某一个文件在另外一个位置建立一个同不的链接

```shell
ln -sf /usr/share/zoneinfo/Asia/Shanghai  /etc/localtime
```

设置时区

```shell
echo "Asia/Shanghai" > /etc/timezone
```

输入查询是否修改成功

```shell
date
```
