'use strict';

const moment = require('moment');
const marked = require('marked');
const Controller = require('egg').Controller;
class PackageController extends Controller {
  async index() {

    let users = await this.service.people.listAll();

    await this.ctx.render('package.html', {
      current: "package",
      title: "套餐管理",
      users: JSON.stringify(users),
    });

  };

  async findVideoByPackageId() {
    const query = this.ctx.request.query;
    let id = query.id;
    let pkg = await this.service.package.find(id);
    let video_ids = pkg.video_ids;
    video_ids = video_ids.split(',');
    let res = await video_ids.map((video_id) => {
      return this.service.video.find(Number(video_id));
    });
    this.ctx.body = res;
  }

  // 新增

  async main() {

    const body = this.ctx.request.body;
    const oper = body.oper;
    let id = body.id;
    const work_id = this.ctx.session && this.ctx.session.user && this.ctx.session.user.id ? this.ctx.session.user.id : '';
    const price = body.price;
    const pic = body.pic;
    const video_ids = body.video_ids;
    const name = body.name;
    const status = body.status

    if (oper === 'add') {
      await this.service.package.insert({
        pic,
        name,
        video_ids,
        price,
        status
      });

      await this.service.workerLog.insert({
        event: '新增套餐' + name,
        place: '套餐管理',
        work_id
      });

      this.ctx.body = 'success';

    } else if (oper === 'edit') {

      await this.service.package.update({
        id,
        pic,
        name,
        video_ids,
        price,
        status
      });

      await this.service.workerLog.insert({
        event: '修改套餐' + name,
        place: '套餐库',
        work_id
      });

      this.ctx.body = 'success';

    } else if (oper === 'del') {

      id = id.split(',');
      for (let i = 0, l = id.length; i < l; i++) {

        await this.service.package.remove(id[i]);

        await this.service.workerLog.insert({
          event: '删除套餐' + id[i],
          place: '套餐库',
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
      result = await this.service.package.list(pageNum, pageSize);
      total = await this.service.package.count('1=1');
    } else {
      result = await this.service.package.search(pageNum, pageSize, sql);
      total = await this.service.package.count(sql);
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
module.exports = PackageController;