var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var mapSchema = new Schema({
	user_id: Schema.Types.ObjectId,
	name : String,
	service: String,
	tracking: Boolean,
	views: { type: Number, default: 0 },
	initial: {
		method: Number,
		center: {
			lat: String,
			lon: String
		},
		zoom: Number
	},
	controls : {
		standard: {
			dbclick_zoom : { type: Boolean, default: true },
			scroll_zoom : { type: Boolean, default: true },
			mouse_pan : { type: Boolean, default: true },
			zoom :  {
				enabled: { type: Boolean, default: false },
				style: String,
				position: String
			},
			pan : {
				enabled: { type: Boolean, default: false },
				position: String
			},
			map_type : {
				enabled: { type: Boolean, default: false },
				style: String,
				position: String
			}
		},
		custom: {
			zoom: {
				enabled: Boolean,
				position: String,
				background : {
					layout: String,
					length: Number,
					color: String
				},
				border : {
					width: Number,
					color: String
				},
				buttons: {
					color: String,
					size: Number
				}
			},
			pan: {
				enabled: Boolean,
				position: String,
				background : {
					shape: String,
					color: String,
					size: Number
				},
				border : {
					width: Number,
					color: String
				},
				buttons: {
					shape: String,
					color: String,
					size: Number
				}
			}
		},
		route_tracking : {
			start_stop: {
				enabled : Boolean,
				position: { type: String, default: 'BOTTOM_CENTER' }
			}
		}
	},
	markers : [{
		position : {
			lat: String,
			lon: String
		},
		icon: String
	}],
	circles : [{
		position : {
			lat: String,
			lon: String
		},
		strokeColor: String,
		strokeOpacity: String,
		strokeWeight: String,
		fillColor: String,
		fillOpacity: String,
		radius: Number
	}]
});

module.exports = mongoose.model('Map', mapSchema);
