const AudioProxy = require("../AudioProxy");
const ProxyStream = require('stream').Transform;
const ffmpeg = require("fluent-ffmpeg");
const PassThrough = require('stream').PassThrough;
const child_process = require("child_process");
const net = require("net");
class VideoStreamOutput {
    /**
     * 
     * @param {AudioProxy} inputAudio
     */
    constructor(inputAudio, image) {
        this.input = inputAudio;
        this.videoImage = image;

        this.output = new PassThrough();

        this.inputProxy = new PassThrough();

        this.input.onStreamReady(this.resetAudioTo.bind(this));
        this.input.on("end", this.removeAudio.bind(this));
    }
    /**
     * Unpipes old stream and pipes the new one
     * @param {NodeJS.ReadableStream} audioStream
     */
    resetAudioTo(audioStream) {
        this.removeAudio();
        this.lastStream = audioStream;
        if (this.oldStream) {
            this.oldStream.unpipe(this.inputProxy);
        }
        if (this.ffmpeg) {
            this.oldStream = this.lastStream;
            this.lastStream.pipe(this.inputProxy, { end: false });
        }
    }
    startFBStream() {

    }
    ffmpegInit() {
        if (!this.ffmpeg) {
            //this.ffmpeg = ffmpeg()
            //    .addInput(this.videoImage)
            //    .addInput(this.inputProxy)
            //    .inputFormat('mp3')
            //    .output(this.output)
            //    .outputFormat("mp4")
            //    .size('320x240')
            //    .on('error', (err, stdout, stderr) => {
            //        console.log('Cannot process video: ' + err.message);
            //        this.ffmpeg = null;
            //    })
            //    .on('end', () => {
            //        console.log('End of audio... ');
            //        this.ffmpeg = null;
            //        this.output.end();
            //    })
            //    .run();

            this.ffmpeg = child_process.spawn(
                "ffmpeg",
                ("-y -thread_queue_size 16 -loop 1 -i " + "web/img/antena-letna-video.png" +" -f mp3 -i pipe:0 -acodec aac -c:v libx264 -shortest -movflags frag_keyframe+empty_moov -f mp4 -bufsize 32k -").split(" "),
                {
                    env: process.env,
                    cwd: process.cwd()
                }
            );
            this.ffmpeg.on("error", (error) => {
                console.log("FFMPEG ERROR: ", error.message, "\n", error.stack);
            })
            this.ffmpeg.on("close", () => {
                console.log("FFMPEG DONE!");

                this.ffmpeg.stdout.unpipe(this.output);
                this.ffmpeg.stderr.unpipe(process.stderr);
                this.ffmpeg = null;
                this.output.end();
                this.output = new PassThrough();
            });
            //this.ffmpeg.stdout.on("data", () => { console.log("FFMPEGDATA!") });
            this.ffmpeg.stdout.pipe(this.output, { end: false });
            //this.output.pipe(process.stdout, { end: false });
            this.ffmpeg.stderr.pipe(process.stderr, { end: false });
            this.inputProxy.pipe(this.ffmpeg.stdin);

            if (this.lastStream && !this.oldStream) {
                this.oldStream = this.lastStream;
                this.lastStream.pipe(this.inputProxy, { end: false });
            }
        }
    }
    removeAudio() {
        if (this.oldStream)
            this.oldStream.unpipe(this.inputProxy);
        this.oldStream = null;
    }
}
module.exports = VideoStreamOutput;