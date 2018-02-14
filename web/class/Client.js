const EventEmitter = require("eventemitter2");

class Client extends EventEmitter {
    constructor(io) {
        super();
        this.sessionID = Cookies.get("delet dis");
        this.io = io;
    }
    send(name, data) {
        this.io.emit(name, { session: this.sessionID, data:data });
    }
}