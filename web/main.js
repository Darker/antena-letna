import cheet from "./cheet.js";
import Player from "./class/Player.js";
//import Cookies from "./lib/js.cookie-2.2.0.min.js";

cheet("a d m i n", function () {
    cheet.disable("a d m i n");
});

const PLAYER = new Player(document.querySelector("#player_container"));



const SOCKET = io();
/** @type {string} **/
const SESSION_ID = Cookies.get("delet dis");
console.log("Session ID: ", SESSION_ID);
SOCKET.emit("session", SESSION_ID);