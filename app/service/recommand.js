'use strict';

module.exports = app => {
  class MonthServer extends app.Service {
    * insert(obj) {
      const result = yield app.mysql.insert('video_recommand', {
        video_id:obj.video_id,
        datetime: app.mysql.literals.now,
      });

      return result.affectedRows === 1;
    }

    // 获取列表
    * list(pageNum, pageSize) {
      const articles = yield app.mysql.query('select video_recommand.id as id, video_video.id as video_id,video_video.name, datetime from video_recommand left join video_video on video_recommand.video_id = video_video.id order by video_recommand.datetime desc limit ? offset ?;', [ pageSize, (pageNum - 1) * pageSize ]);
      return articles;
    }

    // 获取某条信息
    * find(id) {
      const article = yield app.mysql.get('video_recommand', { id });

      return article;
    }

    // 搜索
    * search(pageNum, pageSize, where) {
      let sql = 'select  id,video_id, datetime from video_recommand where'
      sql += ' '+ where;
      sql += ' order by timestamp desc limit ? offset ?;'
      const articles = yield app.mysql.query(sql, [pageSize, (pageNum - 1) * pageSize ]);
      return articles;
    }
    // 总数
    * count(where) {
      const count = yield app.mysql.query('select count(*) from video_recommand where ?', [where]);

      return count[0]['count(*)'];
    }

    // 更新
    * update(data) {
      const result = yield app.mysql.update('video_recommand', data);

      return result.affectedRows === 1;
    }

    // 删除
    * remove(id) {
      const result = yield app.mysql.delete('video_recommand', {
        id:id
      });

      return result.affectedRows === 1;
    }

  }
  return MonthServer;
};
