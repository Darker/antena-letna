import AsyncModal from "./AsyncModal.js";


class Alert extends AsyncModal {
    constructor(message) {
        super();
        this.dialog.appendChild(document.createTextNode(message));
        this.addButtons(AsyncModal.BUTTON_OK);
    }
}
export default Alert;
