'use strict';

const Service = require('egg').Service;

class RecommandService extends Service {
  async insert(obj) {
    const result = await this.app.mysql.insert('video_recommand', {
      video_id: obj.video_id,
      datetime: this.app.mysql.literals.now,
    });

    return result.affectedRows === 1;
  }

  // 获取列表
  async list(pageNum, pageSize) {
    const articles = await this.app.mysql.query('select video_recommand.id as id, video_video.id as video_id,video_video.name, datetime from video_recommand left join video_video on video_recommand.video_id = video_video.id order by video_recommand.datetime desc limit ? offset ?;', [pageSize, (pageNum - 1) * pageSize]);
    return articles;
  }

  // 获取某条信息
  async find(id) {
    const article = await this.app.mysql.get('video_recommand', { id });

    return article;
  }

  // 搜索
  async search(pageNum, pageSize, where) {
    let sql = 'select  id,video_id, datetime from video_recommand where'
    sql += ' ' + where;
    sql += ' order by timestamp desc limit ? offset ?;'
    const articles = await this.app.mysql.query(sql, [pageSize, (pageNum - 1) * pageSize]);
    return articles;
  }
  // 总数
  async count(where) {
    const count = await this.app.mysql.query('select count(*) from video_recommand where ?', [where]);

    return count[0]['count(*)'];
  }

  // 更新
  async update(data) {
    const result = await this.app.mysql.update('video_recommand', data);

    return result.affectedRows === 1;
  }

  // 删除
  async remove(id) {
    const result = await this.app.mysql.delete('video_recommand', {
      id: id
    });

    return result.affectedRows === 1;
  }
}
module.exports = RecommandService;

