import cheet from "./cheet.js";
import Player from "./class/Player.js";
//import Cookies from "./lib/js.cookie-2.2.0.min.js";
import DocumentReady from "./class/DocumentReady.js";


import LocalClient from "./class/LocalClient.js";

function logError(error) {
    console.warn("Error ", error.message, "\n", error.stack);
    try {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "/error");
        // @TODO add useful info
        xhr.send(JSON.stringify([{
            message: error.message,
            userAgent: navigator.userAgent,
            stack: error.stack,
            fatal: true
        }]));
    }
    catch (exception) {
        console.error("Failed to report error to the server. If you see this message please tell someone.")
    }
}
window.addEventListener("error", function (error) {
    logError(error.error);
});


function onIo(callback) {
    if (typeof io == "function") {
        callback();
    }
    else {
        window.addEventListener("io-ready", callback);
    }
};

onIo(() => {
    const SOCKET = io();
    const CLIENT = new LocalClient(SOCKET);


    async function cheetAdminCallback() {
        cheet.disable("a d m i n");
        await new Promise(function (r) { setTimeout(r, 1); });
        if (!(await CLIENT.makeAdminLoginDialog())) {
            cheet("a d m i n", cheetAdminCallback);
        }
    }
    CLIENT.on("makeAdmin", () => { cheet.disable("a d m i n"); });
    cheet("a d m i n", cheetAdminCallback);
});


(async function () {
    await DocumentReady;
    const PLAYER = new Player(document.querySelector("#player_container"), "antena.mp3");
    window.PLAYER = PLAYER;
})();


