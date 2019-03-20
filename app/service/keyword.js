'use strict';

module.exports = app => {
    class MonthServer extends app.Service {
        * insert(obj) {
            let result;
            const exist = yield app.mysql.select('video_search', {
                where: {
                    user_id: obj.user_id,
                    keyword: obj.keyword,
                },
              });
            
            if(exist && exist.length!==0){
                
            }else{
                result = yield app.mysql.insert('video_search', {
                    user_id: obj.user_id,
                    keyword: obj.keyword,
                    datetime: app.mysql.literals.now,
                });
            }

            return result;
        }

        // 获取列表
        * list(pageNum, pageSize) {
            const articles = yield app.mysql.query('select * from video_search;', [pageSize, (pageNum - 1) * pageSize]);
            return articles;
        }
        // 获取某人列表
        * listByUser(pageNum, pageSize, work_id) {
            const articles = yield app.mysql.query('select * from video_search where user_id = ? order by datetime desc limit ? offset ?;', [work_id, pageSize, (pageNum - 1) * pageSize] );
            return articles;
        }
        // 获取某条信息
        * find(id) {
            const article = yield app.mysql.get('video_search', { id });
            return article;
        }


        // 总数
        * count(where) {
            const count = yield app.mysql.query('select count(*) from video_search where ?', [where]);

            return count[0]['count(*)'];
        }

        // 更新
        * update(data) {
            const result = yield app.mysql.update('video_search', data);

            return result.affectedRows === 1;
        }

        // 删除
        * remove(id) {
            const result = yield app.mysql.delete('video_search', {
                id: id
            });

            return result.affectedRows === 1;
        }

        * deleteFromUser(openid){
            const result = yield app.mysql.query('delete from video_search where user_id = ?', [openid]);

            return result
        }

    }
    return MonthServer;
};
