'use strict';

module.exports = app => {
  class MonthServer extends app.Service {
    * insert(obj) {
      console.log(obj);
      const result = yield app.mysql.insert('video_video', {
        work_id:obj.work_id,
        name:obj.name,
        description:obj.description,
        demo_description:obj.demo_description,
        demo_pic:obj.demo_pic,
        category_id:obj.category_id,
        price:obj.price,
        business:obj.business,
        time:obj.time,
        format:obj.format,
        url:obj.url,
        is_audio:obj.is_audio,
        is_model:obj.is_model,
        is_scene:obj.is_scene,
        is_show:obj.is_show,
        is_text:obj.is_text,
        platform_id:obj.platform_id,
        column_id:obj.column_id,
        keystring: obj.keystring,
        short_image: obj.short_image,
        timestamp: app.mysql.literals.now,
        style_id:obj.style_id,
        usage_id:obj.usage_id
      });

      return result.affectedRows === 1;
    }

    // 获取列表
    * list(pageNum, pageSize, orderby) {
      let articles, sql;

      if(orderby){
        sql = 'select * from video_video where deleted = 0 ' + orderby;
        articles = yield app.mysql.query(sql + ' limit ? offset ?;', [ pageSize, (pageNum - 1) * pageSize ]);
      }else{
        articles = yield app.mysql.query('select * from video_video where deleted = 0 order by timestamp desc limit ? offset ?;', [ pageSize, (pageNum - 1) * pageSize ]);
      }
       
      return articles;
    }

    // 获取某条信息
    * find(id) {
      const article = yield app.mysql.query('select video_style.name as style_name, video_usage.name as usage_name, video_video.id as video_id ,video_video.name as video_name, video_video.price, business, time,video_video.platform_id,video_video.column_id,keystring, format,work_id, url, is_audio, is_text, is_model, is_show, is_scene, short_image,demo_description,demo_pic, video_category.name as category_name, video_platform.name as platform_name, video_column.name as column_name, video_video.timestamp,category_id, description from video_video LEFT JOIN video_category on video_video.category_id = video_category.id LEFT JOIN video_platform on video_video.platform_id = video_platform.id LEFT JOIN video_column on video_video.column_id = video_column.id LEFT JOIN video_usage on video_video.usage_id = video_usage.id LEFT JOIN video_style on video_video.style_id = video_style.id where video_video.id = ?;', [ id ]);

      return article;
    }

    * listByHot(pageSize){
      const articles = yield app.mysql.query('select * from video_hot LEFT JOIN video_video  on video_hot.video_id=video_video.id order by pv desc limit ?;', [ pageSize ]);
      return articles;
    }

    * listByRecommand(where, pageSize){
      let sql = '';
      if(where){
        sql = `select * from video_video WHERE id >= (SELECT floor(RAND() * (SELECT MAX(id) FROM video_video))) ${where} ORDER BY id LIMIT 6`
      }else{
        sql = `select video_id as id,video_video.time ,video_video.name as name, video_video.short_image as short_image from video_recommand LEFT JOIN video_video on video_recommand.video_id=video_video.id ORDER BY video_recommand.id LIMIT 6`
      }

      const articles = yield app.mysql.query(sql);
      return articles;
    }

  
    
    // 搜索
    * search(pageNum, pageSize, where) {
        let sql = 'select * from video_video where deleted = 0 and'
        sql += ' '+ where;
        sql += ' order by timestamp desc limit ? offset ?;'
        const articles = yield app.mysql.query(sql, [pageSize, (pageNum - 1) * pageSize ]);
        return articles;
    }


    // 搜索
    * searchByKeyword(pageNum, pageSize, keyword) {
      let sql = `select id,name,url,short_image,price from video_video where name like '%` +keyword +`%' order by timestamp desc limit ? offset ?;`; 
      const articles = yield app.mysql.query(sql, [pageSize, (pageNum - 1) * pageSize ]);
      return articles;
    }

    // 总数
    * count(where) {
        const count = yield app.mysql.query('select count(*) from video_video where ?', [where]);

        return count[0]['count(*)'];
    } 

    // 更新
    * update(data) {
      const result = yield app.mysql.update('video_video', data);

      return result.affectedRows === 1;
    }

    // 删除
    * remove(id) {
      const result = yield app.mysql.delete('video_video', {
        id:id,
      });

      return result.affectedRows === 1;
    }

  }
  return MonthServer;
};
