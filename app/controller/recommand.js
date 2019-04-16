'use strict';

const moment = require('moment');
const marked = require('marked');
const counter = require('../lib/count');
const Controller = require('egg').Controller

class RecommandController extends Controller {
  async index() {

    let users = await this.service.people.listAll();

    await this.ctx.render('recommand.html', {
      current: "recommand",
      title: "推荐管理",
      users: JSON.stringify(users),
    });

  };

  // 新增



  async main() {

    const body = this.ctx.request.body;
    const oper = body.oper;
    let id = body.id;
    const work_id = this.ctx.session && this.ctx.session.user.id ? this.ctx.session.user.id : '';
    const video_id = body.video_id;

    if (oper === 'add') {

      await this.service.recommand.insert({
        work_id,
        video_id,
      });

      this.ctx.body = {
        status: 200,
        data: []
      }

    } else if (oper === 'edit') {

      await this.service.recommand.update({
        id,
        video_id
      });

      this.ctx.body = {
        status: 200,
        data: []
      };

    } else if (oper === 'del') {

      console.log(typeof(id))
      if(typeof(id) === 'string') {
        id = id.split(',');
      } 
      
      for (let i = 0, l = id.length; i < l; i++) {

        await this.service.recommand.remove(id[i]);

      }

      this.ctx.body = {
        status: 200,
        data: []
      };
    }


  }

  async list() {
    const pageNum = +this.ctx.request.querypage || 1;
    const pageSize = +this.ctx.request.queryrows || 100;
    const _search = this.ctx.request.query_search;
    const sql = this.ctx.request.querysql;
    let result, total;

    if (_search !== 'true') {
      result = await this.service.recommand.list(pageNum, pageSize);
      total = await this.service.recommand.count('1=1');
    } else {
      result = await this.service.recommand.search(pageNum, pageSize, sql);
      total = await this.service.recommand.count(sql);
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

module.exports = RecommandController;