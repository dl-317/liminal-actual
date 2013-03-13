var express = require("express")
var app = express();

// static content goes in static
app.use(express.static("static"));

// fallback to simple system online message
app.use(function(req, res, next) {
    var body = "system online";
    res.writeHead(404, {
        "Content-Type": "text/plain",
        "Content-Length": body.length
    });
    res.end(body);
});

// log errors and present system failure message
app.use(function(err, req, res, next) {
    console.error(err.stack);
    var body = "system failure";
    res.writeHead(500, {
        "Content-Type": "text/plain",
        "Content-Length": body.length
    });
});

// begin listening for requests
app.listen("2727");
console.log("Listening on port 2727");
