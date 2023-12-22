# AOP 以及 nest 中使用 AOP 方式调用的中间件

## AOP

AOP 面向切面编程，指的是在入口或出口处，通过一种统一的拦截方式去处理一些公共逻辑。这种方式不会影响到业务逻辑，也不会与业务逻辑糅合在一起。

![image](../assets/aop.png)

## middleware

nest 的 middleware 继承于 express。全局 middleware 的用法跟 express 中的 middleware 没有太大区别。

局部作用域的使用方式需要需要注意，是写在 module 模块文件中的。

```typescript
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(xxxMiddleware).forRoutes('cats')
  }
}
```

## guard

对某个 controller 执行前判断是否有权限，返回 true 或 false 判断是否能够执行对应的 controller。

作用范围：可以用在单独的 controller 上，也可以用在全局。

## interceptor

对某个 controller 执行前和执行后做一些操作。内部集成了 rxjs，所以可以使用一些 rxjs 的操作方法。

作用范围：可以用在单独的 controller 上，也可以用在全局。

interceptor 用在全局时，因为是手动 new 实例，没法注入依赖。这种时候要怎么做呢？nest 给我们提供了一个 token。
用这个 token 在 AppModule 里声明的 interceptor，Nest 会把它作为全局 interceptor。

```ts
@Module({
    imports: [],
    controllers: [AppController],
    providers: [AppService,
        {
            provide: APP_INTERCEPTOR,
            useClass: AaaInterceptor
        }
    ]
})
```

这样，在 AaaInterceptor 中就可以使用 app 的服务了。

这里列举一些在 interceptor 中常用的操作方法：

1. tap: 不修改响应数据，执行一些额外逻辑，比如记录日志、更新缓存等；
2. map：对响应数据做修改，一般都是改成 {code, data, message} 的格式； 
3. catchError：在 exception filter 之前处理抛出的异常，可以记录或者抛出别的异常； 
4. timeout：处理响应超时的情况，抛出一个 TimeoutError，配合 catchErrror 可以返回超时的响应。

### @UseFilters

@UseFilters 用于处理未捕获的异常，需要与 @Catch 配合使用。使用方式是：

```ts
// filter.ts
// AbcFilter 实现 ExceptionFilter 接口，再通过 @Catch 装饰想要捕获的异常
@Catch(HttpException)
export class AbcFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const response: Response = host.switchToHttp().getResponse()
    response.status(exception.getStatus()).json({
      msg: exception.message
    })
  }
}

// controller.ts
@Controller()
export class AppController {
  @Inject(AppService)
  private readonly appService: AppService

  @Get()
  // 在方法上使用注册的 filter 去处理 HttpException 异常
  @UseFilters(AbcFilter)
  getHello(): string {
    throw new HttpException('xxx', HttpStatus.BAD_REQUEST)
  }
}
```

## pipe

对参数进行一些校验和转换操作。

作用范围：可以对单个参数生效，可以用在单独的 controller 上，也可以用在全局。

## exceptionFilter

对抛出的异常做处理。

作用范围：可以用在单独的 controller 上，也可以用在全局。
