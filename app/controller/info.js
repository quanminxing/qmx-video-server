const Controller = require('egg').Controller;
class InfoController extends Controller {
    async banner() {
        const { ctx, query = ctx.request.query } = this;
        let res;
        if (query.name == 'bannertype') {
            if (query.platform == '1') {
                const res = await this.service.info.bannerType(1);

                // 设置响应内容和响应状态码
                ctx.body = { results: res };
            }
        }
    }

    async operateVideo() {
        let category, platform, column, usage, classify;
        category = this.service.category.list(1, 100);
        platform = this.service.platform.list(1, 100);
        column = this.service.column.list(1, 100);
        usage = this.service.usage.list(1, 100);
        classify = this.service.classify.list;
        [category, platform, column, usage, classify] = await Promise.all([category, platform, column, usage, classify]);
        this.ctx.body = {
            status:200,
            data:{
                category: category,
                platform: platform,
                column: column,
                usage: usage,
                classify: classify
            }
        }
    }
}

module.exports = InfoController;