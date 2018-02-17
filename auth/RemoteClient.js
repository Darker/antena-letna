﻿const Client = require("./Client");
const RemoteAdmin = require("./RemoteAdmin")

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
    }
    get session() {
        return this.io.handshake.session;
    }
    authAdmin(password) {
        console.log("Login attempt!", password);
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