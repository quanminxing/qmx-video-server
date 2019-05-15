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
    async paycallback(callbackdata) {
        const conn = await app.mysql.beginTransaction();
        try {
            await conn.query(`UPDATE video_bill SET trade_status="待寄送", pay_status="已付款" WHERE order_id= "${callbackdata.out_trade_no}";`)
            await conn.insert('video_pay_record', {
                type: "全款",
                timestamp: this.app.mysql.literals.now,
                channel: '微信支付',
                third_id: callbackdata.transaction_id,
                time: callbackdata.time_end,
                voucher: '',
                price: callbackdata.cash_fee,
                order_id: callbackdata.out_trade_no
            });
            await conn.commit();
            return true;
        } catch (err) {
            await conn.rollback();
            throw err;
        }

    }
}

module.exports = PayService