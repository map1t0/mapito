var mongoose = require('mongoose');
var User = require('../models/user');
var ResetPassword = require('../models/reset_password');
var AccessToken = require('../models/access_token');
var uuid = require('node-uuid');
var sendEmail = require("../utils/sendmail");

module.exports = function (app) {

	app.route('/user/account')
		.get(isLoggedIn, function(req, res) {
			res.render('account.ejs', {
				user : req.user,
				action: "account"
			});
		})
		.post(function(req, res) {
			User.findOne({ _id : req.user._id }, function (err, user) {

				if (err)
					return res.json({ status: "error"});

				var filter=/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

				if (req.body.name.trim().length < 2 || !(filter.test(req.body.mail))) {
					return res.json({ status: "error"});
				} else {
					var setObj;

					if (typeof req.user.local.email !== 'undefined') {
						setObj = {
							'local.name' : req.body.name,
							'local.email' : req.body.mail
						}
					} else if (typeof req.user.facebook.email !== 'undefined') {
						setObj = {
							'facebook.name' : req.body.name,
							'facebook.email' : req.body.mail
						}
					} else if (typeof req.user.google.email !== 'undefined') {
						setObj = {
							'google.name' : req.body.name,
							'google.email' : req.body.mail
						}
					}

					User.update({ _id: req.user._id },
						{
							$set: setObj
						}, function (err){
							if(err) {
								return res.json({ status: "error"});
							}
							return res.json({ status: "ok"});
						});

				}
			});

		});

	app.route('/user/password')
		.get(isLoggedIn, function(req, res) {

			res.render('account.ejs', {
				user : req.user,
				action: "password"
			});

		})
		.post(function(req, res) {

			User.findOne({ _id : req.user._id }, function (err, user) {

				if (err)
					return res.json({ status: "error"});

				var newpassword = req.body.newpassword.trim();

				if (newpassword < 6) {
					return res.json({ status: "error"});
				} else if (req.user.validPassword(req.body.password)) {
					User.update({ _id: req.user._id },
						{
							$set: {
								'local.password' : req.user.generateHash(newpassword)
							}
						}, function (err){
							if(err) {
								return res.json({ status: "error"});
							}
							return res.json({ status: "ok"});
						});
				} else {
					return res.json({ status: "incorrect"});
				}

			});

		});

	app.route('/user/delete')
		.get(isLoggedIn, function(req, res) {
			res.render('account.ejs', {
				user : req.user,
				action: "delete"
			});
		})
		.post(function(req, res) {
			User.findOne({ _id : req.user._id }, function (err, user) {

				if (err)
					return res.json({ status: "error"});

				if (typeof req.user.local.email !== "undefined") {
					if (req.user.validPassword(req.body.password)) {
						User.remove({ _id: req.user._id }, function (err) {
							if (err)
								return res.json({ status: "error"});
							// removed!
							return res.json({ status: "ok"});
						});
					} else {
						return res.json({ status: "incorrect"});
					}
				} else {
					User.remove({ _id: req.user._id }, function (err) {
						  if (err)
							  return res.json({ status: "error"});
						  // removed!
						  return res.json({ status: "ok"});
					});
				}
			})
		});

	app.get('/user/access_tokens', isLoggedIn, function(req, res) {

		AccessToken.find({user_id: req.user._id}, function (error, tokens) {
			if (error) {
				return res.json({ status: "error"});
			}

			res.render('tokens.ejs', {
				user : req.user,
				tokens : tokens
			});
		});

	});

	app.get('/user/reset_password', function(req, res) {

		ResetPassword.findOne({ '_id' : req.query.rpid }, function (err, rp) {
			if(rp) {
				res.render('reset_password.ejs', {
					rpid : req.query.rpid,
					secret: req.query.secret
				});
			} else {
				res.redirect('/home');
			}
		});

	});

	app.post('/resetPassword', function(req, res) {

		ResetPassword.findOne({ _id : req.body.rpid }, function (err, rp) {
			if (err) {
				console.log("first");
				return res.json({ status: "error"});
			}
			else {
				if (req.body.newpassword.trim().length < 6) {
					console.log("sm passs");
					return res.json({ status: "error"});
				} else if (rp.secret == req.body.secret) {
					User.update({ 'local.email': rp.email },
						{
							$set: {
								'local.password' : new User().generateHash(req.body.newpassword)
							}
						}, function (err){
							if (err) {
								console.log("user")
								return res.json({ status: "error"});
							}

							ResetPassword.remove({ _id: mongoose.Types.ObjectId(rp._id) }, function (err) {
								if (err) {
									console.log("reset");
									return res.json({ status: "error"});
								}
								return res.json({ status: "ok"});
		  					});
						});
				} else {
					console.log("last");
					return res.json({ status: "error"});
				}
			}
		});

	});

	app.post('/forgot_password', function(req, res) {

		User.findOne({ 'local.email': req.body.email.trim() }, function(err, user) {

			if (err)
				return res.json({ msg: "error"});

			if (user) {

				ResetPassword.findOne({ 'email': req.body.email.trim() }, function(err, rp) {
					if (err)
				    	return res.json({ msg: "error"});

					if(rp) {
						ResetPassword.remove({ _id: rp._id }, function (err) {
							if (err) return res.json({ msg: "error"});
						});
					}

					var newResetPassword = new ResetPassword();

					newResetPassword.email = req.body.email.trim();
					newResetPassword.secret = uuid.v1();

					newResetPassword.save(function(err, rp) {

						if (err)
							return res.json({ msg: "error"});

						sendEmail.resetPassword(req.body.email, user.local.name, rp._id, rp.secret);

						return res.json({ msg: "ok"});
					});
				});
			} else {
				return res.json({ msg: "notexist"});
			}

		});

	});

	app.post('/generate_access_token', function(req, res) {

		var _uuid = uuid.v1();

		var newAccessToken = new AccessToken();

		newAccessToken.user_id = req.user._id;
		newAccessToken.description = req.body.descr;
		newAccessToken.scopes.map.read = req.body.map_read;
		newAccessToken.scopes.map.modify = req.body.map_modify;
		newAccessToken.scopes.actions.read = req.body.actions_read;
		newAccessToken.scopes.actions.modify = req.body.actions_modify;
		newAccessToken.scopes.routes.read = req.body.routes_read;
		newAccessToken.scopes.routes.modify = req.body.routes_modify;

		newAccessToken.access_token = _uuid;

		newAccessToken.save(function(err) {
			if (err)
				throw err;
			return res.json({ id: newAccessToken._id, token: _uuid });
		});

	});

	app.post('/update_access_token', function(req, res) {

		AccessToken.update({ _id: req.body.token_id },
			{
				$set: {
					'description' : req.body.descr,
					'scopes.map.read' : req.body.map_read,
					'scopes.map.modify' : req.body.map_modify,
					'scopes.actions.read' : req.body.actions_read,
					'scopes.actions.modify' : req.body.actions_modify,
					'scopes.routes.read' : req.body.routes_read,
					'scopes.routes.modify' : req.body.routes_modify
				}
			}, function (err){
				if(err) {
					return res.json({ status: "error"});
				}
				return res.json({ status: "ok"});
			});
	});

	app.post('/delete_access_token', function(req, res) {

		AccessToken.remove({ _id: req.body.token_id }, function (err) {

			  if (err)
				  return res.json({ status: "error"});
			  // removed
			  return res.json({ status: "ok"});
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
