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
      phone: obj.phone,
      comment: obj.comment,
      openid: obj.openid,
      timestamp: this.app.mysql.literals.now,
      order_time: this.app.mysql.literals.now,
      email: obj.email,
      order_id: util.getDate() + '01' + util.getSixRandom(),
      pay_status:'未付款',
      refund_price:0.00,
      trade_status:'待付款',
      order_source: '宜拍小程序',
      settle_status: '全款',
      earnest_price: 0.00,
      paid_price: 0.00,
      sale_status: '待支付全款'
    });

    return result;
  }

  // 获取列表
  async list(cond, pageNum, pageSize) {
    const param = cond ? cond : ''
    let sql = `select VB.id, VB.phone, VCOL.name as column_name, VB.video_id, VB.comment, VB.email,VB.order_id, VB.pay_status, VB.refund_price, date_format(VB.refund_time,'%Y-%m-%d %H:%i:%s') AS refund_time,`
    + ` VB.name, IF(VB.work_id=0, 15, VB.work_id) AS work_id, VB.price, VB.status, VB.business, VB.trade_status, VB.work_comment,date_format(VB.timestamp,'%Y-%m-%d %H:%i:%s') as timestamp, date_format(VB.order_time, '%Y-%m-%d %H:%i:%s') AS order_time,`
    + ` VB.product_name, VB.product_url, VB.product_scale,`
    + ` date_format(VB.trade_time, '%Y-%m-%d %H:%i:%s') AS trade_time, VB.earnest_price, VB.paid_price, VB.sale_status, VB.settle_status, VB.order_source,`
    + ` VPF.name as platform_name,`
    + ` VV.name as video_name, VV.category_id, VV.platform_id, VV.column_id, VV.classify_id, VV.time AS video_time, VV.scale_id, VV.is_model, VV.sence, VV.short_image, VV.usage_id,`
    + ` VC.name AS category_name,`
    + ` VU.name AS usage_name,VU.comment AS usage_comment,`
    + ` IF(VWOK.cname = "" || ISNULL(VWOK.cname)=1, "汪涛", VWOK.cname) AS worker_name, IF(VWOK.phone = "" || ISNULL(VWOK.phone)=1, "15345817944", VWOK.phone) AS worker_phone,`
    + ` IF(VWOK.email = "" || ISNULL(VWOK.email)=1, "", VWOK.email) AS worker_email`

    + ` from video_bill AS VB`
    + ` LEFT JOIN video_video AS VV on video_id = VV.id`
    + ` LEFT JOIN video_category AS VC on VV.category_id = VC.id `
    + ` LEFT JOIN video_platform AS VPF on VV.platform_id = VPF.id`
    + ` LEFT JOIN video_column AS VCOL on VV.column_id = VCOL.id`
    + ` LEFT JOIN video_usage AS VU on VV.usage_id = VU.id`
    + ` LEFT JOIN video_worker AS VWOK on VB.work_id = VWOK.id`

    + ` ${param} order by timestamp desc`
    if(pageNum && pageSize) {
      sql += ` limit ${pageSize} offset ${(pageNum - 1) * pageSize};`
    }
    const bill_records = await this.app.mysql.query(sql);
    return bill_records;
  }

  // 获取列表byren
  async listByUser(cond, pageNum, pageSize) {
    try {
      let sql = `select VB.id, VB.phone, VCOL.name as column_name, VB.video_id, VB.comment, VB.email,VB.order_id, VB.pay_status, VB.refund_price, date_format(VB.refund_time,'%Y-%m-%d %H:%i:%s') AS refund_time,`
        + ` VB.name, IF(VB.work_id=0, 15, VB.work_id) AS work_id, VB.price, VB.status, VB.business, VB.trade_status, VB.work_comment,date_format(VB.timestamp,'%Y-%m-%d %H:%i:%s') as timestamp, date_format(VB.order_time, '%Y-%m-%d %H:%i:%s') AS order_time,`
        + ` date_format(VB.trade_time, '%Y-%m-%d %H:%i:%s') AS trade_time, VB.earnest_price, VB.paid_price, VB.sale_status, VB.settle_status, VB.order_source,`
        + ` VB.product_name, VB.product_url, VB.product_scale,`
        + ` VPF.name as platform_name, `
        + ` VV.name as video_name, VV.category_id, VV.platform_id, VV.column_id, VV.classify_id, VV.time AS video_time, VV.scale_id, VV.is_model, VV.sence, VV.short_image, VV.usage_id,`
        + ` VC.name AS category_name,`
        + ` VU.name AS usage_name,`
        + ` IF(VWOK.cname = "" || ISNULL(VWOK.cname)=1, "汪涛", VWOK.cname) AS worker_name, IF(VWOK.phone = "" || ISNULL(VWOK.phone)=1, "15345817944", VWOK.phone) AS worker_phone,`
        + ` (select concat_ws(',', id, verify, type) from video_pay_record  where order_id = VB.order_id order by id desc limit 1) AS pay_info`
        + ` from video_bill AS VB`
        + ` LEFT JOIN video_video AS VV on video_id = VV.id`
        + ` LEFT JOIN video_category AS VC on VV.category_id = VC.id `
        + ` LEFT JOIN video_platform AS VPF on VV.platform_id = VPF.id`
        + ` LEFT JOIN video_column AS VCOL on VV.column_id = VCOL.id`
        + ` LEFT JOIN video_usage AS VU on VV.usage_id = VU.id`
        + ` LEFT JOIN video_worker AS VWOK on VB.work_id = VWOK.id`

        + `${cond} order by timestamp desc limit ${pageSize} offset ${(pageNum - 1) * pageSize};`
      const bill_records = await this.app.mysql.query(sql);
      return bill_records;
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
    const record = await this.app.mysql.get('video_bill', { id });

    return record;
  }

  async findByOrder(order_id) {
    const result = this.app.mysql.get('video_bill', {
      order_id: order_id
    })
    return result;
  }

  // 总数
  async count(cond) {
    console.log(cond)
    const count = await this.app.mysql.query(`select count(*) from video_bill AS VB ${cond}`);

    return count[0]['count(*)'];
  }

  // 更新
  async update(data) {
    let result;
    result = await this.app.mysql.update('video_bill', data);
 
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