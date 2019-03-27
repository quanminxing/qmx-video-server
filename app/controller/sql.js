const Controller = require('egg').Controller;


class SqlController extends Controller {
  async checksql() {
    const { ctx, service } = this;
    // 调用 Service 进行业务处理
    const res = await this.service.sql.find('video_bill');
    // 设置响应内容和响应状态码
    ctx.body = { cols: res };
    ctx.status = 200;
  }
}
module.exports = SqlController;