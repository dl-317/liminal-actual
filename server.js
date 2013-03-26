#!/usr/bin/env node

var Server = require("./lib/site_server").SiteServer,
    fs = require("fs"),
    path = require("path"),
    config = {},
    runConfig = {
        node: null,
        script: null
    };

// process command line arguments
process.argv.forEach(function(arg) {
    if (!runConfig.node) runConfig.node = arg;
    else if (!runConfig.script) runConfig.script = arg;
    else {
        console.error("unexpected argument: " + arg);
        process.exit(1);
    }
});

// read in config file
fs.readFile(path.join(__dirname, "config.json"), function(err, data) {
    var appConfig,
        server;    

    if (err) {
        console.warn("could not load config.json\n" + err.toString());
    } else {
        defaultConfig = require("./lib/default_config");
        appConfig = JSON.parse(data);

        [runConfig, appConfig, defaultConfig].forEach(function(conf) {
            for (var k in conf)
                if (!config.hasOwnProperty(k))
                    config[k] = conf[k];
        });
    }

    // start server
    require("./lib/auth").initialize(config);
    server = new Server(config);
    server.start();
});
