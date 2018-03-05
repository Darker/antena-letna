import EventEmitter from "../../lib/event-emitter.js";

class VoteButtons extends EventEmitter {
    constructor() {
        super();
        /** @type {HTMLDivElement} **/
        this._html = null;
        /** @type {Button[]} **/
        this.buttons = [];
    }
    get html() {
        if (!this._html) {
            this._html = document.createElement("div");
            this._html.className = "vote_buttons";
            for (let i = 0, l = this.buttons.length; i < l; ++i) {
                const item = this.buttons[i];
                this._html.appendChild(item.div);
            }
        }
        return this._html;
    }
    addButtonNamed(imageURL, name) {
        const button = new Button(this, imageURL, name);
        this.buttons.push(button);
        if (this._html) {
            this._html.appendChild(button.div);
        }
    }
    /**
     * 
     * @param {Button} button
     */
    buttonClicked(button) {
        // something?
        button.disabled = true;
        emit("vote", button.name);
    }

}

class Button {
    /**
     * 
     * @param {VoteButtons} parent
     * @param {string} image
     * @param {string} name of the reaction action
     */
    constructor(parent, image, name) {
        this.parent = parent;
        this.name = name;

        this.div = document.createElement("div");
        this.div.className = "button_container";
        this.disabled_overlay = document.createElement("div");
        this.disabled_overlay.className = "disabled_overlay";
        //this.disabled_overlay.style.display = "none";

        this.div.appendChild(this.disabled_overlay);
        this.button = document.createElement("div");
        this.button.className = "button";
        this.button.style.backgroundImage = "url('" + image + "')";

        this.div.addEventListener("click", () => {
            if (!this.disabled) {
                this.parent.buttonClicked(this);
            }
        });

        this.div.appendChild(this.button);
    }
    get disabled() {
        return this.div.classList.contains("disabled");
    }
    set disabled(state) {
        if (state) {
            this.div.classList.add("disabled");
        }
        else {
            this.div.classList.remove("disabled");
        }
    }
}
VoteButtons.Button = Button;
export default VoteButtons;
export { VoteButtons, Button };