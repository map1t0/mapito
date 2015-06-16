var express = require('express');
var path = require('path');
var errorhandler = require('errorhandler');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var favicon = require('serve-favicon');
var flash = require('connect-flash');
var router = express.Router();
var MongoStore = require('connect-mongo')(session);
var methodOverride = require('method-override');

var logger = require("../config/logger");

var dbconfig = require('../config').db;

module.exports = function (app, passport) {

    // all environments
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '../../views');
    app.set('view engine', 'ejs');
    app.set('trust proxy', true);
    app.set('json spaces', 2);
    app.use(favicon(__dirname + '../../public/images/favicon.ico'));
    app.use(bodyParser.urlencoded({
    	extended: true
    }));
    app.use(bodyParser.json());
    app.use(express.static(path.join(__dirname + '../../public')));
    app.use(morgan("combined", { "stream": logger.stream }));
    app.use(cookieParser()); // read cookies (needed for auth)
    app.use(flash());
    app.use('/', router);
    //required for passport
    app.use(session({
    	secret : 'secret_key',
    	cookie : {
    		path : '/',
    		maxAge : 1000 * 60 * 60 * 24 * 30 // 30 days
    	},
    	store: new MongoStore({ host: dbconfig.host, port: dbconfig.port, db: dbconfig.dbname, collection: 'sessions' }),
    	resave: true,
        saveUninitialized: true
    }));
    app.use(passport.initialize());
    app.use(passport.session()); // persistent login sessions
    app.use(function(req, res, next) {
        var oneof = false;
        if(req.headers.origin) {
            res.header('Access-Control-Allow-Origin', req.headers.origin);
            oneof = true;
        }
        if(req.headers['access-control-request-method']) {
            res.header('Access-Control-Allow-Methods', req.headers['access-control-request-method']);
            oneof = true;
        }
        if(req.headers['access-control-request-headers']) {
            res.header('Access-Control-Allow-Headers', req.headers['access-control-request-headers']);
            oneof = true;
        }
        if(oneof) {
            res.header('Access-Control-Max-Age', 60 * 60 * 24 * 365);
        }

        if (oneof && req.method == 'OPTIONS') {
            res.sendStatus(200);
        }
        else {
            next();
        }
    });
    // override with the X-HTTP-Method-Override header in the request
    app.use(methodOverride('X-HTTP-Method-Override'));

    //development only
    if ('development' == app.get('env')) {
    	app.use(errorhandler());
    }

};
