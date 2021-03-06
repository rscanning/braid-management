//This file sets up the routes for the entire app. By splitting it into their own modules it will be easier to
//create and set up routes as needed as the app may grow, both through features and api versions.
//The function takes the app and then sets up the routes, it works exactly the same as how configure works.

var managementApiv1 = require('./routes/mangementApiV1');
var emailRoutes = require('./routes/emailRoutes');
var loginRoutes = require('./routes/loginRoutes.js');
var adminRoutes = require('./routes/adminRoutes.js');
var serveStatic = require('serve-static');
var path = require('path');
var auth = require('./controllers/auth');

module.exports.init = function(app) {
  app.use('/api/management/v1/', managementApiv1);
  app.use('/email/', emailRoutes);
  app.get('/login/', function(req, res) {
	var options = {
    root: __dirname + '/views/login/',
    dotfiles: 'deny',
    headers: {
        'x-timestamp': Date.now(),
        'x-sent': true
    }
  	};
	res.sendFile('index.html', options);
	});
  app.use('/', loginRoutes);
  app.use('/admin', adminRoutes);
  app.use('/admin', auth.clientIsAuthenticated(), serveStatic(path.join(__dirname, '/views/admin/')));
  //serve up any files in the public folder
  app.use('/public/', serveStatic(path.join(__dirname, '/public/')));
  app.use('/', serveStatic(path.join(__dirname, '/_site/')));
  app.use('/docs', serveStatic(path.join(__dirname, '/views/docs/')));
}
