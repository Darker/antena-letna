const Writable = require("stream").Writable;

class DataSink {
    _write(chunk, encoding, done) {
        done();
    }
}
module.exports = DataSink;