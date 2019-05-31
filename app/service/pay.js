const Service = require('egg').Service;

class PayService extends Service {
    async recordinsert(data) {
        try {
            let result = await this.app.mysql.insert('video_pay_record', {
                type: "全款",
                timestamp: this.app.mysql.literals.now,
                channel: '微信支付',
                third_id: data.transaction_id,
                time: data.time_end,
                voucher: '',
                price: data.cash_fee,
                order_id: data.out_trade_no
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
    async findByOrder(order_id) { 
        try {
            const record = await this.app.mysql.get('video_pay_record', { order_id });

            return record;
        } catch(err) {
            throw err;
        }
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
                    pay_serial: callbackdata.out_trade_no,
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
}

module.exports = PayService