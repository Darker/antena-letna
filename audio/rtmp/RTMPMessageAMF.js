const RTMPHeader = require("./RTMPHeader");
const RTMPMessage = require("./RTMPMessage")
const RTMPStaticData = require("./RTMPStaticData");
class RTMPMessageAMF extends RTMPMessage {
    constructor() {
        super();
        this.data = [];

        this.message_type_id = -1;
    }
    /**
     * 
     * @param {NodeJS.WritableStream} stream
     */
    toBytes(stream) {
        const header = new RTMPHeader();
        header.cs = 4;
        header.fmt = 0;
        header.message_type_id = this.message_type_id;

    }
}
module.exports = RTMPMessageAMF;