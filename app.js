var express = require("express")
var app = express();

app.get("*", function(req, res) {
    var body = "system online";
    res.writeHead(404, {
        "Content-Type": "text/plain",
        "Content-Length": body.length
    });
    res.end(body);
});

app.listen("2727");
console.log("Listening on port 2727");
