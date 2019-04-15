const Controller = require('egg').Controller;

class ChannelController extends Controller {
    async channel() {
        const body = this.ctx.request.body;
        const oper = body.oper;
        const id = body.id;
        const name = body.name || '';
        const url = body.url || ''
        const is_show = body.is_show === 'true' || body.is_show === 1 || body.is_show === '1' || body.is_show === true ? true : false;
        const type_id = body.type_id || 0;
        const weight = body.weight || 0;
        const img_url = body.img_url || '';
        const comment = body.comment || '';
        const work_id = this.ctx.session && this.ctx.session.user && this.ctx.session.user.id ? this.ctx.session.user.id : '';

        if (oper === 'add') {
            try {
                let result = this.service.channel.insert({
                    name,
                    url,
                    is_show,
                    type_id,
                    weight,
                    img_url,
                    comment
                });
                let log = this.service.workerLog.insert({
                    event: '新增' + name,
                    place: '频道管理',
                    work_id
                });
                [result, log] = await Promise.all([result, log]);
                if (result && log) {
                    this.ctx.body = {
                        status: 200,
                        data: result
                    };
                } else {
                    this.ctx.body = {
                        status: 503,
                        err_message: '添加失败'
                    }
                }
            } catch (err) {
                this.ctx.body = {
                    status: 503,
                    err_message: '添加失败'
                }
                throw err;
            }
        } else if (oper === 'edit') {
            try {
                let result = this.service.channel.update({
                    id,
                    name,
                    url,
                    is_show,
                    type_id,
                    weight,
                    img_url,
                    comment
                });
                let log = this.service.workerLog.insert({
                    event: '修改' + name,
                    place: '频道管理',
                    work_id
                });
                [result, log] = await Promise.all([result, log]);
                if (result) {

                    this.ctx.body = {
                        status: 200,
                        data: result
                    };
                } else {
                    this.ctx.body = {
                        status: 503,
                        err_message: '修改失败'
                    }
                }
            } catch (err) {
                this.ctx.body = {
                    status: 503,
                    err_message: '修改失败'
                }
                throw err;
            }
        }
    }
    async listAll() {
        const query = this.ctx.request.query;
        const pageSize = query.pageSize ? query.pageSize : 100;
        const pageNum = query.pageNum ? query.pageNum : 1;
        const sidx = query.sidx ? query.sidx : 'id'
        const sord = query.sord ? query.sord : 'asc'
        let data = this.service.channel.list({ pageNum, pageSize, sidx, sord });
        let total = this.service.channel.count();
        try {
            [data, total] = await Promise.all([data, total]);
            this.ctx.body = {
                status: 200,
                data: data,
                total: total
            }
        } catch (err) {
            this.ctx.body = {
                status: 503,
                err_message: '查询失败'
            }
            throw err;
        }
    }
    async list() {
        const query = this.ctx.request.query;
        const pageSize = query.pageSize ? query.pageSize : 100;
        const pageNum = query.pageNum ? query.pageNum : 1;
        const sidx = query.sidx ? query.sidx : 'id'
        const sord = query.sord ? query.sord : 'asc'
        const condition = 'where is_show = true and id_del = false'
        let data = this.service.channel.list({ pageNum, pageSize, sidx, sord, condition });
        let total = this.service.channel.count();
        try {
            [data, total] = await Promise.all([data, total]);
            this.ctx.body = {
                status: 200,
                data: data,
                total: total
            }
        } catch (err) {
            this.ctx.body = {
                status: 503,
                err_message: '查询失败'
            }
            throw err;
        }
    }

    async findById() {
        try {
            const query = this.ctx.request.query;
            const id = query.id
            let result = await this.service.channel.findById(id);

            if (result) {
                this.ctx.body = {
                    status: 200,
                    data: result
                }
            } else {
                this.ctx.body = {
                    status: 503,
                    err_message: '查询失败'
                }
                throw err;
            }
        } catch (err) {
            this.ctx.body = {
                status: 503,
                err_message: err.message
            }
            throw err;
        }
    }

    async remove() {
        try {
            const body = this.ctx.request.body;

            const ids = body.ids;
            const work_id = this.ctx.session && this.ctx.session.user && this.ctx.session.user.id ? this.ctx.session.user.id : '';

            let result = this.service.channel.remove(ids);

            let log = this.service.workerLog.insert({
                event: '删除频道' + ids,
                place: '频道管理',
                work_id
            });

            [result, log] = await Promise.all([result, log]);
            if (result) {
                this.ctx.body = {
                    status: 200,
                    data: ids
                }
            } else {
                this.ctx.body = {
                    status: 503,
                    err_message: '删除失败'
                }
            }
        } catch (err) {
            this.ctx.body = {
                status: 503,
                err_message: err.message
            }
            throw err;
        }
    }
}

module.exports = ChannelController