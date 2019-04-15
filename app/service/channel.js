const Service = require('egg').Service;
class ChannelService extends Service {
    async insert(data) {
        try {
            let result = await this.app.mysql.insert('video_channel', data);
            return result.affectedRows === 1 ? true : false;
        } catch (err) {
            throw err;
        }
    }
    async update(data) {
        try {
            let result = await this.app.mysql.update('video_channel', data);

            return result.affectedRows === 1 ? true : false;
        } catch (err) {
            throw err;
        }
    }

    // async listAll(params) {
    //     let sql = `select * from video_channel order by ${params.sidx} ${params.sord} limit ${params.pageSize} offset ${(params.pageNum - 1) * params.pageSize};`
    //     let result;
    //     try{
    //         result = await this.app.mysql.query(sql);
    //         return result;
    //     } catch (err) {
    //         throw err;
    //     }
    // }

    async list(params) {
        let condition = params.condition ? params.condition : '';
        let sql = `select id, name, url, is_show, type_id, weight, img_url, comment from video_channel ${condition} order by ${params.sidx} ${params.sord} limit ${params.pageSize} offset ${(params.pageNum - 1) * params.pageSize};`
        try {
            let result = await this.app.mysql.query(sql);
            return result;
        } catch (err) {
            throw err;
        }
    }

    async count(params) {
        let condition = params && params.condition ? params.condition : '';
        let sql = `select count(*) from video_channel ${condition}`;
        let count;
        try {
            count = await this.app.mysql.query(sql);
            return count[0]['count(*)']
        } catch (err) {
            throw err
        }

    }

    async findById(id) {
        try {
            let sql = `select id, name, url, is_show, type_id, weight, img_url, comment from video_channel where is_show = true and is_del = false and id = ${id}`
            let result = await this.app.mysql.query(sql);

            return result
        } catch (err) {
            throw err
        }
    }

    async remove(ids) {
        const conn = await this.app.mysql.beginTransaction();
        try {
            let sql = `UPDATE video_channel SET is_del = true WHERE id IN (${ids});`

            //let result = await this.app.mysql.query(sql);
            let resultCPDEL = await conn.query(`DELETE FROM video_channel_price WHERE channel_id IN (${ids});`)
            let result = await conn.query(sql);
            if (result.affectedRows > 0) {
                await conn.commit();
                return true;
            } else {
                await conn.rollback();
                return false;
            }
        } catch (err) {
            await conn.rollback();
            throw err;
        }
    }
}

module.exports = ChannelService