var mongoose = require('mongoose');
var path = require('path');
var Map = require('../models/map');
var UserAction = require('../models/user_action');

module.exports = function (app) {

	app.get('/api/js', function(req, res) {
		res.sendFile(path.join(__dirname, '../public/javascript/', 'mapito.js'));
	});

	app.get('/js/embed', function(req, res) {
		res.sendFile(path.join(__dirname, '../public/javascript/', 'embed.js'));
	});

	app.get('/get_map_data', function(req, res) {
		Map.findOne({ _id : mongoose.Types.ObjectId(req.query.mapId) },  function (err, maps) {
			return res.json({ map:  maps });
		});
	});

	app.get('/embedded_map', function(req, res) {
		Map.findOneAndUpdate({ _id : mongoose.Types.ObjectId(req.query.mapId) },
			{ $inc: { views: 1 } },
			function (err, maps) {
				return res.json({ map:  maps });

			});
	});

	app.post('/user_action', function(req, res) {

		var newUserAction = new UserAction();

		newUserAction.map_id = req.body.map_id;
		newUserAction.time = new Date();
		newUserAction.from.lat = req.body.from.lat;
		newUserAction.from.lon = req.body.from.lon;
		newUserAction.from.zoom = req.body.from.zoom;
		newUserAction.to.lat = req.body.to.lat;
		newUserAction.to.lon = req.body.to.lon;
		newUserAction.to.zoom = req.body.to.zoom;

		// save the action
		newUserAction.save(function (err) {
			if (err) {
				return res.json({ status : "error"});
			}

			return res.json({ status : "ok"});
		});

	});

};
