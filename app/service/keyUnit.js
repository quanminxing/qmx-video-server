'use strict';
const Service = require('egg').Service;


class KeyUnitService extends Service {
  async insert(obj) {
    const result = await this.app.mysql.insert('video_key_unit', {
      name: obj.name,
      url: obj.url,
      description: obj.description,
      key_id: obj.key_id,
      price: obj.price,
      work_id: obj.work_id,
      timestamp: this.app.mysql.literals.now,
    });

    return result.affectedRows === 1;
  }

  // 获取列表
  async list(pageNum, pageSize) {
    const articles = await this.app.mysql.query('select * from video_key_unit order by timestamp desc limit ? offset ?;', [pageSize, (pageNum - 1) * pageSize]);
    return articles;
  }
  async listByKeyid(pageNum, pageSize, key_id) {
    const articles = await this.app.mysql.query('select * from video_key_unit where key_id = ? order by timestamp desc limit ? offset ?;', [key_id, pageSize, (pageNum - 1) * pageSize]);
    return articles;
  }
  // 获取某条信息
  async find(id) {
    const article = await this.app.mysql.get('video_key_unit', { id });

    return article;
  }

  // 总数
  async count(where) {
    const count = await this.app.mysql.query('select count(*) from video_key_unit where ' + where);
    return count[0]['count(*)'];
  }
  async getChildNode(id) {
    const res = await this.app.mysql.query('SELECT getChild(?) as childs', [id]);
    return res
  }




  // 更新
  async update(data) {
    const result = await this.app.mysql.update('video_key_unit', data);

    return result.affectedRows === 1;
  }

  // 删除
  async remove(id) {
    const result = await this.app.mysql.delete('video_key_unit', {
      id: id
    });

    return result.affectedRows === 1;
  }

}

module.exports = KeyUnitService