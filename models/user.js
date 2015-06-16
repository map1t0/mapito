var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt   = require('bcrypt-nodejs');

var userSchema = new Schema({

   local : {
        email : String,
        password : String,
        name : String,
        reg_date : Date
    },
    facebook : {
        id : String,
        token : String,
        email : String,
        name : String,
        reg_date : Date
    },
    google : {
        id : String,
        token : String,
        email : String,
        name : String,
        reg_date : Date
    }

});

// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

module.exports = mongoose.model('User', userSchema);
