var http = require('http');
var mongoose = require('mongoose');
var path = require('path');
var flash = require('connect-flash');
var Map = require('../models/map');
var User = require('../models/user');
var Route = require('../models/route');
var ResetPassword = require('../models/reset_password');
var UserAction = require('../models/user_action')
var uuid = require('node-uuid');
var json2gpx = require("../utils/json2gpx");

module.exports = function(app, passport) {

	app.get('/', isLoggedIn, function(req, res) {
		res.redirect('/mymaps');
	});

	app.get('/home', function(req, res) {
		if (req.isAuthenticated()) {
			return res.redirect('/mymaps');
		}
		return res.render('index.ejs');
	});

	app.get('/view', function(req, res) {
		res.render('view.ejs', {
			mapId: req.query.m
		});
	});

	app.get('/:cat/embed', isLoggedIn, function(req, res) {
		Map.findOne({ $and : [{_id: mongoose.Types.ObjectId(req.query.mapId), user_id: req.user._id}]},
			function (err, maps) {
				res.render('embed.ejs', {
					user : req.user,
					map:  maps,
					category: req.params.cat,
					mapId : req.query.mapId
				});
			});
	});

	app.get('/error', isLoggedIn, function(req, res) {
		res.render('error.ejs');
	});

	app.get('/apis', isLoggedIn, function(req, res) {
		res.render('api.ejs', {
			user: req.user
		});
	});

	app.get('/http_api', isLoggedIn, function(req, res) {
		res.render('http_api.ejs', {
			user: req.user
		});
	});

	app.get('/js_api', isLoggedIn, function(req, res) {
		res.render('js_api.ejs', {
			user: req.user
		});
	});


	app.get('/:cat/routes', isLoggedIn, function(req, res) {
		if (req.params.cat == "tracking") {
			Map.findOne({ $and : [{_id: mongoose.Types.ObjectId(req.query.mapId), user_id: req.user._id}]}, function (err, maps) {
				Route.find({ map_id : mongoose.Types.ObjectId(req.query.mapId) },
					function (err, routes) {
						res.render('routes.ejs', {
							user : req.user,
							map: maps,
							routes:  routes,
							mapId : req.query.mapId,
							category: req.params.cat
						});
					});
			});
		} else {
			res.redirect('/error');
		}
	});


	app.post('/get_routes_by_map', isLoggedIn, function(req, res) {
		Route.find({ map_id : mongoose.Types.ObjectId(req.body.mapId) },
			function (err, routes) {
				return res.json(routes);
			});
	});

	app.get('/:cat/settings', isLoggedIn, function(req, res) {

		Map.findOne({ $and : [{_id: mongoose.Types.ObjectId(req.query.mapId), user_id: req.user._id}]},
			function (err, maps) {
				res.render('settings.ejs', {
					user : req.user,
					map:  maps,
					category: req.params.cat,
					mapId : req.query.mapId
				});
			});
	});

	app.get('/mymaps', isLoggedIn, function(req, res) {
		if (getFlashCategory(req) === "tracking") {
			res.redirect("/tracking")
		} else {
			res.redirect("/maps")
		}
	});

	app.get('/maps', isLoggedIn, function(req, res) {
		setFlashCategory(req, 'maps');
		Map.find({ $and: [{user_id: req.user._id}, {tracking: { $exists: false } }] },
			function (err, maps) {
				res.render('mymaps.ejs', {
					user : req.user,
					category: "maps",
					title: "Custom Maps",
					maps:  maps
				});
			});
	});

	app.get('/tracking', isLoggedIn, function(req, res) {
		setFlashCategory(req, 'tracking');
		Map.find({ $and: [{user_id: req.user._id}, {tracking: true }] },
			function (err, maps) {
				res.render('mymaps.ejs', {
					user : req.user,
					category: "tracking",
					title: "Route tracking",
					maps:  maps
				});
			});
	});


	app.post('/:cat/addmap', function(req, res) {

		var newMap = new Map();

		newMap.user_id = req.user._id;
		newMap.name = req.body.name;
		newMap.service = req.body.map_service;
		newMap.initial.method = 2;
		newMap.initial.zoom = 14;

		if (req.body.category == "tracking") {
			newMap.tracking = true;
			newMap.controls.route_tracking.start_stop.enabled = true;
		}

		// save the map
		newMap.save(function(err) {
		    if (err)
		        throw err;
		    res.redirect('/' + req.params.cat);
		});
	});


	app.post('/update_map_settings', function(req, res) {

		Map.update({ $and : [{_id: req.body.mapid, user_id: req.user._id}]},
			{ $set: {
				name : req.body.name,
				service : req.body.map_service
			}

		}, function (err){
			if(err) {
				return res.json({ msg: "error"});
			}
			return res.json({ msg: "ok"});
		});

	});





	app.post('/deletemap', function(req, res) {

		Map.remove({ $and : [{_id: req.body.id, user_id: req.user._id}]}, function (err) {
			if (err) return handleError(err);
			// removed!
			res.redirect('/mymaps');
		});
	});


	app.post('/login', function(req, res, next) {
		passport.authenticate('local-login', function(err, user, info) {

			if (err)
				return next(err);

			if (!user)
				return res.json({ msg: "incorrect"});

			req.logIn(user, function(err) {
				if (err)
					return next(err);

				return res.json({ msg: "ok"});
			});

		})(req, res, next);
	});


	app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));

	app.get('/auth/facebook/callback',
	 	passport.authenticate('facebook', { failureRedirect: '/' }),
	 	function(req, res) {
	 		res.redirect('/mymaps');
	 });


	app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

	app.get('/auth/google/callback', passport.authenticate('google', {
		successRedirect : '/mymaps',
		failureRedirect : '/'
	}));


	app.post('/signup', function(req, res, next) {
		passport.authenticate('local-signup', function(err, user, info) {
			if (err) { return next(err); }
			if (info) {
				return res.json({ msg: "registered"});
			}
			if (!user) { return res.json({ msg: "error"}); }
			req.logIn(user, function(err) {
			      if (err) { return next(err); }
			      return res.json({ msg: "ok"});
			});
		})(req, res, next);
	});



	app.post('/create_route', function(req, res) {

		var newRoute = new Route();

		newRoute.map_id = req.body.mapId;
		newRoute.name = (new Date()).toISOString();
		newRoute.time = new Date();

		newRoute.save(function(err) {
			if (err)
			    throw err;
			return res.json({ id: newRoute._id});
		});
	});

	app.post('/save_point', function(req, res) {

		Route.update({ _id: req.body.id },
			{$push: { points: {
					lat: req.body.lat,
					lon: req.body.lon,
					ele: req.body.ele,
					time: new Date()
				}
			}
			},function(err){
		        if (err) {
		                console.log(err);
		        } else {
		            return res.json({ status: "success"});
		        }
		});
	});


	app.post('/gpx_download', isLoggedIn, function(req, res) {

		if (req.body.route_id) {
			Route.findOne({ _id : req.body.route_id}, function (err, route) {
				if (err)
	            	return res.json({ msg: "error"});

				res.set('Content-Type', 'text/xml');
				res.set({"Content-Disposition":"attachment; filename=" + route.name + ".gpx"});
				res.send(json2gpx(route));

			});
		} else {
			return res.json({ msg: "error"});
		}
	});

	app.get('/gpx_download', isLoggedIn, function(req, res) {

		if (req.query.routeId) {
			Route.findOne({ _id : req.query.routeId}, function (err, route) {
				if (err)
	            	return res.json({ msg: "error"});

				res.set('Content-Type', 'text/xml');
				res.set({"Content-Disposition":"attachment; filename=" + route.name + ".gpx"});
				res.send(json2gpx(route));

			});
		} else {
			return res.json({ msg: "error"});
		}
	});

	app.get('/data_download', isLoggedIn, function(req, res) {

		if (req.query.mapId) {
			Map.findOne({ $and: [{ user_id: req.user._id, _id : req.query.mapId}] }, function (err, map) {

				UserAction.find({ map_id : req.query.mapId}, function (err, user_actions) {
					if (err)
		            	return res.json({ msg: "error"});
					var csv;
					csv = "time,from.zoom,from.lat,from.lon,to.zoom,to.lat,to.zoom\n";
					//console.log(user_actions.length)
					for (var i=0;i<user_actions.length;i++) {
						var n = user_actions[i];
						csv = csv + n.time.toISOString() + "," + n.from.zoom + "," + n.from.lat + "," + n.from.lon + "," + n.to.zoom + "," + n.to.lat + "," + n.to.lon + "\n"
					}

					res.set('Content-Type', 'text/csv');
					res.set({"Content-Disposition":"attachment; filename=" + map.name.replace(" ", "_") + ".csv"});
					res.send(csv);

				});

			});
		} else {
			return res.json({ msg: "error"});
		}
	});


	// logout
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});


};

//route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/home');
}


function setFlashCategory(req, cat) {
	req.flash('category').pop();
	req.flash('category', cat);
}

function getFlashCategory(req) {
	return req.flash('category').pop();
}
