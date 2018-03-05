import EventEmitter from "../lib/event-emitter.js";

class RateLimited extends EventEmitter {
    constructor(callback, actionsPerSecond) {
        super();
        this.callback = callback;
        this.APS = actionsPerSecond;
        // Timestamp of last action
        this.lastAction = 0;
        // number of actions taken recently, must not exceed APS
        this.actions = 0;
    }
    get delta() {
        return (this.now - this.lastAction) / 1000;
    }
    get availableActions() {
        const delta = this.delta;
        return Math.max(this.APS - this.actions + this.APS * delta, 0);
    }
    get retryAfter() {
        const delta = this.delta;
        const state = this.APS * delta - this.actions;
        if (state >= 0)
            return 0;
        else {
            return (-1 * state + 1) / this.APS;
        }
    }
    get now() {
        return new Date().getTime();
    }
    awaitNextAction() {
        return new Promise((resolve) => {
            setTimeout(resolve, this.retryAfter);
        });
    }
    do() {
        const delta = this.delta;
        this.actions = Math.max(0, this.actions - this.APS * delta);

        if (this.actions + 1 <= this.APS) {
            this.actions++;
            this.lastAction = this.now;
            this.callback.apply(this, arguments);
            if(this.actions>=this.APS)
                this.emit("exhausted");
        }
        else {
            this.emit("fail");
        }
    }
}