'use strict';
const Service = require('egg').Service;

class BillService extends Service {
  async insert(obj) {
    const result = await this.app.mysql.insert('video_bill', {
      name: obj.name,
      work_id: obj.work_id || 0,
      price: obj.price,
      status: obj.status || 0,
      business: obj.business,
      platform_id: obj.platform_id,
      column_id: obj.column_id,
      video_id: obj.video_id,
      time: obj.time,
      phone: obj.phone,
      comment: obj.comment,
      category_id: obj.category_id,
      openid: obj.openid,
      timestamp: this.app.mysql.literals.now,
      email: obj.email
    });

    return result;
  }

  // 获取列表
  async list(pageNum, pageSize, param) {
    const cond = param ? param : ''
    const articles = await this.app.mysql.query(
      `select VB.id, VB.name, VB.work_id, VB.price, VB.status, VB.business, VB.scale, VB.channel, date_format(VB.timestamp, '%Y-%m-%d %H:%i') as timestamp,`
    + ` VB.phone, VB.category_id, VB.platform_id, VB.column_id, VB.video_id, VB.comment, VB.email,` 
    + ` VV.name AS video_name, VV.url AS video_url, VV.short_image AS video_short_image, VV.time AS video_time,`
    + ` VWOK.cname AS worker_name`
    + ` from video_bill AS VB`
    + ` LEFT JOIN video_video AS VV on VB.video_id = V.id`
    + ` LEFT JOIN video_worker AS VWOK on VB.work_id = VWOK.id`
    + ` ${cond} order by timestamp desc limit ${pageSize} offset ${(pageNum - 1) * pageSize};`);
    return articles;
  }

  // 获取列表byren
  async listByUser(openid, pageNum, pageSize) {
    try{
      const articles = await this.app.mysql.query(
        `select VB.id, VPF.name as platform_name, VCOL.name as column_name, VV.name as video_name,`
        + ` VB.name, VB.work_id, VB.price, VB.status, VB.business, VB.time,`
        + ` scale, channel, date_format(VB.timestamp,'%Y-%m-%d %H:%i') as timestamp,`
        + ` VB.phone, VB.category_id, VC.name AS category_name, VB.platform_id, VB.column_id,`
        + ` VB.video_id, VB.comment, VB.email,`
        + ` VWOK.cname AS worker_name`
        + ` from video_bill AS VB`
        + ` LEFT JOIN video_category AS VC on VB.category_id = VC.id `
        + ` LEFT JOIN video_platform AS VPF on VB.platform_id = VPF.id`
        + ` LEFT JOIN video_column AS VCOL on VB.column_id = VCOL.id`
        + ` LEFT JOIN video_video AS VV on VB.video_id = VV.id`
        + ` LEFT JOIN video_worker AS VWOK on VB.work_id = VWOK.id`
        + ` where openid = '${openid}' and VB.status != 3 order by timestamp desc limit ${pageSize} offset ${(pageNum - 1) * pageSize};`);
      return articles;
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
    let sql = "select id,name,work_id,price,status,business,is_scene,is_audio,is_model,is_show,is_text,time,scale,channel,date_format(timestamp,'%Y-%m-%d %H:%i') as timestamp, phone,category_id,openid,platform_id,column_id,video_id,comment from video_bill where"
    sql += ' ' + where;
    sql += ` order by timestamp desc limit ${pageSize} offset ${(pageNum - 1) * pageSize};`
    const articles = await this.app.mysql.query(sql);
    return articles;
  }
  // 总数
  async count(where) {
    const count = await this.app.mysql.query('select count(*) from video_bill where ?', [where]);

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