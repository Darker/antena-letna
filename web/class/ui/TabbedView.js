
class TabbedView {
    constructor() {
        /** @type {TabbedViewTab[]} **/
        this.tabs = [];
        this.container = document.createElement("div");
        this.tab_container = document.createElement("div");
        this.content_container = document.createElement("div");

        this.container.appendChild(this.tab_container);
        this.container.appendChild(this.content_container);
    }
    /**
     * adds existing tab instance to tabs
     * @param {TabbedViewTab} tab
     */
    addClassTab(tab) {
        if (this.tabs.indexOf(tab)) {

        }
    }
}
class TabbedViewTab {
    /**
     * 
     * @param {string|HTMLElement} tabText
     * @param {HTMLDivElement} tabContent
     */
    constructor(tabText, tabContent) {
        this.tab = document.createElement("div");
        this.content = tabContent;
        this.content.style.display = "none";

        this.tab.appendChild(
            tabText instanceof HTMLElement ?
                tabText :
                document.createTextNode(tabText)
        );
    }
    /** @type {boolean} determines whether this tab is active **/
    get active() {
        return this.tab.classList.contains("active");
    }
    set active(value) {
        if (value) {
            this.tab.classList.add("active");
            this.content.style.display = "";
        }
        else {
            this.tab.classList.remove("active");
            this.content.style.display = "none";
        }
        return !!value;
    }
}