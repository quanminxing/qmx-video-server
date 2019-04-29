const Service = require('egg').Service;
class PriceRangeService extends Service {
    async insert(data, channel_ids) {
        const conn = await this.app.mysql.beginTransaction();
        try {

            let result = await conn.insert('video_price_range', data);
            if (result) {
                let createUnit = []
                for (let i = 0; i < channel_ids.length; i++) {
                    createUnit.push(conn.insert('video_channel_price', {
                        channel_id: channel_ids[i],
                        price_id: result.insertId
                    }))
                }
                if (await Promise.resolve(createUnit)) {
                    conn.commit()
                    return true;
                } else {
                    await conn.rollback()
                    return false;
                }
            } else {
                await conn.rollback()
                return false;
            }

        } catch (err) {
            conn.rollback();
            throw err;
        }
    }
    async update(data, channel_ids) {
        const conn = await this.app.mysql.beginTransaction();
        try {

            let resultUp = await conn.update('video_price_range', data);
            let resultDEL = await conn.query(`DELETE FROM video_channel_price WHERE price_id = ${data.id};`)
            if (resultUp) {
                let createUnit = []
                for (let i = 0; i < channel_ids.length; i++) {
                    createUnit.push(conn.insert('video_channel_price', {
                        channel_id: channel_ids[i],
                        price_id: data.id
                    }))
                }
                if (await Promise.resolve(createUnit)) {
                    conn.commit()
                    return true;
                } else {
                    await conn.rollback()
                    return false;
                }
            } else {
                await conn.rollback()
                return false;
            }

        } catch (err) {
            conn.rollback();
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
        let sql = `select id, name, maxprice, minprice, is_show, weight, comment from video_price_range ${condition} order by ${params.sidx} ${params.sord} limit ${params.pageSize} offset ${(params.pageNum - 1) * params.pageSize};`
        try {
            let result = await this.app.mysql.query(sql);
            return result;
        } catch (err) {
            throw err;
        }
    }

    async count(params) {
        let condition = params && params.condition ? params.condition : '';
        let sql = `select count(*) from video_price_range ${condition};`;
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
            let sql = `select id, name, maxprice, minprice, is_show, weight, comment from video_price_range where is_show = true;`
            let result = await this.app.mysql.query(sql);

            return result
        } catch (err) {

        }
    }
    async listByChannel(channel_id) {
        try {
            let sql = `select PR.id, PR.name, PR.maxprice, PR.minprice, PR.is_show, PR.weight, PR.comment from video_price_range AS PR RIGHT JOIN video_channel_price AS CP ON CP.price_id = PR.id WHERE CP.channel_id = ${channel_id};`
            let result = await this.app.mysql.query(sql);

            return result
        } catch (err) {

        }
    }

    async remove(ids) {
        const conn = await this.app.mysql.beginTransaction();
        try {

            //let result = await this.app.mysql.query(sql);
            let resultCPDEL = await conn.query(`DELETE FROM video_channel_price WHERE price_id IN (${ids});`)
            let result = await conn.query(`DELETE FROM video_price_range WHERE id IN (${ids});`);  // 第一步操作
            if (result.affectedRows > 0) {
                await conn.commit(); // 提交事务
                return true;
            } else {
                conn.rollback()
                return false;
            }
        } catch (err) {
            await conn.rollback();
            throw err;
        }
    }
}

module.exports = PriceRangeService