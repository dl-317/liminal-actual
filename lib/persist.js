var events = require("events"),
    storage = require("redis").createClient();

var Persist = function(options) {

    var opt = options || {};
    opt.type = opt.type || "unknown";
    opt.id = opt.id || "id";
    opt.keys = opt.keys || [];

    this.meta = function(name) {
        return opt[name];
    };
    
};

Persist.load = function(type, key, obj, done) {
    var id = [type, key, obj[key]].join(":");
    storage.get(id, function(err, id) {
        if (err) return obj.emit("error", err);
        storage.hgetall(id, function(err, reply) {
            if (err) return obj.emit("error", err);
            for (var prop in reply)
                obj[prop] = reply[prop];
            done(obj);
        });
    });
}

Persist.prototype = new events.EventEmitter();

Persist.prototype.indices = function() {
    var result = [];
    for (var i in this.meta("keys"))
        if (this[this.meta("keys")[i]])
            // type:key:value
            result.push([
                this.meta("type"),
                this.meta("keys")[i],
                this[this.meta("keys")[i]]
            ].join(":"));
    return result;
}

Persist.prototype.assignId = function(done) {
    var self = this;
    var incr = this.meta("type") + ".next";

    storage.incr(incr, function(err, id) {
        if (err) return self.emit("error", err);
        self[self.meta("id")] = id;
        done(id, self);
    });
};

Persist.prototype.identify = function(done) {
    if (this[this.meta("id")])
        done(this[this.meta("id")], this);
    else
        this.assignId(done);
};

Persist.prototype.validate = function(done) {
    done(this);
};

Persist.prototype.store = function(done) {
    this.validate(function(obj) {
        obj.identify(function(id, obj) {
            id = [obj.meta("type"), id].join(":");

            var vals = [];
            obj.indices().forEach(function(key) {
                vals.push(key);
                vals.push(id);
            });

            storage.mset(vals, function(err) {
                if (err) return obj.emit(err);

                // get attributes
                var attributes = {};
                for (var prop in obj)
                    if (typeof obj[prop] != "function" && typeof obj[prop] != "object")
                        attributes[prop] = "" + obj[prop];

                storage.hmset(id, attributes, function(err) {
                    if (err) return obj.emit("error", err);
                    if (done) done(id, obj);
                });
            });
        });
    });
};

Persist.prototype.refresh = function(done) {
    var id = this[this.meta("id")];

    // without an id, there is no data to refresh
    if (!id) return done(null, this);

    // retrieve attributes
    storage.hgetall(id, function(err, reply) {
        if (err) return self.emit(err);
        for (var prop in reply) {
            this[prop] = reply[prop];
        }
        done(id, this);
    });
};

storage.on("error", function(err) {
    console.error("Error " + err);
});

exports.Persist = Persist;

