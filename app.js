var http = require('http');
var express = require('express');
var fs = require("fs");
var mongoose = require('mongoose');
var passport = require('passport');

var dbconfig = require('./config').db;

var app = express();

mongoose.connect(dbconfig.url());

var db = mongoose.connection;

db.on('error', console.error);
db.once('open', function() {
	console.log('Mongodb: Success connect!');
});

require('./config/passport')(passport);

require('./config/express')(app, passport);

fs.readdirSync(__dirname + "/models").forEach(function(filename) {
	if(filename.indexOf(".js")) {
		require(__dirname + "/models/" + filename);
	}
});

fs.readdirSync(__dirname + "/routes").forEach(function(filename) {
	if(filename.indexOf(".js")) {
		require(__dirname + "/routes/" + filename)(app, passport);
	}
});

http.createServer(app).listen(app.get("port"), function(err) {
	console.log("Nodejs: Server started!");
});
