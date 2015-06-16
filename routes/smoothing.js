var mongoose = require('mongoose');
var Route = require('../models/route');
var json2gpx = require("../utils/json2gpx");
var smoothing = require("../utils/smoothing");

module.exports = function(app) {

	// params routeId, format=gpx[default]|json
	app.get('/smoothing', function(req, res) {

		Route.findOne({ _id : mongoose.Types.ObjectId(req.query.routeId) },
			function (err, routes) {
				if (err)
					res.json({status : "error"})
				if (routes == null) {
					res.json({
						status: "error",
						msg: "Route not found in database"
					})
				} else {

					if (req.query.format && req.query.format.toUpperCase() == "JSON") {
						return res.json(smoothing(routes))
					} else {
						var route = smoothing(routes);

						res.set('Content-Type', 'text/xml');
						res.set({"Content-Disposition":"attachment; filename=" + routes.name.replace(" ", "_") + ".gpx"});
						return res.send(json2gpx(route));
					}
				}
			});

	});
}
