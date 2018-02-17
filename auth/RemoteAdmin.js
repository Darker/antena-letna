
class RemoteAdmin {
    /**
     * 
     * @param {RemoteClient} client
     */
    constructor(client) {
        this.client = client;
        if (!this.client.session.admin) {
            console.log("Assigning session admin=true");
            this.client.session.admin = true;
            this.client.session.save();
        }
    }
    logClientError(errdata) {
        this.client.io.emit("errlog", errdata);
    }
}
module.exports = RemoteAdmin;