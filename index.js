var Hapi = require('hapi');
var server = new Hapi.Server(3000);
var User = require("./lib/user");
var config = require("./config");

server.pack.register(require('hapi-auth-cookie'), function(err) {

  server.auth.strategy('session', 'cookie', {
    password: config.cookiePassword,
    redirectTo: false,
    isSecure: false
  });

  server.route({
    method: 'POST',
    path: '/login',
    handler: function(request, reply) {
      var email = request.payload.email;
      var password = request.payload.password;
      User.authenticate(email, password, function(err, user, msg) {
        if (user) {
          request.auth.session.set(user);
          reply(msg);
        }
        reply(msg).code(401);
      });
    }
  });

  server.route({
    method: 'POST',
    path: '/logout',
    config: {
      auth: 'session',
      handler: function(request, reply) {
        request.auth.session.clear();
        reply("You have been logged out");
      }
    }
  });

  if (!module.parent) {
    server.start(function() {
      console.log('Listening on port ' + server.info.port);
    });
  }

  module.exports = server;

});
