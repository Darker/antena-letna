const RTMPAbstractMessage = require("./RTMPAbstractMessage");
const RTMPStaticData = require("./RTMPStaticData");

class RTMPHandshakeMessage extends RTMPAbstractMessage {
    constructor(step) {
        super();
        //this.buffer = new Buffer(RTMPStaticData.handhake.H1_length);
        this.timestamp = -1;
        this.timestamp2 = -1;
        /** @type {Buffer} **/
        this.randomData = null;

        this.step = step;
    }
    /**
     * Reads data from the stream, emits 'parsed' if all data have been read
     * @param {NodeJS.ReadableStream} stream stream to read from
     */
    readBytes(stream) {
        const data = stream.read(RTMPStaticData.handhake.H1_length);
        if (data instanceof Buffer) {
            this.randomData = data.slice(8);
            this.timestamp = data.readInt32BE(0);
            if (this.step == RTMPHandshakeMessage.STEP.S2) {
                this.timestamp2 = data.readInt32BE(4);
            }
            this.done();
        }
    }
}
RTMPHandshakeMessage.STEP = {
    S1: {},
    S2: {}
}
module.exports = RTMPHandshakeMessage;