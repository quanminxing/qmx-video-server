'use strict';

const moment = require('moment');
const Controller = require('egg').Service;

// 新增
class LogController extends Controller {
    async log() {

        const body = this.ctx.request.body;
        const kind = body.kind;
        const video_id = body.video_id;
        const openid = body.user_id;
        this.ctx.body = 'success';
        
        if(kind == 'play') {
            await this.service.videoLog.updateHot(video_id)
        } else if(kind == 'browse') {
            await this.service.videoLog.insert({
                video_id,
                user_id: openid
            });
        }
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
        
        result = await this.service.videoLog.deleteFromUser(ids, openid);
        if(result.affectedRows > 0 ) {
            this.ctx.body = {
                status: 200,
                data: "删除成功" + ids
            }
        } else {
            this.ctx.body = {
                status: 500,
                err_message: "删除失败"
            }
        }
    }
}

module.exports = LogController;