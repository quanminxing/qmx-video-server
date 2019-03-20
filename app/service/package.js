'use strict';

module.exports = app => {
  class MonthServer extends app.Service {
    * insert(obj) {
      const result = yield app.mysql.insert('video_package', {
        name: obj.name,
        work_id: obj.work_id,
        video_ids:obj.video_ids,
        pic:obj.pic,
        price:obj.price,
        status:obj.status,
        timestamp: app.mysql.literals.now,
      });

      return result.affectedRows === 1;
    }

    // 获取列表
    * list(pageNum, pageSize) {
      const articles = yield app.mysql.query('select  id,name,  work_id, video_ids, pic, price,status, timestamp from video_package order by timestamp desc;', [ pageSize, (pageNum - 1) * pageSize ]);
      return articles;
    }

    // 获取某条信息
    * find(id) {
      const article = yield app.mysql.get('video_package', { id });

      return article;
    }

    // 搜索
    * search(pageNum, pageSize, where) {
      let sql = 'select  id,name,  work_id, video_ids, pic, price, status, timestamp from video_package where'
      sql += ' '+ where;
      sql += ' order by timestamp desc limit ? offset ?;'
      const articles = yield app.mysql.query(sql, [pageSize, (pageNum - 1) * pageSize ]);
      return articles;
    }
    // 总数
    * count(where) {
      const count = yield app.mysql.query('select count(*) from video_package where ?', [where]);

      return count[0]['count(*)'];
    }

    // 更新
    * update(data) {
      const result = yield app.mysql.update('video_package', data);

      return result.affectedRows === 1;
    }

    // 删除
    * remove(id) {
      const result = yield app.mysql.delete('video_package', {
        id:id
      });

      return result.affectedRows === 1;
    }

  }
  return MonthServer;
};
