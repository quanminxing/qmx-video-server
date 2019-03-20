'use strict';

const moment = require('moment');
const marked = require('marked');


exports.index = function* () {

  let users = yield this.service.people.listAll();
  let platforms = yield this.service.platform.list();

  yield this.render('column.html',{
    current:"column",
    title:"栏目管理",
    users : JSON.stringify(users),
    platforms : JSON.stringify(platforms),
  });

};

// 新增

exports.main = function *(){

  const body = this.request.body;
  const oper = body.oper; 
  let id = body.id;
  const work_id = this.session.user.id;
  const comment = body.comment;
  const platform_id = body.platform_id;
  const name = body.name;
  const status = body.status

  if(oper === 'add'){
    yield this.service.column.insert({
      work_id : body.work_id,
      name,
      comment,
      platform_id,
      status
    });

    yield this.service.workerLog.insert({
      event: '新增栏目'+ name,
      place:'栏目管理',
      work_id
    });

    this.body = 'success';

  }else if(oper === 'edit'){

    yield this.service.column.update({
      id,
      name,
      platform_id,
      comment,
      status
    });

    yield this.service.workerLog.insert({
      event: '修改栏目'+ name,
      place:'栏目管理',
      work_id
    });

    this.body = 'success';

  }else if(oper === 'del'){

    id = id.split(',');
    for(let i =0, l = id.length;i<l; i++){

      yield this.service.column.remove(id[i]);

      yield this.service.workerLog.insert({
        event: '删除栏目'+ id[i],
        place:'栏目管理',
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
    result = yield this.service.column.list(pageNum, pageSize);
    total = yield this.service.column.count('1=1');
  }else{
    result = yield this.service.column.search(pageNum, pageSize, sql);
    total = yield this.service.column.count(sql);
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



exports.listAll = function *(){
  const pageNum = +this.query.page || 1;
  const pageSize = +this.query.rows || 100;
  //全查
  let result = yield this.service.platform.list();

  const r = {"全部":[]};

  for(let i = 0; i < result.length; i++){
    let child = yield this.service.column.listByPlatformId(1, 1000, result[i].id);
    r[result[i].name] = [];
    r[result[i].name].push({
      "name":"全部",
      id:0
    });
    child.forEach((c)=>{
      r[result[i].name].push(c);
    });
  }

  this.body = r
}