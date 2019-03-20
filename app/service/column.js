'use strict';

module.exports = app => {
  class MonthServer extends app.Service {
    * insert(obj) {
      const result = yield app.mysql.insert('video_column', {
        name: obj.name,
        comment: obj.comment,
        platform_id: obj.platform_id,
        status:obj.status,
        timestamp: app.mysql.literals.now,
      });

      return result.affectedRows === 1;
    }

    // 获取列表
    * list(pageNum, pageSize) {
      const articles = yield app.mysql.query('select  id,name, comment,status,platform_id, timestamp from video_column order by timestamp desc;', [ pageSize, (pageNum - 1) * pageSize ]);
      return articles;
    }

    // 通过 获取id
    * listByPlatformId(pageNum, pageSize, platform_id) {
      const articles = yield app.mysql.query('select * from video_column where platform_id = ? order by timestamp desc limit ? offset ?;', [ platform_id, pageSize, (pageNum - 1) * pageSize ]);
      return articles;
    }

    // 获取某条信息
    * find(id) {
      const article = yield app.mysql.get('video_platform', { id });

      return article;
    }

    // 搜索
    * search(pageNum, pageSize, where) {
      let sql = 'select  id,name, platform_id,  comment, status, timestamp from video_column where'
      sql += ' '+ where;
      sql += ' order by timestamp desc limit ? offset ?;'
      const articles = yield app.mysql.query(sql, [pageSize, (pageNum - 1) * pageSize ]);
      return articles;
    }
    // 总数
    * count(where) {
      const count = yield app.mysql.query('select count(*) from video_column where ?', [where]);

      return count[0]['count(*)'];
    }

    // 更新
    * update(data) {
      const result = yield app.mysql.update('video_column', data);

      return result.affectedRows === 1;
    }

    // 删除
    * remove(id) {
      const result = yield app.mysql.delete('video_column', {
        id:id
      });

      return result.affectedRows === 1;
    }

  }
  return MonthServer;
};
