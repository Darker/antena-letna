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
        /**
         * @type {{[ip_addr:string]:{lastRequest:number,no_requests:number,banned:boolean}}}
         */
        const requestLimiter = {};
        const MAX_RPS = 5;

        this.audioServer = net.createServer((socket) => {
            if (!requestLimiter[socket.remoteAddress]) {
                requestLimiter[socket.remoteAddress] = { lastRequest: new Date().getTime(), no_requests: 1, banned: false };
            }
            else {
                const info = requestLimiter[socket.remoteAddress];
                const now = new Date().getTime();
                const deltaTime = now - info.lastRequest;
                /// remove requests since last request
                const requestsThatDidNotOccur = (deltaTime / 1000) * MAX_RPS;
                info.no_requests -= requestsThatDidNotOccur;
                if (info.no_requests < 0)
                    info.no_requests = 0;
                info.no_requests++;
                if (info.no_requests > MAX_RPS) {
                    //console.log("TOO MANY REQUESTS: " + socket.remoteAddress + " now: " + info.no_requests);
                    socket.end("HTTP/1.1 429 Too Many Requests\r\nRetry- After: 2\r\n\r\n");
                    return;
                }
                else {
                    //console.log("Requests from " + socket.remoteAddress + " now: " + info.no_requests);
                    info.lastRequest = now;
                }
            }

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