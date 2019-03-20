'use strict';

module.exports = app => {
    class MonthServer extends app.Service {
        * insert(obj) {
            let result;
            const exist = yield app.mysql.select('video_log', {
                where: {
                    user_id: obj.user_id,
                    video_id: obj.video_id,
                },
              });
            
            if(exist && exist.length!==0){
                result = yield app.mysql.update('video_log', {
                    id: exist[0].id,
                    datetime: app.mysql.literals.now,
                });
            }else{
                result = yield app.mysql.insert('video_log', {
                    user_id: obj.user_id,
                    video_id: obj.video_id,
                    datetime: app.mysql.literals.now,
                });
            }

            return result;
        }

        // 获取列表
        * list(pageNum, pageSize) {
            const articles = yield app.mysql.query('select * from video_log;', [pageSize, (pageNum - 1) * pageSize]);
            return articles;
        }
        // 获取某人列表
        * listByUser(pageNum, pageSize, work_id) {
            const articles = yield app.mysql.query('select video_id, datetime ,video_video.name,video_video.price,video_video.url,video_video.short_image from video_log LEFT JOIN video_video on video_video.id = video_log.video_id where user_id = ? order by datetime desc limit ? offset ?;', [work_id, pageSize, (pageNum - 1) * pageSize] );
            return articles;
        }
        // 获取某条信息
        * find(id) {
            const article = yield app.mysql.get('video_log', { id });
            return article;
        }


        // 总数
        * count(where) {
            const count = yield app.mysql.query('select count(*) from video_log where ?', [where]);

            return count[0]['count(*)'];
        }

        // 更新
        * update(data) {
            const result = yield app.mysql.update('video_log', data);

            return result.affectedRows === 1;
        }

        // 删除
        * remove(id) {
            const result = yield app.mysql.delete('video_log', {
                id: id
            });

            return result.affectedRows === 1;
        }


        * deleteFromUser(ids, openid){
            const result = yield app.mysql.query('delete from video_log where video_id in(' + ids + ') and user_id = ?', [openid]);

            return result
        }

    }
    return MonthServer;
};
