"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AuthService", {
    enumerable: true,
    get: function() {
        return AuthService;
    }
});
const _common = require("@nestjs/common");
const _prismaservice = require("./prisma.service");
const _jwt = require("@nestjs/jwt");
const _ioredis = require("@nestjs-modules/ioredis");
const _ioredis1 = /*#__PURE__*/ _interop_require_default(require("ioredis"));
const _axios = /*#__PURE__*/ _interop_require_default(require("axios"));
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
let AuthService = class AuthService {
    async signIn(loginParam, res) {
        const { email } = loginParam;
        const user = await this.prisma.user.create({
            data: {
                email
            }
        });
        const payload = {
            sub: user.id
        };
        const access_token = await this.jwtService.signAsync(payload, {
            secret: process.env.ACCESS_TOKEN_SECRET
        });
        this.redis.multi().set(`userId:${user.id}`, access_token).expire(`userId:${user.id}`, 60 * 60 * 24 * 3).exec();
        res.cookie('userId', user.id, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 3
        });
        res.send({
            status: 200,
            message: '登录成功'
        });
    }
    async oauthRedirect(code, res) {
        console.log(code);
        const tokenResponse = await (0, _axios.default)({
            method: 'post',
            url: 'https://github.com/login/oauth/access_token?' + `client_id=${'Ov23li9D4HB48T32pxI9'}&` + `client_secret=${'d192c5308379781d18d3cb48a6d0f704346bf5ab'}&` + `code=${code}`,
            headers: {
                accept: 'application/json'
            }
        });
        const accessToken = tokenResponse.data.access_token;
        const result = await (0, _axios.default)({
            method: 'get',
            url: `https://api.github.com/user`,
            headers: {
                accept: 'application/json',
                Authorization: `token ${accessToken}`
            }
        });
        const userInfo = result.data;
        const userId = result.data.id;
        this.redis.multi().set(`gid:${userId}`, accessToken).expire(`gid:${userId}`, 60 * 60 * 24 * 3).exec();
        res.cookie('gid', userId, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 3
        });
        return userInfo;
    }
    constructor(prisma, jwtService, redis){
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.redis = redis;
    }
};
AuthService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(2, (0, _ioredis.InjectRedis)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _jwt.JwtService === "undefined" ? Object : _jwt.JwtService,
        typeof _ioredis1.default === "undefined" ? Object : _ioredis1.default
    ])
], AuthService);

//# sourceMappingURL=auth.service.js.map