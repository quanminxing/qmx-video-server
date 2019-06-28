'use strict';

const moment = require('moment');
const marked = require('marked');
const counter = require('../lib/count');
const Controller = require('egg').Controller;
class CategoryController extends Controller {
  async index() {

    await this.ctx.render('category.html', {
      current: "category",
      title: "类目库"
    });

  };



  async main() {

    const body = this.ctx.request.body;
    const oper = body.oper;
    const id = body.id;
    const name = body.name;
    const parent_id = body.parent_id;
    const level = body.level;
    const work_id = this.ctx.session && this.ctx.session.user && this.ctx.session.user.id ? this.ctx.session.user.id : 0;

    if (oper === 'add') {

      this.ctx.body = await this.service.category.insert({
        name,
        parent_id,
        level
      });

      await this.service.workerLog.insert({
        event: '新增类目' + name,
        place: '类目管理',
        work_id
      });

    } else if (oper === 'edit') {

      await this.service.category.update({
        id,
        name,
      });

      await this.service.workerLog.insert({
        event: '修改类目' + name,
        place: '类目管理',
        work_id
      });

      this.ctx.body = 'success';

    } else if (oper === 'del') {

      await this.service.category.remove(id);

      await this.service.workerLog.insert({
        event: '删除类目' + id,
        place: '类目管理',
        work_id
      });


      this.ctx.body = 'success';
    }


  }

  async list() {
    const query = this.ctx.request.query;
    const pageNum = +query.page || 1;
    const pageSize = +query.rows || 100;

    //全查
    let result = await this.service.category.list();
    let total = await this.service.category.count();
    this.ctx.body = {
      total: total > pageSize ? (parseInt(total / pageSize) + 1) : 1,
      rows: result
    };
  }
}
module.exports = CategoryController;