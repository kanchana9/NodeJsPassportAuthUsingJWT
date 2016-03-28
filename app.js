//Main JS code

var express = require('express');
var dbConfig = require('./models/db');
var mongoose = require('mongoose');
var morgan = require('morgan');
var User = require('./models/user');
var app = express();
var jwt = require('jsonwebtoken');
var jwtSecret = require('./models/secret');
var app = express();
var bodyParser = require('body-parser');


mongoose.connect(dbConfig.url, function(err){
	if(err) throw err;
	console.log("Connected to Mongodb sucessfully!!");
});

//logging requests to console
app.use(morgan('dev'));


app.use(bodyParser.urlencoded({ extended: false }));//earlier true
app.use(bodyParser.json());


/*********Passport Configuration***********/

var passport = require('passport');
//var stratergy = require('passport-local');

var LocalStrategy = require('passport-local').Strategy;


var apiRoutes = express.Router();
console.log(' app');
//var apiRoutes = require('./routes/index')(passport);
app.use('/api', apiRoutes);


/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Endpoint not found');
    err.status = 404;
    next(err);
});

app.use(passport.initialize());

passport.use(new LocalStrategy(function(username, password, done){
	User.findOne({username : username }, function(err, usr){
		if(err){
			console.log("Error while searching for user!");
			return done(err);
		}
		if(!usr){
			console.log("Invalid username");
			return done(null, false, { message: 'Invalid username.'});
		}
		if(!usr.comparePassword(password)){
			console.log("Invalid password");
			return done(null, false, { message : 'Invalid password.'});
		}
		console.log("Valid user!");
		return done(null,usr);	
	});
}));


//********New user registration, using passport*******
// passport.use('signup', new LocalStrategy({
//     passReqToCallBack: true
// },
// function (req, username, password, done) {
//     findOrCreateUser = function () {

//         //First find the user in db

//         User.findOne({ username: username }, function (err, user) {
//             if (err) {
//                 console.log(' Error during signup :' + err);
//                 return done(err);
//             }

//             //user already exists
//             if (user) {
//                 console.log(' User already exists!');
//                 return done(null, false, 'message', 'User already exists!');
//             }
//             else {
//                 //if control reaches here , means user doesn't exists in db, so create it

//                 var userData = new User({
//                     username: username,
//                     password: password,
//                     admin: true,
//                     location: 'LA'
//                 });

//                 //save user to database
//                 userData.save(function (err) {
//                     if (err) {
//                         console.log("\n Error occured while saving the user : " + err);
//                         throw err;
//                     } else {
//                         console.log("\n User is saved sucessfully!");
//                         return done(null, userData);
//                     }
//                 });

//             }
//         });
//     }
// }
// ));




//********Already registered user, authenticating using passport*******
/**** POST Login *********/

console.log('before login');

apiRoutes.post('/login', function (req, res, next) { console.log("body parsing", req.body);
    passport.authenticate('passport-local', function (err, usr, info) {

console.log('inside login authenticate');

        if (err) {
            console.log('Error occured while authenticating');
            return next(err);
        }
        if (!usr) {
            return res.json(401, { success: false, message: ' Authentcation falied: Invalid user details provided!' });
        }
        else if (usr) {

            //check if password is matching
            usr.comparePassword(req.body.password, function (err, isMatch) {
                if (err) throw err;
                console.log('Password : ', isMatch); // true
                if (!isMatch) {
                    res.json({ success: false, message: " Authentication failed. Invalid password" });
                }
            });

            //user is authenticated when control is reached here
            //create JWT token
            var token = jwt.sign(user, jwtSecret());
            res.json(200, {success: true, message: 'User is authenticated!', token: token })
        }
    });
});

/***********************************************************/
//NEW CODE








module.exports = app;

// passport.use(new LocalStrategy(function(username, password, done){
// 	User.findOne({username : username }, function(err, usr){
// 		if(err){
// 			console.log("Error while seraching for user!");
// 			return done(err);
// 		}
// 		if(!usr){
// 			console.log("Invalid username");
// 			return done(null, false, { message: 'Invalid username.'});
// 		}
// 		if(!usr.comparePassword(password)){
// 			console.log("Invalid password");
// 			return done(null, false, { message : 'Invalid password.'});
// 		}
// 		console.log("Valid user!");
// 		return done(null,usr);	
// 	});
// }));

// apiRoutes.post('/login', passport.authenticate('local', { successRedirect : '/', failureRedirect : '/login', failureFlash : true }));



