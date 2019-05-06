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
        let category, platform, column, usage, classify, style;
        category = this.service.category.list(1, 100);
        platform = this.service.platform.list(1, 100);
        column = this.service.column.list(1, 100);
        usage = this.service.usage.list(1, 100);
        classify = this.service.classify.list();
        style = this.service.style.list(1, 100);
        [category, platform, column, usage, classify, style] = await Promise.all([category, platform, column, usage, classify, style]);
        this.ctx.body = {
            status:200,
            data:{
                category: category,
                platform: platform,
                column: column,
                usage: usage,
                classify: classify,
                style: style
            }
        }
    }
    async regard() {
        let result = await this.service.info.regard();
        this.ctx.body = {
            status: 200,
            data: result
        }
    }

    async worker() {
        let result = await this.service.info.worker()
        this.ctx.body = {
            status: 200,
            data: result
        }
    }
}

module.exports = InfoController;