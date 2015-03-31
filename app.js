var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
//var process = require('process');

var fs = require('fs');
//var errorLogfile = fs.createWriteStream('error.log', {flags: 'a'});

var routes = require('./routes/index');
var users = require('./routes/users');
var cases = require('./routes/cases');
var caseShower = require('./routes/caseShower');

var db = require('./model/db');

var app = express();
app.enable('trust proxy');

var base = '';
if (process.env.BASE_URL != null) {
    base = process.env.BASE_URL;
}
console.log("BASE URL:"+base);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
if (app.get('env') != 'development') {
    console.log("Start with product mode");
    var accessLogStream = fs.createWriteStream(__dirname + '/access.log', {flags: 'a'});
    var errorLogStream = fs.createWriteStream(__dirname + '/error.log', {flags: 'a'});
    app.use(logger('combined', {stream: accessLogStream}));
    app.use(logger('combined', {stream: errorLogStream,
            skip: function (req, res) { return res.statusCode < 400 }
    }));
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use(function(req, res, next) {
        req.base = base;
        req.db = db;
        next();
    }
);

app.use('/', routes);
app.use('/users', users);
app.use('/cases', cases);
app.use('/caseShower', caseShower);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err,
            projects: [],
            base: req.base
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    if (app.get('env') != 'development') {
        var meta = '[' + new Date() + '] ' + req.url + '\n';
        errorLogStream.write(meta + err.stack + '\n');
    }
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {},
        projects: [],
        base: req.base
    });
});


module.exports = app;
