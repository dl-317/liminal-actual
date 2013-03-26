var path = require("path"),
    passport = require("passport"),
    GoogleStrategy = require("passport-google").Strategy,
    User = require("./model/user").User;

// initialize authentication
exports.initialize = function(config) {
    // setup Google authentication strategy; use Google profile as user
    passport.use(new GoogleStrategy({
        returnURL: config.base_url + config.auth_url,
        realm: config.base_url + "/"
    }, function(identifier, profile, done) {
        profile.identifier = identifier;
        profile.handle = profile.handle || profile.displayName;
        return done(null, profile);
    }));

    // serialize user for session
    passport.serializeUser(function(user, done) {
        done(null, user.identifier);
        User.loadByIdentifier(user.identifier, function(u) {
            var fresh = true;
            for (var prop in user) {
                if (!u[prop]) {
                    u[prop] = user[prop];
                    fresh = false;
                }
            }

            if (!fresh) {
                u.store();
            }
        });
    });

    // deserialize the user from the session
    passport.deserializeUser(function(identifier, done) {
        User.loadByIdentifier(identifier, function(user) {
            done(null, user);
        });
    });
};
