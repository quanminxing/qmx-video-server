'use strict';
const Service = require('egg').Service;


class ColumnService extends Service {
  async insert(obj) {
    const result = await this.app.mysql.insert('video_column', {
      name: obj.name,
      comment: obj.comment,
      platform_id: obj.platform_id,
      status: obj.status,
      timestamp: this.app.mysql.literals.now,
    });

    return result.affectedRows === 1;
  }

  // 获取列表
  async list(pageNum, pageSize) {
    const articles = await this.app.mysql.query('select  id,name, comment,status,platform_id, timestamp from video_column order by timestamp desc;', [pageSize, (pageNum - 1) * pageSize]);
    return articles;
  }

  // 通过 获取id
  async listByPlatformId(pageNum, pageSize, platform_id) {
    const articles = await this.app.mysql.query(`select * from video_column where platform_id = ${platform_id} order by timestamp desc limit ${pageSize} offset ${(pageNum - 1) * pageSize};`);
    return articles;
  }

  // 获取某条信息
  async find(id) {
    const article = await this.app.mysql.get('video_platform', { id });

    return article;
  }

  // 搜索
  async search(pageNum, pageSize, where) {
    let sql = 'select  id,name, platform_id,  comment, status, timestamp from video_column where'
    sql += ' ' + where;
    sql += ` order by timestamp desc limit ${pageSize} offset ${(pageNum - 1) * pageSize};`
    const articles = await this.app.mysql.query(sql);
    return articles;
  }
  // 总数
  async count(where) {
    const count = await this.app.mysql.query('select count(*) from video_column where ?', [where]);

    return count[0]['count(*)'];
  }

  // 更新
  async update(data) {
    const result = await this.app.mysql.update('video_column', data);

    return result.affectedRows === 1;
  }

  // 删除
  async remove(id) {
    const result = await this.app.mysql.delete('video_column', {
      id: id
    });

    return result.affectedRows === 1;
  }

}

module.exports = ColumnService

