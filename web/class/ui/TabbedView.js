
class TabbedView {
    constructor() {
        /** @type {TabbedViewTab[]} **/
        this.tabs = [];
        this.container = document.createElement("div");
        this.container.className = "TabbedView";
        this.tab_container = document.createElement("div");
        this.tab_container.className = "tabs";
        this.content_container = document.createElement("div");
        this.content_container.className = "contents";

        this.container.appendChild(this.tab_container);
        this.container.appendChild(this.content_container);
    }
    /**
     * adds existing tab instance to tabs
     * @param {TabbedViewTab} tab
     */
    addClassTab(tab) {
        if (this.tabs.indexOf(tab)==-1) {
            this.tabs.push(tab);
            this.content_container.appendChild(tab.content);
            this.tab_container.appendChild(tab.tab);

            tab.tab.addEventListener("click", () => {
                this.selectTab(tab);
            });

            if (this.selectedTab == null) {
                this.selectTab(tab);
            }
        }
    }
    /**
     * 
     * @param {string} text
     * @param {HTMLElement} content
     */
    addTextTab(text, content) {
        const tab = new TabbedViewTab(text, content);
        this.addClassTab(tab);
    }
    /**
     * @param {number|TabbedViewTab} tab to be selected
     */
    selectTab(tab) {
        if (typeof tab == "number")
            tab = this.tabs[tab];
        tab.active = true;
        if (this.selectedTab != null) {
            this.selectedTab.active = false;
        }
        this.selectedTab = tab;
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
        this.tab.className = "tab";
        this.content = tabContent;
        this.content.style.display = "none";
        this.content.classList.add("tab_content");

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
TabbedView.Tab = TabbedViewTab;
export default TabbedView;