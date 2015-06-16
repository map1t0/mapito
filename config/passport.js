var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

var User = require('../models/user');

var SendEmail = require("../utils/sendmail");

var configAuth = require('../config').passport;

module.exports = function(passport) {

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user._id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });


    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    }, function(req, email, password, done) {
        // asynchronous
        // User.findOne wont fire unless data is sent back
        process.nextTick(function() {

            // find a user whose email is the same as the forms email
            // we are checking to see if the user trying to login already exists
            User.findOne({ 'local.email' :  email }, function(err, user) {
                // if there are any errors, return the error
                if (err) {
                	console.log("error");
                    return done(err);
                }

                // check to see if theres already a user with that email
                if (user) {
                    return done(null, false, { message: 'registered' });
                } else {
                	if(!validateSignUpData(req.body.name, email, password, req.body.confirmpassword)) {
                		return done(err);
                	}

            		// if there is no user with that email
                    // create the user
                    var newUser = new User();

                    // set the user's local credentials
                    newUser.local.email = email.trim();
                    newUser.local.password = newUser.generateHash(password);
                    newUser.local.name = req.body.name.trim();
                    newUser.local.reg_date = new Date();
            		// save the user
                    newUser.save(function(err) {
                        if (err)
                            throw err;

                        SendEmail.welcome(email, req.body.name);

                        return done(null, newUser);
                    });
                }

            });

        });

    }));


    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) { // callback with email and password from our form

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        User.findOne({ 'local.email' :  email }, function(err, user) {
            // if there are any errors, return the error before anything else
            if (err)
                return done(err);

            // if no user is found, return the message
            if (!user)
                return done(null, false);

			// if the user is found but the password is wrong
            if (!user.validPassword(password))
                return done(null, false);

            // all is well, return successful user
            return done(null, user);
        });

    }));


    passport.use(new FacebookStrategy({
        clientID : configAuth.facebookAuth.clientID,
        clientSecret : configAuth.facebookAuth.clientSecret,
        callbackURL : configAuth.facebookAuth.callbackURL,
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },
    // facebook will send back the token and profile
    function(req, token, refreshToken, profile, done) {

        // asynchronous
        process.nextTick(function() {

            if (!req.user) {

                User.findOne({ 'facebook.id' : profile.id }, function(err, user) {

                    if (err)
                        return done(err);

                    // if the user is found, then log them in
                    if (user) {
                        return done(null, user);
                    } else {
                    	var newUser = new User();

                        newUser.facebook.id = profile.id;
                        newUser.facebook.token = token; // we will save the token that facebook provides to the user
                        newUser.facebook.name = profile.name.givenName + " " + profile.name.familyName;
                        newUser.facebook.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first
                        newUser.facebook.reg_date = new Date()

                        // save our user to the database
                        newUser.save(function(err) {
                            if (err)
                                throw err;

                            SendEmail.welcome(profile.emails[0].value, profile.name.givenName);

                            return done(null, newUser);
                        });
                    }

                });

            } else {
            	return done(null, req.user);
            }

        });

    }));


    passport.use(new GoogleStrategy({
        clientID : configAuth.googleAuth.clientID,
        clientSecret : configAuth.googleAuth.clientSecret,
        callbackURL : configAuth.googleAuth.callbackURL,
    },
    function(token, refreshToken, profile, done) {

        // make the code asynchronous
        // User.findOne won't fire until we have all our data back from Google
		process.nextTick(function() {

                // try to find the user based on their google id
                User.findOne({ 'google.id' : profile.id }, function(err, user) {
                if (err)
                    return done(err);

                if (user) {
                    // if a user is found, log them in
                    return done(null, user);
                } else {
                    // if the user isnt in our database, create a new user
                    var newUser = new User();

                    // set all of the relevant information
                    newUser.google.id = profile.id;
                    newUser.google.token = token;
                    newUser.google.name = profile.displayName;
                    newUser.google.email = profile.emails[0].value; // pull the first email
                    newUser.google.reg_date = new Date();

                    // save the user
                    newUser.save(function(err) {
                        if (err)
                            throw err;

                        SendEmail.welcome(profile.emails[0].value, profile.displayName);

                        return done(null, newUser);
                    });
                }
	        });
	    });

    }));

};


function validateSignUpData(name, mail, password, confirmpassword) {

	name = name.trim();
	mail = mail.trim();

	var ok = true;

	// check name
	var regex_name=/^[A-Za-z][A-Za-z\s]+$/;

	if (name == null || name.length < 2 || !(regex_name.test(name))) {
		ok = false;
	}

	var regex_mail=/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

	if (mail == null || !(regex_mail.test(mail))) {
		ok = false;
	}

	if (password == null || password.length < 6 || password != confirmpassword) {
		ok = false;
	}

	return ok;
}
