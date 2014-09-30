var bcrypt = require("bcrypt");
var jf = require("jsonfile");

var usersFile = "./db/users.json";

function create(email, password, callback) {
  hashPassword(password, function(hash) {
    var user = {
      email: email,
      password: hash
    };
    jf.writeFile(usersFile, user, function(err) {
      if (err) { throw err; }
      callback(null, true, "Successfully created user");
    });
  });
}

function destroy(email, callback) {
  jf.writeFile(usersFile, {}, function(err) {
    if (err) { throw err; }
    callback();
  });
}

function authenticate(email, password, callback) {
  jf.readFile(usersFile, function(err, user) {
    if (err) { throw err; }
    if (user.email !== email) {
      callback(null, false, "Invalid username or password");
    }
    bcrypt.compare(password, user.password, function(err, passwordsMatch) {
      if (err) { throw err; }
      if (passwordsMatch) {
        callback(null, { email: user.email }, "Welcome, " + user.email + "!");
      }
    });
  });
}

function hashPassword(password, callback) {
  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(password, salt, function(err, hash) {
      callback(hash);
    });
  });
}

module.exports = {
  create: create,
  destroy: destroy,
  authenticate: authenticate
};
