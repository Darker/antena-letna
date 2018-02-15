const AudioProxy = require("../AudioProxy");
const url = require('url');
const fs = require("fs");
const net = require('net');
const headerParser = require("parse-headers");
const authParser = require('basic-auth');

const ProxyStream = require('stream').Transform;

const SocketHeaderReader = require("./SocketHeaderReader");
///admin/metadata?pass=changemenow&mode=updinfo&mount=/stream.mp3&song= 404 153 - 2.402 ms
const ok_xml = `<?xml version="1.0"?>
<iceresponse>
  <message>Metadata update successful</message>
  <return>1</return>
</iceresponse>
`;

const ok_response = "HTTP/1.0 200 OK\r\nContent-Type: text/xml\r\nContent-Length: 120\r\n\r\n";
class LocalStream extends AudioProxy {
    /**
     * 
     * @param {http} server
     */
    constructor(server) {
        super();
        this.hasStream = false;
        this.password = null;
        /** @type {NodeJS.Socket} **/
        this.streamSocket = null;
        this.proxy = new ProxyStream({
            transform: function (data, encoding, callback) {
                //console.log("ICE: data!");
                callback(null, data);
            }
        });
        this.audioServer = net.createServer((socket)=>{
            const headerReader = new SocketHeaderReader(socket);
            headerReader.once("headers", (response) => {
                if (response.headers.indexOf("ice-name:") == -1) {
                    //console.log("This is a normal HTTP request, passing it to server!");
                    server.emit("connection", response.socket);
                    response.socket.unshift(new Buffer(response.headers));
                    if (response.remainingData)
                        socket.unshift(response.remainingData);
                }
                else {
                    if (this.hasStream && this.streamSocket) {
                        if (this.streamSocket.readableLength) {
                            console.log("Another conenction ignored - already connected to " + this.streamSocket.remoteAddress + " " + this.streamSocket.readableLength);
                            this.destroySocket("HTTP/1.0 403 Client already connected\r\n\r\n", response.socket);
                            return;
                        }
                        else {
                            this.destroyStreamSocket("HTTP/1.0 408 Timeout by other user\r\n\r\n");
                        }
                    }
                    try {
                        const headersHead = response.headers.substr(0, response.headers.indexOf("\n"));
                        const headersRest = response.headers.substr(response.headers.indexOf("\n") + 1);
                        /** @type {{name:string, pass:string}} **/
                        const auth = authParser.parse(headerParser(headersRest).authorization);
                        if (auth.pass != this.password) {
                            console.log("ICE: Invalid password " + auth.pass + " from " + socket.remoteAddress);
                            this.destroySocket("HTTP/1.0 403 Invalid password\r\n\r\n", response.socket);
                            return;
                        }
                        else {
                            console.log("ICE: Valid login for " + auth.name);
                        }
                        //if (socket.destroyed || !socket.writable || !socket.readable) {
                        //    console.error("Socket not valid!");
                        //    return;
                        //}
                        this.streamSocket = response.socket;
                        response.socket.pipe(this.proxy, { end: false });
                        this.hasStream = true;

                        //var lastBytesRead = 0;
                        //const checkInterval = setInterval(() => {
                        //    const read = socket.bytesRead;
                        //    console.log("SOCKET READ: ",read, " == ",socket.bytesRead)
                        //    if (socket.bytesRead == lastBytesRead) {
                        //        console.error("ICE CAST: Source timed out!")
                        //        //this.destroyStreamSocket("HTTP/1.0 408 Timeout\r\n\r\n");
                        //        //clearInterval(checkInterval);
                        //    }
                        //    else {
                        //        lastBytesRead = socket.bytesRead;
                        //    }
                        //}, 500);
                        //response.socket.on("data", (data) => {
                        //    response.socket.unshift(data);
                        //    if (this.killerTimeout) {
                        //        console.log("Clearing data timeout.")
                        //        clearTimeout(this.killerTimeout);
                        //        this.killerTimeout = null;
                        //    }
                        //    console.log("Setting data timeout.")
                        //    this.killerTimeout = setTimeout(() => {
                        //        console.log("Killer timeout triggered!");
                        //    }, 10000);
                        //});

                        response.socket.on("close", () => {
                            console.log("ICE CAST: CLOSE");
                            if (this.hasStream) {
                                this.hasStream = false;
                                this.streamSocket.unpipe(this.proxy);
                                this.streamSocket = null;
                            }
                        });
                        response.socket.on("error", (e) => {
                            console.log("ICE CAST: ERROR" + e.message);
                            response.socket.end();
                        });
                        response.socket.on("end", () => {
                            console.log("ICE CAST: END");
                            response.socket.end();
                        });
                        if (response.remainingData)
                            response.socket.unshift(response.remainingData);
                    } catch (e) {
                        console.error("Cannot interpret Ice data: ", e.message);
                        response.socket.end();
                    }
                }
            });
            //console.log("New connection!");
            //socket.a_headers = "";
            //socket.a_headersEnd = false;
            //var ondata, onclose, onerror;
            //socket.on("data", ondata=(data) => {
            //    if (!socket.a_headersEnd) {
            //        //var tmp = "";
            //        for (let i = 0, l = data.byteLength; i < l; ++i) {
            //            const item = data[i];
            //            if (item == CR_NUMBER)
            //                continue;
            //            const character = String.fromCharCode(item);
            //            if (character == "\n" && socket.a_lastCharacter == "\n") {
            //                socket.headersEnd = true;
            //            }
            //            socket.a_lastCharacter = character;
            //            socket.a_headers += character;
            //            if (socket.headersEnd) {
            //                const headersHead = socket.a_headers.substr(0, socket.a_headers.indexOf("\n"));
            //                const headersRest = socket.a_headers.substr(socket.a_headers.indexOf("\n") + 1);
            //                if (headersRest.indexOf("ice-name") == -1) {
            //                    console.log("This is a normal HTTP request, passing it to server!");
            //                    socket.removeListener("data", ondata);
            //                    socket.removeListener("error", onerror);
            //                    socket.removeListener("close", onclose);
            //                    server.emit("connection", socket);
            //                    socket.unshift(new Buffer(socket.a_headers));
            //                    //setTimeout(() => {

            //                    //});
            //                    //socket// new Buffer(socket.a_headers));
            //                }
            //                else {
            //                    console.log("ICE CAST HEADERS: \n", socket.a_headers.replace(/\n/g, "\\n\n").replace(/\r/g, "\\r"));
            //                    console.log("Split headers: ", headersHead, headersRest);
            //                }
            //                //socket.write(ok_response + ok_xml);
            //                break;
            //            }
            //            else if (socket.a_headers.length > 1000) {
            //                console.log("HTTP header too large!");
            //                console.log(socket.a_headers.replace(/\n/g, "\\n\n").replace(/\r/g, "\\r"));
            //                socket.write("HTTP/1.0 413 Entity Too Large\r\n\r\n");
            //                socket.end();
            //                socket.removeListener("data", ondata);
            //                socket.on("error", (e) => { });
            //                return;
            //            }
            //        }
            //    }
            //    if (socket.headersEnd) {
            //        if (mp3) {
            //            console.log("Another conenction ignored!");
            //            socket.write("HTTP/1.0 403 Client already connected\r\n\r\n");
            //            socket.removeListener("data", ondata);
            //            socket.end();
            //            socket.on("error", (e) => { });
            //            return;
            //        }
            //        mp3 = fs.createWriteStream("test.mp3", { encoding: null, flags: "a" });
            //        mp3.write(data);
            //    }
            //});
            //socket.on("close", onclose=() => {
            //    console.log("ICE CAST: END");
            //    if (mp3) {
            //        mp3.close();
            //        mp3 = null;
            //    }

            //});
            //socket.on("error", onerror=(e) => {
            //    console.log("ICE CAST: ERROR" + e.message);
            //    socket.end();
            //});
        });
    }
    destroyStreamSocket(reason) {
        if (this.streamSocket) {
            console.error("DESTROYING STREAM: " + reason);
            this.destroySocket(reason, this.streamSocket);
            this.streamSocket = null;
            this.hasStream = false;
        }
    }
    destroySocket(reason, socket) {
        if (socket) {
            socket.end(reason);
            socket.on("error", (e) => { });
            socket.destroy();
        }
    }
    async getStreamPrivate() {
        return this.proxy;
        //if (this.streamSocket) {
        //    return this.streamSocket;
        //}
        //else {
        //    throw new Error("No radio connected!");
        //}
    }
    listen(port, ip) {
        this.audioServer.listen.apply(this.audioServer, arguments);
    }
}
module.exports = LocalStream;