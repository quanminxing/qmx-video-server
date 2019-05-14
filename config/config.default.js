'use strict';
const env = process.env;



exports.security = {
    csrf: false
}


// exports.oss = {
//   client: {
//     accessKeyId: env.ALI_SDK_OSS_ID,
//     accessKeySecret: env.ALI_SDK_OSS_SECRET,
//     endpoint: env.ALI_SDK_OSS_ENDPOINT,
//     bucket: 'ali-oss-test-bucket-test99',
//   },
// };

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

