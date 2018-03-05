import LogEntry from "./LogEntry.js";
import TabbedView from "./ui/TabbedView.js";
class LocalAdmin {
    /**
     * 
     * @param {LocalClient} client that has become admin
     */
    constructor(client) {
        this.client = client;

        this.tabbedView = new TabbedView();
        this.div = this.tabbedView.container;
        this.div.classList.add("adminPanel");
        document.body.appendChild(this.div);

        this.errorLog = document.createElement("div");
        this.errorLog.className = "errlog";

        this.tabbedView.addTextTab("Errors", this.errorLog);

        this.streamManager = document.createElement("div");
        this.streamSelection = document.createElement("select");
        this.streamSelection.addEventListener("change", () => {
            if (window.PLAYER) {
                window.PLAYER.switchTrack(this.streamSelection.options[this.streamSelection.selectedIndex].value);
            }
        });
        
        this.streamManager.appendChild(labeledFormField("Stream:", this.streamSelection));

        this.tabbedView.addTextTab("Options", this.streamManager);


        this.loggedErrors = [];

        this.client.io.on("errlog", this.logError.bind(this));

        document.title = document.title.replace(/( \[admin\]|$)/i, " [admin]");

        this.client.registerRemoteRPC("getStreamList");

        this.prepareStreamSelection();
    }
    /**
     * @returns {Promise<string[]>}
     */
    async getStreamList() {
        return await this.client.getStreamList();
    }
    
    async prepareStreamSelection() {
        // loading option
        const loading = document.createElement("option");
        loading.appendChild(document.createTextNode("Loading..."));
        loading.style.textAlign = "center";
        loading.disabled = true;
        this.streamSelection.appendChild(loading);
        const streams = await this.getStreamList();
        this.streamSelection.removeChild(loading);
        const currentAudio = window.PLAYER.audioPath;

        for (let i = 0, l = streams.length; i < l; ++i) {
            const item = streams[i];
            const opt = document.createElement("option");
            opt.appendChild(document.createTextNode(item));
            opt.value = item;
            this.streamSelection.appendChild(opt);
            if (currentAudio == item) {
                this.streamSelection.selectedIndex = i;
            }
        }
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
/**
 * 
 * @param {string} labelText
 * @param {HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement} field
 * @returns {HTMLDivElement}
 */
function labeledFormField(labelText, field) {
    const label = document.createElement("label");
    label.appendChild(document.createTextNode(labelText));
    if (field.getAttribute("id")) {
        label.setAttribute("for", field.getAttribute("id"));
    }
    const div = document.createElement("div");
    div.appendChild(label);
    div.appendChild(field);
    return div;
}

export default LocalAdmin;