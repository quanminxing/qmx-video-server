const Service = require('egg').Service;

class BannerService extends Service {
    async list(param) {
        const cond = param ? 'B.platform = ' + param : 'B.platform = ""'
        let results = await this.app.mysql.query(`select A.*, date_format(A.timestamp,'%Y-%m-%d %H:%i') as timestamp from video_banner AS A left join video_banner_type AS B on A.type_id = B.id where A.is_show = 1 and is_del = false and ${cond};`);
        // select COLUMN_NAME from information_schema.COLUMNS where table_name = ?;
        return results;
    }

    async listAll(pageNum, pageSize) {
        try {
            let results = await this.app.mysql.query(`select A.*, date_format(A.timestamp,"%Y-%m-%d %H:%i") as timestamp from video_banner  AS A left join video_banner_type AS B on A.type_id = B.id where is_del = false order by A.id desc limit ${pageSize} offset ${(pageNum - 1) * pageSize};`)
            return results;
        } catch (err) {

            throw err
        }
    }

    async listById(id) {
        let results = await this.app.mysql.query(`select A.*, date_format(A.timestamp,"%Y-%m-%d %H:%i") as timestamp from video_banner  AS A left join video_banner_type AS B on A.type_id = B.id where A.id = ${id}`)
        return results;
    }
    async count() {
        try {
            let count = await this.app.mysql.query(`select count(*) from video_banner where is_show = true;`);
            return count[0]['count(*)'];
        } catch (err) {
            throw err
        }
    }

    async insert(obj) {
        const result = await this.app.mysql.insert('video_banner', {
            work_id: obj.work_id || null,
            img_name: obj.img_name || null,
            url_name: obj.url_name || null,
            img_url: obj.img_url,
            url: obj.url,
            is_show: obj.is_show || 0,
            type_id: obj.type_id,
            timestamp: this.app.mysql.literals.now,
        });

        return result;
    }
    async update(data) {
        const result = await this.app.mysql.update('video_banner', data);

        return result.affectedRows === 1;
    }
    async remove(id) {
        try {
            const result = await this.app.mysql.delete('video_banner', {
                id: id
            });
            return result.affectedRows === 1;
        } catch (err) {
            console.log(err)
        }
    }
}

module.exports = BannerService