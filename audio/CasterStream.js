const AudioProxy = require("../AudioProxy");
const requestPromise = require("request-promise");
const request = require("request");

const REGEX_MP3_URL = /(https?:\/\/shaincast\.caster\.fm:[0-9]+\/listen\.mp3\?[a-z0-9]+)/i;
class CasterStream extends AudioProxy {
    constructor(casterURL) {
        super();
        this.url = casterURL;
    }
    async getStreamPrivate() {
        // load caster HTML
        const html = await requestPromise.get({
            url: this.url
        });
        const match = REGEX_MP3_URL.exec(html);
        if (match) {
            const mp3URL = match[1];
            /** @type {IncomingMessage} **/
            const stream = await new Promise(function (resolve, reject) {
                const str = request.get(mp3URL)
                    .on("error", function (e) {
                        reject(e);
                    })
                    .on("response", function (response) {
                        resolve(response);
                    }
                );
            });
            stream.on("end", () => {
                this.stream = null;
                this.emit("end");
            });
            return stream;
        }
        throw new Error("Server offline or unavailable.");
    }
}
module.exports = CasterStream;