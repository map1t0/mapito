var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var accessTokenSchema = new Schema({
	user_id: Schema.Types.ObjectId,
	access_token: String,
	description: String,
	scopes: {
		map : {
			read: Boolean,
			modify: Boolean
		},
		actions : {
			read: Boolean,
			modify: Boolean
		},
		routes : {
			read: Boolean,
			modify: Boolean
		}
	}
});

module.exports = mongoose.model('AccessToken', accessTokenSchema);
