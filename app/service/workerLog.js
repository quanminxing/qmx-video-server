'use strict';

module.exports = app => {
    class MonthServer extends app.Service {
        * insert(obj) {
            const result = yield app.mysql.insert('video_worker_log', {
                event: obj.event,
                place: obj.place,
                time: app.mysql.literals.now,
                work_id: obj.work_id
            });

            return result;
        }

        // 获取列表
        * list(pageNum, pageSize) {
            const articles = yield app.mysql.query('select event,place,time,work_id from video_worker_log;', [pageSize, (pageNum - 1) * pageSize]);
            return articles;
        }
        // 获取某人列表
        * listByUser(pageNum, pageSize, work_id) {
            const articles = yield app.mysql.query('select event,place,time,work_id from video_worker_log where work_id = ? order by time desc limit ? offset ?;', [work_id, pageSize, (pageNum - 1) * pageSize] );
            return articles;
        }
        // 获取某条信息
        * find(id) {
            const article = yield app.mysql.get('video_worker_log', { id });

            return article;
        }


        // 总数
        * count(where) {
            const count = yield app.mysql.query('select count(*) from video_worker_log where ?', [where]);

            return count[0]['count(*)'];
        }

        // 更新
        * update(data) {
            const result = yield app.mysql.update('video_worker_log', data);

            return result.affectedRows === 1;
        }

        // 删除
        * remove(id) {
            const result = yield app.mysql.delete('video_worker_log', {
                id: id
            });

            return result.affectedRows === 1;
        }

    }
    return MonthServer;
};
