'use strict'
const fs = require("fs");
process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason, "\n", reason.stack);
    // application specific logging, throwing an error, or other logic here
});
const SETTINGS = JSON.parse(fs.readFileSync("settings.json", "utf8").replace(/^\uFEFF/, ''));
if (SETTINGS.password_mode == "file") {
    console.log("Loading password from " + SETTINGS.password_params.file);
    SETTINGS.authentication = JSON.parse(fs.readFileSync(SETTINGS.password_params.file, "utf8").replace(/^\uFEFF/, ''));
}
else {
    console.log("Loading password from process.env[\"" + SETTINGS.password_params.env_name+"\"]");
    SETTINGS.authentication = { password: process.env[SETTINGS.password_params.env_name] };
}
SETTINGS.authentication = JSON.parse(fs.readFileSync("login.json", "utf8").replace(/^\uFEFF/, ''));
/// Convert Client.js
{
    const ClientJS = fs.readFileSync(require.resolve("./web/class/Client.js")).toString();
    fs.writeFileSync("./auth/Client.js","// NOTE: this file is auto-generated from ./web/class/Client.js\n"+
        ClientJS
            .replace(/([\"\'])[^\"\']+\/event\-emitter\.js/ig, "$1eventemitter2")
            .replace(/import +([a-z0-9_]+) +from \"([^\"]+)\"/ig, "const $1 = require(\"$2\")")
            .replace(/export default ([a-z0-9_]+)/ig, "module.exports = $1")
    );
}

const express = require('express');
var app = express();
var createServer = require('http').createServer;

const server = createServer(function (req, res) {
    return app(req, res);
});

const LocalStream = require("./audio/LocalStream");
const localStreamAudio = new LocalStream(server);
localStreamAudio.password = SETTINGS.authentication.password;
//var errcnt = 0;
//server.on('clientError',
//    /**
//     * @param {Error} err
//     * @param {NodeJS.Socket} socket
//    */
//    (err, socket) => {
//    console.log("Client error: ", err.message);
//    socket.on("data", (data) => {
//        errcnt++;
//        console.log("ERROR DATA:" + data);
//        if (errcnt > 10)
//            process.exit(1);
//    });
//    //socket.end();
//});
//server.on('upgrade',
//    /**
//     * @param {Request} request
//     * @param {NodeJS.Socket} socket
//     * @param {Buffer} head
//    */
//  (request, socket, head) => {
//    console.log("Client upgrade: ", head.toString());
//    //socket.on("data", (data) => {
//    //    errcnt++;
//    //    console.log("ERROR DATA:" + data);
//    //    if (errcnt > 10)
//    //        process.exit(1);
//    //});
//    //socket.end();
//});

//server.listen(1337, '127.0.0.1');

var io = require('socket.io')(server);




const session = require('express-session');
const MemoryStore = require('memorystore')(session);
const sessionStore = new MemoryStore({
    checkPeriod: 5 * 60 * 60 * 1000
});
const SESSION_SECRET = "napalm";
const sessionMiddleware = session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
    cookie: { secure: false, httpOnly: false },
    name: "delet dis"
});
app.use(sessionMiddleware);

io.use(require("express-socket.io-session")(sessionMiddleware, {
    autoSave: true
})); 


const path = require("path");
const StreamManager = require("./audio/StreamManager");
const CasterStream = require("./audio/CasterStream")

//app.get("/es6enable", function (req, res) {
//    req.session.es6 = true;
//    res.set("Location", "/index.html");
//    res.end();
//});

//app.use(function (err, req, res, next) {
//    if (req.path == "" || req.path == "/" || req.path == "/index.html") {
//        if (req.session.es6) {
//            fs.readFile(path.join(__dirname, "web/index.html"), function (error, result) {
//                if (error)
//                    next();
//                else {
//                    res.end(result.toString("utf8").replace(
//                        /<script id="main" type="([^"]+)" src="([^"]+)"><\/script>/i,
//                        '<script type="module" src="main.js" async> </script>'
//                    ));
//                }
//            });
//        }
//    }

//    next();
//});

//try {
//    const morgan = require('morgan')
//    app.use(morgan(function (tokens, req, res) {
//        return [
//            tokens.method(req, res),
//            tokens.url(req, res),
//            tokens.status(req, res),
//            tokens.res(req, res, 'content-length'), '-',
//            tokens['response-time'](req, res), 'ms'
//        ].join(' ')
//    }))
//}
//catch (e) {
//    console.log("No morgan package, no logging!");
//}



app.use(express.static(path.resolve(__dirname, "web")));

const HISTORY_DIR = path.join(__dirname,"./web/history/");
const HISTORY_DIR_TEST = path.join(HISTORY_DIR, "test");
const HISTORY_DIR_PROD = path.join(HISTORY_DIR, "prod");

const audioManagerTest = new StreamManager(app, "/antena_test.mp3", new CasterStream("http://mxxiv.caster.fm/"));
var fx = require('mkdir-recursive');
const audioManager = new StreamManager(app, "/antena.mp3", new CasterStream("http://antenaletna.caster.fm/"));
const localManager = new StreamManager(app, "/local.mp3", localStreamAudio);


const RemoteClient = require("./auth/RemoteClient");
/** @type {RemoteClient[]} **/
const CLIENTS = [];


audioManagerTest.on("clients.count", function (count) {
    CLIENTS.forEach((client) => {
        client.io.emit("clients.listeners", count);
    });
});

app.post("/error", function (req, res) {
    var bodyStr = '';
    req.on("data", function (chunk) {
        bodyStr += chunk.toString();
    });
    req.on("end", function () {
        res.end("<html></html>");
        CLIENTS.forEach((client) => {
            if (client.admin) {
                client.admin.logClientError(bodyStr);
            }
        });
    });    
});

io.on('connection', function (socket) {
    console.log('a user connected', socket.handshake.session.logins);
    const client = new RemoteClient(socket);
    client.all = CLIENTS;
    socket.emit("clients.listeners", audioManagerTest.activeClients.length);
    CLIENTS.push(client);
    io.emit("clients.online", CLIENTS.length);
    client.on("destroyMe", function () {
        const index = CLIENTS.indexOf(client);
        if (index >= 0) {
            CLIENTS.splice(index, 1);
            console.log("Client removed, remaining clients: ", CLIENTS.length);
        }
        io.emit("clients.online", CLIENTS.length);
    });

    client.serverConfig = SETTINGS;
    if (socket.handshake.session.logins) {
        socket.handshake.session.logins++;
    }
    else 
        socket.handshake.session.logins = 1;
    socket.handshake.session.save();
});
const PORT = process.env.PORT || 3000;
localStreamAudio.listen(PORT, function () {
    console.log('listening on *:' + PORT);
});