var _ = require('lodash');
var User = require('../models').User,
    VerificationToken = require('../models').VerificationToken,
    EmailService = require('../services/email');
    mongoose = require('mongoose');

var user = {
  list: function(req,res) {
    User.find({},'-__v -password -_id',{}).exec(function(err, users){
      if (err) { throw err;}
      res.status(200).json(users);
    });
  },
  create: function(req,res) {
    User.find({username: req.body.username}).exec(function(err, users) {
      if (err) {throw err};

      if (users.length > 0) {
        //we found one, tell them it already exisits
        res.status(200).json({
          'message': 'we\'re sorry than username already exists, please pick a new one'
        });
      } else {

        var newUser = new User({
          _id: new mongoose.Types.ObjectId,
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          email: req.body.email,
          username: req.body.username,
          password: req.body.password,
          created: Date.now(),
          braids: [],
          modifiers: []
        });

        newUser.save(function(err, user) {
          if (err) { throw err;};

          var verificationToken = new VerificationToken({ _userId: user.username });
          verificationToken.createToken(function(err, token){
            if (err) return console.log("Couldn't create verification token", err);

            //We've succesfully created a user and made a verification token, send them an email man!
            var context = {
              name: user.firstName,
              verifyLink: req.protocol + '://' + req.headers.host + '/email/verify/' + token.token,
              assetsUrl: req.protocol + '://' + req.headers.host + '/public/assets/email/'
            };

            EmailService.renderTemplate('./views/email/welcome.html', context, function(compiledHtml){
              var emailData = {
                from: 'Braid.io <welcome@mg.getbraid.io>',
                to: user.email,
                subject: 'Thanks for signing up',
                html: compiledHtml
              };

              EmailService.send(emailData, function(err, result){
                if (err) { throw err;};

                console.log(result);
              });

            });
          })



          res.status(201).json({
            'message': 'New user sucessfully created!',
            'user': user
          });
        });

      } // end of else
    });
  },
  update: function(req,res) {
    //use traditional find method so save is called, therefore the pre save hook is called
    if (req.params.username) {
      User.findOne({ username: req.params.username},'-__v -password', function(err, user){
        if (err) { throw err;};


        _.extend(user, req.body);

        user.save(function(err, user){
          if (err) { throw err;};

          res.json({
            'message': 'User succesfully updated',
            'user': user
          });
        });
      });
    }
  },
  remove: function(req, res) {
    if (req.params.username) {
      User.findOneAndRemove({ username: req.params.username }, function(err){
        res.json('User: ' + req.params.username + ' has been removed');
      });
    }
  }
}

module.exports = user;
