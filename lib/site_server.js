var flash = require("connect-flash"),
    express = require("express"),
    passport = require("passport"),
    path = require("path"),
    user = require("./model/user");

// SiteServer class
var SiteServer = function(config) {

    var app = express();

    // configure application
    var configure = function() {
        // configure application
        app.configure(function() {
            // configure media type for XHTML
            express.static.mime.define({"application/xhtml+xml": ["xhtml"]});

            // static content goes in static
            app.use(express.static(config.static_dir));

            // enable cookie parsing for session management
            app.use(express.cookieParser());

            // enable simple access to JSON data in message bodies
            app.use(express.bodyParser());

            // enable default MemoryStore sessions
            app.use(express.session({secret:config.session_secret}));

            // enable passport with session management
            app.use(passport.initialize());
            app.use(passport.session());

            // route requests
            app.use(app.router);

            // fallback to missing resource message
            app.use(function(req, res, next) {
                res.send(404, "resource not found");
            });

            // log errors and present system failure message
            app.use(function(err, req, res, next) {
                console.error("error");
                console.error(err);
                res.send(500, "system failure");
            });
        });
    };

    // setup application routes
    var routing = function() {
        // redirect homepage requests to appropriate resource
        app.get("/", function(req, res, next) {
            res.redirect(config.home_url);
        });

        // present user login
        app.get(config.login_url, passport.authenticate("google"));

        // authenticate users
        app.get(config.auth_url, passport.authenticate("google", {
            successRedirect: config.home_url,
            failureRedirect: config.unauthorized_url
        }));

        // provide info about logged in user
        app.get(config.current_user_url, function(req, res, next) {
            res.writeHead(200, {"Content-Type":"application/json"});
            res.end(req.user == null ? "null" : JSON.stringify(req.user));
        });
    };

    // begin listening for requests
    var listen = function() {
        app.listen(config.listen_port);
        console.log("Listening on port " + config.listen_port);
    };
    
    // start site server
    this.start = function() {
        configure();
        routing();
        listen();
    };
}

exports.SiteServer = SiteServer;
