const Controller = require('egg').Controller;
class BannerController extends Controller {
  async banner() {
    const { ctx, service } = this;
    const createRule = {
      title: { type: 'string' },
      content: { type: 'string' },
    };
    // 调用 Service 进行业务处理
    const res = await service.banner.list();
    // 设置响应内容和响应状态码
    ctx.body = { results: res };
  }
}

module.exports = BannerController;