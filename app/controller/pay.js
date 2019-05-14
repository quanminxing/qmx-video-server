const crypto = require('crypto');
const Util = require('../lib/util');
const xml2js = require('xml2js').parseString;
const Controller = require('egg').Controller;

class PayController extends Controller {
    async payPrepare() {
        let prepare_url = 'https://api.mch.weixin.qq.com/pay/unifiedorder';

        let appid = this.app.config.wechat.appId ? 'appid=' + this.app.config.wechat.appId : '';
        let key = this.app.config.wechat.secretKey ? '&key=' + this.app.config.wechat.secretKey : '';
        let mch_id = this.app.config.wechat.mch_id ? '&mch_id=' + this.app.config.wechat.mch_id : '';
        let notify_url = this.app.config.wechat.notify_url ? '&notify_url=' + this.app.config.wechat.notify_url : '';
        let trade_type = '&trade_type=JSAPI';

        let bill_id = this.ctx.request.body.bill_id ;
        let openid = this.ctx.request.body.openid;


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
        total_fee = '&total_fee=' + bill.price;
        product_id = bill.video_id ? '&product_id' + bill.video_id : '';
        out_trade_no =  bill.order_id ? '&out_trade_no=' + bill.order_id : '&out_trade_no=' + Util.getDate + '01' + Util.getSixRandom;
        body = '&body=宜拍短视频工厂--短视频制作';

        let params = appid + mch_id + notify_url + trade_type + total_fee + product_id + out_trade_no + body + openid
        let paramsArray = params.replace(' ', '').split('&').sort();
        
        //console.log('paramsArray\n',paramsArray);

        let stringSign = (paramsArray.join('&') + key).replace(' ', '')
 
        //console.log(stringSign)
        let md5 = crypto.createHash('md5');
        let sign = md5.update(stringSign).digest('hex').toUpperCase();
        //console.log('sign\n', sign)

        let dataXml = '<xml>\n'
        for(var i=0; i<paramsArray.length; i++){
			dataXml += '<' + paramsArray[i].split("=")[0] + '>' + paramsArray[i].split("=")[1] + '</' + paramsArray[i].split("=")[0] + '>\n'
        }
        dataXml += '</xml>'

        let result = await this.app.curl(prepare_url, {
            method:'POST',
            data: dataXml,
            dataType: 'xml'
        })
        console.log(xml2js(result.data))


    }

    async callback() {
        //console.log(this.ctx.request);
        this.ctx.body = {
            return_code:"SUCCESS"
        }
    }
}

module.exports = PayController;