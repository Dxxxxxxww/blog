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