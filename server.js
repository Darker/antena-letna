'use strict'

process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason, "\n", reason.stack);
    // application specific logging, throwing an error, or other logic here
});

const express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const fs = require("fs");


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

app.use(express.static(path.resolve(__dirname, "web")));



const audioManagerTest = new StreamManager(app, "/antena_test.mp3", new CasterStream("http://mxxiv.caster.fm/"));
const historyStreamTest = fs.createWriteStream(path.join(__dirname, "./web/history/test/history.mp3"), { encoding: null });
audioManagerTest.sinks.push(historyStreamTest);

const audioManager = new StreamManager(app, "/antena.mp3", new CasterStream("http://antenaletna.caster.fm/"));

io.on('connection', function (socket) {
    console.log('a user connected');
});

http.listen(3000, function () {
    console.log('listening on *:3000');
});
