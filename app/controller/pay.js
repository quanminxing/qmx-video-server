const crypto = require('crypto');
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

        let bill_id = this.ctx.request.body.bill_id ;
        let openid = this.ctx.request.body.openid;
        let spbill_create_ip = this.ctx.request.ip

        console.log(this.ctx.request)

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

        let params = appid + mch_id + notify_url + trade_type + total_fee + product_id + out_trade_no + body + openid + spbill_create_ip + nonce_str
        
        let paramsArray = params.replace(' ', '').split('&').sort();
        
        console.log('paramsArray\n',paramsArray);

        let stringSign = (paramsArray.join('&') + key).replace(' ', '')
 
        console.log(stringSign)
        let md5 = crypto.createHash('md5');
        let sign = md5.update(stringSign).digest('hex').toUpperCase();
        console.log('sign\n', sign)
        paramsArray.push('sign=' + sign)
        let dataXml = '<xml>\n'
        for(var i=0; i<paramsArray.length; i++){
			dataXml += '<' + paramsArray[i].split("=")[0] + '>' + paramsArray[i].split("=")[1] + '</' + paramsArray[i].split("=")[0] + '>\n'
        }
        dataXml += '</xml>'
        console.log(dataXml)
        let result = await this.app.curl(prepare_url, {
            method:'POST',
            data: dataXml,
            dataType: 'xml'
        })
        let that = this;
        //const parser = new xml2js.Parser();
        xml2js(result.data.toString(), {explicitArray:false}, (err, json) => {
            console.log(err)
            if(json && json.xml) {
                that.ctx.body = {
                    status: 200,
                    data: {
                        appid:json.xml.appid,
                        mch_id: json.xml.mch_id,
                        nonce_str: json.xml.nonce_str,
                        prepare_id: json.xml.prepare_id,
                        key: that.app.config.wechat.paykey
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
                }
            });
        });
    }
}

module.exports = PayController;