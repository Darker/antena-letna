const AudioProxy = require("../AudioProxy");
const PromiseTimeout = require("../promises/PromiseTimeout");
class StreamManager {
    /**
     * 
     * @param {Express} expressApp
     * @param {string} streamName
     * @param {AudioProxy} source
     */
    constructor(expressApp, streamName, source) {
        this.app = expressApp;
        this.name = streamName;
        this.app.get(streamName, this.handleRequest.bind(this));
        this.source = source;
        /** @type {[Request,Response, number][]} **/
        this.activeClients = [];
        /** @type {NodeJS.WritableStream[]} array of passive sinks, all data will be piped there **/
        this.sinks = [];

        this.requestIdIncrement = 0;
        this.retryCount = 0;
        this.connected = false;

        this.source.on("end", () => {
            this.connected = false;
            this.reconnectAll(1000);
        });
        this.source.on("streamReady", (stream) => {
            for (let i = 0, l = this.sinks.length; i < l; ++i) {
                const sink = this.sinks[i];
                stream.pipe(sink, false);
            }
        });
    }
    async reconnectAll(timeout) {
        if (this.connected || this.activeClients.length < 1)
            return;
        if (this.retryCount > 5) {
            for (let i = 0, l = this.activeClients.length; i < l; ++i) {
                const client = this.activeClients[i];
                client[1].end();
            }
            this.activeClients.length = 0;
            this.retryCount = 0;
            this.source.stop();
            return;
        }
        if(typeof timeout=="number" && timeout>0)
            await PromiseTimeout(timeout);
        try {
            this.streamPromise = this.streamPromise || this.source.getStream();
            const stream = await this.streamPromise;
            this.streamPromise = null;
            if (stream.readable) {
                this.connected = true;
                for (let i = 0, l = this.activeClients.length; i < l; ++i) {
                    const client = this.activeClients[i];
                    stream.pipe(client[1], { end: false });
                }
            }
        }
        catch (e) {
            this.streamPromise = null;
            this.retryCount++;
            return await this.reconnectAll(timeout);
        }
    }
    /**
     * 
     * @param {Request} req
     * @param {Response} res
     */
    async handleRequest(req, res) {
        res.set("Accept-Ranges", "none");
        res.set("Cache-Control", "no-cache, no-store, must-revalidate");
        res.set("Pragma", "no-cache");
        res.set("Expires", "0");
        try {
            this.streamPromise = this.streamPromise || this.source.getStream();
            const stream = await this.streamPromise;
            this.streamPromise = null;
            this.connected = true;
            stream.pipe(res, { end: false });


            const id = this.requestIdIncrement++;
            this.activeClients.push([req, res, id]);
            req.on("close", () => {
                const index = this.activeClients.findIndex((clientInfo) => {
                    return clientInfo[2] == id;
                });
                if (index >= 0) {
                    this.activeClients.splice(index, 1);
                }
                if (this.activeClients.length < 1) {
                    this.source.stop();
                }
            });
        }
        catch (e) {
            this.streamPromise = null;
            res.set("Content-Length", "0");
            res.set("X-Debug-Error", e.message);
            res.status(503);
            res.end();
        }
    }

    //async tryPipe(res) {
    //    try {
    //        const stream = await this.source.getStream();
    //        this.connected = true;
    //        stream.pipe(res);
    //        const id = this.requestIdIncrement++;
    //        this.activeClients.push([req, res, id]);
    //        req.on("close", () => {
    //            const index = this.activeClients.findIndex((clientInfo) => {
    //                return clientInfo[2] == id;
    //            });
    //            if (index >= 0) {
    //                this.activeClients.splice(index, 1);
    //            }
    //        });
    //    }
    //    catch (e) {
    //        res.set("Accept-Ranges", "none");
    //        res.set("Content-Length", "0");
    //        res.set("X-Debug-Error", e.message);
    //        res.status(503);
    //        res.end();
    //    }
    //}

}
module.exports = StreamManager;