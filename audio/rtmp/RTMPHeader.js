
const READ_HEADER_STEP = {
    FMT: {},
    // Reading another byte for extended CS header
    CS: {},
    TIMESTAMP: {},
    BODY_SIZE: {},
    TYPE_ID: {},
    STREAM_ID: {},
    DONE: {}
}

class RTMPHeader {
    constructor() {
        this.initialized = false;
        /** @type {0|1|2} format of the header**/
        this.fmt = -1;
        /** @type {number} Chunk stream ID **/
        this.cs = -1;

        this.timestamp = 0;
        this.message_length = 0;
        this.message_type_id = 0;
        this.msg_stream_id = 0;

        this.read_step = null;
    }
    /**
     * 
     * @param {RTMPHeader} header use any object that has the properties defined in constructor
     */
    init(header) {
        this.fmt = header.fmt;
        this.cs = header.cs;
        this.timestamp = header.timestamp;
        this.message_length = header.message_length;
        this.message_type_id = header.message_type_id;
        this.msg_stream_id = header.msg_stream_id;
        this.read_step = null;
        this.initialized = true;
    }
    toBytes() {
        if (!this.initialized) {
            throw new Error("Cannot convert undefined header to Buffer. Call init() first.");
        }
        const bytes = [];
        const firstByte = 0;
        firstByte = firstByte | this.fmt << 6;
        var useExtendedID = false;
        if (this.cs < 64) {
            firstByte = firstByte | (this.cs & 0b00111111);
        }
        else {
            // Using only 2byte headers
            firstByte = firstByte | (0b00000010);
            useExtendedID = true;
        }
        bytes.push(firstByte);
        if (useExtendedID) {
            const num = this.cs - 64;
            const buffer = new Buffer(2);
            bytes.push(num % 256);
            bytes.push(Math.floor(num / 256));
        }
        const timestampBuf = new Buffer(3);
        bytes.push(timestampBuf);
        if (this.timestamp >= 0xFFFFFF) {
            timestampBuf.writeUIntBE(0xFFFFFF, 3);
            const extendedBuf = new Buffer(4);
            extendedBuf.writeUIntBE(this.timestamp, 4);
            bytes.push(extendedBuf);
        }
        else {
            timestampBuf.writeUIntBE(this.timestamp, 3);
        }

        const messageLenBuf = new Buffer(4);
        messageLenBuf.writeUIntBE(this.message_length, 4);
        bytes.push(messageLenBuf);

        bytes.push(this.message_type_id & 0xFFFF);

        const messageSIDBuf = new Buffer(4);
        messageSIDBuf.writeUIntLE(this.msg_stream_id, 4);
        bytes.push(messageSIDBuf);
    }
    /**
     * Reads the header from some input stream
     * @param {NodeJS.ReadableStream} stream
     * @returns {boolean} true if the header is complete
     */
    readBytes(stream) {
        if (this.read_step == READ_HEADER_STEP.DONE) {
            return true;
        }
        if (this.read_step == null) {
            this.read_step = READ_HEADER_STEP.FMT;
        }
        if (this.read_step == READ_HEADER_STEP.FMT) {
            const data = stream.read(1);
            if (data && data.length>0) {
                const fmt = (data & 0b11000000) >> 6;
                const csid = data & 0b00111111;
                console.log("Received FMT=", fmt, " and CSID=", csid);
                this.fmt = fmt;
                if (csid < 2) {
                    this._id_size = csid + 1;
                    this.read_step = READ_HEADER_STEP.CS;
                }
                else {
                    this.read_step = READ_HEADER_STEP.TIMESTAMP;
                }
            }
        }
        if (this.read_step == READ_HEADER_STEP.CS) {
            const data = stream.read(this._id_size);
            if (data) {
                const csid = data.readUIntBE(0, this._id_size);
                console.log("Extended CSID: ", csid);
                this.read_step = READ_HEADER_STEP.TIMESTAMP;
            }
        }
        if (this.read_step == READ_HEADER_STEP.TIMESTAMP) {
            const data = stream.read(3);
            
            if (data) {
                const timestamp = data.readUIntBE(0,3);
                console.log("Received timestamp: ", timestamp);
                this.timestamp = timestamp;
                this.read_step = READ_HEADER_STEP.BODY_SIZE;
            }
        }
        return this.read_step == READ_HEADER_STEP.DONE;
    }
}
module.exports = RTMPHeader;