
import EventEmitter from "../lib/event-emitter.js";
class VolumeEditor extends EventEmitter {
    /**
     * 
     * @param {HTMLDivElement} domNode
     */
    constructor(domNode) {
        super();
        // 0-1
        this.vol = 0;
        this.elm = domNode;
        this.instantFeedback = true;
        /** @type {HTMLDivElement} **/
        this.elmValue = this.elm.querySelector(".value");
        this.elmValue.style.width = "0%";
        this.dragging = false;
        this.elm.addEventListener("mousedown", (e) => {
            this.dragging = true;
            e.preventDefault();
            return false;
        });
        const undrag = () => { this.dragging = false; };
        this.elm.parentNode.addEventListener("mouseup", undrag);
        this.elm.parentNode.addEventListener("mouseleave", undrag);
        this.elm.parentNode.addEventListener("mousemove", this.calculateVolume.bind(this));
    }
    get volume() {
        return this.vol;
    }
    set volume(number) {
        number = Math.min(Math.max(0, number), 1);
        this.vol = number;
        this.elmValue.style.width = (number * 100) + "%";
    }
    /**
     * Calculates required volume from mouse event
     * @private
     * @param {MouseEvent} mouseEvent
     */
    calculateVolume(mouseEvent) {
        if (this.dragging) {
            const rect = this.elm.getBoundingClientRect();
            const width = rect.right - rect.left;
            const fromStart = mouseEvent.clientX - rect.left;
            const volumeDouble = Math.min(Math.max(0, fromStart / width), 1);

            this.emit("volumechange", volumeDouble);
            if(this.instantFeedback)
                this.volume = volumeDouble;
        }
    }
}
export default VolumeEditor;