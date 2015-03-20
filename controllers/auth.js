var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;
var Models = require('../models/');

passport.use(new BasicStrategy(function(username, password, cb) {
  Models.User.findOne({ username: username}, function(err, user){
    if (err) {return cb(err)};

    //if we didn't find a user with that username
    if (!user) { return cb(null, false); };

    //check the password using verifyPassword method of the user
    user.verifyPassword( password, function(err, isMatch){
      if (err) { return cb(err); };

      // the password didn't match, it's wrong
      if (!isMatch) { return cb(null,false);};

      //success, they're authenticated.
      return cb(null, user);
    });
  });
}));

var auth = {
  restrictTo: function(role) {
    return function(req, res, next) {
      if (req.user.role == role) {
        next();
      } else {
        next(res.json(403, {message: 'You need admin priveleges'}));
      }
    }
  },
  restrictToSelf: function() {
    return function(req,res,next) {
      if (req.user.username == req.params.username) {
        next();
      } else if (req.user.role == 'admin') {
        next();
      } else {
        next(res.json(403, {message: 'You need admin priveleges or to be the owner of this account'}));
      }
    }
  },
  isAuthorized: function() {
    return function(req,res,next) {
      /*
      if the user is trying to edit their own user thats fine
      however if they are trying to edit their role, don't let them.
      */
      if (req.user.username == req.params.username) {
        if (req.body.role) {
          return res.json({ message: 'Oi! cheeky, you thought you could change your role? Please remove the role parameter from your request'});
        } else if (req.body.username) {
          return res.json({ message: 'If you change your username, you\'re gonna have a bad time, don\'t change it, please remove it from the request '});
        } else {
          next();
        }
      } else if (req.user.role == 'admin') {
        next();
      } else {
        next(res.json(403, {message: 'You need admin priveleges or to be the owner of this account'}));
      }
    }
  }
}

//don't set a session because we want to have the user authenticate on every request.
auth.isAuthenticated = passport.authenticate('basic', {session: false});

module.exports = auth;
