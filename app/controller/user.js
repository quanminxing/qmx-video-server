'use strict';

const moment = require('moment');
const Controller = require('egg').Controller;
// 新增
class UserController extends Controller{
async find() {
    let result;
    const query = this.ctx.request.query;
    const openid = query.openid;
    result = await this.service.user.find(openid);
    this.ctx.body = {
        rows: result
    };
}


async save() {
    let result;
    const openid = this.ctx.request.body.openid;
    const type = this.ctx.request.body.type;
    const obj = {
        id: openid
    }
    obj[type] = this.ctx.request.body.inputVal;

    let user = await this.service.user.find(openid);

    if (!user) {
        result = await this.service.user.insert(obj);
    } else {
        result = await this.service.user.update(obj);
    }
    this.ctx.body = {
        rows: result
    };
}
}
module.exports = UserController;