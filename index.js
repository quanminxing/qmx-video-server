'use strict';

require('aliyun-egg').startCluster({
  baseDir: __dirname,
  workers: 1,       //cfork模块，如不指定则默认使用os.cpus().length()
  port: process.env.PORT || 7001,
});
