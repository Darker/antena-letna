/** @type {NodeRequire} **/
const requireES6 = require("../es6import");
/** @type {Client} **/
const Client = requireES6(require.resolve("../web/class/Client"));
/** @type {RateLimited} **/
const RateLimited = requireES6(require.resolve("../web/class/RateLimited"));

const RemoteAdmin = require("./RemoteAdmin");



class RemoteClient extends Client {
    /**
     * 
     * @param {SocketIO.Socket} io
     */
    constructor(io) {
        super(io);
        /** @type {RemoteAdmin} **/
        this.admin = null;
        if (this.session.admin) {
            this.makeAdmin();
        }
        this.registerLocalRPC("adminLogin", this.authAdmin);

        this.io.on('disconnect', () => {
            this.emit("destroyMe");
        });

        this.doVoteLimited = new RateLimited(this.doVote.bind(this), 4);

        this.io.on("vote", (voteName) => {
            this.doVoteLimited.do(voteName);
        });
        /** @type {RemoteClient[]} **/
        this.all = null;
        /** @type {StreamManager[]} **/
        this.streams = null;
    }
    get session() {
        return this.io.handshake.session;
    }
    /**
     * Adds stream ref to the client
     * @param {StreamManager[]} streams
     */
    initStreams(streams) {
        this.streams = streams;
    }

    doVote(voteName) {
        this.emit("vote", voteName);
    }

    sendListenerCount() {

    }
    authAdmin(password) {
        console.log("Login attempt!", password, " Real password: ", this.serverConfig.authentication.password);
        if (password == this.serverConfig.authentication.password) {
            this.makeAdmin();
            return true;
        }
        else
            return false;
    }
    makeAdmin() {
        if (!this.admin) {
            this.admin = new RemoteAdmin(this);
            this.io.emit("makeAdmin");
        }
    }
}
module.exports = RemoteClient;