
const Util = require('../lib/util');
const xml2js = require('xml2js').parseString;
const Controller = require('egg').Controller;

class PayController extends Controller {
    async listAll() {
        const query = this.ctx.request.query;
        const _search = query._search;
        const pay_id = query.pay_id ? ' and VPR.id = ' + pay_id : '';
        const order_id = query.order_id ? ` and VPR.order_id = "${query.order_id}"` : '';
        const pay_serial = query.pay_serial ? ` and VPR.serial="${query.pay_serial}"` : '';
        const pay_verify = query.pay_verify ? ` and VPR.verify="${query.pay_verify}"` : '';
        const pay_channel = query.pay_channel? ` and VPR.channel="${query.pay_channel}"` : '';
        const timestamp = query.timestamp ? query.timestamp.split(',') : '';

        const pageSize = query.pageSize || 20;
        const pageNum = query.pageNum || 1;
        let sql = '';
        
        if(_search == true || _search == "true") {
            sql = pay_id + order_id + pay_serial + pay_verify + pay_channel
            if(timestamp || timestamp.length == 2 ) {
                sql += ` and VPR.timestamp between '${timestamp[0]}' and '${timestamp[1]}'`
            }
        }
        
        const result = await this.service.pay.listAll(sql, pageNum, pageSize);
        const total = await this.service.pay.count(sql);
        if(result) {
            this.ctx.body = {
                status: 200,
                data: result,
                total: total
            }
        } else {
            this.ctx.body = {
                status: 500,
                err_message: ''
            }
        }
    }

    async listById() {
        const query = this.ctx.request.query;
        const pay_id = query.pay_id ? ' and VPR.id = ' + query.pay_id : '';
        
        if(!pay_id) {
            this.ctx.body = {
                status: 500,
                err_message: 'pay_id is null'
            }
        }
        let sql = pay_id;

        const result = await this.service.pay.listAll(sql, 1, 1);
        if(result) {
            this.ctx.body = {
                status: 200,
                data: result[0]
            }
        } else {
            this.ctx.body = {
                status: 500,
                err_message: '未查询到记录'
            }
        }
    }

    async payByBank() {
        const body = this.ctx.request.body;
        const bill_id = body.bill_id;
        const voucher = body.voucher;
        const pay_type = body.pay_type;
        let price;
        if(!bill_id) {
            this.ctx.body = {
                status: 500,
                err_message: 'bill_id is null'
            }
            return;
        }
        if(!voucher) {
            this.ctx.body = {
                status: 500,
                err_message: 'voucher is null'
            }
            return;
        }
        if(!pay_type) {
            this.ctx.body = {
                status: 500,
                err_message: 'pay_type is null'
            }
            return;
        }

        const bill_record = await this.service.bill.find(bill_id);
        if(!bill_record) {
            this.ctx.body = {
                status: 500,
                err_message: '未找到订单'
            }
            return;
        }
        switch (pay_type) {
            case '全款':
                price = bill_record.price
                break;
            
            case '定金':
                price = bill_record.earnest_price
                break;
            case '尾款':
                price = bill_record.price - bill_record.earnest_price
                break;
            default:
                this.ctx.body = {
                    status: 500,
                    err_message: 'pay_type is wrong'
                }
                return;
        }

        const pay_record = await this.service.pay.listAll(` and VPR.order_id = "${bill_record.order_id}" and VPR.type = "${pay_type}" and (VPR.verify = "待审核" or VPR.channel = "微信支付")`, 1, 1);
        if(pay_record && pay_record.length > 0) {
            this.ctx.body = {
                status:500,
                err_message: '已存在对应项目的付款记录，无需重复支付'
            }
            return;
        }

        const result = await this.service.pay.insert({
            type: pay_type,
            channel: '对公付款',
            voucher: voucher,
            price: price,
            order_id: bill_record.order_id,
            verify: '待审核',
            serial: 'ZF' + Util.getDate() + Util.getSixRandom() + (pay_type === '全款' ? '01' : pay_type === '定金' ? '02' : pay_type === '尾款' ? '03' : '04')
        });

        if(result) {
            this.ctx.body = {
                status: 200,
                data: '提交成功'
            }
        } else {
            this.ctx.body = {
                status:500,
                err_message: '上传失败'
            }
        }
    }

