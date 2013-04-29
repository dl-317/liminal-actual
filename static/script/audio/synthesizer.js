define(["./scale", "./sample"],
function(Scale, Sample) {

    // Synthesizer
    var Synthesizer = function(options) {

        var scale = options.scale || Scale.createScale(options);
        var oscillators = [options.oscillator || Oscillator.createOscillator("sine", 440)];
        var envelope = options.envelope || Envelope.createEnvelope(0.1, 0.05, 0.3);

        var envelope = options.envelope || function(t, r) {
            var attack = 0.1;       // seconds from press to max
            var sustain = 0.05;     // attenuation per second
            var decay = 0.3;        // seconds from release to silence
        };
        var output = Sample.createSample(options);

        this.getScale = function() {
            return scale;
        };

        this.record = function(length) {
            var rate = output.sampleRate(),
                sampleLength = rate * length / 1000,
                sample,
                sampleValue,
                sampleData = [],
                channel, t;

            for (sample = 0; sample < sampleLength; sample++) {
                sampleValue = 0;
                t = sample / rate;
                oscillators.forEach(function(oscillator) {
                    sampleValue += oscillator(t);
                });
                sampleValue = (Math.exp(sampleValue) - Math.exp(-sampleValue)) /
                    (Math.exp(sampleValue) + Math.exp(sampleValue));
                
                for (channel = 0; channel < output.numChannels(); channel++)
                    sampleData.push(sampleValue * (1<<output.bitsPerSample()));
            }
            output.addSampleData(sampleData);

            return this;
        };

        this.activate = function() {
            console.log(output.audio());
            output.audio().play();
        };
    };

    Synthesizer.createSynthesizer = function(options) {
        return new Synthesizer(options);
    };

    Synthesizer.sine = function(val) {
        return Math.sin(val * 2 * Math.PI);
    };

    // Oscillator
    var Oscillator = function(waveform, frequency) {
        var fn = Synthesizer[waveform];
        var wavelength = (1/frequency);
        
        if (!fn || typeof fn != "function")
            return function(t) { return null; };

        return function(t) {
            return fn(t / wavelength % 1);
        };
    };

    Oscillator.createOscillator = function(waveform, frequency) {
        return new Oscillator(waveform, frequency);
    };

    // Envelope
    var Envelope = function(options) {
    };

    Envelope.createEnvelope = function(options) {
        return new Envelope(options);
    };

    return {
        createSynthesizer: Synthesizer.createSynthesizer,
        createOscillator: Oscillator.createOscillator,
        createEnvelope: Envelope.createEnvelope
    };

});

