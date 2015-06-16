var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userActionSchema = new Schema({
	map_id: Schema.Types.ObjectId,
	time : Date,
	from: {
		zoom: Number,
		lat: String,
		lon: String
	},
	to: {
		zoom: Number,
		lat: String,
		lon: String
	}
});

module.exports = mongoose.model('UserAction', userActionSchema);
