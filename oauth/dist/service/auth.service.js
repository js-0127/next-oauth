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
    async signIn(loginParam) {
        const { email } = loginParam;
        const loginUser = await this.prisma.user.findUnique({
            where: {
                email
            }
        });
        if (!loginUser) {
            const user = await this.prisma.user.create({
                data: {
                    email
                }
            });
            return this.setJwtToken(user.id);
        }
        return this.setJwtToken(loginUser.id);
    }
    async oauthRedirect(code) {
        try {
            const tokenResponse = await (0, _axios.default)({
                method: 'post',
                url: `https://gitee.com/oauth/token?grant_type=authorization_code&code=${code}&client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}&redirect_uri=${process.env.REDIRECT_URL}`,
                headers: {
                    accept: 'application/json'
                },
                data: {
                    client_secret: process.env.CLIENT_SECRET
                }
            });
            console.log(tokenResponse, 'data');
            const accessToken = tokenResponse.data.access_token;
            const result = await (0, _axios.default)({
                method: 'get',
                url: `https://gitee.com/api/v5/user?access_token=${accessToken}`,
                headers: {
                    accept: 'application/json'
                }
            });
            const userInfo = result.data;
            const userId = userInfo.id;
            this.redis.multi().set(`gid:${userId}`, accessToken).expire(`gid:${userId}`, 60 * 60 * 24 * 3).exec();
            const user = await this.prisma.user.findUnique({
                where: {
                    id: userId
                }
            });
            if (!user) {
                await this.prisma.user.create({
                    data: {
                        id: userId,
                        email: userInfo?.email,
                        userName: userInfo?.login,
                        avatar: userInfo?.avatar_url,
                        nickName: userInfo?.name
                    }
                });
            } else {
                await this.prisma.user.update({
                    where: {
                        id: userId
                    },
                    data: {
                        email: userInfo?.email,
                        userName: userInfo?.login,
                        avatar: userInfo?.avatar_url,
                        nickName: userInfo?.name
                    }
                });
            }
            return {
                gid: userId
            };
        } catch (error) {
            console.log(error, 'error');
        }
    }
    async getUserInfo(cookies) {
        const { userId, gid } = cookies;
        const user = await this.prisma.user.findUnique({
            where: {
                id: Number(userId) || Number(gid)
            }
        });
        return {
            user
        };
    }
    async setJwtToken(userId) {
        const payload = {
            sub: userId
        };
        const access_token = await this.jwtService.signAsync(payload, {
            secret: process.env.ACCESS_TOKEN_SECRET
        });
        this.redis.multi().set(`userId:${userId}`, access_token).expire(`userId:${userId}`, 60 * 60 * 24 * 3).exec();
        return {
            userId: userId
        };
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