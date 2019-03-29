const Controller = require('egg').Controller;
class InfoController extends Controller {
	async banner() {
        const { ctx, query = ctx.request.query } = this;
        let res;
        if(query.name == 'bannertype') {
            if(query.platform  == '1'){
                const res = await this.service.info.bannerType(1);
                
                // 设置响应内容和响应状态码
                ctx.body = { results: res };
            }
        }
	}
}

module.exports = InfoController;