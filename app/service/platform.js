'use strict';

module.exports = app => {
  class MonthServer extends app.Service {
    * insert(obj) {
      const result = yield app.mysql.insert('video_platform', {
        name: obj.name,
        comment: obj.comment,
        status:obj.status,
        timestamp: app.mysql.literals.now,
      });

      return result.affectedRows === 1;
    }

    // 获取列表
    * list(pageNum, pageSize) {
      const articles = yield app.mysql.query('select  id,name, comment,status, timestamp from video_platform order by timestamp desc;', [ pageSize, (pageNum - 1) * pageSize ]);
      return articles;
    }

    // 获取某条信息
    * find(id) {
      const article = yield app.mysql.get('video_platform', { id });

      return article;
    }

    // 搜索
    * search(pageNum, pageSize, where) {
      let sql = 'select  id,name,  comment, status, timestamp from video_platform where'
      sql += ' '+ where;
      sql += ' order by timestamp desc limit ? offset ?;'
      const articles = yield app.mysql.query(sql, [pageSize, (pageNum - 1) * pageSize ]);
      return articles;
    }
    // 总数
    * count(where) {
      const count = yield app.mysql.query('select count(*) from video_platform where ?', [where]);

      return count[0]['count(*)'];
    }

    // 更新
    * update(data) {
      const result = yield app.mysql.update('video_platform', data);

      return result.affectedRows === 1;
    }

    // 删除
    * remove(id) {
      const result = yield app.mysql.delete('video_platform', {
        id:id
      });

      return result.affectedRows === 1;
    }

  }
  return MonthServer;
};
