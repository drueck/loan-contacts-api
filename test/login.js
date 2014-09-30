var Lab = require("lab");
var lab = exports.lab = Lab.script();
var server = require("../index");
var expect = Lab.expect;

var User = require("../lib/user");
var email = "user@example.com";
var password = "secret";

lab.experiment("Login", function() {

  lab.experiment("POST to /login with valid email and password", function() {
    lab.test("logs in the user", function(done) {
      User.create(email, password, function() {
        var options = {
          method: "POST",
          url: "/login",
          payload: {
            email: email,
            password: password
          }
        };
        server.inject(options, function(response) {
          expect(response.statusCode).to.equal(200);
          expectSetCookieWithSessionId(response.headers);
          User.destroy(email, done);
        });
      });
    });
  });

  lab.experiment("POST to /login with invalid email or password", function() {
    lab.test("returns 401 unauthorized with applicable message", function(done) {
      User.create(email, password, function() {
        var options = {
          method: "POST",
          url: "/login",
          payload: {
            email: "not" + email,
            password: "not" + password
          }
        };
        server.inject(options, function(response) {
          expect(response.statusCode).to.equal(401);
          expect(response.payload).to.include("Invalid username or password");
          User.destroy(email, done);
        });
      });
    });
  });

  function expectSetCookieWithSessionId(headers) {
    expect(headers).to.have.ownProperty("set-cookie");
    var setCookie = headers["set-cookie"];
    expect(setCookie[0]).to.include("sid=");
    var sid = setCookie[0].match(/sid\=(.*?);/)[1];
    expect(sid.length).to.be.greaterThan(100);
  }

});
