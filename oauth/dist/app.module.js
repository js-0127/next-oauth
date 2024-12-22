"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AppModule", {
    enumerable: true,
    get: function() {
        return AppModule;
    }
});
const _common = require("@nestjs/common");
const _appcontroller = require("./controller/app.controller");
const _appservice = require("./service/app.service");
const _prismaservice = require("./service/prisma.service");
const _authcontroller = require("./controller/auth.controller");
const _authservice = require("./service/auth.service");
const _jwt = require("@nestjs/jwt");
const _ioredis = require("@nestjs-modules/ioredis");
const _authmiddleware = require("./middleware/auth.middleware");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let AppModule = class AppModule {
    configure(consumer) {
        consumer.apply(_authmiddleware.AuthMiddleware).exclude({
            path: '/auth/login',
            method: _common.RequestMethod.ALL
        }, {
            path: '/auth/redirect',
            method: _common.RequestMethod.ALL
        }).forRoutes({
            path: '*',
            method: _common.RequestMethod.ALL
        });
    }
};
AppModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            _ioredis.RedisModule.forRoot({
                type: 'single',
                url: process.env.REDIS_URL
            })
        ],
        controllers: [
            _appcontroller.AppController,
            _authcontroller.AuthController
        ],
        providers: [
            _appservice.AppService,
            _prismaservice.PrismaService,
            _authservice.AuthService,
            _jwt.JwtService
        ]
    })
], AppModule);

//# sourceMappingURL=app.module.js.map