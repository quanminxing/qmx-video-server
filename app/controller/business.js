'use strict';

const moment = require('moment');
const marked = require('marked');
const counter = require('../lib/count');


exports.index = function* () {

  let users = yield this.service.people.listAll();

  yield this.render('business.html',{
    current:"business",
    title:"商家库",
    users : JSON.stringify(users),
  });

};

// 新增

exports.main = function *(){

  const body = this.request.body;
  const oper = body.oper; 
  let id = body.id;
  const work_id = this.session.user.id;
  const phone = body.phone;
  const name = body.name;
  const status = body.status

  if(oper === 'add'){

    yield this.service.business.insert({
      work_id : body.work_id,
      phone,
      name,
      status
    });

    yield this.service.workerLog.insert({
      event: '新增商家'+ name,
      place:'商家库',
      work_id
    });

    this.body = 'success';

  }else if(oper === 'edit'){

    yield this.service.business.update({
      id,
      work_id:body.work_id,
      phone,
      name,
      status
    });

    yield this.service.workerLog.insert({
      event: '修改商家'+ name,
      place:'商家库',
      work_id
    });

    this.body = 'success';

  }else if(oper === 'del'){

    id = id.split(',');
    for(let i =0, l = id.length;i<l; i++){

      yield this.service.business.remove(id[i]);

      yield this.service.workerLog.insert({
        event: '删除商家'+ id[i],
        place:'商家库',
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
    result = yield this.service.business.list(pageNum, pageSize);
    total = yield this.service.business.count('1=1');
  }else{
    result = yield this.service.business.search(pageNum, pageSize, sql);
    total = yield this.service.business.count(sql);
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