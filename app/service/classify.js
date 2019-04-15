const Service = require('egg').Service;
class ChannelService extends Service {
    async list() {
        let result = await this.app.mysql.query('select id, name from video_classify');
        return result;
    }
}

module.exports = ChannelService;