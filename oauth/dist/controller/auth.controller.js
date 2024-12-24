"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AuthController", {
    enumerable: true,
    get: function() {
        return AuthController;
    }
});
const _common = require("@nestjs/common");
const _authservice = require("../service/auth.service");
const _express = require("express");
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
let AuthController = class AuthController {
    async login(body, res) {
        const { userId } = await this.authService.signIn(body);
        res.cookie('userId', userId, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 3
        });
        res.status(200).send({
            status: 200,
            message: '登录成功'
        });
    }
    async oauthRedirect(query, res) {
        const result = await this.authService.oauthRedirect(query?.code);
        if (result?.gid) {
            res.cookie('gid', result?.gid, {
                httpOnly: true,
                maxAge: 1000 * 60 * 60 * 24 * 1
            });
        }
        res.status(200).send();
    }
    async getUserInfo(req) {
        const cookies = req.cookies;
        return this.authService.getUserInfo(cookies);
    }
    async getAuth(req, res) {
        const cookies = req.cookies;
        console.log(cookies, 'cookies');
        if (Object.keys(cookies).length) {
            res.status(302).json({
                redirectUrl: 'http://localhost:3000',
                cookies
            });
            return res.send();
        }
        return res.send({
            status: 200
        });
    }
    async logout(res) {
        res.clearCookie('userId');
        res.clearCookie('gid');
        res.status(200).send({
            message: 'logout success'
        });
    }
    constructor(authService){
        this.authService = authService;
    }
};
_ts_decorate([
    (0, _common.Post)('login'),
    _ts_param(0, (0, _common.Body)()),
    _ts_param(1, (0, _common.Res)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object,
        typeof _express.Response === "undefined" ? Object : _express.Response
    ]),
    _ts_metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
_ts_decorate([
    (0, _common.Get)('redirect'),
    _ts_param(0, (0, _common.Query)()),
    _ts_param(1, (0, _common.Res)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object,
        typeof _express.Response === "undefined" ? Object : _express.Response
    ]),
    _ts_metadata("design:returntype", Promise)
], AuthController.prototype, "oauthRedirect", null);
_ts_decorate([
    (0, _common.Get)('userInfo'),
    _ts_param(0, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _express.Request === "undefined" ? Object : _express.Request
    ]),
    _ts_metadata("design:returntype", Promise)
], AuthController.prototype, "getUserInfo", null);
_ts_decorate([
    (0, _common.Get)(),
    _ts_param(0, (0, _common.Req)()),
    _ts_param(1, (0, _common.Res)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _express.Request === "undefined" ? Object : _express.Request,
        typeof _express.Response === "undefined" ? Object : _express.Response
    ]),
    _ts_metadata("design:returntype", Promise)
], AuthController.prototype, "getAuth", null);
_ts_decorate([
    (0, _common.Get)('logout'),
    _ts_param(0, (0, _common.Res)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _express.Response === "undefined" ? Object : _express.Response
    ]),
    _ts_metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
AuthController = _ts_decorate([
    (0, _common.Controller)('auth'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _authservice.AuthService === "undefined" ? Object : _authservice.AuthService
    ])
], AuthController);

//# sourceMappingURL=auth.controller.js.map