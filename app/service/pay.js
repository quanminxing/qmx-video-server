const Service = require('egg').Service;

class PayService extends Service {
    async insert() {

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
                price: cash_fee,
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