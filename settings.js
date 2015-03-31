var ini = require('ini');
var fs = require('fs');
var path = require('path');


var Settings = function() {};

Settings.prototype.db = function() {
    var setting = path.join(__dirname,'settings.ini');
    return ini.parse(fs.readFileSync(setting, 'utf-8'));
};

Settings.prototype.filterTags = ['ftt', 'acceptancetest'];


module.exports = new Settings();
