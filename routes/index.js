var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  var db = req.db;
  var projects = [];
  db.collection('project').find().toArray(function(err, items) {
    items.forEach(function(item) {
      projects.push(item['name']);
    });
    response();
  });

  function response() {
    if (projects.length != 0) {
      res.render('index', { title: 'Case Viewer', projects: projects, base: "."});
    } else {
      res.render('index', { title: 'Case Viewer', projects: [], base: "."});
    }
  }

});

module.exports = router;
