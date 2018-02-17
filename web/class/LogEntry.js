
class LogEntry {
    constructor(logData) {
        this.logData = logData;
    }
    makeDiv() {
        const div = document.createElement("div");
        div.className = "entry";
        const message = document.createElement("div");
        message.appendChild(new Text(this.logData.message));
        message.className = "message";

        const client = document.createElement("div");
        client.appendChild(new Text(this.logData.userAgent));
        client.className = "client";

        const stacktrace = document.createElement("pre");
        stacktrace.appendChild(new Text(this.logData.stack));
        stacktrace.className = "stack";

        div.appendChild(message);
        div.appendChild(client);
        div.appendChild(stacktrace);
        return div;
    }
}

export default LogEntry;