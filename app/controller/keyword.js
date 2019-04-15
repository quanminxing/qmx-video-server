'use strict';

const moment = require('moment');
const Controller = require('egg').Controller;
// 新增
class KeyWordController extends Controller {
    async add() {

        const body = this.ctx.request.body;
        const keyword = body.keyword;
        const openid = body.openid;
        await this.service.keyword.insert({
            keyword,
            user_id: openid
        });
        this.ctx.body = 'success';
    }


    async listByUser() {
        const query = this.ctx.request.query;
        const pageNum = +query.pageNumber || 1;
        const pageSize = +query.pageSize || 20;
        let result;
        const openid = query.openid;
        result = await this.service.keyword.listByUser(pageNum, pageSize, openid);
        this.ctx.body = {
            rows: result
        };
    }


    async deleteKeyword() {
        let result;
        const query = this.ctx.request.query;
        const openid = query.openid;
        result = await this.service.keyword.deleteFromUser(openid);
        this.ctx.body = {
            result
        };
    }
}
module.exports = KeyWordController;