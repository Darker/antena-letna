'use strict'
const fs = require("fs");
process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason, "\n", reason.stack);
    // application specific logging, throwing an error, or other logic here
});
const SETTINGS = JSON.parse(fs.readFileSync("settings.json", "utf8").replace(/^\uFEFF/, ''));
if (SETTINGS.password_mode == "file") {
    SETTINGS.authentication = JSON.parse(fs.readFileSync(SETTINGS.password_params.file, "utf8").replace(/^\uFEFF/, ''));
}
else {
    SETTINGS.authentication = process.env[SETTINGS.password_params.env_name];
}
SETTINGS.authentication = JSON.parse(fs.readFileSync("login.json", "utf8").replace(/^\uFEFF/, ''));

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
const MemoryStore = require('memorystore')(session)
app.use(session({
    secret: 'napalm',
    resave: false,
    saveUninitialized: true,
    store: new MemoryStore({
        checkPeriod: 5 * 60 * 60 * 1000
    }),
    cookie: { secure: false, httpOnly: false },
    name: "delet dis"
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
fx.mkdir(HISTORY_DIR_TEST, function (err) {
    if (err) {
        console.error("Cannot open/create directory", HISTORY_DIR_TEST);
        return;
    }
    const historyStreamTest = fs.createWriteStream(path.join(HISTORY_DIR_TEST, "history.mp3"), { encoding: null });
    audioManagerTest.sinks.push(historyStreamTest);
});

const audioManager = new StreamManager(app, "/antena.mp3", new CasterStream("http://antenaletna.caster.fm/"));
fx.mkdir(HISTORY_DIR_PROD, function (err) {
    if (err) {
        console.error("Cannot open/create directory", HISTORY_DIR_PROD);
        return;
    }
    const historyStream = fs.createWriteStream(path.join(HISTORY_DIR_PROD, "history.mp3"), { encoding: null });
    audioManager.sinks.push(historyStream);
});

const localManager = new StreamManager(app, "/local.mp3", localStreamAudio);


io.on('connection', function (socket) {
    console.log('a user connected');
});
const PORT = process.env.PORT || 3000;
localStreamAudio.listen(PORT, function() {
    console.log('listening on *:'+PORT);
})
//server.listen(PORT, function () {
//    console.log('listening on *:'+PORT);
//});
