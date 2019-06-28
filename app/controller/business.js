'use strict';

const moment = require('moment');
const marked = require('marked');
const counter = require('../lib/count');
const Controller = require('egg').Controller;
class BusinessController extends Controller {
  async index() {

    let users = await this.service.people.listAll();

    await this.ctx.render('business.html', {
      current: "business",
      title: "商家库",
      users: JSON.stringify(users),
    });

  };

  // 新增

  async main() {

    const body = this.ctx.request.body;
    const oper = body.oper;
    let id = body.id;
    const work_id = this.ctx.session && this.ctx.session.user && this.ctx.session.user.id ? this.ctx.session.user.id : 0;
    const phone = body.phone;
    const name = body.name;
    const status = body.status

    if (oper === 'add') {

      await this.service.business.insert({
        work_id,
        phone,
        name,
        status
      });

      await this.service.workerLog.insert({
        event: '新增商家' + name,
        place: '商家库',
        work_id
      });

      this.ctx.body = 'success';

    } else if (oper === 'edit') {

      await this.service.business.update({
        id,
        work_id,
        phone,
        name,
        status
      });

      await this.service.workerLog.insert({
        event: '修改商家' + name,
        place: '商家库',
        work_id
      });

      this.ctx.body = 'success';

    } else if (oper === 'del') {

      id = id.split(',');
      for (let i = 0, l = id.length; i < l; i++) {

        await this.service.business.remove(id[i]);

        await this.service.workerLog.insert({
          event: '删除商家' + id[i],
          place: '商家库',
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
      result = await this.service.business.list(pageNum, pageSize);
      total = await this.service.business.count('1=1');
    } else {
      result = await this.service.business.search(pageNum, pageSize, sql);
      total = await this.service.business.count(sql);
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
module.exports = BusinessController;