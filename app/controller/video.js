'use strict';

const moment = require('moment');
const path = require('path');
const fs = require('fs');

const xlsx = require('node-xlsx');

function saveStream(stream, filepath) {
  return new Promise((resolve, reject) => {
    const ws = fs.createWriteStream(filepath);
    stream.pipe(ws);
    ws.on('error', reject);
    ws.on('finish', resolve);
  });
}

exports.upload = function* () {

  const stream = yield this.getFileStream();
  const filepath = path.join(this.app.config.logger.dir, 'multipart-test-file.xlsx');
  yield saveStream(stream, filepath);
  const work_id = this.session.user.id;
  const self = this;
  const workSheetsFromBuffer = xlsx.parse(fs.readFileSync(filepath));
  console.log(JSON.stringify(workSheetsFromBuffer));
  let rows = workSheetsFromBuffer[0].data;
  rows.shift();

  let categorys = yield this.service.category.list();
  let platforms = yield this.service.platform.list();
  let columns = yield this.service.column.list();
  let styles = yield this.service.styles.list();
  let usages = yield this.service.usages.list();
  categorys = categorys.filter((d) => { return d.level === 1 });

  for(let i = 0, l = rows.length;i< l; i++){
    let d = rows[i];
    yield self.service.video.insert({
      work_id,
      name:d[0],
      description:d[1],
      category_id:categorys.filter((category)=>{
        return category.name === d[2]
      })[0].id || 16,
      price:d[3],
      business:d[4],
      time:d[5],
      format:d[6],
      url:d[7],
      short_image:d[8],
      is_scene:d[9],
      is_show:d[10],
      is_text:d[11],
      is_audio:d[12],
      is_model:d[13],
      platform_id:platforms.filter((platform)=>{
        return platform.name === d[14]
      })[0].id || 1,
      column_id:columns.filter((column)=>{
        return column.name === d[15]
      })[0].id || 1,
      usage_id:usages.filter((usage)=>{
        return usage.name === d[16]
      })[0].id || 1,
      style_id:styles.filter((style)=>{
        return style.name === d[17]
      })[0].id || 1,
      keystring:d[16]
    });
    yield this.service.workerLog.insert({
      event: '上传视频' + d[0],
      place: '视频库',
      work_id
    });
  }

  this.body = 'success';
  return

  const plus = 'http://pic-cloud-hn.b0.upaiyun.com/';
  const filename = moment(Date.now()).format('YYYY-MM-DD') + '/' + stream.filename;
  let result = yield this.app.upyun.putFile(filename, fs.readFileSync(filepath), 'text/plain', true, null);
  console.log(plus + filename);
  if (result) {
    this.body = plus + filename;
  } else {
    this.body = '上传失败';
  }

  //const object = yield this.app.upyun.put(moment(Date.now()).format('YYYY-MM-DD') + '/' + stream.filename, stream);

};

exports.index = function* () {
  let categorys = yield this.service.category.list();
  let platforms = yield this.service.platform.list();
  let usages = yield this.service.usage.list();
  let styles = yield this.service.style.list();
  let columns = yield this.service.column.list();
  categorys = categorys.filter((d) => { return d.level === 1 });
  let users = yield this.service.people.listAll()
  yield this.render('video.html', {
    current: "video",
    columns: JSON.stringify(columns),
    categorys: JSON.stringify(categorys),
    platforms: JSON.stringify(platforms),
    styles: JSON.stringify(styles),
    usages: JSON.stringify(usages),
    title: "视频库",
    users: JSON.stringify(users)
  });
};

exports.detail = function* () {

  const id = this.request.query.id;
  const detail = yield this.service.video.find(id);
  detail[0].timestamp = moment(detail[0].timestamp).format('YYYY-MM-DD hh:mm:ss')
  if(detail[0].url.indexOf('embed')!==-1){
    detail[0].isqq = 1
  }else{
    detail[0].isqq = 0
  }
  let user = yield this.service.people.find(detail[0]['work_id']);
  yield this.render('video-detail.html', {
    title: "视频库",
    detail: detail[0],
    user
  });
};

exports.getDetail = function* () {

  const id = this.request.query.id;
  const detail = yield this.service.video.find(id);
  this.body = {
    "success":true,
    detail
  }
};


// 新增

