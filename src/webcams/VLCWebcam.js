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

    if(!scope.opts.device) {
        throw new Error("VLC requires a device");
    }
}

VLCWebcam.prototype = Object.create( Webcam.prototype );

VLCWebcam.prototype.constructor = VLCWebcam;

VLCWebcam.prototype.bin = "vlc";


/**
 * @override
 *
 * Generate shell statement
 *
 * @param String location
 *
 */
VLCWebcam.prototype.generateVideoSh = function( location ) {

    var scope = this;

    var verbose = scope.opts.verbose
        ? "-v"
        : "-q";

    var delay = scope.opts.delay
        ? "-w " + scope.opts.delay
        : "";

    var device = scope.opts.device
        ? "-d '" + scope.opts.device + "'"
        : "";

    var width = scope.opts.width
        ? "width=" + scope.opts.width + ","

    var height = scope.opts.height
        ? "height=" + scope.opts.height + ","

    var transcode = "#transcode{"
        + scope.opts.vcodec + ","
        + "vb=400,"
        + width
        + height
        + "acodec=" + scope.opts.acodec + ","
        + "ab=32,channels=2,"
        + "samplerate=" + scope.opts.samplerate;

    var dup = ":duplicate{dst=std{access=http{"
        + "mime=" scope.opts.httpMime + "},mux=asf,"
        + "dst=:" + scope.opts.port + "/" + location"}}";

    var sh = scope.bin + " v4l2:// "
    + ':v4l2-vdev="' + scope.opts.device + "' "
    + "--sout "
    + transcode
        + delay + " "
        + device + " "
        + verbose + " "
        + location;

    return sh;

};


/**
 * @Override
 *
 * Webcam list
 *
 * @param Function callback
 *
 */
VLCWebcam.prototype.list = function( callback ) {

    var scope = this;

    var sh = scope.bin + " -l";

    var cams = [];

    EXEC( sh, function( err, data, out ) {

        var lines = data.split( "\n" );

        var ll = lines.length;

        for( var i = 0; i < ll; i ++ ) {

            var line = lines[ i ];

            if( line === "Video Devices:" || ! line ) {

                continue;

            }

            //imagesnap update adds extra stuff
            line = line.replace(/.*?\[(.*?)\].*/, "$1");

            cams.push( line );

        }

        callback && callback( cams );

    });

};


//Defaults

VLCWebcam.Defaults = {

    delay: 1,

    vcodec: "vcodec=x264{keyint=60, idrint=2}, vcodec=h264",

    acodec: "mp4a",

    samplerate: 22100,

    port: 8082,

    width: "",

    heigth: "",

    useAudio: false,

    httpMime: "video/x-ms-wmv",

};


//Export

module.exports = VLCWebcam;
