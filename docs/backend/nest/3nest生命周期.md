# nest 生命周期

初始化模块生命周期

```ts
onModuleInit
onApplicationBootstrap
```

模块销毁生命周期

```ts
onModuleDestroy
// 只有此生命周期会接受一个信号参数
// 这些终止信号是别的进程传过来的，让它做一些销毁的事情，比如用 k8s 管理容器的时候，可以通过这个信号来通知它。
beforeApplicationShutdown(signal) // signal: string
onApplicationShutdown
```

多个模块的执行顺序是按照在 app.module.ts 中的注册顺序来的。
单个模块内部的执行顺序是按照 controller service module 来的。
例如：

```ts
// 这里只距离初始化，销毁也是如此
// app.module.ts
@Module({
  // nest 生命周期是按照在 app.module.ts 中的注册顺序来的
  // 所以下面先执行 Bbb 的生命周期，之后执行 Aaa 的生命周期
  imports: [BbbModule, AaaModule],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}

// console.log()
// BbbController onModuleInit
// BbbService onModuleInit
// BbbModule OnModuleInit
// AaaController onModuleInit
// AaaService onModuleInit
// AaaModule OnModuleInit
// BbbController OnApplicationBootstrap
// BbbService OnApplicationBootstrap
// BbbModule onApplicationBootstrap
// AaaController OnApplicationBootstrap
// AaaService OnApplicationBootstrap
// AaaModule onApplicationBootstrap
```
