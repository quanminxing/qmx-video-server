'use strict';
const Service = require('egg').Service;


class StyleService extends Service {
  async insert(obj) {
    const result = await this.app.mysql.insert('video_style', {
      name: obj.name,
      comment: obj.comment,
      status: obj.status,
      timestamp: this.app.mysql.literals.now,
    });

    return result.affectedRows === 1;
  }

  // 获取列表
  async list(pageNum, pageSize) {
    const articles = await this.app.mysql.query('select  id,name, comment,status, timestamp from video_style order by timestamp desc;', [pageSize, (pageNum - 1) * pageSize]);
    return articles;
  }

  // 获取某条信息
  async find(id) {
    const article = await this.app.mysql.get('video_style', { id });

    return article;
  }

  // 搜索
  async search(pageNum, pageSize, where) {
    let sql = 'select  id,name,  comment, status, timestamp from video_style where'
    sql += ' ' + where;
    sql += ' order by timestamp desc limit ? offset ?;'
    const articles = await this.app.mysql.query(sql, [pageSize, (pageNum - 1) * pageSize]);
    return articles;
  }
  // 总数
  async count(where) {
    const count = await this.app.mysql.query('select count(*) from video_style where ?', [where]);

    return count[0]['count(*)'];
  }

  // 更新
  async update(data) {
    const result = await this.app.mysql.update('video_style', data);

    return result.affectedRows === 1;
  }

  // 删除
  async remove(id) {
    const result = await this.app.mysql.delete('video_style', {
      id: id
    });

    return result.affectedRows === 1;
  }

}
module.exports = StyleService
