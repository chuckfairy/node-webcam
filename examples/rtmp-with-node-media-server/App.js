/**
 * Node media server rtmp video stream example
 * VLC only right now
 *
 *
 */
"use strict";

const port = 9090;

const HTTP = require( "http" );

const FS = require( "fs" );

const HTML_CONTENT = FS.readFileSync( __dirname + "/www/index.html" );

const NodeMediaServer = require('node-media-server');

const NodeWebcam = require( "./../../" );

const Webcam = NodeWebcam.create({
    videoOutput: "rtmp",
    streamPath: "rtmp://localhost:1935/live/stream",
    verbose: true,
}, "vlc");


main();

function main() {

    let mediaConfig = {
        http: {
            port: 8000,
            allow_origin: '*',
        },
        rtmp: {
            port: 1935,
            chunk_size: 60000,
            gop_cache: true,
            ping: 30,
            ping_timeout: 60
        },
    };

    //Start Server
    let nms = new NodeMediaServer(mediaConfig)
    nms.run();

    //Start camera
    Webcam.record();

    //Html client
    setupHTTP();
}

function setupHTTP() {

    var server = HTTP.createServer();

    server.on( "request", function( request, response ) {

        response.write( HTML_CONTENT );

        response.end();

    });

    server.listen( port );

    console.log("Visit http://localhost:9090 to see stream");
    console.log("Make sure you enable autoplay video and audio");

}
