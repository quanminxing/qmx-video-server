'use strict';

const moment = require('moment');
const marked = require('marked');
const counter = require('../lib/count');
const mail = require('../lib/mail');


exports.index = function* () {
  let categorys = yield this.service.category.list();
  categorys = categorys.filter((d) => { return d.level === 1 });
  let platforms = yield this.service.platform.list();
  let columns = yield this.service.column.list();
  let users = yield this.service.people.listAll()
  yield this.render('bill.html', {
    current: "bill",
    columns: JSON.stringify(columns),
    categorys: JSON.stringify(categorys),
    platforms: JSON.stringify(platforms),
    users: JSON.stringify(users),
    title: "订单管理"
  });
};

// 新增

exports.main = function* () {

  const body = this.request.body;
  const oper = body.oper;
  let id = body.id;
  const name = body.name;
  console.log(typeof(null))
  const price = body.price != 'null'? body.price : '';
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

  let result;
  let newResult;
  if (oper === 'add') {

    try {
      result = yield this.service.bill.insert({
        work_id: this.session.user ? this.session.user.id : null,
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
    } catch (err) {
      this.body = {
        status: 503,
        err_message: err.err_message
      }
    }
    

    newResult = yield this.service.bill.list(1, 1, 'where V.id = ' + video_id);
    let video_name, video_time;
    if(newResult.length > 0) {
       video_name = newResult[0].video_name ? newResult[0].video_name : '无'
       video_time = newResult[0].video_time ? newResult[0].video_time.split(':').join('分') + '秒' : '无'
    } else {
      video_name = '无'
      video_time = '无'
    }
     //video_name = newResult[0].video_name ? newResult[0].video_name : '无'
     //video_time = newResult[0].video_time ? newResult[0].video_time.split(':').join('分') + '秒' : '无'
    if (!this.session.user) {
      let mailHtmlText = `订单ID为${result.insertId},订单内容如下：</br>` +
        `样片视频：${video_name}</br>` +
        `样片时长：${video_time}</br>` +
        //`样片功能：室内场景</br>` +
        `公司名称：${business}</br>` +
        `联系人：${name}</br>` +
        `联系方式：${phone}</br>` +
        `邮箱：${email}</br>` +
        `请及时联系客户。`
      mail.sendMail('这是一封测试用的邮件一份来自全民星小视频的brief', mailHtmlText, function (info) {   //'你收到一份来自全民星小视频的brief', '请在后台查看id为' + result.insertId +'的订单'
        console.log(info);
      });
    }
    this.body = 'success';

  } else if (oper === 'edit') {

    let work_id = this.session.user.id;

    yield this.service.bill.update({
      id,
      work_id: body.work_id,
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
    yield this.service.workerLog.insert({
      event: '修改订单' + name,
      place: '订单管理',
      work_id
    });
    this.body = 'success';

  } else if (oper === 'del') {

    let work_id = this.session.user.id;

    id = id.split(',');
    for (let i = 0, l = id.length; i < l; i++) {

      yield this.service.bill.remove(id[i]);

      yield this.service.workerLog.insert({
        event: '删除订单' + id[i],
        place: '订单管理',
        work_id
      });
    }

    this.body = 'success';
  }

}

exports.list = function* () {
  const pageNum = +this.query.page || 1;
  const pageSize = +this.query.rows || 100;
  const _search = this.query._search;
  const sql = this.query.sql;
  let result, total;

  if (_search !== 'true') {
    result = yield this.service.bill.list(pageNum, pageSize);
    total = yield this.service.bill.count('1=1');
  } else {
    result = yield this.service.bill.search(pageNum, pageSize, sql);
    total = yield this.service.bill.count(sql);
  }
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
  this.body = {
    total: total > pageSize ? (parseInt(total / pageSize) + 1) : 1,
    rows: result,
    totalRow: total,
  };
}

exports.listByUser = function* () {
  let result;
  const openid = this.query.openid;
  const pageNum = parseInt(this.query.pageNum || 1);
  const pageSize = parseInt(this.query.pageSize || 10)
  result = yield this.service.bill.listByUser(openid, pageNum, pageSize);
  // result = result.map((d)=>{
  //   d.timestamp = moment(d.timestamp).format('YYYY-MM-DD hh:mm:ss');
  //   return d;
  // });
  this.body = {
    rows: result
  };
}