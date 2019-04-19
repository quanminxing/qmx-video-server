'use strict';

const moment = require('moment');
const Controller = require('egg').Service;

// 新增
class LogController extends Controller {
    async log() {

        const body = this.ctx.request.body;
        const video_id = body.video_id;
        const openid = body.openid;
        await this.service.videoLog.insert({
            video_id,
            user_id: openid
        });
        this.ctx.body = 'success';
    }


    async listByUser() {
        const pageNum = +this.ctx.request.querypageNumber || 1;
        const pageSize = +this.ctx.request.querypageSize || 100;
        let result;
        const openid = this.ctx.request.query.openid;

        result = await this.service.videoLog.listByUser(pageNum, pageSize, openid);
        this.ctx.body = {
            rows: result
        };
    }


    async deleteLog() {
        let result;
        const openid = this.ctx.request.queryopenid;
        const ids = this.ctx.request.body.ids;
        console.log(ids);
        result = await this.service.videoLog.deleteFromUser(ids, openid);
        this.ctx.body = {
            result
        };
    }
}

module.exports = LogController;