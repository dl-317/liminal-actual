define(
function() {

    // Sequencer
    var Sequencer = function(options) {

        var events = [];
        this.clock = null;

        this.beats = options.beats || 1;
        this.divisions = options.divisions || 1;
        this.tempo = options.tempo || 100;
        
        this.__defineGetter__("stops", function() { return this.beats * this.divisions; });

        this.events = function() {
            return events;
        };

        this.at = function(time, target) {
            if (!events[time]) events[time] = [];
            events[time].push(target);
        };

    };

    Sequencer.createSequencer = function(options) {
        return new Sequencer(options);
    };

    Sequencer.prototype.start = function() {
        var interval = 1000 * 60 / (this.tempo * this.divisions),
            i = 0,
            stops = this.stops,
            events = this.events();

        if (this.clock) clearInterval(this.clock);
        this.clock = setInterval(function() {
            if (events[i])
                events[i].forEach(function(target) {target.activate();})
            i = ++i % (stops);
        }, interval);
    };

    // Switch
    var Switch = function(target) {
        
        var enabled = false;
        var that = this;
        var bound = $();
        
        this.target = target;

        this.activate = function() {
            if (enabled)
                this.target.activate();
        };

        this.on = function() {
            enabled = true;
        };

        this.off = function() {
            enabled = false;
        };

        this.toggle = function() {
            enabled = !enabled;
            if (enabled)
                $(bound).addClass("active");
            else
                $(bound).removeClass("active");
        };

        this.bind = function(selector) {
            bound = $.merge(bound, $(selector));
            $(selector).click(function() {
                that.toggle();
            });
        };
        
    };

    Switch.createSwitch = function(target) {
        return new Switch(target);
    };

    // module
    return {
        createSequencer: Sequencer.createSequencer,
        createSwitch: Switch.createSwitch
    };

});
