var util = require("util"),
    Persist = require("../persist").Persist;

var User = function(id) {

    Persist.call(this, {
        type: "user",
        keys: ["identifier"]
    });
    
    this.id = id;
    this.refresh(function() {
        if (id) this.emit("ready");
    });

};

User.load = function(key, value, done) {
    var obj = new User();
    obj[key] = value;
    Persist.load("user", key, obj, done);
};

User.loadByIdentifier = function(identifier, done) {
    User.load("identifier", identifier, done);
};

User.prototype.validate = function(done) {
    this.handle = this.handle || this.displayName || this.identifier;
    done(this);
};

util.inherits(User, Persist);

exports.User = User;
