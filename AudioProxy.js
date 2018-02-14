const EventEmitter = require("eventemitter2");
/**
 * @emits AudioProxy#end
 * @emits AudioProxy#streamReady
 */
class AudioProxy extends EventEmitter {
    constructor() {
        super();
        /** @type {NodeJS.ReadableStream} **/
        this.stream = null;
    }
    /**
     * @private
     * @returns {Promise<NodeJS.ReadableStream>}
     */
    async getStreamPrivate() {
        throw new Error("Pure virtual method call!");
    }
    /**
     * @description Returns the stream for this audio output, or throws an error
     * @returns {Promise<NodeJS.ReadableStream>}
     */
    async getStream() {
        if (!this.stream) {
            // indicate whether this is the first request on stream
            // if it is, it's gonna emit the event after stream loads
            var isFirst = false;
            if (!this.streamPromise) {
                this.streamPromise = this.getStreamPrivate();
                isFirst = true;
            }
            var error = null;
            try {
                this.stream = await this.streamPromise;
                if (isFirst) {
                    this.emit("streamReady", this.stream);
                }
            }
            catch (e) {
                error = e;
            }
            if(this.streamPromise)
                this.streamPromise = null;
            if (error) {
                throw error;
            }
        }
        return this.stream;
    }
    stop() {
        if (this.stream) {
            this.stream.destroy();
            this.stream = null;
        }
    }
    /**
     * @description Pipes the stream of this audio to the given writable stream
     * @param {NodeJS.WritableStream} out
     */
    async pipe(out) {
        const stream = await this.getStream();
        stream.pipe(out);
    }
}
/**
 * End event
 *
 * @event AudioProxy#end
 * @type {object}
 * @property {boolean} definitive
 */

module.exports = AudioProxy;