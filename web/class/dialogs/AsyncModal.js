
/**
 * @typedef {(HTMLButtonElement|function(AsyncModal, string):HTMLButtonElement)} DialogButton
 */

class AsyncModal {
    constructor() {
        this.div = document.createElement("div");
        this.overlay = document.createElement("div");

        this.hide();


        this.div.className = "dialog_frame";
        this.dialog = document.createElement("div");
        this.dialog.className = "dialog";
        this.div.appendChild(this.dialog);
        this.overlay.className = "overlay";
    }
    hide() {
        this.div.style.display = "none";
        this.overlay.style.display = "none";
    }
    show() {
        this.div.style.display = "";
        this.overlay.style.display = "";
        if (this.div.parentNode == null) {
            document.body.appendChild(this.div);
            document.body.appendChild(this.overlay);
        }
    }
    /**
     * resolves when dialog is cancelled or submitted
     * @returns {number} 0 for cancel, 1 for submit
     */
    async exec() {
        if (!this.__endPromise) {
            this.show();
            this.__endPromise = new Promise((resolve, reject) => {
                this.__onend = resolve;
            });
        }
        return await this.__endPromise;
    }
    /// Override this however you want - this shall be called after dialog is submitted
    getResult() {
        return null;
    }

    /**
     * Called in order to submit this dialog. If overriden, superclass method must be called!
     * @private
     */
    accept() {
        if (typeof this.__onend == "function") {
            this.__onend(1);
        }
        this.destroy();
    }
    reject() {
        if (typeof this.__onend=="function") {
            this.__onend(0);
        }
        this.destroy();
    }
    destroy() {
        this.__onend = null;
        this.__endPromise = null;
        this.div.parentNode.removeChild(this.div);
        this.overlay.parentNode.removeChild(this.overlay);
    }
    /**
     * 
     * @param {DialogButton[]|DialogButton...} buttons
     */
    addButtons(buttons) {
        if (!(buttons instanceof Array)) {
            buttons = [];
            buttons.push.apply(buttons, arguments);
        }
        if (!this.buttonBox) {
            this.buttonBox = document.createElement("div");
            this.buttonBox.className = "buttons";
            this.dialog.appendChild(this.buttonBox);
        }

        for (let i = 0, l = buttons.length; i < l; ++i) {
            var button = buttons[i];
            if ((!(button instanceof HTMLButtonElement)) && typeof button == "function") {
                console.log(button.toString(), button(this));
                button = button(this);
            }
            if (!(button instanceof HTMLButtonElement)) {
                console.warn("Invalid button: ", button);
                continue;
            }
            this.buttonBox.appendChild(button);
        }
    }
}

AsyncModal.BUTTON_WITH_TEXT = function (unused, text) {
    const button = document.createElement("button");
    button.appendChild(document.createTextNode(text));
    return button;
}
AsyncModal.BUTTON_OK = function (dialog, text="OK") {
    const okButton = AsyncModal.BUTTON_WITH_TEXT(dialog, text);
    okButton.addEventListener("click", () => { dialog.accept(); });
    return okButton;
}
AsyncModal.BUTTON_CANCEL = function (dialog, text="Cancel") {
    const cancelButton = AsyncModal.BUTTON_WITH_TEXT(dialog, text);
    cancelButton.addEventListener("click", () => { dialog.reject(); });
    return cancelButton;
}
AsyncModal.BUTTON_YES = function (dialog, text="Yes") {
    return AsyncModal.BUTTON_OK(dialog, text);
}
AsyncModal.BUTTON_NO = function (dialog, text = "No") {
    return AsyncModal.BUTTON_CANCEL(dialog, text);
}
export default AsyncModal;