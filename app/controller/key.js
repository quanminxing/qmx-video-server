'use strict';

const moment = require('moment');
const marked = require('marked');
const counter = require('../lib/count');
const Controller = require('egg').Controller;
class KeyController extends Controller {
  async index() {

    await this.ctx.render('key.html', {
      current: "key",
      title: "颗粒库"
    });

  };


  async listAll() {
    const pageNum = +this.ctx.request.query.page || 1;
    const pageSize = +this.ctx.request.query.rows || 100;
    //全查
    let result = await this.service.key.list();
    let total = await this.service.key.count();

    for (let i = 0; i < result.length; i++) {
      if (result[i].level === 3) {
        result[i].children = await this.service.keyUnit.listByKeyid(1, 1000, result[i].id)
      } else {
        result[i].children = []
      }
    }

    this.ctx.body = {
      total: total > pageSize ? (parseInt(total / pageSize) + 1) : 1,
      rows: result
    };
  }

  async main() {

    const body = this.ctx.request.body;
    const oper = body.oper;
    const id = body.id;
    const name = body.name;
    const parent_id = body.parent_id;
    const level = body.level;
    const work_id = this.ctx.session.user.id;

    if (oper === 'add') {

      this.ctx.body = await this.service.key.insert({
        name,
        parent_id,
        level
      });

      await this.service.workerLog.insert({
        event: '新增颗粒度' + name,
        place: '颗粒库',
        work_id
      });

    } else if (oper === 'edit') {

      await this.service.key.update({
        id,
        name,
      });

      await this.service.workerLog.insert({
        event: '修改颗粒度' + name,
        place: '颗粒库',
        work_id
      });

      this.ctx.body = 'success';

    } else if (oper === 'del') {

      await this.service.key.remove(id);

      await this.service.workerLog.insert({
        event: '删除颗粒度' + id,
        place: '颗粒库',
        work_id
      });

      this.ctx.body = 'success';
    }


  }

  async list() {
    const pageNum = +this.ctx.request.query.page || 1;
    const pageSize = +this.ctx.request.query.rows || 100;

    //全查
    let result = await this.service.key.list();
    let total = await this.service.key.count();
    this.ctx.body = {
      total: total > pageSize ? (parseInt(total / pageSize) + 1) : 1,
      rows: result
    };
  }
}
module.exports = KeyController;