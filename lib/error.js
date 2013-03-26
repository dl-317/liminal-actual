var util = require("util");

var createError = function(type, parent) {
    parent = parent || Error;
    var constructor = function(message) {
        parent.call(this, type + " " + message);
    }
    util.inherits(constructor, parent);
    return constructor;
};

exports.createError = createError;
