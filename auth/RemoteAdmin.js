


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
        this.client.registerLocalRPC("getStreamList", this.getStreamList.bind(this));
    }
    logClientError(errdata) {
        this.client.io.emit("errlog", errdata);
    }
    getStreamList() {
        const list = [];
        for (let i = 0, l = this.client.streams.length; i < l; ++i) {
            const item = this.client.streams[i].name;
            list.push(item);
        }
        return list;
    }
}
module.exports = RemoteAdmin;