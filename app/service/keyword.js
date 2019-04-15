'use strict';
const Service = require('egg').Service;


class KeywordService extends Service {
    async insert(obj) {
        let result;
        const exist = await this.app.mysql.select('video_search', {
            where: {
                user_id: obj.user_id,
                keyword: obj.keyword,
            },
        });

        if (exist && exist.length !== 0) {

        } else {
            result = await this.app.mysql.insert('video_search', {
                user_id: obj.user_id,
                keyword: obj.keyword,
                datetime: this.app.mysql.literals.now,
            });
        }

        return result;
    }

    // 获取列表
    async list(pageNum, pageSize) {
        const articles = await this.app.mysql.query('select * from video_search;', [pageSize, (pageNum - 1) * pageSize]);
        return articles;
    }
    // 获取某人列表
    async listByUser(pageNum, pageSize, work_id) {
        const articles = await this.app.mysql.query('select * from video_search where user_id = ? order by datetime desc limit ? offset ?;', [work_id, pageSize, (pageNum - 1) * pageSize]);
        return articles;
    }
    // 获取某条信息
    async find(id) {
        const article = await this.app.mysql.get('video_search', { id });
        return article;
    }


    // 总数
    async count(where) {
        const count = await this.app.mysql.query('select count(*) from video_search where ?', [where]);

        return count[0]['count(*)'];
    }

    // 更新
    async update(data) {
        const result = await this.app.mysql.update('video_search', data);

        return result.affectedRows === 1;
    }

    // 删除
    async remove(id) {
        const result = await this.app.mysql.delete('video_search', {
            id: id
        });

        return result.affectedRows === 1;
    }

    async deleteFromUser(openid) {
        const result = await this.app.mysql.query('delete from video_search where user_id = ?', [openid]);

        return result
    }

}
module.exports = KeywordService