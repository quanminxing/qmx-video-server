'use strict';
const Service = require('egg').Service;

class WorkerLogService extends Service {
    async insert(obj) {
        const result = await this.app.mysql.insert('video_worker_log', {
            event: obj.event,
            place: obj.place,
            time: this.app.mysql.literals.now,
            work_id: obj.work_id
        });

        return result;
    }

    // 获取列表
    async list(pageNum, pageSize) {
        const articles = await this.app.mysql.query('select event,place,time,work_id from video_worker_log;', [pageSize, (pageNum - 1) * pageSize]);
        return articles;
    }
    // 获取某人列表
    async listByUser(pageNum, pageSize, work_id) {
        const articles = await this.app.mysql.query('select event,place,time,work_id from video_worker_log where work_id = ? order by time desc limit ? offset ?;', [work_id, pageSize, (pageNum - 1) * pageSize]);
        return articles;
    }
    // 获取某条信息
    async find(id) {
        const article = await this.app.mysql.get('video_worker_log', { id });

        return article;
    }


    // 总数
    async count(where) {
        const count = await this.app.mysql.query('select count(*) from video_worker_log where ?', [where]);

        return count[0]['count(*)'];
    }

    // 更新
    async update(data) {
        const result = await this.app.mysql.update('video_worker_log', data);

        return result.affectedRows === 1;
    }

    // 删除
    async remove(id) {
        const result = await this.app.mysql.delete('video_worker_log', {
            id: id
        });

        return result.affectedRows === 1;
    }

}
module.exports = WorkerLogService;
