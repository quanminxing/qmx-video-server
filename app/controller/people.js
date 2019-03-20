'use strict';

const moment = require('moment');
const marked = require('marked');
const counter = require('../lib/count');


exports.index = function* () {

  yield this.render('people.html',{
    current:"people",
    title:"人员管理",
    user:this.session.user
  });

};


// 新增

exports.main = function *(){

  const body = this.request.body;
  const oper = body.oper; 
  let id = body.id;
  const phone = body.phone;
  const name = body.name;
  const cname = body.cname;
  const description = body.description;
  const password = body.password;
  const auth = body.auth;
  const work_id = this.session.user.id;

  if(oper === 'add'){

    yield this.service.people.insert({
      phone,
      name,
      cname,
      description,
      auth,
      password
    });

    yield this.service.workerLog.insert({
      event: '新增人员'+ name,
      place:'人员管理',
      work_id
    });

    this.body = 'success';

  }else if(oper === 'edit'){

    yield this.service.people.update({
      id,
      phone,
      name,
      cname,
      description,
      auth,
      password
    });

    yield this.service.workerLog.insert({
      event: '修改人员'+ name,
      place:'人员管理',
      work_id
    });

    this.body = 'success';

  }else if(oper === 'del'){

    id = id.split(',');
    for(let i =0, l = id.length;i<l; i++){

      yield this.service.workerLog.insert({
        event: '删除人员id'+ id[i],
        place:'人员管理',
        work_id
      });
  
      yield this.service.people.remove(id[i]);
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
    result = yield this.service.people.list(pageNum, pageSize);
    total = yield this.service.people.count('1=1');
  }else{
    result = yield this.service.people.search(pageNum, pageSize, sql);
    total = yield this.service.people.count(sql);
  }
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  if(this.session.user.auth !==0){
    result = result.filter((d)=>{
      return d.id === this.session.user.id
    });
    total = 1;
  }

  this.body = {
    total: total > pageSize ? (parseInt(total / pageSize) + 1) : 1,
    rows: result,
    totalRow:total,
  };
}