    async verify() {
        const body = this.ctx.request.body;
        const pay_id = body.pay_id
        const verify = body.verify
        const verify_info = body.verify_info || ''
        const end_time = body.end_time || null
        const third_id = body.third_id || ''

        if(!pay_id) {
            this.ctx.body = {
                status: 500,
                err_message: 'pay_id is null'
            }
            return;
        }
        if(!verify) {
            this.ctx.body = {
                status: 500,
                err_message: 'verify is null'
            }
            return;
        }
        if(!end_time) {
            this.ctx.body = {
                status: 500,
                err_message: 'end_time is null'
            }
            return;
        }
        if(!verify_info) {
            this.ctx.body = {
                status: 500,
                err_message: 'verify_info is null'
            }
            return;
        }
        const pay_record = await this.service.pay.listAll(` and VPR.id = ${pay_id}`, 1, 1)
        const bill_record = await this.service.bill.findByOrder(pay_record[0].order_id);
        if(!pay_record || pay_record.length <= 0) {
            this.ctx.body = {
                status: 500,
                err_message: '未找到支付记录'
            }
            return;
        }
        if(!bill_record) {
            this.ctx.body = {
                status: 500,
                err_message: '未找到订单'
            }
            return
        }
        if(!pay_record || pay_record.length <= 0) {
            this.ctx.body = {
                status: 500,
                err_message: '未找到相关支付记录'
            }
            return;
        }
        if(pay_record[0].verify === '审核通过' || pay_record[0].verify === '审核未通过') {
            this.ctx.body = {
                status: 500,
                err_message: '操作失败：已审核的支付记录，不能重复审核'
            }
            return;
        }
        if(bill_record.trade_status === '退款完成') {
            this.ctx.body = {
                status: 500,
                err_message: '操作失败：退款完成的订单，不能审核通过其支付记录'
            }
            return;
        }
        if(verify === "审核未通过") {
            const result = await this.service.pay.update({
                id: pay_id,
                verify: '审核未通过',
                verify_info: verify_info,
                verify_time: this.app.mysql.literals.now
            });
            if(result) {
                this.ctx.body = {
                    status:200,
                    data: '修改审核成功'
                }
            } else {
                this.ctx.body = {
                    status: 500,
                    err_message: '修改审核失败'
                }
            }
        } else if(verify === '审核通过') {
                const result_bill = await this.service.bill.update({
                    id: bill_record.id,
                    trade_status: '进行中',
                    pay_status: pay_record[0].type === '全款' ? '已支付全款' : pay_record[0].type === '定金' ? '已支付定金' : pay_record[0].type === '尾款' ? '已支付尾款' : '已付款',
                    sale_status: pay_record[0].type === '全款' ? '已支付全款' : pay_record[0].type === '定金' ? '已支付定金' : pay_record[0].type === '尾款' ? '已支付尾款' : '已付款',
                    paid_price: bill_record.paid_price + pay_record[0].price,
                });
                const result_pay_record = await this.service.pay.update({
                    id: pay_record[0].id,
                    verify: '审核通过',
                    third_id: third_id,
                    verify_time:this.app.mysql.literals.now,
                    end_time: end_time
                })
                if(result_bill && result_pay_record) {
                    this.ctx.body = {
                        status: 200,
                        data:'修改成功'
                    }
                } else {
                    this.ctx.body = {
                        status: 500,
                        err_message: `修改失败, 修改支付记录${result_pay_record}, 修改订单信息${result_bill}`
                    }
                }

        }

    }

