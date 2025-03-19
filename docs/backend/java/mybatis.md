## jdbc 链接

jdbc 链接的最后一个 /xx 指的是库名，需要指定正确，否则在 mapper.xml 中就需要对每一个数据语句加上库名限制。

例如：jdbc:mysql://localhost:2333/kuming

这里的 /kuming 就是指定的数据库名称

## xml 标签

在 <resultMap> 标签中，有两种标签：

1. id
2. result

简单理解为，id 用于主键列，result 用于普通列

## mysql

mysql 8 的驱动强制设置时区，需要在 datasource.url 中配置 serverTimezone
