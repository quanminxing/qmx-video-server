'use strict';

module.exports = app => {
    class MonthServer extends app.Service {
        * insert(obj) {
            let result;
            const exist = yield app.mysql.select('video_user_fav', {
                where: {
                    user_id: obj.user_id,
                    video_id: obj.video_id,
                },
              });
            
            if(exist && exist.length!==0){
                result = yield app.mysql.update('video_user_fav', {
                    id: exist[0].id,
                    datetime: app.mysql.literals.now,
                });
            }else{
                result = yield app.mysql.insert('video_user_fav', {
                    user_id: obj.user_id,
                    video_id: obj.video_id,
                    datetime: app.mysql.literals.now,
                });
            }

            return result;
        }

        // 获取某人列表
        * listByUser(pageNum, pageSize, work_id) {
            const articles = yield app.mysql.query('select video_id, datetime ,video_video.name,video_video.price,video_video.url,video_video.short_image from video_user_fav LEFT JOIN video_video on video_video.id = video_user_fav.video_id where user_id = ? order by datetime desc limit ? offset ?;', [work_id, pageSize, (pageNum - 1) * pageSize] );
            return articles;
        }
        // 获取某条信息
        * find(id) {
            const article = yield app.mysql.get('video_user_fav', { id });
            return article;
        }

        // 获取某条信息是否被收藏
        * findByUser(openid, id){
            const articles = yield app.mysql.query('select video_id from video_user_fav where user_id = ? and video_id = ?;', [openid, id]);
            return articles;
        }


        // 总数
        * count(where) {
            const count = yield app.mysql.query('select count(*) from video_user_fav where ?', [where]);

            return count[0]['count(*)'];
        }

        // 更新
        * update(data) {
            const result = yield app.mysql.update('video_user_fav', data);

            return result.affectedRows === 1;
        }

        // 删除
        * remove(id) {
            const result = yield app.mysql.delete('video_user_fav', {
                id: id
            });

            return result.affectedRows === 1;
        }

        * deleteFromUser(ids, openid){
            const result = yield app.mysql.query('delete from video_user_fav where video_id in(' + ids + ') and user_id = ?', [openid]);

            return result
        }

    }
    return MonthServer;
};
