'use strict';

const moment = require('moment');
const marked = require('marked');
const counter = require('../lib/count');
const Controller = require('egg').Controller

class PeopleController extends Controller {
  async index() {
    await this.ctx.render('people.html', {
      current: "people",
      title: "人员管理",
      user: this.ctx.session.user
    });

  };


  // 新增

  async main() {

    const body = this.ctx.request.body;
    const oper = body.oper;
    let id = body.id;
    const phone = body.phone;
    const name = body.name;
    const cname = body.cname;
    const description = body.description;
    const password = body.password;
    const auth = body.auth;
    const work_id = this.ctx.session && this.ctx.session.user && this.ctx.session.user.id ? this.ctx.session.user.id : '';

    if (oper === 'add') {

      await this.service.people.insert({
        phone,
        name,
        cname,
        description,
        auth,
        password
      });

      await this.service.workerLog.insert({
        event: '新增人员' + name,
        place: '人员管理',
        work_id
      });

      this.ctx.body = 'success';

    } else if (oper === 'edit') {

      await this.service.people.update({
        id,
        phone,
        name,
        cname,
        description,
        auth,
        password
      });

      await this.service.workerLog.insert({
        event: '修改人员' + name,
        place: '人员管理',
        work_id
      });

      this.ctx.body = 'success';

    } else if (oper === 'del') {

      id = id.split(',');
      for (let i = 0, l = id.length; i < l; i++) {

        await this.service.workerLog.insert({
          event: '删除人员id' + id[i],
          place: '人员管理',
          work_id
        });

        await this.service.people.remove(id[i]);
      }



      this.ctx.body = 'success';
    }
  }

  async list() {
    const pageNum = +this.ctx.request.querypage || 1;
    const pageSize = +this.ctx.request.queryrows || 100;
    const _search = this.ctx.request.query_search;
    const sql = this.ctx.request.querysql;
    let result, total;

    if (_search !== 'true') {
      result = await this.service.people.list(pageNum, pageSize);
      total = await this.service.people.count('1=1');
    } else {
      result = await this.service.people.search(pageNum, pageSize, sql);
      total = await this.service.people.count(sql);
    }
    function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms))
    }

    if (this.ctx.session.user.auth !== 0) {
      result = result.filter((d) => {
        return d.id === this.ctx.session.user.id
      });
      total = 1;
    }

    this.ctx.body = {
      total: total > pageSize ? (parseInt(total / pageSize) + 1) : 1,
      rows: result,
      totalRow: total,
    };
  }
}

module.exports = PeopleController;