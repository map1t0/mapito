var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var mapSchema = new Schema({
	email: String,
	secret: String
});

module.exports = mongoose.model('ResetPassword', mapSchema);
