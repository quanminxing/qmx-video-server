'use strict';


module.exports = app => {
  class MonthServer extends app.Service {
    * insert(obj) {
      const result = yield app.mysql.insert('video_bill', {
        name: obj.name,
        work_id: obj.work_id || 0,
        price:obj.price,
        status:obj.status || 0,
        business:obj.business,
        platform_id:obj.platform_id,
        column_id:obj.column_id,
        video_id:obj.video_id,
        phone:obj.phone,
        comment:obj.comment,
        category_id:obj.category_id,
        openid: obj.openid,
        timestamp: app.mysql.literals.now,
      });

      return result;
    }

    // 获取列表
    * list(pageNum, pageSize) {
      const articles = yield app.mysql.query('select id,name,work_id,price,status,business,time,scale,channel,video_bill.timestamp,phone,category_id, platform_id,column_id,video_id,comment from video_bill order by timestamp desc limit ? offset ?;', [ pageSize, (pageNum - 1) * pageSize ]);
      return articles;
    }

    // 获取列表byren
    * listByUser(openid) {
      const articles = yield app.mysql.query('select video_bill.id,video_platform.name as platform_name,video_column.name as column_name,video_video.name as video_name, video_bill.name,video_bill.work_id,video_bill.price,video_bill.status,video_bill.business,video_bill.time,scale,channel,video_bill.timestamp,phone,video_bill.category_id,video_category.name, video_bill.platform_id,video_bill.column_id,video_bill.video_id,video_bill.comment from video_bill LEFT JOIN video_category on video_bill.category_id=video_category.id LEFT JOIN video_platform on video_bill.platform_id=video_platform.id  LEFT JOIN video_column on video_bill.column_id=video_column.id LEFT JOIN video_video on video_bill.video_id=video_video.id where openid = ? and video_bill.status != 3 order by timestamp desc;', [ openid ]);
      return articles;
    }

    // 获取某条信息
    * find(id) {
      const article = yield app.mysql.get('video_bill', { id });

      return article;
    }

    // 搜索
    * search(pageNum, pageSize, where) {
        let sql = 'select id,name,work_id,price,status,business,is_scene,is_audio,is_model,is_show,is_text,time,scale,channel,timestamp,phone,category_id,openid,platform_id,column_id,video_id,comment from video_bill where'
        sql += ' '+ where;
        sql += ' order by timestamp desc limit ? offset ?;'
        const articles = yield app.mysql.query(sql, [pageSize, (pageNum - 1) * pageSize ]);
        return articles;
    }
    // 总数
    * count(where) {
        const count = yield app.mysql.query('select count(*) from video_bill where ?', [where]);

        return count[0]['count(*)'];
    } 

    // 更新
    * update(data) {
      const result = yield app.mysql.update('video_bill', data);

      return result.affectedRows === 1;
    }

    // 删除
    * remove(id) {
      const result = yield app.mysql.delete('video_bill', {
        id:id
      });

      return result.affectedRows === 1;
    }

  }
  return MonthServer;
};
