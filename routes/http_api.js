var util = require('util');
var Map = require('../models/map');
var UserAction = require('../models/user_action');
var Route = require('../models/route');
var AccessToken = require('../models/access_token');
var path = require('path');
var json2gpx = require("../utils/json2gpx");
var smoothing = require("../utils/smoothing");

module.exports = function(app, passport) {

	///////////////////////////////////////////////////////////////////////////
	/////////////////////////////////  Maps   /////////////////////////////////
	///////////////////////////////////////////////////////////////////////////

	// create map
	app.post('/api/v1/maps', function(req, res) {

		headers.authorization.token(req, res, function (token) {

			if (token.scopes.map.modify) {

				var newMap = new Map();

				newMap.user_id = token.user_id;

				newMap = maps.setOptions(req, res, newMap);

		        newMap.save(function(err) {
		            if (err)
		                throw err;
		            res.json({ status: "ok", map_id: newMap._id});
		        });

			} else {
				return res.json({ status: "error", message: "invalid scope"	});
			}
		})
	});

	// update map
	app.put('/api/v1/maps/:id', function(req, res) {

		headers.authorization.token(req, res, function (token) {

			if (token.scopes.map.modify) {

				maps.findOne(res, token, req.params.id, function (map) {

					var options = new Object();

					options = maps.setOptions(req, res, options)

					Map.update({ _id: req.params.id }, { $set: options }, function (err){
						if(err)
							return res.json({ status: "error", message: "unexpected error" });
						return res.json({ status: "ok"});
					});
				});

			} else {
				return res.json({
					status: "error",
					message: "invalid scope"
				});
			}
		})
	});

	// get all map data
	app.get('/api/v1/maps', function(req, res) {

		headers.authorization.token(req, res, function (token) {

			if (token.scopes.map.read) {

				maps.find(res, token, req.params.id, function (maps) {
					return res.json(maps);
				});

			} else {
				return res.json({ status: "error", message: "invalid scope"	});
			}
		})
	});

	// get map data by id
	app.get('/api/v1/maps/:id', function(req, res) {

		headers.authorization.token(req, res, function (token) {

			if (token.scopes.map.read) {

				maps.findOne(res, token, req.params.id, function (map) {
					return res.json(map);
				});

			} else {
				return res.json({ status: "error", message: "invalid scope"	});
			}
		})
	});

	// delete map
	app.delete('/api/v1/maps/:id', function(req, res) {

		headers.authorization.token(req, res, function (token) {

			if (token.scopes.map.modify) {

				maps.findOne(res, token, req.params.id, function (map) {

					Map.remove({ _id: req.params.id }, function (err) {
						if (err)
							return res.json({ status: "error", message: "unexpected error" });
							return res.json({ status: "success", message: "map deleted successfully"});
					});

				});

			} else {
				return res.json({ status: "error", message : "scope error"});
			}
		});
	});

	// add markers and circles
	app.post('/api/v1/maps/map/:id/draw', function(req, res) {

		headers.authorization.token(req, res, function (token) {

			if (token.scopes.map.modify) {

				maps.findOne(res, token, req.params.id, function (map) {

					Map.remove({ _id: req.params.id }, function (err) {
						if (err)
							return res.json({ status: "error", message: "unexpected error" });

						return res.json({ status: "success", message: "map deleted successfully"});
					});

					var push = new Object();

					if (util.isArray(req.body.markers)) {
						push.markers = req.body.markers;
					}
					if (util.isArray(req.body.circles)) {
						push.circles = req.body.circles;
					}

					Map.findByIdAndUpdate(map._id, {$pushAll: push}, function(err, model) {
						if (err)
							return res.json({ status: "error", message: "unexpected error"});
						return res.json({ status: "ok" });
					});
				});

			} else {
				return res.json({ status: "error", message : "scope error"});
			}
		});
	});

	// modify markers and circles
	app.put('/api/v1/maps/map/:id/draw', function(req, res) {

		headers.authorization.token(req, res, function (token) {

			if (token.scopes.map.modify) {

				maps.findOne(res, token, req.params.id, function (map) {

					Map.remove({ _id: req.params.id }, function (err) {
						if (err)
							return res.json({ status: "error", message: "unexpected error" });

						return res.json({ status: "success", message: "map deleted successfully"});
					});

					var push = new Object();

					if (util.isArray(req.body.markers)) {
						push.markers = req.body.markers;
					}
					if (util.isArray(req.body.circles)) {
						push.circles = req.body.circles;
					}

					Map.findByIdAndUpdate(map._id, {$pushAll: push}, function(err, model) {
						if (err)
							return res.json({ status: "error", message: "unexpected error"});
						return res.json({ status: "ok" });
					});
				});

			} else {
				return res.json({ status: "error", message : "scope error"});
			}
		});
	});

	// delete markers and circles
	app.delete('/api/v1/maps/map/:id/draw', function(req, res) {

		headers.authorization.token(req, res, function (token) {

			if (token.scopes.map.modify) {

				maps.findOne(res, token, req.params.id, function (map) {

					Map.remove({ _id: req.params.id }, function (err) {
						if (err)
							return res.json({ status: "error", message: "unexpected error" });
						return res.json({ status: "success", message: "map deleted successfully"});
					});

					var pull = new Object();

					if (util.isArray(req.body.markers)) {
						pull.markers = req.body.markers;
					}
					if (util.isArray(req.body.circles)) {
						pull.circles = req.body.circles;
					}

					Map.findByIdAndUpdate(map._id, {$pullAll: { markers : {_id : pull.markers }, circles : {_id : pull.circles}}}, function(err, model) {
						if (err)
							return res.json({ status: "error", message: "unexpected error"});
						return res.json({ status: "ok" });
					});
				});

			} else {
				return res.json({ status: "error", message : "scope error"});
			}
		});
	});

	///////////////////////////////////////////////////////////////////////////
	///////////////////////////////  Actions   ////////////////////////////////
	///////////////////////////////////////////////////////////////////////////

	// get actions
	app.get('/api/v1/maps/:mid/actions', function(req, res) {

		headers.authorization.token(req, res, function (token) {

			if (token.scopes.actions.read) {

				maps.findOne(res, token, req.params.mid, function (map) {

					UserAction.find({ map_id : map._id}, function (err, user_actions) {
						if (err)
			            	return res.json({ status: "error", message: "unexpected error"});

						res.json(user_actions)

					});

				});

			} else {
				res.json({ status: "error", message : "scope error"});
			}
		});
	});

	///////////////////////////////////////////////////////////////////////////
	/////////////////////////////   GPS Tracks   //////////////////////////////
	///////////////////////////////////////////////////////////////////////////

	// get route as xml
	app.get('/api/v1/maps/:mid/routes/:rid/gpx', function(req, res) {

		headers.authorization.token(req, res, function (token) {

			routes.findOne(res, token, req.params.mid, req.params.rid, function (route) {

				res.set('Content-Type', 'text/xml');
				res.send(json2gpx(route));

			});

		});
	});

	// get smooth route as xml
	app.get('/api/v1/maps/:mid/routes/:rid/gpx/smooth', function(req, res) {

		headers.authorization.token(req, res, function (token) {

			routes.findOne(res, token, req.params.mid, req.params.rid, function (route) {

				res.set('Content-Type', 'text/xml');
				res.send(json2gpx(smoothing(route)));

			});

		});
	});

	// get routes as json
	app.get('/api/v1/maps/:mid/routes', function(req, res) {

		headers.authorization.token(req, res, function (token) {

			routes.find(res, token, req.params.mid, function (routes) {

				res.json(routes)

			});

		});
	});

	// get route as json
	app.get('/api/v1/maps/:mid/routes/:rid', function(req, res) {

		headers.authorization.token(req, res, function (token) {

			routes.findOne(res, token, req.params.mid, req.params.rid, function (route) {

				res.json(route)

			});

		});
	});

	// get smooth route as json
	app.get('/api/v1/maps/:mid/routes/:rid/smooth', function(req, res) {

		headers.authorization.token(req, res, function (token) {

			routes.findOne(res, token, req.params.mid, req.params.rid, function (route) {

				res.json(smoothing(route))

			});

		});
	});

	// create route
	app.post('/api/v1/maps/:mid/routes', function(req, res) {

		if (!(headers.contentType.json(req))) {
			return res.json({ status: "error", message: "missing header content-type:application/json"});
		}

		headers.authorization.token(req, res, function (token) {

			if (token.scopes.routes.modify) {

				maps.findOne(res, token, req.params.mid, function (map) {

						var newRoute = new Route();

						newRoute.map_id = map._id;
						newRoute.name = req.body.name || new Date();
						newRoute.time = new Date();

						newRoute.save(function(err) {
							if (err)
								return res.json({ status: "error", message: "unexpected error"});
							res.json({ status: "ok", route_id: newRoute._id});
						});

				});

			} else {
				res.json({ status: "error", message : "scope error"});
			}

		});
	});

	// add points in route
	app.put('/api/v1/maps/:mid/routes/:rid', function(req, res) {

		if (!(headers.contentType.json(req))) {
			return res.json({ status: "error", message: "missing header content-type:application/json"});
		}

		headers.authorization.token(req, res, function (token) {

			if (token.scopes.routes.modify) {

				routes.findOne(res, token, req.params.mid, req.params.rid, function (route) {

					var push;

					if (util.isArray(req.body.points)) {
						push = {$pushAll: {"points": req.body.points}}
					} else {
						push = {$pushAll: {"points": [req.body.points]}}
					}

					Route.findByIdAndUpdate(route._id, push, function(err, model) {
						if (err)
							return res.json({ status: "error", message: "unexpected error"});
						return res.json({ status: "ok" });
					});

				});

			} else {
				res.json({ status: "error", message : "scope error"});
			}

		});
	});

	// END API
};

