var express = require('express');
var fs = require('fs');
var settings = require('../settings');
var router = express.Router();


router.get('/tag', function(req, res, next) {
  console.log('Access tag');
  console.log(settings.filterTags);
  res.json(settings.filterTags);
});

router.get('/:projectName', function(req, res, next) {
  var db = req.db;
  var projects = [];
  db.collection('project').find().toArray(function(err, items) {
    items.forEach(function(item) {
      projects.push(item['name']);
    });
    response();
  });

  function response() {
    res.render('cases', { title: 'Case Viewer', projects: projects,
      project:req.params.projectName, base:".."});
  }
});

router.post('/:projectName', function(req, res, next) {
  console.log('get post');

  var db = req.db;
  var suites = [];
  var filters = req.body;

  db.collection('project').findOne({name: req.params.projectName}, function(err, item) {
    var suiteIds = [];
    item['suites'].forEach(function(item) {
      suiteIds.push(item['oid']);
    })
    var condition = null;
    var tag_condition = [{_id: {$in: suiteIds}}];
    var tag_filter_condition = [];
    for (var index in filters) {
      tag_filter_condition.push(create_tag_filter_condition(filters[index]));
    }
    if (tag_filter_condition.length == 1) {
      tag_condition.push(tag_filter_condition[0]);
    } else if (tag_filter_condition.length > 1) {
      tag_condition.push({$or: tag_filter_condition});
    }

    condition = {$and: tag_condition};
    console.log("Condition: ", condition);

    db.collection('suite').find(condition, {'doc':0}).sort({name: 1}).toArray(function(err, items) {
      items.forEach(function(item) {
        suites.push(item);
      });
      response();
    });
  });

  function response() {
    console.log(suites.length);
    res.json(suites);
  }

  function create_tag_filter_condition(tag_name) {
    return {$or: [{'force_tags.value':tag_name}, {'default_tags.value':tag_name}, {'cases.tags.value':tag_name}]};
  }
});



module.exports = router;