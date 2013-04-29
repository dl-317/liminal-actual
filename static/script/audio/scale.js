define(
function() {

    var Scale = function(options) {

        var notes = [];

        this.lowendCutoff = options.lowendCutoff || 16.352;
        this.highendCutoff = options.highendCutoff || 25088.324;
        this.intervalSize = options.intervalSize || 2;
        this.steps = options.steps || 12;

        this.note = function(index) {
            return notes[index];
        };

        this.rescale = function() {
            var freq = this.lowendCutoff,
                step = 0,
                octave,
                offset;
        
            while (freq < this.highendCutoff) {
                octave = step % this.steps;
                offset = step++ / this.steps;
                freq = Math.pow(this.intervalSize,(Math.log(this.lowendCutoff)/Math.log(this.intervalSize)) + offset);

                notes.push(freq);
            }
        };

        this.rescale();

    };

    Scale.createScale = function(options) {
        return new Scale(options);
    };

    return {
        createScale: Scale.createScale
    };

});

