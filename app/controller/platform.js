'use strict';

const moment = require('moment');
const marked = require('marked');
const Controller = require('egg').Controller;
class PlatformController extends Controller {
  async index() {

    let users = await this.service.people.listAll();

    await this.ctx.render('platform.html', {
      current: "platform",
      title: "平台管理",
      users: JSON.stringify(users),
    });

  };

  // 新增

  async main() {

    const body = this.ctx.request.body;
    const oper = body.oper;
    let id = body.id;
    const work_id = this.ctx.session && this.ctx.session.user && this.ctx.session.user.id ? this.ctx.session.user.id : '';
    const comment = body.comment;
    const name = body.name;
    const status = body.status

    if (oper === 'add') {
      await this.service.platform.insert({
        work_id,
        name,
        comment,
        status
      });

      await this.service.workerLog.insert({
        event: '新增平台' + name,
        place: '平台管理',
        work_id
      });

      this.ctx.body = 'success';

    } else if (oper === 'edit') {

      await this.service.platform.update({
        id,
        name,
        comment,
        status
      });

      await this.service.workerLog.insert({
        event: '修改平台' + name,
        place: '平台管理',
        work_id
      });

      this.ctx.body = 'success';

    } else if (oper === 'del') {

      id = id.split(',');
      for (let i = 0, l = id.length; i < l; i++) {

        await this.service.platform.remove(id[i]);

        await this.service.workerLog.insert({
          event: '删除平台' + id[i],
          place: '平台管理',
          work_id
        });

      }


      this.ctx.body = 'success';
    }


  }

  async list() {
    const query = this.ctx.request.query;
    const pageNum = +query.page || 1;
    const pageSize = +query.rows || 100;
    const _search = query._search;
    const sql = query.sql;
    let result, total;

    if (_search !== 'true') {
      result = await this.service.platform.list(pageNum, pageSize);
      total = await this.service.platform.count('1=1');
    } else {
      result = await this.service.platform.search(pageNum, pageSize, sql);
      total = await this.service.platform.count(sql);
    }

    function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms))
    }

    console.log(total, pageSize, (parseInt(total / pageSize) + 1));
    this.ctx.body = {
      total: total > pageSize ? (parseInt(total / pageSize) + 1) : 1,
      rows: result,
      totalRow: total,
    };
  }
}
module.exports = PlatformController;