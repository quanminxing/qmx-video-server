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
    const username = body.username;
    const cname = body.cname;
    const description = body.description;
    const password = body.password;
    const email = body.email;
    const auth = body.auth;
    const work_id = this.ctx.session && this.ctx.session.user && this.ctx.session.user.id ? this.ctx.session.user.id : 0;

    if (oper === 'add') {

      await this.service.people.insert({
        phone,
        username,
        cname,
        description,
        auth,
        password,
        email
      });

      await this.service.workerLog.insert({
        event: '新增人员' + username,
        place: '人员管理',
        work_id
      });

      this.ctx.body = 'success';

    } else if (oper === 'edit') {

      await this.service.people.update({
        id,
        phone,
        username,
        cname,
        description,
        auth,
        password,
        email
      });

      await this.service.workerLog.insert({
        event: '修改人员' + username,
        place: '人员管理',
        work_id
      });

      this.ctx.body = 'success';
    }
  }

  async list() {
    const query = this.ctx.request.query;
    const pageNum = parseInt(query.pageNum) || 1;
    const pageSize = parseInt(query.pageSize) || 100;
    const _search = query._search
    const id = query.id ? ` and id = ${query.id}` : '';
    const cname = query.cname ? ` and cname = "${query.cname}"` : '';
    const phone = query.phone ? ` and phone = "${query.phone}"` : '';
    const email = query.email ? ` and email = "${query.email}"` : '';
    const description = query.description ? ` and description like "%${query.description}%"` : '';

    let result, total;

    if (_search !== 'true') {
      result = await this.service.people.list('', pageNum, pageSize);
      total = await this.service.people.count('1=1');
    } else {
      let sql = '1=1' + id + cname + phone + email + description
      result = await this.service.people.list(sql, pageNum, pageSize);
      total = await this.service.people.count(sql);
    }

    this.ctx.body = {
      status: 200,
      total: total,
      data: result
    };
  }
  async remove() {
    const body = this.ctx.request.body;
    const ids = body.ids;

    const result = await this.service.people.remove(ids);

    if(result) {
      this.ctx.body = {
        status: 200,
        data: '删除成功'
      }
    } else {
      this.ctx.body = {
        status: 500,
        err_message: '删除失败'
      }
    }

  }
}

module.exports = PeopleController;