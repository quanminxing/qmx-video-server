const Service = require('egg').Service;

class BannerService extends Service {
    async list(param) {
        const cond = param ? 'where B.platform = ' + param : 'where B.platform = ""'
        let results = await this.app.mysql.query(`select A.*, date_format(A.timestamp,'%Y-%m-%d %H:%i') as timestamp from video_banner  AS A left join video_banner_type AS B on A.type_id = B.id ${cond};`);
        // select COLUMN_NAME from information_schema.COLUMNS where table_name = ?;
        return results;
    }
}

module.exports = BannerService