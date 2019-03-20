'use strict';

const moment = require('moment');

// 新增

exports.add = function* () {

    const body = this.request.body;
    const keyword = body.keyword;
    const openid = body.openid;
    yield this.service.keyword.insert({
        keyword,
        user_id: openid
    });
    this.body = 'success';
}


exports.listByUser = function* () {
    const pageNum = +this.query.pageNumber || 1;
    const pageSize = +this.query.pageSize || 20;
    let result;
    const openid = this.query.openid;
    result = yield this.service.keyword.listByUser(pageNum, pageSize, openid);
    this.body = {
        rows: result
    };
}


exports.deleteKeyword = function *(){
    let result;
    const openid = this.query.openid;
    result = yield this.service.keyword.deleteFromUser(openid);
    this.body = {
        result
    };
}