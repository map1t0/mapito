var nodemailer = require('nodemailer');

var emailAuth = require('../config').mailer;

var transporter = nodemailer.createTransport({
	service : 'gmail',
	auth : {
		user : emailAuth.email,
		pass : emailAuth.password
	}
});

var html_template = function (title, msg) {
	return '<body style="padding:50px;background-color:#ecf0f1;">' +
		'<table style="padding: 3px;margin:0 auto;background-color:#ffffff;width:70%;max-width:600px;min-width:300px;font-family:Arial,sans-serif;border-radius: 5px;">' +
		'<tr style="background-color:#ffffff;color:#ffffff;padding: 60px 0;text-align:center;">' +
		'<td><img src="http://mapito.org/images/mapito-logo-email.png"></td>' +
		'</tr>' +
		'<tr style="background-color:#368ECA;color:#ffffff;font-size:25px;font-weight:bold;"> ' +
		'<td style="padding: 60px 0;" align="center">' + title + '</td>' +
		'</tr>' +
		'<tr style="background-color:#ffffff;color:#000000;font-size:16px;font-weight:bold;">' +
		'<td  style="padding: 60px 0;" align="center">' + msg + '</td>' +
		'</tr>' +
		'<tr style="background-color:#253237;color:#ffffff;font-size:12px;font-weight:bold;">' +
		'<td style="padding: 10px 0;" align="center">For any question, please contact to admin@mapito.org.</td>' +
		'</tr>' +
		'</table>' +
		'</body>';
}

module.exports = {

	welcome : function(recieverEmail, recieverName) {

		var mailOptions = {
			from : 'Mapito.org ' + emailAuth.email,
			to : recieverEmail.trim(),
			subject : 'Welcome to Mapito.org!',
			html : html_template('Welcome to Mapito.org', 'Hi ' + recieverName.trim() + ', thanks for signing up for Mapito.org!')
		};

		transporter.sendMail(mailOptions, function(error, info) {
			if (error) {
				console.log(error);
			} else {
				console.log('Message sent: ' + info.response);
			}
		});

	},

	resetPassword : function (recieverEmail, recieverName, rpID, rpSecret) {

		var reset_password_url = "http://www.mapito.org/user/reset_password?rpid=" + rpID + "&secret=" + rpSecret;

		var reset_msg = "Hi " + recieverName + ", <br>" +
		"We've received a request to reset your password.<br>" +
		"If you didn't make the request, just ignore this email.<br>" +
		"Otherwise, you can reset your password using this link:<br>" +
		"<a href=\"" + reset_password_url + "\">" + reset_password_url + "</a>";

		var mailOptions = {
			from: 'Mapito.org ' + emailAuth.email,
			to: recieverEmail.trim(),
			subject: 'Reset your Password‏',
			html : html_template('Reset your Password‏', reset_msg)
		};

		transporter.sendMail(mailOptions, function(error, info){
			if(error){
			    console.log(error);
			}else{
			    console.log('Message sent(new password): ' + info.response);
			}
		});

	}

};
