
/**
 * @typedef {Object} FBUIParams
 * @property {"live_broadcast"} method defines what dialog should appear (eg. create post, create video...)
 * @property {"publish"|"create"} phase which step is happening right now, differes based on method
 * @property {"popup"} display
 * @property {Object} broadcast_data
 */

/**
 * @typedef {Object} FBLiveStreamUrl
 * @property {string} id
 * @property {string} secure_stream_url
 * @property {string[]} stream_secondary_urls
 * @property {string} stream_url
 */

/**
 * @typedef {Object} FBLiveStreamStatus
 * @property {string|number} id
 * @property {"live"} status
 */

/**
 @description Wraps FB stuff into async methods 
***/
class FBAsync {
    constructor(FB) {
        this.FB = FB;
    }
    /**
     * 
     * @param {FBUIParams} paramsObj
     */
    ui(paramsObj) {
        return new Promise((resolve, reject) => {
            FB.ui(paramsObj, function (response) {
                if (!response) {
                    reject(new Error("Dialog canceled!"));
                }
                else {
                    resolve(response);
                }
            });
        });
    }
}
export default FBAsync;