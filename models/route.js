var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var routeSchema = new Schema({
	map_id: Schema.Types.ObjectId,
	name: String,
	time: Date,
	points : [{
		lat: Number,
		lon: Number,
		ele: Number,
		time: Date
	}]
});

module.exports = mongoose.model('Route', routeSchema);
