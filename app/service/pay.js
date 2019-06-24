const Service = require('egg').Service;

class PayService extends Service {
    async insert(data) {
        try {
            let result = await this.app.mysql.insert('video_pay_record', {
                type: data.type || "全款",
                timestamp: this.app.mysql.literals.now,
                channel: data.channel || '微信支付',
                third_id: data.transaction_id || '',
                end_time: data.end_time || '',
                voucher: data.voucher || '',
                price: data.price,
                order_id: data.order_id,
                verify: data.verify,
                verify_info: data.verify_info,
                verify_time: data.verify_time,
                serial: data.serial
            });
            if (!result) {
                return false;
            } else {
                return result;
            }
        } catch (err) {
            throw err;
        }
    }

    async listAll(cond, pageNum, pageSize) {
        try{
            let sql = 'select VPR.id, VPR.order_id, VPR.serial, VPR.type, VPR.channel, VPR.third_id, VPR.voucher, date_format(VPR.timestamp,"%Y-%m-%d %H:%i:%s") AS timestamp, date_format(VPR.end_time,"%Y-%m-%d %H:%i:%s") AS end_time, VPR.price, VPR.verify, VPR.verify_info, date_format(VPR.verify_time,"%Y-%m-%d %H:%i:%s") AS verify_time, '
            + ` VB.name, VB.business, VB.phone, VB.email`
            + ` from video_pay_record AS VPR`
            + ` LEFT JOIN video_bill AS VB on VPR.order_id = VB.order_id`
            + ` where 1=1 ${cond} order by VPR.serial desc limit ${pageSize} offset ${(pageNum - 1) * pageSize};`
            const result = await this.app.mysql.query(sql);
            
            return result;
        } catch (err) {
            throw err
        }
    }
    async findByOrder(order_id, cond) {
        try {
            let sql = 'select VPR.id, VPR.order_id, VPR.serial, VPR.type, VPR.channel, VPR.third_id, VPR.voucher, date_format(VPR.timestamp,"%Y-%m-%d %H:%i:%s") AS timestamp, date_format(VPR.end_time,"%Y-%m-%d %H:%i:%s") AS end_time, VPR.price, VPR.verify, VPR.verify_info, date_format(VPR.verify_time,"%Y-%m-%d %H:%i:%s") AS verify_time, '
            + ` VB.name, VB.business, VB.phone, VB.email`
            + ` from video_pay_record AS VPR`
            + ` LEFT JOIN video_bill AS VB on VPR.order_id = VB.order_id`
            + ` where VPR.order_id="${order_id}" ${cond ? cond : ''} order by VPR.id;`
            const record = await this.app.mysql.query(sql)

            return record;
        } catch(err) {
            throw err;
        }
    }

    async count(cond) {
        console.log(cond)
        const count = await this.app.mysql.query(`select count(*) from video_pay_record AS VPR where 1=1 ${cond}`);
    
        return count[0]['count(*)'];
    }
    
    async verify(pay_id) {
        // {
        //     id: pay_id,
        //     verify: '审核未通过',
        //     verify_info: verify_info,
        //     verify_time: this.app.mysql.literals.now,
        //     end_time: end_time,
        //     third_id: third_id
        // }
    }

    async paycallback(callbackdata) {
        const info = callbackdata.attach.split('-');
        const order_id = info[1];
        const type = info[2];
        const payRecord = await this.app.mysql.select('video_pay_record', {
            where: {
                order_id: order_id,
                third_id: callbackdata.transaction_id
            },
        });
        if (payRecord && payRecord.length !== 0) {
            return true;
        } else {
            let sql = '';
            const conn = await this.app.mysql.beginTransaction();
            if(type === '全款') sql = `UPDATE video_bill SET trade_status="进行中", pay_status="已支付全款", sale_status="已支付全款", paid_price=paid_price + ${callbackdata.cash_fee / 100} WHERE order_id= "${order_id}";`
            if(type === '定金') sql = `UPDATE video_bill SET trade_status="进行中", pay_status="已支付定金", sale_status="已支付定金", paid_price=paid_price + ${callbackdata.cash_fee / 100} WHERE order_id= "${order_id}";`
            if(type === '尾款') sql = `UPDATE video_bill SET trade_status="进行中", pay_status="已支付尾款", sale_status="已支付尾款", paid_price=paid_price + ${callbackdata.cash_fee / 100} WHERE order_id= "${order_id}";`
            if(type === '其他') sql = `UPDATE video_bill SET trade_status="进行中", pay_status="已支付款项", sale_status="已支付款项", paid_price=paid_price + ${callbackdata.cash_fee / 100} WHERE order_id= "${order_id}";`
            else console.log('支付类型错误')

            try {
                await conn.query(sql)
                await conn.insert('video_pay_record', {
                    serial: callbackdata.out_trade_no,
                    type: type || '其他',
                    timestamp: this.app.mysql.literals.now,
                    channel: '微信支付',
                    third_id: callbackdata.transaction_id,
                    end_time: callbackdata.time_end,
                    voucher: '',
                    price: callbackdata.cash_fee / 100,
                    order_id: order_id
                });
                await conn.commit();
                return true;
            } catch (err) {
                await conn.rollback();
                throw err;
            }
        }
    }
    async update(data) {
        try {
            let result = await this.app.mysql.update('video_pay_record', data);

            return result.affectedRows === 1;
        } catch (err) {
            throw err;
        }
    }
}

module.exports = PayService