var settings = require('../settings');
console.log(settings.filterTags);
var db = require('mongoskin').db('mongodb://'+settings.db().db_host+':'+settings.db().db_port+'/'+settings.db().db_name, {native_parser:true});

module.exports = db;
