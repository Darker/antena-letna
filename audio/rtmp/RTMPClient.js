const net = require("net");
const URL = require("url");
/** @type {NodeJS.EventEmitter} **/
const EventEmitter = require("eventemitter2");
const STATE = {
    C0: {},
    C1: {},
    S0: {},
    S1: {},
    S2: {},
    CONNECTED: {}
}
const RTMPStaticData = require("./RTMPStaticData");


const RTMPMessage = require("./RTMPMessage");
const RTMPHandshakeMessage = require("./RTMPHandshakeMessage");

class RTMPClient extends EventEmitter {
    /**
     * 
     * @param {string} connection
     */
    constructor(connection) {
        super();

        this.url = URL.parse(connection);
        this.sock = net.createConnection({ host: this.url.hostname, port: this.url.port });
        this.sock.on("connect", () => {
            this.sock.write(RTMPStaticData.handhake.C0_data);
            this.sock.write(RTMPStaticData.handhake.C1_data);
        });
        this.state = STATE.S0;
        /** @type {RTMPMessage} **/
        this.currentMessage = new RTMPHandshakeMessage(RTMPHandshakeMessage.STEP.S1);

        // If we're buffering next message, this is the offset in buffer we're writing it into
        this.currentBufferOffset = 0;
    }
    /**
     * This is callback called when socket has new data to be read
     * @private
     */
    dataAvailable() {
        if (this.state == STATE.S0) {
            /** @type {Buffer} **/
            const tmpBuffer = this.sock.read(1);
            const connectionVersion = tmpBuffer.readIntBE();
            console.log("S0 Received. Connection version: ", connectionVersion);
            this.emit("S0");
            this.state = STATE.S1;
        }
        if (this.state == STATE.S1) {
            this.currentMessage.readBytes(this.sock);
            if (this.currentMessage.isDone) {
                this.emit("S1");
                this.state = STATE.S2;
                /** @type {RTMPHandshakeMessage} **/
                this.S1 = this.currentMessage;
                this.sock.write(RTMPStaticData.handhake.C2_S2(0, this.S1.timestamp))
                this.currentMessage = new RTMPHandshakeMessage(RTMPHandshakeMessage.STEP.S2);
            }
            //if (!this.S0_buffer) {
            //    this.S0_buffer = new Buffer(C1_S1_length);
            //    this.currentBufferOffset = 0;
            //}
            ///** @type {Buffer} **/
            //var tmpBuffer = null;
            //while (this.currentBufferOffset < this.S0_buffer.length
            //    && ((tmpBuffer = this.sock.read(1)) != null)) {
            //    this.S0_buffer[this.currentBufferOffset++] = tmpBuffer[0];
            //}

            //if (this.currentBufferOffset >= this.S0_buffer.length) {

            //    console.log("S1 Received!");


            //    this.emit("S1");
            //    this.state = STATE.S2;
            //}
        }
        if (this.state = STATE.S2) {
            this.currentMessage.readBytes(this.sock);
            if (this.currentMessage.isDone) {
                this.emit("S1");
                this.state = STATE.CONNECTED;
                /** @type {RTMPHandshakeMessage} **/
                this.S2 = this.currentMessage;
                this.currentMessage = null;
            }
        }
    }
}
module.exports = RTMPClient;