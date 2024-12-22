"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _core = require("@nestjs/core");
const _appmodule = require("./app.module");
const _cookieparser = /*#__PURE__*/ _interop_require_default(require("cookie-parser"));
const _responseinterceptor = require("./interceptor/response.interceptor");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
async function bootstrap() {
    const app = await _core.NestFactory.create(_appmodule.AppModule);
    app.enableCors({
        origin: [
            'http://localhost:3000'
        ],
        credentials: true
    });
    app.setGlobalPrefix('/api');
    app.use((0, _cookieparser.default)());
    app.useGlobalInterceptors(new _responseinterceptor.ResponseInterceptor());
    await app.listen(process.env.PORT ?? 3001);
}
bootstrap();

//# sourceMappingURL=main.js.map