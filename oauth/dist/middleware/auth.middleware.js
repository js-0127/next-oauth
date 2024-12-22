"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AuthMiddleware", {
    enumerable: true,
    get: function() {
        return AuthMiddleware;
    }
});
const _ioredis = require("@nestjs-modules/ioredis");
const _common = require("@nestjs/common");
const _jwt = require("@nestjs/jwt");
const _ioredis1 = /*#__PURE__*/ _interop_require_default(require("ioredis"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
function _ts_param(paramIndex, decorator) {
    return function(target, key) {
        decorator(target, key, paramIndex);
    };
}
let AuthMiddleware = class AuthMiddleware {
    async use(req, res, next) {
        const cookies = req.cookies;
        const { userId = '', gid } = cookies;
        const accessToken = await this.redis.get(`userId:${userId}`);
        if (accessToken) {
            const new_access_token = await this.jwtService.signAsync({
                userId
            }, {
                secret: process.env.ACCESS_TOKEN_SECRET
            });
            this.redis.multi().set(`userId:${userId}`, new_access_token).expire(`userId:${userId}`, 60 * 60 * 24 * 3).exec();
            res.cookie('userId', userId, {
                httpOnly: true,
                maxAge: 1000 * 60 * 60 * 24 * 3
            });
            next();
        } else if (gid) {
            const githubAccessToken = await this.redis.get(`gid:${gid}`);
            if (githubAccessToken) {
                next();
            }
        } else {
            //这里会有跨域错误，不能直接重定向
            res.setHeader('Access-Control-Allow-Credentials', 'true');
            res.status(302).json({
                redirectUrl: 'http://localhost:3000/login'
            });
            return res.send();
        }
    }
    constructor(redis, jwtService){
        this.redis = redis;
        this.jwtService = jwtService;
    }
};
AuthMiddleware = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(0, (0, _ioredis.InjectRedis)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _ioredis1.default === "undefined" ? Object : _ioredis1.default,
        typeof _jwt.JwtService === "undefined" ? Object : _jwt.JwtService
    ])
], AuthMiddleware);

//# sourceMappingURL=auth.middleware.js.map