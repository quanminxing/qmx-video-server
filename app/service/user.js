'use strict';

module.exports = app => {
    class MonthServer extends app.Service {
        * insert(obj) {
            const result = yield app.mysql.insert('video_user', {
                name: obj.name,
                company: obj.company,
                id: obj.id,
                phone: obj.phone
            });

            return result;
        }

        // 获取某条信息
        * find(openid) {
            const article = yield app.mysql.get('video_user', { id: openid });

            return article;
        }

        // 更新
        * update(data) {
            const result = yield app.mysql.update('video_user', data);

            return result.affectedRows === 1;
        }

    }
    return MonthServer;
};
