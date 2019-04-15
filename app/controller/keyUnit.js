'use strict';

const moment = require('moment');
const marked = require('marked');
const counter = require('../lib/count');
const Controller = require('egg').Controller;
// 新增
class KeyUnitController extends Controller {
    async main() {

        const body = this.ctx.request.body;
        const oper = body.oper;
        const id = body.id;
        const work_id = this.ctx.session.user.id;
        const name = body.name;
        const price = body.price;
        const description = body.description;
        const url = body.url;
        const key_id = body.key_id;

        if (oper === 'add') {

            await this.service.keyUnit.insert({
                work_id,
                name,
                key_id,
                description,
                url,
                price
            });

            await this.service.workerLog.insert({
                event: '新增颗粒库' + name,
                place: '颗粒库',
                work_id
            });

            this.ctx.body = 'success';

        } else if (oper === 'edit') {

            await this.service.keyUnit.update({
                id,
                work_id,
                name,
                key_id,
                description,
                url,
                price
            });

            await this.service.workerLog.insert({
                event: '修改颗粒库' + name,
                place: '颗粒库',
                work_id
            });

            this.ctx.body = 'success';

        } else if (oper === 'del') {

            await this.service.workerLog.insert({
                event: '删除颗粒库' + name,
                place: '颗粒库',
                work_id
            });

            let ids = this.ctx.request.body.ids;
            for (let i = 0, l = ids.length; i < l; i++) {
                await this.service.keyUnit.remove(ids[i]);
            }

            this.ctx.body = 'success';
        }


    }

    async list() {
        const query = this.ctx.request.query;
        const pageNum = +query.pageNumber || 1;
        const pageSize = +query.pageSize || 100;
        const key_id = query.key_id;
        let result = [], total = 0;
        if (key_id && key_id !== '0') {
            // 查所有子集

            let d = await this.service.keyUnit.getChildNode(key_id);
            console.log(d);
            d = d[0].childs.split(',');
            d.shift();
            for (let i = 0, l = d.length; i < l; i++) {
                //先全取出来
                result = result.concat(await this.service.keyUnit.listByKeyid(1, 1000, d[i]));
                total += await this.service.keyUnit.count('key_id=' + d[i]);
                console.log(d[i]);
            }

            //再做分页
            result = result.splice((pageNum - 1) * pageSize, pageSize);

            /*
    result = await this.service.keyUnit.listByKeyid(pageNum, pageSize, key_id);
    total = await this.service.keyUnit.count('key_id='+key_id);*/
        } else {
            result = await this.service.keyUnit.list(pageNum, pageSize);
            total = await this.service.keyUnit.count('1=1');
        }


        this.ctx.body = {
            pageNumber: pageNum,
            pageSize,
            totalRow: total,
            totalPage: total > pageSize ? (parseInt(total / pageSize) + 1) : 1,
            list: result
        };
    }
}
module.exports = KeyUnitController;