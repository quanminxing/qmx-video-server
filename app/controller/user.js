'use strict';

const moment = require('moment');

// 新增

exports.find = function* () {
    let result;
    const openid = this.query.openid;
    result = yield this.service.user.find(openid);
    this.body = {
        rows: result
    };
}


exports.save = function* () {
    let result;
    const openid = this.request.body.openid;
    const type = this.request.body.type;
    const obj = {
        id: openid
    }
    obj[type] = this.request.body.inputVal;

    let user = yield this.service.user.find(openid);

    if(!user){
        result = yield this.service.user.insert(obj);
    }else{
        result = yield this.service.user.update(obj);
    }
    this.body = {
        rows: result
    };
}