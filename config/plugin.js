'use strict';

exports.static = {
    enable: true,
    package: 'egg-static'
}

exports.alinode = {
    enable: false,
    package: 'egg-alinode',
},
exports.oss = {
    enable: true,
    package: 'egg-oss',
};

exports.schedule = false;
exports.logrotator = false;

exports.userrole = {
    enable: true,
    package: 'egg-userrole'
}
exports.mysql = {
    enable: true,
    package: 'egg-mysql',
}
exports.nunjucks = {
    enable: true,
    package: 'egg-view-nunjucks',
}
