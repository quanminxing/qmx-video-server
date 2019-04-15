'use strict';
const Service = require('egg').Service;


class BusinessService extends Service {
  async insert(obj) {
    const result = await this.app.mysql.insert('video_business', {
      name: obj.name,
      work_id: obj.work_id,
      phone: obj.phone,
      status: obj.status,
      timestamp: this.app.mysql.literals.now,
    });

    return result.affectedRows === 1;
  }

  // 获取列表
  async list(pageNum, pageSize) {
    const articles = await this.app.mysql.query('select  id,name,  work_id, phone, status, timestamp from video_business order by timestamp desc limit ? offset ?;', [pageSize, (pageNum - 1) * pageSize]);
    return articles;
  }

  // 获取某条信息
  async find(id) {
    const article = await this.app.mysql.get('video_business', { id });

    return article;
  }

  // 搜索
  async search(pageNum, pageSize, where) {
    let sql = 'select  id,name,  work_id, phone, status, timestamp from video_business where'
    sql += ' ' + where;
    sql += ' order by timestamp desc limit ? offset ?;'
    const articles = await this.app.mysql.query(sql, [pageSize, (pageNum - 1) * pageSize]);
    return articles;
  }
  // 总数
  async count(where) {
    const count = await this.app.mysql.query('select count(*) from video_business where ?', [where]);

    return count[0]['count(*)'];
  }

  // 更新
  async update(data) {
    const result = await this.app.mysql.update('video_business', data);

    return result.affectedRows === 1;
  }

  // 删除
  async remove(id) {
    const result = await this.app.mysql.delete('video_business', {
      id: id
    });

    return result.affectedRows === 1;
  }

}

module.exports = BusinessService