    async payPrepare() {
        let prepare_url = 'https://api.mch.weixin.qq.com/pay/unifiedorder';

        let appid = this.app.config.wechat.appId ? 'appid=' + this.app.config.wechat.appId : '';
        let key = this.app.config.wechat.paykey ? '&key=' + this.app.config.wechat.paykey: '';
        let mch_id = this.app.config.wechat.mch_id ? '&mch_id=' + this.app.config.wechat.mch_id : '';
        let notify_url = this.app.config.wechat.notify_url ? '&notify_url=' + this.app.config.wechat.notify_url : '';
        let trade_type = '&trade_type=JSAPI';
        let nonce_str = Util.getNonceStr();
        let time_expire = new Date();
        time_expire.setMinutes(time_expire.getMinutes() + 2);

        let bill_id = this.ctx.request.body.bill_id ;
        let openid = this.ctx.request.body.openid;
        let spbill_create_ip = this.ctx.request.ip;
        let pay_type = this.ctx.request.body.pay_type;

        if(!bill_id || !openid || !spbill_create_ip || !pay_type) {
            this.ctx.body = {
                status: 500,
                err_message: '参数错误'
            }
            return;
        }


        let total_fee = '';
        let product_id = '';
        let out_trade_no = '';
        let body = '';
        let attach = '';

        let bill = await this.service.bill.find(bill_id);
        if(!bill) {
            this.ctx.body = {
                status: 500,
                err_message: '未查到此订单'
            }
            return;
        }
        openid = '&openid=' + openid;
        spbill_create_ip = '&spbill_create_ip=' + spbill_create_ip;
        nonce_str = '&nonce_str=' + nonce_str;
        if(pay_type === '定金') {
            total_fee = '&total_fee=' + bill.earnest_price * 100;
        } else if(pay_type === '全款') {
            total_fee = '&total_fee=' + bill.price * 100;
        } else if(pay_type === '尾款') {
            total_fee = '&total_fee=' + (bill.price * 100 - bill.earnest_price * 100);
        } else {
            total_fee = '&total_fee=' + bill.price * 100;
        }
        product_id = bill.video_id ? '&product_id=' + bill.video_id : '&product_id=其他';
        out_trade_no = '&out_trade_no=ZF' + Util.getDate() + Util.getSixRandom() + (pay_type === '全款' ? '01' : pay_type === '定金' ? '02' : pay_type === '尾款' ? '03' : '04');
        body = '&body=宜拍短视频制作-订单编号' + bill.order_id + '-' + pay_type;
        attach ='&attach=宜拍短视频制作-' + bill.order_id + '-' + pay_type;
        time_expire = '&time_expire=' + time_expire.getFullYear() + ('0' + (time_expire.getMonth() + 1)).slice(-2) +('0' + time_expire.getDate()).slice(-2) + ('0' + time_expire.getHours()).slice(-2) + ('0' + time_expire.getMinutes()).slice(-2) + ('0' + time_expire.getSeconds()).slice(-2)


        let params = appid + mch_id + notify_url + trade_type + total_fee + product_id + out_trade_no + body + attach + openid + spbill_create_ip + nonce_str + time_expire
        
        let dataXml = Util.queryToXML(params, key);

        let result = await this.app.curl(prepare_url, {
            method:'POST',
            data: dataXml,
            dataType: 'xml' 
        })
        let that = this;
        //const parser = new xml2js.Parser();
        xml2js(result.data.toString(), {explicitArray:false}, (err, json) => {
            console.log(json)
            if(json && json.xml) {
                if(json.xml.return_code == 'SUCCESS' && json.xml.result_code == 'SUCCESS') {
                    let timeStamp = Math.round(new Date() / 1000).toString()
                    let secondSignStr = 'appId=' + that.app.config.wechat.appId + '&nonceStr=' + json.xml.nonce_str + '&package=prepay_id=' + json.xml.prepay_id + '&signType=MD5' + '&timeStamp=' + timeStamp;
                    let secondSign = Util.getSign(secondSignStr, key);
                    that.ctx.body = {
                        status: 200,
                        data: {
                            nonceStr: json.xml.nonce_str,
                            package: 'prepay_id=' + json.xml.prepay_id,
                            timeStamp: timeStamp,
                            signType:'MD5',
                            paySign: secondSign
                        }
                    }
                } else if(json.xml.err_code_des == '201 商户订单号重复') {
                    that.ctx.body = {
                        status: 500,
                        err_message: '请求付款码失败，请等待五分钟后再尝试付款'
                    }
                } else {
                    that.ctx.body = {
                        status: 500,
                        err_message: json.xml.return_msg || '支付异常'
                    }
                }

            } else {
                that.ctx.body = {
                    status:500,
                    err_message: '获取统一下单号失败'
                }
            }
        });
    }

    async callback() {
        let data = '';
        const that = this;

        this.ctx.req.setEncoding('utf8');
        this.ctx.req.on('data', chunk => {
            data += chunk;
        });
        this.ctx.req.on('end', () => {
            xml2js(data, {explicitArray:false}, async(err, json) => {
                if(json && json.xml) {
                    if(await that.service.pay.paycallback(json.xml)) {
                        that.ctx.body = {
                            return_code:"SUCCESS"
                        }
                    } else {
                        that.ctx.body = {
                            return_code: "FAIL",
                            return_msg:"参数格式校验错误"
                        }
                    }
                } else {
                    that.ctx.body = {
                        return_code: "FAIL",
                        return_msg:"参数格式校验错误"
                    }
                }
            });
        });
    }
}

module.exports = PayController;