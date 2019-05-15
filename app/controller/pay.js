
const Util = require('../lib/util');
const xml2js = require('xml2js').parseString;
const Controller = require('egg').Controller;

class PayController extends Controller {
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
        let spbill_create_ip = this.ctx.request.ip

        let total_fee = '';
        let product_id = '';
        let out_trade_no = '';
        let body = '';
        if(!bill_id || !openid) {
            this.ctx.body = {
                status: 500,
                err_message: '参数错误'
            }
            return;
        }
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
        total_fee = '&total_fee=' + bill.price * 100;
        product_id = bill.video_id ? '&product_id=' + bill.video_id : '其他';
        out_trade_no =  bill.order_id ? '&out_trade_no=' + bill.order_id : '&out_trade_no=' + Util.getDate + '01' + Util.getSixRandom;
        body = '&body=宜拍短视频工厂--短视频制作';
        time_expire = '&time_expire=' + time_expire.getFullYear() + ('0' + (time_expire.getMonth() + 1)).slice(-2) +('0' + time_expire.getDate()).slice(-2) + ('0' + time_expire.getHours()).slice(-2) + ('0' + time_expire.getMinutes()).slice(-2) + ('0' + time_expire.getSeconds()).slice(-2)


        let params = appid + mch_id + notify_url + trade_type + total_fee + product_id + out_trade_no + body + openid + spbill_create_ip + nonce_str + time_expire
        
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
                    //await this.service.pay.recordinsert(json.xml);
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
            console.log('\n\n\n\n\n\n回调')
            console.log(data)
            xml2js(data, {explicitArray:false}, async(err, json) => {
                console.log('\n\n\n\n')
                
                console.log(json)
                if(json && json.xml) {

                    if(await this.service.pay.paycallback(json.xml)) {
                        this.ctx.body = {
                            return_code:"SUCCESS"
                        }
                    } else {
                        this.ctx.body = {
                            return_code: "FAIL",
                            return_msg:"参数格式校验错误"
                        }
                    }
                } else {
                    this.ctx.body = {
                        return_code: "FAIL",
                        return_msg:"参数格式校验错误"
                    }
                }
            });
        });
    }
}

module.exports = PayController;