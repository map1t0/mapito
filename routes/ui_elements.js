var Map = require('../models/map');
var mongoose = require('mongoose');

module.exports = function (app) {

	app.get('/:cat/ui_elements', isLoggedIn, function(req, res) {

		Map.findOne({ $and : [{_id: mongoose.Types.ObjectId(req.query.mapId), user_id: req.user._id}]}, function (err, maps) {
			res.render('ui_elements.ejs', {
				user : req.user,
				map:  maps,
				mapId : req.query.mapId,
				category: req.params.cat
			});
		});

	});

	app.post('/change_initialization', function(req, res) {

		Map.update({ $and : [{_id: req.body.mapid, user_id: req.user._id}]},
			{
				$set: {
					'initial.method' : req.body.method,
					'initial.center.lat' : req.body.centerlatitude || "",
					'initial.center.lon' : req.body.centerlongitude || "",
					'initial.zoom' : req.body.zoom
				}
			}, function (err){
				if(err) {
					return res.json({ status: "error"});
				}
				return res.json({ status: "ok"});
			});

	});

	app.post('/change_custom_zoom_control', function(req, res) {

		Map.update({ $and : [{_id: req.body.mapId, user_id: req.user._id}]},
			{
				$set: {
					'controls.custom.zoom.enabled': req.body.custom_zoom,
					'controls.custom.zoom.position' : req.body.position,
					'controls.custom.zoom.background.layout' : req.body.bglayout,
					'controls.custom.zoom.background.color' : req.body.bgcolor,
					'controls.custom.zoom.background.length' : req.body.bglength,
					'controls.custom.zoom.border.width' : req.body.brdrwidth,
					'controls.custom.zoom.border.color' : req.body.brdrcolor,
					'controls.custom.zoom.buttons.color' : req.body.btncolor,
					'controls.custom.zoom.buttons.size' : req.body.btnsize,
				}
			}, function (err){
				if(err) {
					return res.json({ status: "error"});
				}
				return res.json({ status: "ok"});
			});

	});

	app.post('/change_custom_pan_control', function(req, res) {

		Map.update({ $and : [{_id: req.body.mapId, user_id: req.user._id}]},
			{
				$set: {
					'controls.custom.pan.enabled': req.body.custom_pan,
					'controls.custom.pan.position' : req.body.custom_pan_position,
					'controls.custom.pan.background.shape' : req.body.bgshape,
					'controls.custom.pan.background.color' : req.body.bgcolor,
					'controls.custom.pan.background.size' : req.body.bgsize,
					'controls.custom.pan.border.width' : req.body.brdrwidth,
					'controls.custom.pan.border.color' : req.body.brdrcolor,
					'controls.custom.pan.buttons.shape' : req.body.btnshape,
					'controls.custom.pan.buttons.color' : req.body.btncolor,
					'controls.custom.pan.buttons.size' : req.body.btnsize,
				}
			}, function (err){
				if(err) {
					return res.json({ status: "error"});
				}
				return res.json({ status: "ok"});
			});

	});

	app.post('/change_standard_controls', function(req, res) {

		Map.update({ $and : [{_id: req.body.mapId, user_id: req.user._id}]},
			{
				$set: {
					'controls.standard.dbclick_zoom': req.body.dbclickZoomControl,
					'controls.standard.scroll_zoom' : req.body.scrollZoomControl,
					'controls.standard.mouse_pan' : req.body.mousePan,
					'controls.standard.zoom.enabled' : req.body.standardZoomControl,
					'controls.standard.zoom.style' : req.body.standardZoomControlStyle || null,
					'controls.standard.zoom.position' : req.body.standardZoomControlPosition || null,
					'controls.standard.pan.enabled' : req.body.standardPanControl,
					'controls.standard.pan.position' : req.body.standardPanControlPosition || null,
					'controls.standard.map_type.enabled' : req.body.mapTypeControl,
					'controls.standard.map_type.style' : req.body.mapTypeControlStyle || null,
					'controls.standard.map_type.position' : req.body.mapTypeControlPosition || null
				}
			}, function (err){
				if(err) {
					return res.json({ status: "error"});
				}
				return res.json({ status: "ok"});
			});

	});

	app.post('/change_tracking_control', function(req, res) {

		Map.update({ $and : [{_id: req.body.mapId, user_id: req.user._id}]},
			{
				$set: {
					'controls.route_tracking.start_stop.position' : req.body.startStopControlPosition
				}
			}, function (err){
				if(err) {
					return res.json({ status: "error"});
				}
				return res.json({ status: "ok"});
			});

	});

	app.post('/change_markers', function(req, res) {

        Map.update({ $and : [{_id: req.body.mapid, user_id: req.user._id}]},
			{
        		$set: {
					markers : []
				}
			}, function (err){
				if(err) {
					return res.json({ status: "error"});
				}

				Map.update({ $and : [{_id: req.body.mapid, user_id: req.user._id}]},
					{
		        		$set: {
							markers : req.body.data
						}
					}, function (err){
						if(err) {
							return res.json({ status: "error"});
						}
						return res.json({ status: "ok"});
					});
			});

	});

	app.post('/change_circles', function(req, res) {

        Map.update({ $and : [{_id: req.body.mapid, user_id: req.user._id}]},
			{
        		$set: {
					crcles : []
				}
			}, function (err){
				if(err) {
					return res.json({ status: "error"});
				}

				Map.update({ $and : [{_id: req.body.mapid, user_id: req.user._id}]},
					{
		        		$set: {
							circles : req.body.data
						}
					}, function (err){
						if(err) {
							return res.json({ status: "error"});
						}
						return res.json({ status: "ok"});
					});
			});

	});
};

//route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated()) {
		return next();
	}

	// if they aren't redirect them to the home page
	res.redirect('/home');
}