exports.main = function* () {

  const body = this.request.body;
  const oper = body.oper;
  let id = body.id;
  const work_id = this.session.user.id;
  const name = body.name;
  const description = body.description;
  const category_id = body.category_id;
  const platform_id = body.platform_id;
  const usage_id = body.usage_id;
  const style_id = body.style_id;
  const column_id = body.column_id;
  const keystring = body.keystring;
  const demo_description = body.demo_description;
  const demo_pic = body.demo_pic;
  const price = body.price;
  const business = body.business;
  const time = body.time;
  const format = body.format;
  const url = body.url;
  const is_scene = body.is_scene;
  const is_audio = body.is_audio;
  const is_show = body.is_show;
  const is_model = body.is_model;
  const is_text = body.is_text;
  const short_image = body.short_image;


  // work_id 从session里获取

  if (oper === 'add') {

    yield this.service.video.insert({
      work_id,
      name,
      description,
      demo_description,
      demo_pic,
      category_id,
      price,
      business,
      time,
      format,
      url,
      is_audio,
      is_model,
      is_scene,
      is_show,
      is_text,
      short_image,
      platform_id,
      column_id,
      keystring,
      style_id,
      usage_id
    });

    yield this.service.workerLog.insert({
      event: '上传视频' + name,
      place: '视频库',
      work_id
    });

    this.body = 'success';


  } else if (oper === 'edit') {

    yield this.service.video.update({
      id,
      work_id,
      name,
      description,
      demo_description,
      demo_pic,
      category_id,
      price,
      business,
      time,
      format,
      url,
      is_audio,
      is_model,
      is_scene,
      is_show,
      is_text,
      short_image,
      platform_id,
      column_id,
      keystring,
      style_id,
      usage_id
    });

    yield this.service.workerLog.insert({
      event: '修改视频' + name,
      place: '视频库',
      work_id
    });

    this.body = 'success';

  } else if (oper === 'del') {

    id = id.split(',');
    for(let i =0, l = id.length;i<l; i++){
      yield this.service.workerLog.insert({
        event: '删除视频' + id[i],
        place: '视频库',
        work_id
      });
  
      yield this.service.video.remove(id[i]);
    }

    this.body = 'success';
  }


}


exports.listByFilter = function* () {
  const pageNum = +this.query.page || 1;
  const pageSize = +this.query.rows || 100;
  let sql = '';

  const querys = ['category_id', 'usage_id', 'platform_id', 'column_id'];

  for(let key in this.query){
    if(querys.indexOf(key)!==-1){
      sql += ' ' + key + '=' + this.query[key];
      sql += ' and';
    }
  }
  if(sql == ''){
    sql = '1=1'
  }else{
    sql = sql.substring(0, sql.length-3);
  }
  
  console.log(sql);

  let result, total;

  result = yield this.service.video.search(pageNum, pageSize, sql);
  total = yield this.service.video.count(sql);
  
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
  this.body = {
    total: parseInt(total / pageSize) + 1,
    rows: result,
    totalRow:total,
  };
}


exports.list = function* () {
  const pageNum = +this.query.page || 1;
  const pageSize = +this.query.rows || 100;
  const _search = this.query._search;
  const sql = this.query.sql;
  let result, total, orderby;

  const sidx = this.query.sidx;
  const sord = this.query.sord;

  if(sidx){
    orderby = `order by ${sidx} ${sord}`;
  }

  if (_search !== 'true') {
    result = yield this.service.video.list(pageNum, pageSize, orderby);
    total = yield this.service.video.count('1=1');
  } else {
    result = yield this.service.video.search(pageNum, pageSize, sql);
    total = yield this.service.video.count(sql);
  }
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
  this.body = {
    total: parseInt(total / pageSize) + 1,
    rows: result,
    totalRow:total,
  };
}


exports.listByColumn = function* () {
  const pageNum = +this.query.page || 1;
  const pageSize = +this.query.rows || 100;
  const column_id = this.query.column_id;
  const sql = `column_id = ${column_id}`

  let result, total;
  result = yield this.service.video.search(pageNum, pageSize, sql);
  total = yield this.service.video.count();

  this.body = {
    total: total % pageSize,
    rows: result,
    pageNum,
    pageSize
  };
}

exports.listByUsage = function* () {
  const pageNum = +this.query.page || 1;
  const pageSize = +this.query.rows || 100;
  const usage_id = this.query.usage_id;
  const sql = `usage_id = ${usage_id}`

  let result, total;
  result = yield this.service.video.search(pageNum, pageSize, sql);
  total = yield this.service.video.count();

  this.body = {
    total: total % pageSize,
    rows: result,
    pageNum,
    pageSize
  };
}


exports.listByStyle = function* () {
  const pageNum = +this.query.page || 1;
  const pageSize = +this.query.rows || 100;
  const style_id = this.query.style_id;
  const sql = `style_id = ${style_id}`

  let result, total;
  result = yield this.service.video.search(pageNum, pageSize, sql);
  total = yield this.service.video.count();

  this.body = {
    total: total % pageSize,
    rows: result,
    pageNum,
    pageSize
  };
}

exports.listByCategory = function* () {
  const pageNum = +this.query.page || 1;
  const pageSize = +this.query.rows || 100;
  const category_id = this.query.category_id;
  const sql = `category_id = ${category_id}`

  let result, total;
  result = yield this.service.video.search(pageNum, pageSize, sql);
  total = yield this.service.video.count();

  this.body = {
    total: total % pageSize,
    rows: result,
    pageNum,
    pageSize
  };
}

exports.listByHot = function* () {
  const pageNum = +this.query.page || 1;
  const pageSize = +this.query.rows || 100;
  let result = yield this.service.video.listByHot(pageSize);
  this.body = {
    rows: result,
  };
}
exports.listByRecommand = function* () {
  const pageNum = +this.query.page || 1;
  const pageSize = +this.query.rows || 100;
  let where = false;

  if(this.query.category_id){
    where = ' and category_id = ' + this.query.category_id
  }

  let result = yield this.service.video.listByRecommand(where, pageSize);
  this.body = {
    rows: result,
  };
}

exports.searchByKeyword = function *(){
  const pageNum = +this.query.page || 1;
  const pageSize = +this.query.rows || 100;
  const keyword = this.query.keyword
  let result = yield this.service.video.searchByKeyword(pageNum, pageSize, keyword);
  this.body = {
    rows: result,
  }; 
}