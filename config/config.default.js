'use strict';
const env = process.env;

exports.mysql = {
  client: {
    host: '47.111.172.69',
    port: 3306,
    user: 'root',
    password: 'root123',
    database: 'video',
  },
};

exports.security = {
  domainWhiteList: ['http://localhost:7001', 'http://127.0.0.1:7001'],
  methodnoallow: {
    enable: false,
  },
  csrf: false
}

exports.multipart = {
    // will append to whilelist
    fileExtensions: [
      '.xls',
      '.xlsx',
    ],
}

exports.alipay = {
    //↓↓↓↓↓↓↓↓↓↓请在这里配置您的基本信息↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
    // 合作身份者ID，以2088开头由16位纯数字组成的字符串
    partner:"2088221377585424",

// 交易安全检验码，由数字和字母组成的32位字符串
    key:"d8n78pe0gagqen0s362c8ov7gmeq2z9f",

// 签约支付宝账号或卖家收款支付宝帐户
    seller_email:"danyang@de-front.com",

// 支付宝服务器通知的页面 要用 http://格式的完整路径，不允许加?id:123这类自定义参数
// 必须保证其地址能够在互联网中访问的到
    notify_url:"http://www.de-front.com/paynotify",

// 当前页面跳转后的页面 要用 http://格式的完整路径，不允许加?id:123这类自定义参数
// 域名不能写成http://localhost/create_direct_pay_by_user_jsp_utf8/return_url.jsp ，否则会导致return_url执行无效
    return_url:"http://www.de-front.com/payreturn",

//      支付宝通知验证地址

    ALIPAY_HOST: "mapi.alipay.com",
    HTTPS_VERIFY_PATH: "/gateway.do?service=notify_verify&",
    ALIPAY_PATH:"gateway.do?",

//↑↑↑↑↑↑↑↑↑↑请在这里配置您的基本信息↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑


// 调试用，创建TXT日志路径
    log_path:"~/alipay_log_.txt",

// 字符编码格式 目前支持 gbk 或 utf-8
    input_charset:"UTF-8",

// 签名方式 不需修改
    sign_type:"MD5"
};

// exports.oss = {
//   client: {
//     accessKeyId: 'LTAIEcGWDcS9bLAI',
//     accessKeySecret: '4bplw4xzM54fgYnXSnaI11SirQcqVh',
//     endpoint: 'oss-cn-hangzhou-internal.aliyuncs.com',
//     bucket: 'qmx-video',
//   },
// };
exports.bucket1_sts = {
  sts: true,
  accessKeyId: 'LTAI22EYvc2T0NRK',
  accessKeySecret: 'tvCWJfWc2x0WXWu0R5VfBHV0P3OAQy',
}
exports.bucket1 = {
  endpoint: 'https://oss-cn-hangzhou.aliyuncs.com',
  accessKeyId: 'LTAIEcGWDcS9bLAI',
  accessKeySecret: '4bplw4xzM54fgYnXSnaI11SirQcqVh',
  bucket: 'qmx-video',
}

exports.userrole = {
  failureHandler(action) {
    switch (action) {
      case 'admin':
        this.status = 403;
        this.redirect('/adminlogin');
        break;
      default:
        break;
    }
  },
};

exports.onerror = {
  errorPageUrl: '/500',
};

exports.bodyParser = {
    "formLimit": "2000kb",
    "jsonLimit": "2000kb",
};

exports.view = {
  defaultViewEngine: 'nunjucks',
  defaultExtension: '.nj',
  mapping: {
    '.nj': 'nunjucks',
  },
};

exports.keys = 'qmxpower';
