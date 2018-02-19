import Client from "./Client.js"
import LocalAdmin from "./LocalAdmin.js";
import Prompt from "./dialogs/Prompt.js"
import RpcDialog from "./dialogs/RpcDialog.js"
import Alert from "./dialogs/Alert.js";

class LocalClient extends Client {
    constructor(io) {
        super(io);
        this.registerRemoteRPC("adminLogin");
        io.on("makeAdmin", this.makeAdmin.bind(this));

        io.on("clients.listeners", (count) => {
            console.log("Listeners: ",count)
            const counter = document.querySelector("#listeners");
            counter.firstChild.data = count + "";
        });
        io.on("clients.online", (count) => {
            const counter = document.querySelector("#online");
            counter.firstChild.data = count + "";
        });
        /** @type {LocalAdmin} **/
        this.admin = null;
    }

    async makeAdminLoginDialog() {
        const prompt = new Prompt("password");
        if (await prompt.exec()) {
            //console.log("Entered password: ", prompt.getResult());
            const loadingDialog = new RpcDialog("Loging in...");
            loadingDialog.exec();
            try {
                const loginResult = await this.adminLogin(prompt.getResult());
                loadingDialog.accept();
                if (loginResult) {
                    this.makeAdmin();
                    return true;
                }
                else {
                    await (new Alert("Invalid password!")).exec();
                    //
                }
            }
            catch (e) {
                console.error("Cannot log in.",e);
                loadingDialog.accept();
            }
        }
        else {
            console.log("Dialog closed.");
        }
        return false;
    }
    /**
     * This is RPC, it's overriden by RPC registration
     * @param {string} password
     * @returns {boolean} true if login was successful
     */
    async adminLogin(password) { }

    initLocalAdmin() {
        this.admin = new LocalAdmin(this);
        this.emit("makeAdmin");
    }
    makeAdmin() {
        if (!this.admin) {
            this.initLocalAdmin();
        }
    }
}
export default LocalClient;