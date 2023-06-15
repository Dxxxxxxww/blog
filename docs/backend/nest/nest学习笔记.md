# nest学习笔记

## 全部装饰器
- @Module： 声明 Nest 模块
- @Controller：声明模块里的 controller
- @Injectable：声明模块里可以注入的 provider
- @Inject：通过 token 手动指定注入的 provider，token 可以是 class 或者 string
- @Optional：声明注入的 provider 是可选的，可以为空
- @Global：声明全局模块
- @Catch：声明 exception filter 处理的 exception 类型
- @UseFilters：路由级别使用 exception filter
- @UsePipes：路由级别使用 pipe
- @UseInterceptors：路由级别使用 interceptor
- @SetMetadata：在 class 或者 handler 上添加 metadata
- @Get、@Post、@Put、@Delete、@Patch、@Options、@Head：声明 get、post、put、delete、patch、options、head 的请求方式
- @Param：取出 url 中的参数，比如 /aaa/:id 中的 id
- @Query: 取出 query 部分的参数，比如 /aaa?name=xx 中的 name
- @Body：取出请求 body，通过 dto class 来接收
- @Headers：取出某个或全部请求头
- @Session：取出 session 对象，需要启用 express-session 中间件
- @HostParm： 取出 host 里的参数
- @Req、@Request：注入 request 对象
- @Res、@Response：注入 response 对象，一旦注入了这个 Nest 就不会把返回值作为响应了，除非指定 passthrough 为true
- @Next：注入调用下一个 handler 的 next 方法
- @HttpCode： 修改响应的状态码
- @Header：修改响应头
- @Redirect：指定重定向的 url
- @Render：指定渲染用的模版引擎

### 拦截类装饰器

#### @UseFilters 

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
