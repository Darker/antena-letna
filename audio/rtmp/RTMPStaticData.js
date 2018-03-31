const C0_HANDSHAKE_DATA = new Buffer(1);
C0_HANDSHAKE_DATA.writeUInt8(3, 0);

const C1_S1_length = 1536;
const C1_HANDSHAKE_DATA = new Buffer(C1_S1_length);
C1_HANDSHAKE_DATA.writeInt32BE(new Date().getTime(), 0, true);
C1_HANDSHAKE_DATA.writeInt32BE(0, 4);
for (let i = 0, l = C1_S1_length - 8; i < l; ++i) {
    C1_HANDSHAKE_DATA.writeUInt8(i % 256, 8 + i);
}
/**
 * 
 * @param {number} H1_read_timestamp
 * @param {number} remote_timestamp
 * @param {Buffer} randomData
 */
function MakeC2Message(H1_read_timestamp, remote_timestamp, randomData) {
    const message = new Buffer(C1_S1_length);
    message.writeInt32BE(remote_timestamp);
    message.writeInt32BE(H1_read_timestamp);
    randomData.copy(message, 8, 0);
    return message;
}

const MESSAGE_TYPE_ID = {
    USER_CONTROL: 4,
    COMMAND_AMF0: 20,
    COMMAND_AMF3: 17,
    DATA_AMF0: 18,
    DATA_AMF3: 15,
    SHARED_OBJECT_AMF0: 19,
    SHARED_OBJECT_AMF3: -1,
    AUDIO_MESSAGE: 8,
    VIDEO_MESSAGE: 9,
    AGGREGATE_MESAGE: 22,

}


module.exports = {
    handhake: {
        H1_length: C1_S1_length,
        C1_data: C1_HANDSHAKE_DATA,
        C0_data: C0_HANDSHAKE_DATA,
        C2_S2: MakeC2Message
    },
    messages: {
        types: MESSAGE_TYPE_ID
    }
}