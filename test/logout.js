var Lab = require("lab");
var lab = exports.lab = Lab.script();
var server = require("../index");
var expect = Lab.expect;

var User = require("../lib/user");
var email = "user@example.com";
var password = "secret";

lab.experiment("Logout", function() {

  lab.experiment("POST to /logout", function() {
    lab.test("logs out the user", function(done) {
      logIn(function(loginResponse) {
        var sid = sessionId(loginResponse.headers);
        var options = {
          method: "POST",
          url: "/logout",
          headers: { cookie: "sid=" + sid }
        };
        server.inject(options, function(response) {
          expectToClearSessionId(response.headers);
          User.destroy(email, done);
        });
      });
    });
  });

  function logIn(callback) {
    User.create(email, password, function() {
      var options = {
        method: "POST",
        url: "/login",
        payload: { email: email, password: password }
      };
      server.inject(options, function(response) {
        callback(response);
      });
    });
  }

  function sessionId(headers) {
    return headers["set-cookie"][0].match(/sid\=(.*?);/)[1];
  }

  function expectToClearSessionId(headers) {
    expect(headers).to.haveOwnProperty("set-cookie");
    expect(headers["set-cookie"][0]).to.include("sid=;");
  }

});
