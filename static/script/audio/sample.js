// RIFF WAVE reference: http://home.roadrunner.com/~jgglatt/tech/wave.htm
define(
function() {

    var DATA_PREFIX = "data:audio/wav;base64,",
        MAX_CHUNK_SIZE = 0xFFFFF,                       // 1MiB - 1 (divisible by 3)
        ENCODED_CHUNK_SIZE = MAX_CHUNK_SIZE / 3 * 4;

    var Sample = function(options) {

        var encodedData = "";

        var buffer = [],
            dones = [],
            buffered = false;

        var done = function() {
            dones.splice(0, dones.length).forEach(function(done) {
                done();
            });
        }

        var readBuffer = function() {
            var used = 0,
                chunks = [], chunk;

            if (buffer.length == 0)
                return null;

            while (chunk = buffer.shift() && used + chunk.length <= MAX_READ_SIZE) {
                used += chunk.length;
                chunks.push(chunk);                
            }

            if (chunk && used < MAX_READ_SIZE) {
                chunks.push(chunk.splice(0, MAX_READ_SIZE - used));
                buffer.unshift(chunk);
            }
            
            return chunks.shift().concat.call(chunks);
        };

        var drainBuffer = function() {
            var chunk = readBuffer();
            if (!chunk) {
                buffered = false;
                return done();
            }

            

            data = data.concat();
        };

        this.addSampleData = function(data, done) {
            if (done) dones.push(done);

            if (data.length > 0)
                buffer.push(data);

            if (!buffered)
                buffered = setTimeout(drainBuffer, 0);
        }

        var old = function() {
            processing = setTimeout(process, 0);


            if (!data instanceof Array)
                return done(new Error("data must be Array"));

            setTimeout(function() {
                if (encodedData.length == 0) {
                    encodeHeader();
                }
                encodeData(data);
                if (done) done();
            }, 0);
        };

        var encodedData = "";
        var audioCache = null;

        var channels = options.channels || 2;
        var rate = options.rate || 44100;
        var bits = options.bits || 16;

        var subChunk2Size = function() {
            return this.data.length * (this.bits >> 3);
        };

        var dword = function(value) {
            return [value&0xFF, (value>>8)&0xFF, (value>>16)&0xFF, (value>>24)&0xFF];
        };

        var word = function(value) {
            return [value&0xFF, (value>>8)&0xFF];
        };

        var wordData = function(data) {
            var result = [];
            var offset = 0;
            var len = data.length;
            for (var i = 0; i < len; i++) {
                result[offset++] = data[i] & 0xFF;
                result[offset++] = (data[i]>>8) & 0xFF;
            }
            return result;
        };

        var dataString = function(data) {
            var s = "";
            for (var i = 0; i < data.length; i++) {
                s += String.fromCharCode(data[i]&0xFF);
            }
            return s;
        };

        var encodeHeader = function() {
            // initializes with empty sample data
            encodedData = btoa(dataString([].concat(
                // DW "RIFF" = 0x52494646
                [0x52,0x49,0x46,0x46],
                // DW 36+SubChunk2Size = 4+(8+SubChunk1Size)+(8+SubChunk2Size)
                dword(36),
                // DW "WAVE" = 0x57415645
                [0x57,0x41,0x56,0x45],
                // DW "fmt " = 0x666d7420
                [0x66,0x6d,0x74,0x20],
                // DW 16 for uncompressed PCM
                dword(16),
                // W  PCM = 1
                word(1),
                // W  Mono = 1, Stereo = 2...
                word(channels),
                // DW 8000, 44100...
                dword(rate),
                // DW SampleRate*NumChannels*BitsPerSample/8
                dword(((channels * bits) >> 3) * rate),
                // W  NumChannels*BitsPerSample/8
                word((channels * bits) >> 3),
                // W  8 bits = 8, 16 bits = 16
                word(bits),
                // DW "data" = 0x64617461
                [0x64,0x61,0x74,0x61],
                // DW data size = NumSamples*NumChannels*BitsPerSample/8
                dword(0)
            )));
        };

        var encodeData = function(data) {
            var chunk = encodedData.slice(-4),
                currentSize,
                pre,
                len,
                header, postHeader;

            chunk = (chunk.charAt(3) == "=") ? atob(chunk) : "";
            currentSize = ((encodedData.length - 44) * 6) >> 3;
            data = (bits==16) ? wordData(data) : data;
            len = data.length + currentSize + chunk.length;

            header = atob(encodedData.slice(0, 60));
            postHeader = atob(encodedData.slice())
            encodedData =
                btoa(
                    header.slice(0, 4) +                // up to chk1 len
                    dataString(dword(36 + len)) +       // chk1 len
                    header.slice(8, 40) +               // up to chk2 len
                    dataString(dword(len))              // chk2 len
                )
                + (header.length >= 45 ? header[44] : "")
                + (chunk                                // sample data
                  ? encodedData.slice(60, -4)
                  : encodedData.slice(60))
                + btoa(chunk + dataString(data));       // new sample data
            var dat = atob(encodedData);
            for (var i = 0; i < dat.length; i++)
                console.log(dat.charCodeAt(i));
        };

        this.addSampleData = function(data, done) {
            if (!data instanceof Array)
                return done(new Error("data must be Array"));

            setTimeout(function() {
                if (encodedData.length == 0) {
                    encodeHeader();
                }
                encodeData(data);
                if (done) done();
            }, 0);
        };

        this.audio = function() {
            if (!audioCache) {
                if (!encodedData)
                    encodeHeader();
                (audioCache = new Audio(DATA_PREFIX + encodedData)).volume = 1;
            }

            return audioCache;
        };

        this.refreshAudio = function() {
            audioCache = null;
        };

        this.sampleRate = function() {
            return rate;
        };

        this.numChannels = function() {
            return channels;
        };

        this.bitsPerSample = function() {
            return bits;
        };

    };

    Sample.createSample = function(options) {
        return new Sample(options);
    };

    return {
        createSample: Sample.createSample
    };

});

