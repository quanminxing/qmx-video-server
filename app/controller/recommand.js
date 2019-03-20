'use strict';

const moment = require('moment');
const marked = require('marked');
const counter = require('../lib/count');

exports.index = function* () {

  let users = yield this.service.people.listAll();

  yield this.render('recommand.html',{
    current:"recommand",
    title:"推荐管理",
    users : JSON.stringify(users),
  });

};

// 新增



exports.main = function *(){

  const body = this.request.body;
  const oper = body.oper; 
  let id = body.id;
  const work_id = this.session.user.id;
  const video_id = body.video_id;

  if(oper === 'add'){

    yield this.service.recommand.insert({
      work_id : body.work_id,
      video_id,
    });

    this.body = 'success';

  }else if(oper === 'edit'){

    yield this.service.recommand.update({
      id,
      video_id
    });

    this.body = 'success';

  }else if(oper === 'del'){

    id = id.split(',');
    for(let i =0, l = id.length;i<l; i++){

      yield this.service.recommand.remove(id[i]);

    }

    this.body = 'success';
  }


}

exports.list = function* () {
  const pageNum = +this.query.page || 1;
  const pageSize = +this.query.rows || 100;
  const _search = this.query._search;
  const sql = this.query.sql;
  let result, total;

  if(_search !== 'true'){
    result = yield this.service.recommand.list(pageNum, pageSize);
    total = yield this.service.recommand.count('1=1');
  }else{
    result = yield this.service.recommand.search(pageNum, pageSize, sql);
    total = yield this.service.recommand.count(sql);
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  console.log(total, pageSize, (parseInt(total / pageSize) + 1));
  this.body = {
    total: total > pageSize ? (parseInt(total / pageSize) + 1) : 1,
    rows: result,
    totalRow:total,
  };
}