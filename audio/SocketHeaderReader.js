const EventEmitter = require("eventemitter2");

const CR_NUMBER = "\r".charCodeAt(0);
class SocketHeaderReader extends EventEmitter {
    /**
     * 
     * @param {NodeJS.Socket} socket
     */
    constructor(socket) {
        super();
        this.headers = "";
        this.headersEnd = false;
        this.socket = socket;

        socket.on("data", this.ondata = this.ondata.bind(this));
        socket.on("error", this.onerror = this.onerror.bind(this));
        socket.on("end", this.onend = this.onend.bind(this));
    }
    /**
     * 
     * @param {Buffer} data
     */
    ondata(data) {
        if (this.headersEnd) {
            console.error("Data called after headers end!", (new Error()).stack);
            process.exit(1);
        }
        var i = 0;
        var l = data.byteLength;
        for (; i < l; ++i) {
            const item = data[i];
            if (item == CR_NUMBER)
                continue;
            const character = String.fromCharCode(item);
            if (character == "\n" && this.lastCharacter == "\n") {
                this.headersEnd = true;
            }
            this.lastCharacter = character;
            this.headers += character;
            if (this.headersEnd) {

                //const headersHead = this.headers.substr(0, this.headers.indexOf("\n"));
                //const headersRest = this.headers.substr(this.headers.indexOf("\n") + 1);
                //if (headersRest.indexOf("ice-name") == -1) {
                //    console.log("This is a normal HTTP request, passing it to server!");
                //    socket.removeListener("data", ondata);
                //    socket.removeListener("error", onerror);
                //    socket.removeListener("close", onclose);
                //    server.emit("connection", socket);
                //    socket.unshift(new Buffer(this.headers));
                //    //setTimeout(() => {

                //    //});
                //    //socket// new Buffer(this.headers));
                //}
                //else {
                //    console.log("ICE CAST HEADERS: \n", this.headers.replace(/\n/g, "\\n\n").replace(/\r/g, "\\r"));
                //    console.log("Split headers: ", headersHead, headersRest);
                //}
                //socket.write(ok_response + ok_xml);
                break;
            }
            else if (this.headers.length > 8000) {
                console.log("HTTP header too large!");
                console.log(this.headers.replace(/\n/g, "\\n\n").replace(/\r/g, "\\r"));
                this.socket.write("HTTP/1.0 413 Entity Too Large\r\n\r\n");
                this.socket.end();
                this.socket.removeListener("data", ondata);
                this.socket.on("error", (e) => { });
                return;
            }

        }
        
        if (this.headersEnd) {
            this.socket.removeListener("data", this.ondata);
            this.socket.removeListener("error", this.onerror);
            this.socket.removeListener("end", this.onend);

            this.emit("headers", {
                remainingData: i + 1 > l ? data.slice(i + 1) : null,
                socket: this.socket,
                headers: this.headers,
                reader: this
            });
        }
    }
    onerror() {

    }
    onend() {

    }
}
module.exports = SocketHeaderReader;