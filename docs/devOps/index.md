# 中间件地址

## 统一安装路径

/opt/sunyard/

## 中间件信息

- redis 6.106.6.41 6379
- nacos 6.106.6.41:8848/nacos name:nacos password:nacos
- prometheus 6.106.6.41:9090
- grafana 6.106.6.42:3000 admin admin
- portainer 6.106.6.42:9000 admin admin12345
- harbor 6.106.6.43:80
- jenkins 6.106.6.41:8080 sunyard sunyard
- sentinel 6.106.6.41:8080
- elsticearch 6.106.6.44:9200 9300
- logstash 6.106.6.45
- kibana 6.106.6.44 5601

kibana:前段发，后端处理汇总，logstash 读取 elastatic 存储，kibana 显示

## 三次握手

我是用面试具象化三次握手：
A: 面试者 B: 面试官
1： A -- 身份证(简历) --> B（B 收到了，B 知道 A 是 xx 了，体现 A 能发，B 能收）
2： B -- 身份证(简历) --> A（A 收到了，A 知道 B 是 xx 了，体现 B 能发，A 知道 B 能发了）
3： 握手 (B 知道 A 能收)
