'use strict';

const moment = require('moment');
const marked = require('marked');


exports.index = function* () {

  let users = yield this.service.people.listAll();

  yield this.render('package.html',{
    current:"package",
    title:"套餐管理",
    users : JSON.stringify(users),
  });

};

exports.findVideoByPackageId = function *(){
  let id = this.query.id;
  let pkg = yield this.service.package.find(id);
  let video_ids = pkg.video_ids;
  video_ids = video_ids.split(',');
  let res = yield video_ids.map((video_id)=>{
    return this.service.video.find(Number(video_id));
  });
  this.body = res;
}

// 新增

exports.main = function *(){

  const body = this.request.body;
  const oper = body.oper; 
  let id = body.id;
  const work_id = this.session.user.id;
  const price = body.price;
  const pic = body.pic;
  const video_ids = body.video_ids;
  const name = body.name;
  const status = body.status

  if(oper === 'add'){
    yield this.service.package.insert({
      pic,
      name,
      video_ids,
      price,
      status
    });

    yield this.service.workerLog.insert({
      event: '新增套餐'+ name,
      place:'套餐管理',
      work_id
    });

    this.body = 'success';

  }else if(oper === 'edit'){

    yield this.service.package.update({
      id,
      pic,
      name,
      video_ids,
      price,
      status
    });

    yield this.service.workerLog.insert({
      event: '修改套餐'+ name,
      place:'套餐库',
      work_id
    });

    this.body = 'success';

  }else if(oper === 'del'){

    id = id.split(',');
    for(let i =0, l = id.length;i<l; i++){

      yield this.service.package.remove(id[i]);

      yield this.service.workerLog.insert({
        event: '删除套餐'+ id[i],
        place:'套餐库',
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
    result = yield this.service.package.list(pageNum, pageSize);
    total = yield this.service.package.count('1=1');
  }else{
    result = yield this.service.package.search(pageNum, pageSize, sql);
    total = yield this.service.package.count(sql);
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