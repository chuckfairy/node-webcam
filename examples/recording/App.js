/**
 * Recording server app
 *
 *
 */
"use strict";

var httpPort = 9091;
var streamPort = 8081;
var streamPortProxy = 8082;

var HTTP = require( "http" );

var FS = require( "fs" );

var HTML_CONTENT = FS.readFileSync( __dirname + "/www/index.html" ).toString();
HTML_CONTENT = HTML_CONTENT.replace("__PORT__", streamPort);

var NodeWebcam = require( "./../../" );


//Vlc currently
var Webcam = NodeWebcam.create({
    device: "/dev/video0",
    saveShots: false,
    streamPort: streamPort,
    verbose: true,
    width: 368,
    height: 208
}, "vlc");


// Main

init();

function init() {

    setupHTTP();

    setupWebcam();

    console.log( "Visit http://localhost:" + httpPort );

    process.on("exit", onExit);

}

function setupHTTP() {

    var server = HTTP.createServer();

    server.on( "request", function( request, response ) {

        response.write( HTML_CONTENT );

        response.end();

    });

    server.listen( httpPort );

}


//

function setupWebcam() {

    Webcam.record( "stream.flv", function( err, data ) {

        if( err ) {

            throw err;

        }

    });

}

function onExit() {

    Webcam.stopRecording();

}


//Proxy
HTTP.createServer((req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");

    //var streamPath = "http://localhost:" + streamPort + "/stream.flv";

    var _req = HTTP.request(
        {
            hostname: 'localhost',
            port: streamPort,
            path: '/stream.flv',
            headers: req.headers,
            method: req.method
        },
        (_res) => {
            res.writeHead(_res.statusCode, _res.headers)
            _res.pipe(res)
        }
    )
    _req.on('error', (e) => {
        console.error('proxied request failed: '+e.message)
        res.writeHead(500)
        res.end()
    })
    req.pipe(_req)
}).listen(streamPortProxy, () => console.log('listening proxy port ' + streamPortProxy))
