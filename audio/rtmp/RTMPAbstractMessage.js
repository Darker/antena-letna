const EventEmitter = require("eventemitter2");
/**
 * @event parsed emitted when the message is fully parsed
 */
class RTMPAbstractMessage extends EventEmitter {
    constructor() {
        super();
        this.isDone = false;
    }
    /**
     * Reads data from the stream, emits 'parsed' if all data have been read
     * @param {NodeJS.ReadableStream} stream stream to read from
     */
    readBytes(stream) {
        throw new Error("Pure virtual method call!");
    }

    done() {
        this.emit("parsed", this);
        this.isDone = true;
    }
}

module.exports = RTMPAbstractMessage;