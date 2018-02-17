import AsyncModal from "./AsyncModal.js";

class Prompt extends AsyncModal {
    constructor(inputType = "text") {
        super();
        const field = document.createElement("input");
        field.type = inputType;
        this.field = field;
        this.dialog.appendChild(field);

        this.addButtons(AsyncModal.BUTTON_CANCEL, AsyncModal.BUTTON_OK);

        this.field.addEventListener("keypress", (event) => {
            console.log(event.char, event.charCode, event.key, event.keyCode);
            if (event.keyCode == 13) {
                this.accept();
            }
            else if (event.keyCode == 27) {
                this.reject();
            }
        });
    }
    show() {
        super.show();
        this.field.focus();
    }
    getResult() {
        return this.field.value;
    }
}
export default Prompt;