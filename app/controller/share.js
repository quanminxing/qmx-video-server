const Util = require('../lib/util');

const Controller = require('egg').Controller;

class ShareController extends Controller {
    async getacode() {
        const appid = this.app.config.wechat.appId;
        const secret = this.app.config.wechat.secretKey;
        const access_token = await Util.getAccessToken(appid, secret, this.app);
        const body = this.ctx.request.body;
        const page = body.page;
        const scene = body.scene;
        const width = body.width;
        const auto_color = body.auto_color;
        const line_color = body.line_color;
        const is_hyaline = body.is_hyaline;

        let acode_url = 'https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=' + access_token;

        let data = {}
        if(page)    data.page = page;
        if(scene)   data.scene = scene;
        if(width)   data.width = width;
        if(auto_color)  data.auto_color = auto_color;
        if(line_color)  data.line_color = line_color;
        if(is_hyaline)  data.is_hyaline = is_hyaline;
        console.log(JSON.stringify(data))

        let result = await this.ctx.curl(acode_url,{
            method: 'POST',
            data:  data,
            contentType: 'json',
        });
        console.log(result.data.toString());
        this.ctx.response.set('content-type', 'image/jpeg');
        this.ctx.body = result.data

    }
}

module.exports = ShareController;