import LogEntry from "./LogEntry.js";
class LocalAdmin {
    /**
     * 
     * @param {LocalClient} client that has become admin
     */
    constructor(client) {
        this.client = client;
        this.div = document.createElement("div");
        this.div.className = "adminPanel";
        document.body.appendChild(this.div);

        this.errorLog = document.createElement("div");
        this.errorLog.className = "errlog";
        this.div.appendChild(this.errorLog);
        
        this.loggedErrors = [];

        this.client.io.on("errlog", this.logError.bind(this));

        document.title = document.title.replace(/( \[admin\]|$)/i, " [admin]");

        this.client.registerRemoteRpc("getStreamList");
    }
    /**
     * @returns {Promise<string[]>}
     */
    async getStreamList() {
        return await this.client.getStreamList();
    }
    logError(error) {
        try {
            const data = JSON.parse(error);
            for (let i = 0, l = data.length; i < l; ++i) {
                const err = data[i];
                const entry = new LogEntry(err);
                this.errorLog.insertBefore(entry.makeDiv(), this.errorLog.firstChild);
            }
        }
        catch (e) {
            throw e;
        }
    }


}

export default LocalAdmin;