function parseBool(str) {
	if (str.toString().toLowerCase() == 'true') {
        return true;
	}
	return false;
}

function isCorrectPosition(position) {
	var pstns = ["BOTTOM_CENTER", "BOTTOM_LEFT", "BOTTOM_RIGHT", "LEFT_BOTTOM", "LEFT_CENTER", "LEFT_TOP", "RIGHT_BOTTOM", "RIGHT_CENTER","RIGHT_TOP","TOP_CENTER","TOP_LEFT","TOP_RIGHT"];

	if (pstns.indexOf(position.toUpperCase()) > -1)
		return true;
	return false;
}

var headers = {

	authorization : {

		token : function (req, res, callback) {
			var access_token = req.query.token || null;

			if (access_token == null) {
				var header = req.headers['authorization'] || '';  // get the header
				access_token = header.split(/\s+/).pop() || '';  // and the encoded auth token
			}

			AccessToken.findOne({access_token: access_token}, function (error, token) {
				if (error) {
					return res.json({ status: "error", message: "unexpected error"});
				}

				if (token == null) {
					return res.json({ status: "error", message: "token does not exists"});
				}

				callback(token);
			});
		}

	},

	contentType : {

		json : function (req) {
			if (/application\/json/.test(req.headers['content-type'])) {
				return true;
			} else {
				return false;
			}
		}

	}

}

