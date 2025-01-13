## BEAN

bean 就是在 java 中， IoC 容器自动创建，管理的对象。比如说 dao 对象，service 对象。

## AOP

spring 中的 aop 实际是使用代理模式来处理的。本质上是在 spring 实例化 bean 时，如果有 aop 匹配上了，则创建一个代理对象（类比前端就是一个 proxy），通过代理对象来增强，实现一些增强的能力。

## Spring 事务

Spring 事务与 sql 中的事务一样，都是确保某一系列的操作同步成功/同步失败。

Spring 事务通过 @Transactional 来开启。当我们对某一个复杂服务需要设置事务来保证其内部操作同步成功或者失败时，就可以在服务接口方法上加上 @Transactional 。

例如我们现在有一个转账服务，里面涉及到钱的转入，转出两个数据层操作，需要同步这两个操作时，就可以加上 @Transactional 。这里写一下伪代码：

```java

// interface

@Transactional

Boolean transfer()

// impl

public Boolean transfer() {

    moneyIn()

    moneyOut()

}

```

而当我们在这个服务中，又需要加上不管服务成功还是失败，都需要记录转账日志的逻辑时，就可以使用事务传播行为这个概念来处理。这里写一下伪代码：

```java

// interface Transfer

@Transactional

Boolean transfer()

// interface Log

@Transactional(propagation = Propagation.REQUIRES_NEW)

void log()

// impl

public Boolean transfer() {

    moneyIn()

    moneyOut()

    log()

}
```

通过将 log 接口的事务传播行为设置为 @Transactional(propagation = Propagation.REQUIRES_NEW) ，表示不加入调用方的事务，而是新起一个事务。由于是两个事务，这样就不会受到 transfer 事务的影响同步成功或者失败，就会执行。

事务传播行为的默认行为是加入调用方的事务，一共有 7 种，可以在代码中点进源码查看，这里不多详述。

## 杂

service 调用 mapper 接口方法，实际调用了 mapper.xml 中的 sql 操作。实体类实际上不涉及具体的操作，只是数据库和 java 数据通信的字段映射。
