var express = require('express');
var fs = require('fs');
var mongodb = require('mongodb');
var router = express.Router();

router.get('/:oid', function(req, res, next) {
    var db = req.db;
    //console.log(req.params.oid);
    //console.log(db.ObjectId(req.params.oid));
    db.collection('suite').findOne({_id: mongodb.ObjectID(req.params.oid)}, function(err, suite) {
        if (err) {
            next(err);
            return;
        }
        if (suite) {
            var absPath = suite['path'];
            console.log(absPath)
            var content = '';
            fs.readFile(absPath, function (err, data) {
                console.log(err);
                if (err) {
                    next(err);
                    return;
                }
                content = data;
                if (absPath.toLowerCase().indexOf('.html') > 0) {
                    res.writeHead(200, {'Content-Type': 'text/html'});
                } else {
                    res.writeHead(200, {'Content-Type': 'text'});
                }
                res.write(content);
                res.end();
            });
        } else {
            next();
        }

    });
});

module.exports = router;