/**
 * VLC command line proxy
 */
"use strict";


//cvlc v4l2:// :v4l2-vdev="/dev/video0" --sout '#transcode{vcodec=x264{keyint=60,idrint=2},vcodec=h264,vb=400,width=368,heigh=208,acodec=mp4a,ab=32 ,channels=2,samplerate=22100}:duplicate{dst=std{access=http{mime=video/x-ms-wmv},mux=asf,dst=:8082/stream.wmv}}' --no-sout-audio


var CHILD_PROCESS = require('child_process');

var EXEC = CHILD_PROCESS.exec;

var Webcam = require( "./../Webcam.js" );

var Utils = require( "./../utils/Utils.js" );


//Main class

function VLCWebcam( options ) {

    var scope = this;

    scope.opts = Utils.setDefaults( options, VLCWebcam.Defaults );

    //Construct

    Webcam.call( scope, scope.opts );

    //if(!scope.opts.device) {
        //throw new Error("VLC requires a device");
    //}

    if(!VLCWebcam.VideoOutputCommand[scope.opts.videoOutput]) {
        throw new Error(
            "Video output type invalid " + scope.opts.VideoOutputCommand
        );
    }
}

VLCWebcam.prototype = Object.create( Webcam.prototype );

VLCWebcam.prototype.constructor = VLCWebcam;

VLCWebcam.prototype.bin = "cvlc";


/**
 * @override
 *
 * Generate shell statement
 *
 * @param String location
 *
 */
VLCWebcam.prototype.generateVideoSh = function( location, options ) {

    var scope = this;
    var opts = scope.opts;

    var fps = "--v4l2-fps=" + opts.fps;

    var width = scope.opts.width
        ? "width=" + scope.opts.width + ","
        : "";

    var height = scope.opts.height
        ? "height=" + scope.opts.height + ","
        : "";

    var transcode = "#transcode{"
        + "vcodec=" + scope.opts.vcodec + ","
        + "vb=300,"
        + "fps=" + opts.fps + ","
        + "scale=1,"
        + "acodec=" + scope.opts.acodec + ","
        + "ab=64,"
        + "channels=2"
        //+ "vb=400,"
        //+ width
        //+ height
        //+ "ab=32,channels=2,"
        //+ "samplerate=" + scope.opts.samplerate
        + "}";

    //@TODO pure stream
    //var dup = ":std{access=http,"
        //+ "mime=" + scope.opts.httpMime + "," //+ "mux=" + scope.opts.mux + ","
        //+ "dst=:" + scope.opts.streamPort + "/" + location + "}";

    var audio = scope.opts.useAudio
        ? ""
        : "--no-sout-audio";

    var outputTypeSetup = VLCWebcam.VideoOutputCommand[opts.videoOutput];

    var bin = options.time
        ? "timeout " + options.time / 1000 + " " + scope.bin
        : scope.bin

    //var runTime = "--run-time=300 --stop-time=300";

    var sh = bin + " v4l2://" + (scope.opts.device ? scope.opts.device : "")
        + " " + fps
        + " --sout "
        + "'"
            + transcode
            + outputTypeSetup(opts, location)
        + "' "
        + audio
    ;

    return sh;

};


//Defaults

VLCWebcam.Defaults = {

    vcodec: "h264",
    //vcodec: "x264{keyint=60,idrint=2},vcodec=h264",
    //vcodec: "flv",
    //vcodec: "FLV1",
    //vcodec: "mp4",

    acodec: "mp4a",
    //acodec: "none",

    samplerate: 22100,

    videoOutput: "rtmp",
    //videoOutput: "file",

    streamPort: 8082,
    streamPath: "rtmp://localhost:1935/live/stream",

    width: "",

    heigth: "",

    useAudio: true,

    fps: 60,

    //httpMime: "video/x-ms-wmv",
    httpMime: "video/flv",
    //httpMime: "video/ogg",
    //httpMime: "video/mp4",

    mux: "asf"
    //mux: "ogg"

};


VLCWebcam.VideoOutputCommand = {

    file: function(opts, location) {
        return `:duplicate{dst=standard{access=file,mux=ps,dst=${location}}}`;
    },

    rtmp: function(opts) {
        return `:std{access=rtmp,mux=ffmpeg{mux=flv},dst=${opts.streamPath}}`;
    },

};


//Export

module.exports = VLCWebcam;
