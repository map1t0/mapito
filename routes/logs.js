var logger = require("../config/logger");

module.exports = function (app) {

	app.get('/_system/logs/:secret', function(req, res) {

		if (req.params.secret == "secret_key") {
			var options = {
				from: new Date() - 24 * 60 * 60 * 1000,
				until: new Date(),
				limit: 5000,
				start: 0,
				order: 'desc'
			};

			// Find items logged between today and yesterday.
			logger.query(options, function (err, results) {
				if (err) {
				  throw err;
				}
				res.json(results.file);
			});
		} else {
			es.redirect('/');
		}
		
	});

};
