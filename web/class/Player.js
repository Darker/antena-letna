
class Player {
    /**
     * 
     * @param {HTMLDivElement} htmlElement
     */
    constructor(htmlElement) {
        this.audio = new Audio();
        this.div = htmlElement;
        this.state = Player.STATE_STOPPED;
        this.controlButton = this.div.querySelector("#control_button");
        this.controlButton.addEventListener("click", () => {
            this.togglePlaying();
        });
        
        this.audio.addEventListener("playing",
            /** @param {Event} event **/
            (event) => {
                this.drawPlayingState(Player.STATE_PLAYING);
            }
        );
        this.audio.addEventListener("waiting",
            /** @param {Event} event **/
            (event) => {
                this.drawPlayingState(Player.STATE_LOADING);
            }
        );
        this.audio.addEventListener("ended",
            /** @param {Event} event **/
            (event) => {
                this.drawPlayingState(Player.STATE_STOPPED);
            }
        );
        this.drawPlayingState(this.state);
    }
    togglePlaying() {
        if (this.state == Player.STATE_LOADING)
            return;
        if (this.state == Player.STATE_PLAYING) {
            this.audio.setAttribute("src", "");
            this.audio.pause();
            this.audio.load();
            this.drawPlayingState(Player.STATE_STOPPED);
        }
        else {
            this.audio.setAttribute("src", "antena_test.mp3");
            this.audio.load();
            this.audio.play();
        }
    }
    /**
     * Draws state as loading/playing/stopped. Actual value can be overriden using force argument
     * @param {PlayerState} force
     */
    drawPlayingState(force) {
        if (typeof force == "undefined") {
            if (this.audio.getAttribute('src') == "" || this.audio.ended) {
                this.state = Player.STATE_STOPPED;
            }
            else {
                return;
            }
        }
        else
            this.state = force;
        this.controlButton.classList.remove("sad", "loading", "happy");
        switch (this.state) {
            case Player.STATE_LOADING: {
                this.controlButton.classList.add("loading");
                break;
            }
            case Player.STATE_PLAYING: {
                this.controlButton.classList.add("happy");
                
                break;
            }
            case Player.STATE_STOPPED: {
                this.controlButton.classList.add("sad");
                break;
            }
            default: {
                throw new Error("Illegal player state.");
            }
        }
    }
}
class PlayerState { };
Player.STATE_PLAYING = new PlayerState();
Player.STATE_STOPPED = new PlayerState();
Player.STATE_LOADING = new PlayerState();


export default Player;