'use strict';

const moment = require('moment');
const marked = require('marked');


exports.index = function* () {

  let users = yield this.service.people.listAll();

  yield this.render('usage.html',{
    current:"usage",
    title:"视频功能管理",
    users : JSON.stringify(users),
  });

};

// 新增

exports.main = function *(){

  const body = this.request.body;
  const oper = body.oper; 
  let id = body.id;
  const work_id = this.session.user.id;
  const comment = body.comment;
  const name = body.name;
  const status = body.status

  if(oper === 'add'){
    yield this.service.usage.insert({
      work_id : body.work_id,
      name,
      comment,
      status
    });

    yield this.service.workerLog.insert({
      event: '新增功能'+ name,
      place:'视频功能管理',
      work_id
    });

    this.body = 'success';

  }else if(oper === 'edit'){

    yield this.service.usage.update({
      id,
      name,
      comment,
      status
    });

    yield this.service.workerLog.insert({
      event: '修改功能'+ name,
      place:'视频功能管理',
      work_id
    });

    this.body = 'success';

  }else if(oper === 'del'){

    id = id.split(',');
    for(let i =0, l = id.length;i<l; i++){

      yield this.service.usage.remove(id[i]);

      yield this.service.workerLog.insert({
        event: '删除平台功能'+ id[i],
        place:'视频功能管理',
        work_id
      });

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
    result = yield this.service.usage.list(pageNum, pageSize);
    total = yield this.service.usage.count('1=1');
  }else{
    result = yield this.service.usage.search(pageNum, pageSize, sql);
    total = yield this.service.usage.count(sql);
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