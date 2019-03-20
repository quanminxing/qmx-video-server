'use strict';

module.exports = app => {
    class MonthServer extends app.Service {
        * insert(obj) {
            const result = yield app.mysql.insert('video_key', {
                name: obj.name,
                parent_id: obj.parent_id,
                level: obj.level,
            });

            return result;
        }

        // 获取列表
        * list(pageNum, pageSize) {
            const articles = yield app.mysql.query('select id,name,parent_id,level from video_key;', [pageSize, (pageNum - 1) * pageSize]);
            return articles;
        }

        // 获取某条信息
        * find(id) {
            const article = yield app.mysql.get('video_key', { id });

            return article;
        }


        // 总数
        * count(where) {
            const count = yield app.mysql.query('select count(*) from video_key where ?', [where]);

            return count[0]['count(*)'];
        }

        // 更新
        * update(data) {
            const result = yield app.mysql.update('video_key', data);

            return result.affectedRows === 1;
        }

        // 删除
        * remove(id) {
            const result = yield app.mysql.delete('video_key', {
                id: id
            });

            return result.affectedRows === 1;
        }

    }
    return MonthServer;
};
