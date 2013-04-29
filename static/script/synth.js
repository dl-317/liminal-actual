define(["./audio/scale", "./audio/synthesizer", "./audio/sequencer"],
function(Scale, Synthesizer, Sequencer) {
    var noteOffset = 36,
        synth, scale, seq, seqSwitch;

    // create an equal temperament octave scale based around 256Hz (scientific tuning for middle C)
    scale = Scale.createScale({
        lowendCutoff: 16    // note 0 = 16 Hz
    });

    // create a sequencer for synchronizing events
    seq = Sequencer.createSequencer({
        beats: 4,
        divisions: 4,
        tempo: 90
    });

    // setup sequencer switches for 16 notes
    var switchNumber = 0;
    for (var note = 0; note < 16; note++) {
        // synthesize a short sample
        synth = Synthesizer.createSynthesizer({
            rate: 8000,
            bits: 8,
            channels: 1,
            oscillator: Synthesizer.createOscillator("sine", scale.note(note+noteOffset))
        }).record(200);

        // create a sequenced switch for this note at each of 16 stops
        var wrapper;
        for (var stop = 0; stop < 16; stop++) {
            // copy the synth and wrap it in a switch
            seqSwitch = Sequencer.createSwitch(synth);

            // sequence the switch at this stop
            seq.at(stop, seqSwitch);

            // create switch UI
            id = "sw" + switchNumber++;
            ui = $("<div class=\"switch\" id=\"" + id + "\" />");

            // add switch to appropriate wrapper
            if (stop % 16 == 0) {
                wrapper = $("<div class=\"meter len2\" />")
                    .append(ui)
                    .appendTo($("<div class=\"meter len4\" />")
                        .appendTo($("<div class=\"meter len8\" />")
                            .appendTo($("<div class=\"meter len16\" />")
                                .appendTo("#controller")
                            )
                        )
                    );
            } else if (stop % 8 == 0) {
                wrapper = $("<div class=\"meter len2\" />")
                    .append(ui)
                    .appendTo($("<div class=\"meter len4\" />")
                        .appendTo($("<div class=\"meter len8\" />")
                            .appendTo(wrapper.parent().parent().parent())
                        )
                    );
            } else if (stop % 4 == 0) {
                wrapper = $("<div class=\"meter len2\" />")
                    .append(ui)
                    .appendTo($("<div class=\"meter len4\" />")
                        .appendTo(wrapper.parent().parent())
                    );
            } else if (stop % 2 == 0) {
                wrapper = $("<div class=\"meter len2\" />")
                    .append(ui)
                    .appendTo(wrapper.parent());
            } else {
                wrapper.append(ui);
            }

            // tie the UI to the switch
            seqSwitch.bind("#" + id);
        }
    }

    // start the sequencer
    seq.start();
});
