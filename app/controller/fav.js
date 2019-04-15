'use strict';

const moment = require('moment');
const Controller = require('egg').Controller;
// 新增
class FavController extends Controller {
    async fav() {

        const body = this.ctx.request.body;
        const video_id = body.video_id;
        const openid = body.openid;
        const isFav = body.isFav;
        if (isFav === true) {
            await this.service.fav.deleteFromUser(video_id, openid);
        } else {
            await this.service.fav.insert({
                video_id,
                user_id: openid
            });
        }

        this.ctx.body = 'success';
    }


    async listByUser() {
        const query = this.ctx.request.query;
        const pageNum = +query.pageNumber || 1;
        const pageSize = +query.pageSize || 100;
        let result;
        const openid = query.openid;
        result = await this.service.fav.listByUser(pageNum, pageSize, openid);
        this.ctx.body = {
            rows: result
        };
    }

    async deleteFav() {
        let result;
        const query = this.ctx.request.query;
        const openid = query.openid;
        const ids = this.ctx.request.body.ids;
        console.log(ids);
        result = await this.service.fav.deleteFromUser(ids, openid);
        this.ctx.body = {
            result
        };
    }

    async findByUser() {
        let result;
        const query = this.ctx.request.query;
        const openid = query.openid;
        const id = query.id;
        result = await this.service.fav.findByUser(openid, id);
        this.ctx.body = {
            result
        };
    }
}
module.exports = FavController;