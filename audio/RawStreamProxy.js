const { Duplex } = require('stream');

class MyDuplex extends Duplex {
    constructor(source, options) {
        super(options);
    }

    _write(chunk, encoding, callback) {

    }

    _read(size) {

    }
}
