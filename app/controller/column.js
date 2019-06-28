'use strict';

const moment = require('moment');
const marked = require('marked');
const Controller = require('egg').Controller;
class ColumnController extends Controller {
  async index() {

    let users = await this.service.people.listAll();
    let platforms = await this.service.platform.list();

    await this.ctx.render('column.html', {
      current: "column",
      title: "栏目管理",
      users: JSON.stringify(users),
      platforms: JSON.stringify(platforms),
    });

  };

  // 新增

  async main() {

    const body = this.ctx.request.body;
    const oper = body.oper;
    let id = body.id;
    const work_id = this.ctx.session && this.ctx.session.user && this.ctx.session.user.id ? this.ctx.session.user.id : 0;
    const comment = body.comment;
    const platform_id = body.platform_id;
    const name = body.name;
    const status = body.status

    if (oper === 'add') {
      await this.service.column.insert({
        work_id,
        name,
        comment,
        platform_id,
        status
      });

      await this.service.workerLog.insert({
        event: '新增栏目' + name,
        place: '栏目管理',
        work_id
      });

      this.ctx.body = 'success';

    } else if (oper === 'edit') {

      await this.service.column.update({
        id,
        name,
        platform_id,
        comment,
        status
      });

      await this.service.workerLog.insert({
        event: '修改栏目' + name,
        place: '栏目管理',
        work_id
      });

      this.ctx.body = 'success';

    } else if (oper === 'del') {

      id = id.split(',');
      for (let i = 0, l = id.length; i < l; i++) {

        await this.service.column.remove(id[i]);

        await this.service.workerLog.insert({
          event: '删除栏目' + id[i],
          place: '栏目管理',
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
      result = await this.service.column.list(pageNum, pageSize);
      total = await this.service.column.count('1=1');
    } else {
      result = await this.service.column.search(pageNum, pageSize, sql);
      total = await this.service.column.count(sql);
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



  async listAll() {
    const query = this.ctx.request.query;
    const pageNum = +query.page || 1;
    const pageSize = +query.rows || 100;
    //全查
    let result = await this.service.platform.list();

    const r = { "全部": [] };

    for (let i = 0; i < result.length; i++) {
      let child = await this.service.column.listByPlatformId(1, 1000, result[i].id);
      r[result[i].name] = [];
      r[result[i].name].push({
        "name": "全部",
        id: 0
      });
      child.forEach((c) => {
        r[result[i].name].push(c);
      });
    }

    this.ctx.body = r
  }
}
module.exports = ColumnController;