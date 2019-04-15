const Controller = require('egg').Controller;

class PriceRangeController extends Controller {
    async priceRange() {
        const body = this.ctx.request.body;
        const oper = body.oper;
        const id = body.id;
        const name = body.name || '';
        const maxprice = body.maxprice || 999999999
        const minprice = body.minprice || 0
        const is_show = body.is_show === 'true' || body.is_show === 1 || body.is_show === '1' || body.is_show === true ? true : false;
        const channel_ids = body.channel_ids || 0;
        const weight = body.weight || 0;
        const comment = body.comment || '';
        const work_id = this.ctx.session && this.ctx.session.user && this.ctx.session.user.id ? this.ctx.session.user.id : '';

        if (oper === 'add') {
            try {
                let result = this.service.priceRange.insert({
                    name,
                    maxprice,
                    minprice,
                    is_show,
                    weight,
                    comment
                }, channel_ids);
                let log = this.service.workerLog.insert({
                    event: '新增' + name,
                    place: '价格区间管理',
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
                        err_message: '添加失败'
                    }
                }
            } catch (err) {
                this.ctx.body = {
                    status: 503,
                    err_message: err.message
                }
                throw err;
            }
        } else if (oper === 'edit') {
            try {
                let result = this.service.priceRange.update({
                    id,
                    name,
                    maxprice,
                    minprice,
                    is_show,
                    weight,
                    comment
                }, channel_ids);
                let log = this.service.workerLog.insert({
                    event: '修改' + name,
                    place: '价格区间管理',
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
                    err_message: err.message
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
        const sord = query.sord ? query.sord : 'desc'
        let data = this.service.priceRange.list({ pageNum, pageSize, sidx, sord });
        let total = this.service.priceRange.count();
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
                err_message: err.message
            }
            throw err;
        }
    }
    async list() {
        const query = this.ctx.request.query;
        const pageSize = query.pageSize ? query.pageSize : 100;
        const pageNum = query.pageNum ? query.pageNum : 1;
        const sidx = query.sidx ? query.sidx : 'minprice'
        const sord = query.sord ? query.sord : 'desc'
        const condition = 'where is_show = true'
        let result = this.service.priceRange.list({ pageNum, pageSize, sidx, sord, condition });
        let total = this.service.priceRange.count();
        try {
            [result, total] = await Promise.all([result, total]);
            if (result) {
                this.ctx.body = {
                    status: 200,
                    data: result,
                    total: total
                }
            } else {
                this.ctx.body = {
                    status: 204,
                    err_message: '查询失败'
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

    async findById() {
        try {
            const query = this.ctx.request.query;
            const id = query.id
            let result = await this.service.priceRange.findById(id);

            if (result) {
                this.ctx.body = {
                    status: 200,
                    data: result
                }
            } else {
                this.ctx.body = {
                    status: 204,
                    err_message: '查询失败'
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

    async listByChannel() {
        try {
            const query = this.ctx.request.query;
            const channel_id = query.channel_id
            let result = await this.service.priceRange.listByChannel(channel_id);

            if (result) {
                this.ctx.body = {
                    status: 200,
                    data: result
                }
            } else {
                this.ctx.body = {
                    status: 204,
                    err_message: '查询失败'
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

    async remove() {
        try {
            const body = this.ctx.request.body;

            const ids = body.ids;
            const work_id = this.ctx.session && this.ctx.session.user && this.ctx.session.user.id ? this.ctx.session.user.id : '';

            let result = this.service.priceRange.remove(ids);

            let log = this.service.workerLog.insert({
                event: '删除价格区间' + ids,
                place: '价格区间管理',
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

module.exports = PriceRangeController