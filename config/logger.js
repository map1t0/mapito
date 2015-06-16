var fs = require("fs");
var winston = require('winston');

winston.emitErrs = true;

if (!fs.existsSync('logs')) {
	fs.mkdirSync('logs');
}

var logger = new winston.Logger({
	transports : [ new winston.transports.File({
		level : 'info',
		filename : './logs/all-logs.log',
		handleExceptions : true,
		json : true,
		maxsize : 5242880, // 5MB
		maxFiles : 50,
		colorize : false
	}), new winston.transports.Console({
		level : 'debug',
		handleExceptions : true,
		json : true,
		colorize : true
	}) ],
	exitOnError : false
});

module.exports = logger;

module.exports.stream = {
	write : function(message, encoding) {
		logger.info(message);
	}
};
