const moment = require('moment'); //时间库

// let date = moment();
// date.add(100, 'years').subtract(9, 'months'); //不用库需要转成毫秒再加减，再转回
// console.log(date.format('MMM Do, YYYY')); //Jun 4th, 2117
// console.log(date.format('h:mm a')); //11:34 am

var createdAt = 1000;
var date = moment(createdAt);
console.log(date.format('MMM Do YYYY h:mm ss a'));

var someTimestamp = moment().valueOf(); //取毫秒
console.log(someTimestamp);
