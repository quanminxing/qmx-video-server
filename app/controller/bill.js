'use strict';

const moment = require('moment');
const marked = require('marked');
const counter = require('../lib/count');
const mail = require('../lib/mail');
const Controller = require('egg').Controller;
class BillController extends Controller {
  async index() {
    let categorys = await this.service.category.list();
    categorys = categorys.filter((d) => { return d.level === 1 });
    let platforms = await this.service.platform.list();
    let columns = await this.service.column.list();
    let users = await this.service.people.listAll()
    await this.ctx.render('bill.html', {
      current: "bill",
      columns: JSON.stringify(columns),
      categorys: JSON.stringify(categorys),
      platforms: JSON.stringify(platforms),
      users: JSON.stringify(users),
      title: "订单管理"
    });
  };

  // 新增

  async main() {

    const body = this.ctx.request.body;
    const oper = body.oper;
    let id = body.id;
    const name = body.name;
    const price = body.price != 'null' ? body.price : '';
    const business = body.business;
    const status = body.status;
    const is_scene = body.is_scene;
    const is_audio = body.is_audio;
    const is_show = body.is_show;
    const is_model = body.is_model;
    const is_text = body.is_text;
    const time = body.time;
    const scale = body.scale;
    const channel = body.channel;
    const phone = body.phone;
    const category_id = body.category_id;
    const video_id = body.video_id || '';
    const platform_id = body.platform_id || '';
    const comment = body.comment;
    const column_id = body.column_id;
    const openid = body.openid;
    const email = body.email;
    const work_id = this.ctx.session && this.ctx.session.user && this.ctx.session.user.id ? this.ctx.session.user.id : '';

    let result;
    let newResult;
    if (oper === 'add') {

      try {
        result = await this.service.bill.insert({
          work_id,
          name,
          price,
          business,
          status,
          is_scene,
          is_audio,
          is_model,
          is_text,
          is_show,
          time,
          scale,
          channel,
          phone,
          category_id,
          platform_id,
          column_id,
          video_id,
          openid,
          comment,
          email
        });


        newResult = await this.service.bill.list(1, 1, 'where V.id = ' + video_id);
        let video_name, video_time;
        if (newResult.length > 0) {
          video_name = newResult[0].video_name ? newResult[0].video_name : '无'
          video_time = newResult[0].video_time ? newResult[0].video_time.split(':').join('分') + '秒' : '无'
        } else {
          video_name = '无'
          video_time = '无'
        }
        if (!this.ctx.session.user) {
          let mailHtmlText = `订单ID为${result.insertId},订单内容如下：</br>` +
            `样片视频：${video_name}</br>` +
            `样片时长：${video_time}</br>` +
            //`样片功能：室内场景</br>` +
            `公司名称：${business}</br>` +
            `联系人：${name}</br>` +
            `联系方式：${phone}</br>` +
            `邮箱：${email}</br>` +
            `请及时联系客户。`
          let toMailAddress = this.app.config.mailaddress
          mail.sendMail('你收到一份来自全民星小视频的brief', mailHtmlText, toMailAddress, function (info) {   //'你收到一份来自全民星小视频的brief', '请在后台查看id为' + result.insertId +'的订单'
            console.log(info);
          });
        }
        this.ctx.body = 'success';
      } catch (err) {
        this.ctx.body = {
          status: 503,
          err_message: err.err_message
        }
        throw err;
      }

    } else if (oper === 'edit') {

      await this.service.bill.update({
        id,
        work_id,
        name,
        price,
        business,
        status,
        is_scene,
        is_audio,
        is_model,
        is_text,
        is_show,
        time,
        scale,
        channel,
        phone,
        platform_id,
        column_id,
        video_id,
        category_id,
        comment,
        email
      });
      await this.service.workerLog.insert({
        event: '修改订单' + name,
        place: '订单管理',
        work_id
      });
      this.ctx.body = 'success';

    } else if (oper === 'del') {

      id = id.split(',');
      for (let i = 0, l = id.length; i < l; i++) {

        await this.service.bill.remove(id[i]);

        await this.service.workerLog.insert({
          event: '删除订单' + id[i],
          place: '订单管理',
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
      result = await this.service.bill.list(pageNum, pageSize);
      total = await this.service.bill.count('1=1');
    } else {
      result = await this.service.bill.search(pageNum, pageSize, sql);
      total = await this.service.bill.count(sql);
    }
    function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms))
    }
    this.ctx.body = {
      total: total > pageSize ? (parseInt(total / pageSize) + 1) : 1,
      rows: result,
      totalRow: total,
    };
  }

  async listByUser() {
    let result;
    const query = this.ctx.request.query;
    const openid = query.openid;
    const pageNum = parseInt(query.pageNum || 1);
    const pageSize = parseInt(query.pageSize || 10)
    
    // result = result.map((d)=>{
    //   d.timestamp = moment(d.timestamp).format('YYYY-MM-DD hh:mm:ss');
    //   return d;
    // });
    if(openid) {
      result = await this.service.bill.listByUser(openid, pageNum, pageSize);
      this.ctx.body = {
        rows: result
      };
    } else {
      this.ctx.body = {
        err_message:'openid null'
      }
    }

  }
}
module.exports = BillController;