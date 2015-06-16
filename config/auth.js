module.exports = {

    db : {
        host : "127.0.0.1", // MongoDB host
    	port : 27017, // MongoDB port
    	dbname : "mapitodb", // database name

    	url : function () {
    		return "mongodb://" + this.host + ":" + this.port + "/" + this.dbname;
    	}
    },

    mailer : {
        email : '********@gmail.com', // enter your gmail
    	password : '************' // enter your password
    },

    passport : {
        facebookAuth : {
    		clientID : '************', // Facebook App ID
    		clientSecret : '************************', // Facebook App Secret
    		callbackURL : 'http://YOUR_DOMAIN/auth/facebook/callback' // change the YOUR_DOMAIN to your domain 
    	},

    	googleAuth : {
    		clientID : '************', // Google Client ID
    		clientSecret : '************************', // Google Client secret
    		callbackURL : 'http://YOUR_DOMAIN/auth/google/callback' // change the YOUR_DOMAIN to your domain 
    	}
    }

};
