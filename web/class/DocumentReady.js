export default new Promise(function(resolve, reject) {
    if (document.readyState != "loading") {
        resolve();
    }
    else {
        document.addEventListener("DOMContentLoaded", resolve);
    }
});