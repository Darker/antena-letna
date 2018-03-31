const RTMPAbstractMessage = require("./RTMPAbstractMessage");
const RTMPStaticData = require("./RTMPStaticData");

class RTMPMessage extends RTMPAbstractMessage {
    constructor() {
        super();

    }
    /**
     * Reads data from the stream, emits 'parsed' if all data have been read
     * @param {NodeJS.ReadableStream} stream stream to read from
     */
    readBytes(stream) {
        throw new Error("Pure virtual method call!");
    }
    /**
     * Encodes and writes the message data to given writable stream
     * @param {NodeJS.WritableStream} stream
     */
    writeBytes(stream) {
        throw new Error("Pure virtual method call!");
    }
}
module.exports = RTMPMessage;