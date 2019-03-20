'use strict';

const moment = require('moment');

// 新增

exports.log = function* () {

    const body = this.request.body;
    const video_id = body.video_id;
    const openid = body.openid;
    yield this.service.videoLog.insert({
        video_id,
        user_id: openid
    });
    this.body = 'success';
}


exports.listByUser = function* () {
    const pageNum = +this.query.pageNumber || 1;
    const pageSize = +this.query.pageSize || 100;
    let result;
    const openid = this.query.openid;
    console.log(openid);
    console.log(99999);
    result = yield this.service.videoLog.listByUser(pageNum, pageSize, openid);
    this.body = {
        rows: result
    };
}


exports.deleteLog = function *(){
    let result;
    const openid = this.query.openid;
    const ids = this.request.body.ids;
    console.log(ids);
    result = yield this.service.videoLog.deleteFromUser(ids, openid);
    this.body = {
        result
    };
}