var routes = {

	findOne : function (res, token, mapId, routeId, callback) {

		maps.findOne(res, token, mapId, function (map) {

			if(token.scopes.routes.read) {
				Route.findOne({ $and : [{ _id : routeId, map_id : mapId }] }, function (err, route) {
					if (err)
						return res.json({ status: "error", message: "unexpected error"});

					if (!route)
						return res.json({ status: "error", message: "route not found"});

					callback(route)

				});
			} else {
				res.json({ status: "error", message : "scope error"});
			}

		});

	},

	find : function (res, token, mapId, callback) {

		maps.findOne(res, token, mapId, function (map) {

			if(token.scopes.routes.read) {
				Route.find({  map_id : mapId }, function (err, routes) {
					if (err)
						return res.json({ status: "error", message: "unexpected error"});

					if (!routes)
						return res.json({ status: "error", message: "routes not found"});

					callback(routes)

				});
			} else {
				res.json({ status: "error", message : "scope error"});
			}

		});

	}

}

var maps = {

	findOne : function (res, token, mapId, callback) {
		Map.findOne( { $and : [{_id: mapId, user_id: token.user_id}] }, function (error, map) {
			if (error) {
				return res.json({ status: "error", message: "unexpected error"});
			}

			if (map == null) {
				return res.json({ status: "error", message: "map does not exist"});
			}

			callback(map);
		});
	},

	find : function (res, token, mapId, callback) {
		Map.find( { user_id: token.user_id }, function (error, maps) {
			if (error) {
				return res.json({ status: "error", message: "unexpected error"});
			}

			if (map == null) {
				return res.json({ status: "error", message: "map does not exist"});
			}

			callback(maps);
		});
	},

	setOptions : function (req, res, obj) {

		if (req.body.name) {
			obj.name = req.body.name;
		} else if (req.params.id || req.params.mid) {
			return res.json({ status: "error",	message: "name is require" });
		}

		if(req.body.service) {
			var service = req.body.service.toLowerCase()
			if (service == "google" || service == "bing") {
				obj.service = service;
			} else {
				return res.json({ status: "error", message: "service must be 'google' or 'bing'" });
			}
		} else if (req.params.id || req.params.mid) {
			return res.json({ status: "error", message: "service is require" });
		}

		if (req.body.tracking) {
			obj.tracking = req.body.tracking;
		} else if (req.params.id || req.params.mid) {
			return res.json({ status: "error", message: "tracking is require" });
		}

		if (req.body.initial.method) {
			var init_method = parseInt(req.body.initial.method);
			if (init_method >= 1 && init_method <= 3 ) {
				obj.initial.method = init_method;
			} else {
				return res.json({ status: "error", message: "initial_method must be 1, 2 or 3" });
			}
		} else {
			obj.initial.method = 2;
		}

		if (req.body.initial.zoom) {
			var init_zoom = parseInt(req.body.initial.zoom);
			if (init_zoom >= 1 && init_zoom <= 20) {
				obj.initial.zoom = init_zoom;
			} else {
				return res.json({ status: "error", message: "initial_zoom must be between 1 and 20" });
			}
		} else {
			obj.initial.zoom = 14;
		}

		if (req.body.initial.center.lat && req.body.initial.center.lon) {
			obj.initial.center.lat = parseFloat(req.body.initial.center.lat);
			obj.initial.center.lon = parseFloat(req.body.initial.center.lon);
		}

		if (req.body.controls.dbclick_zoom) {
			obj.controls.standard.dbclick_zoom = parseBool(req.body.controls.dbclick_zoom);
		} else {
			obj.controls.standard.dbclick_zoom = true;
		}

		if (req.body.controls.scroll_zoom) {
			obj.controls.standard.scroll_zoom = parseBool(req.body.controls.scroll_zoom);
		} else {
			obj.controls.standard.scroll_zoom = true;
		}

		if (req.body.controls.mouse_pan) {
			obj.controls.standard.mouse_pan = parseBool(req.body.controls.mouse_pan);
		} else {
			obj.controls.standard.mouse_pan = true;
		}

		// standard zoom control
		if (req.body.controls.zoom.enabled) {
			obj.controls.standard.zoom.enabled = parseBool(req.body.controls.zoom.enabled);
		}

		if (req.body.controls.zoom.position) {
			var pos = req.body.controls.zoom.position.toUpperCase();
			if (isCorrectPosition(pos)) {
				obj.controls.standard.zoom.position = pos;
			} else {
				return res.json({ status: "error", message: "incorrect controls_zoom_position" });
			}
		}

		if (req.body.controls.zoom.style) {
			var style = req.body.controls.zoom.style.toUpperCase();
			if (style == "DEFAULT" || style == "SMALL" || style == "LARGE") {
				obj.controls.standard.zoom.style = style;
			} else {
				return res.json({ status: "error", message: "incorrect controls_zoom_style" });
			}
		}

		// standard pan control
		if (req.body.controls.pan.enabled) {
			obj.controls.standard.pan.enabled = parseBool(req.body.controls.pan.enabled);
		}

		if (req.body.controls.pan.position) {
			var pos = req.body.controls.pan.position.toUpperCase();
			if (isCorrectPosition(pos)) {
				obj.controls.standard.pan.position = pos;
			} else {
				return res.json({ status: "error", message: "incorrect controls.standard.pan.position" });
			}
		}

		// standard map type control
		if (req.body.controls.map_type.enabled) {
			obj.controls.standard.map_type.enabled = parseBool(req.body.controls.map_type.enabled);
		}

		if (req.body.controls.map_type.position) {
			var pos = req.body.controls.map_type.position.toUpperCase();
			if (isCorrectPosition(pos)) {
				obj.controls.standard.map_type.position = pos;
			} else {
				return res.json({ status: "error", message: "incorrect controls.map_type.position" });
			}
		}

		if (req.body.controls.map_type.style) {
			var style = req.body.controls.map_type.style.toUpperCase();
			if (style == "DEFAULT" || style == "HORIZONTAL_BAR" || style == "DROPDOWN_MENU") {
				obj.controls.standard.map_type.style = style;
			} else {
				return res.json({ status: "error", message: "incorrect controls.map_type.style" });
			}
		}

		//route tracking control
		if (req.body.controls.route_tracking.start_stop.enabled) {
			obj.controls.route_tracking.start_stop.enabled = parseBool(req.body.controls.route_tracking.start_stop.enabled);
		}

		if (req.body.controls.route_tracking.start_stop.position) {
			var pos = req.body.controls.route_tracking.start_stop.position.toUpperCase();
			if (isCorrectPosition(pos)) {
				obj.controls.route_tracking.start_stop.position = pos;
			} else {
				return res.json({ status: "error", message: "incorrect controls.route_tracking.start_stop.position" });
			}
		}

		if (req.body.controls.custom.zoom.enabled) {
			obj.controls.custom.zoom.enabled = req.body.controls.custom.zoom.enabled;
		}

		if (req.body.controls.custom.zoom.position) {
			var pos = req.body.controls.custom.zoom.position.toUpperCase();
			if (isCorrectPosition(pos)) {
				obj.controls.custom.zoom.position = pos;
			} else {
				return res.json({ status: "error", message: "incorrect controls.custom.zoom.position" });
			}
		}

		if (req.body.controls.custom.zoom.background.layout) {
			var layout = req.body.controls.custom.zoom.background.layout.toUpperCase();
			if (isCorrectPosition(pos)) {
				obj.controls.custom.zoom.background.layout = layout;
			} else {
				return res.json({ status: "error", message: "incorrect controls.custom.zoom.background.layout" });
			}
		}

		if (req.body.controls.custom.zoom.background.color) {
			var color = req.body.controls.custom.zoom.background.color.toUpperCase();
			if (isCorrectPosition(pos)) {
				obj.controls.custom.zoom.background.color = color;
			} else {
				return res.json({ status: "error", message: "incorrect controls.custom.zoom.background.color" });
			}
		}

		if (req.body.controls.custom.zoom.background.length) {
			var length = req.body.controls.custom.zoom.background.length;
			if (isCorrectPosition(pos)) {
				obj.controls.custom.zoom.background.length = length;
			} else {
				return res.json({ status: "error", message: "incorrect controls.custom.zoom.background.length" });
			}
		}

		if (req.body.controls.custom.zoom.border.width) {
			var width = req.body.controls.custom.zoom.border.width;
			if (isCorrectPosition(pos)) {
				obj.controls.custom.zoom.border.width = width;
			} else {
				return res.json({ status: "error", message: "incorrect controls.custom.zoom.border.width" });
			}
		}

		if (req.body.controls.custom.zoom.border.color) {
			var color = req.body.controls.custom.zoom.border.color.toUpperCase();
			if (isCorrectPosition(pos)) {
				obj.controls.custom.zoom.border.color = color;
			} else {
				return res.json({ status: "error", message: "incorrect controls.custom.zoom.border.color" });
			}
		}

		if (req.body.controls.custom.zoom.buttons.size) {
			var size = req.body.controls.custom.zoom.buttons.size;
			if (isCorrectPosition(pos)) {
				obj.controls.custom.zoom.buttons.size = size;
			} else {
				return res.json({ status: "error", message: "incorrect controls.custom.zoom.buttons.size" });
			}
		}

		if (req.body.controls.custom.zoom.buttons.color) {
			var color = req.body.controls.custom.zoom.buttons.color.toUpperCase();
			if (isCorrectPosition(pos)) {
				obj.controls.custom.zoom.buttons.color = color;
			} else {
				return res.json({ status: "error", message: "incorrect controls.custom.zoom.buttons.color" });
			}
		}

		if (req.body.controls.custom.pan.enabled) {
			obj.controls.custom.pan.enabled = req.body.controls.custom.pan.enabled;
		}

		if (req.body.controls.custom.pan.position) {
			var pos = req.body.controls.custom.pan.position.toUpperCase();
			if (isCorrectPosition(pos)) {
				obj.controls.custom.pan.position = pos;
			} else {
				return res.json({ status: "error", message: "incorrect controls.custom.pan.position" });
			}
		}

		if (req.body.controls.custom.pan.background.shape) {
			var shape = req.body.controls.custom.pan.background.shape.toUpperCase();
			if (isCorrectPosition(pos)) {
				obj.controls.custom.pan.background.shape = shape;
			} else {
				return res.json({ status: "error", message: "incorrect controls.custom.pan.background.shape" });
			}
		}

		if (req.body.controls.custom.pan.background.color) {
			var color = req.body.controls.custom.pan.background.color.toUpperCase();
			if (isCorrectPosition(pos)) {
				obj.controls.custom.pan.background.color = color;
			} else {
				return res.json({ status: "error", message: "incorrect controls.custom.pan.background.color" });
			}
		}

		if (req.body.controls.custom.pan.background.size) {
			var size = req.body.controls.custom.pan.background.size;
			if (isCorrectPosition(pos)) {
				obj.controls.custom.pan.background.size = size;
			} else {
				return res.json({ status: "error", message: "incorrect controls.custom.pan.background.size" });
			}
		}

		if (req.body.controls.custom.pan.border.width) {
			var width = req.body.controls.custom.pan.border.width;
			if (isCorrectPosition(pos)) {
				obj.controls.custom.pan.border.width = width;
			} else {
				return res.json({ status: "error", message: "incorrect controls.custom.pan.border.width" });
			}
		}

		if (req.body.controls.custom.pan.border.color) {
			var color = req.body.controls.custom.pan.border.color.toUpperCase();
			if (isCorrectPosition(pos)) {
				obj.controls.custom.pan.border.color = color;
			} else {
				return res.json({ status: "error", message: "incorrect controls.custom.pan.border.color" });
			}
		}

		if (req.body.controls.custom.pan.buttons.shape) {
			var shape = req.body.controls.custom.pan.buttons.shape.toUpperCase();
			if (isCorrectPosition(pos)) {
				obj.controls.custom.pan.buttons.shape = shape;
			} else {
				return res.json({ status: "error", message: "incorrect controls.custom.pan.buttons.shape" });
			}
		}

		if (req.body.controls.custom.pan.buttons.size) {
			var size = req.body.controls.custom.pan.buttons.size;
			if (isCorrectPosition(pos)) {
				obj.controls.custom.pan.buttons.size = size;
			} else {
				return res.json({ status: "error", message: "incorrect controls.custom.pan.buttons.size" });
			}
		}

		if (req.body.controls.custom.pan.buttons.color) {
			var color = req.body.controls.custom.pan.buttons.color.toUpperCase();
			if (isCorrectPosition(pos)) {
				obj.controls.custom.pan.buttons.color = color;
			} else {
				return res.json({ status: "error", message: "incorrect controls.custom.pan.buttons.color" });
			}
		}

		return obj;

	}

}
