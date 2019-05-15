'use strict';
const Service = require('egg').Service;
const util = require('../lib/util')

class BillService extends Service {
  async insert(obj) {

    const result = await this.app.mysql.insert('video_bill', {
      name: obj.name,
      work_id: obj.work_id || 0,
      price: obj.price,
      status: obj.status || 0,
      business: obj.business,
      video_id: obj.video_id,
      time: obj.time,
      phone: obj.phone,
      comment: obj.comment,
      openid: obj.openid,
      timestamp: this.app.mysql.literals.now,
      email: obj.email,
      order_id: util.getDate() + '01' + util.getSixRandom(),
      pay_status:'未付款',
      refund_price:0.00,
      refund_time:null,
      trade_status:'进行中',
    });

    return result;
  }

  // 获取列表
  async list(pageNum, pageSize, param) {
    const cond = param ? param : ''
    console.log(cond)
    const articles = await this.app.mysql.query(
      `select VB.id, VB.name, VB.work_id, VB.price, VB.status, VB.business, date_format(VB.timestamp, '%Y-%m-%d %H:%i:%s') as timestamp,`
      + ` VB.phone, VB.video_id, VB.comment, VB.email, VB.order_id, VB.pay_status, VB.refund_price, VB.refund_time, VB.trade_status, VB.work_comment,`
      + ` VV.name AS video_name, VV.url AS video_url, VV.short_image AS video_short_image, VV.time AS video_time, VV.platform_id, VV.scale_id, VV.column_id, VV.category_id,`
      + ` VWOK.cname AS worker_name, VWOK.id AS worker_id,`
      + ` VPR.id AS pay_id, VPR.type AS pay_type, VPR.timestamp AS pay_timestamp, VPR.channel AS pay_channel, VPR.third_id AS pay_third_id, VPR.time AS pay_time, VPR.voucher AS pay_voucher, VPR.price AS pay_price`
      + ` from video_bill AS VB`
      + ` LEFT JOIN video_video AS VV on VB.video_id = VV.id`
      + ` LEFT JOIN video_worker AS VWOK on VB.work_id = VWOK.id`
      + ` LEFT JOIN video_pay_record AS VPR on VB.order_id = VPR.order_id`
      + ` ${cond} order by timestamp desc limit ${pageSize} offset ${(pageNum - 1) * pageSize};`);
    return articles;
  }

  // 获取列表byren
  async listByUser(cond, pageNum, pageSize) {
    try {
      let sql = `select VB.id, VCOL.name as column_name, VV.name as video_name,`
        + ` VB.name, VB.work_id, VB.price, VB.status, VB.business, VV.time AS video_time,`
        + ` VV.scale_id, date_format(VB.timestamp,'%Y-%m-%d %H:%i:%s') as timestamp,`
        + ` VB.phone, VV.category_id, VC.name AS category_name, VV.platform_id, VPF.name as platform_name, VV.column_id,`
        + ` VB.video_id, VB.comment, VB.email,VB.order_id, VB.pay_status, VB.refund_price, VB.refund_time, VB.trade_status, VB.work_comment,`
        + ` VWOK.cname AS worker_name,`
        + ` VPR.id AS pay_id, VPR.type AS pay_type, VPR.timestamp AS pay_timestamp, VPR.channel AS pay_channel, VPR.third_id AS pay_third_id, VPR.time AS pay_time, VPR.voucher AS pay_voucher, VPR.price AS pay_price`
        + ` from video_bill AS VB`
        + ` LEFT JOIN video_video AS VV on video_id = VV.id`
        + ` LEFT JOIN video_category AS VC on VV.category_id = VC.id `
        + ` LEFT JOIN video_platform AS VPF on VV.platform_id = VPF.id`
        + ` LEFT JOIN video_column AS VCOL on VV.column_id = VCOL.id`
        + ` LEFT JOIN video_worker AS VWOK on VB.work_id = VWOK.id`
        + ` LEFT JOIN video_pay_record AS VPR on VB.order_id = VPR.order_id`

        + `${cond}  order by timestamp desc limit ${pageSize} offset ${(pageNum - 1) * pageSize};`
      const articles = await this.app.mysql.query(sql);
      return articles;
    } catch (err) {
      throw err;
    }
  }
  
  //获取各个交易状态下的订单数量
  async tradeCount(openid) {
    try {
      let sql = `SELECT case when trade_status = '' or isnull(trade_status) then '其他' else trade_status end AS trade_status, count(*) as count FROM video_bill where is_del = false and openid='${openid}' group by trade_status`
      const result = await this.app.mysql.query(sql);
      return result;
    } catch (err) {
      throw err;
    }
  }

  // 获取某条信息
  async find(id) {
    const article = await this.app.mysql.get('video_bill', { id });

    return article;
  }

  // 搜索
  async search(pageNum, pageSize, where) {
    let sql = "select id,name,work_id,price,status,business,time,scale,channel,date_format(timestamp,'%Y-%m-%d %H:%i') as timestamp, phone,category_id,openid,platform_id,column_id,video_id,comment from video_bill where"
    sql += ' ' + where;
    sql += ` order by timestamp desc limit ${pageSize} offset ${(pageNum - 1) * pageSize};`
    const articles = await this.app.mysql.query(sql);
    return articles;
  }
  // 总数
  async count(cond) {
    console.log(cond)
    const count = await this.app.mysql.query(`select count(*) from video_bill AS VB ${cond}`);

    return count[0]['count(*)'];
  }

  // 更新
  async update(data) {
    const result = await this.app.mysql.update('video_bill', data);

    return result.affectedRows === 1;
  }

  // 删除
  async remove(id) {
    const result = await this.app.mysql.delete('video_bill', {
      id: id
    });

    return result.affectedRows === 1;
  }
}

module.exports = BillService