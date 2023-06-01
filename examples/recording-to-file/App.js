/**
 * Recording
 */
"use strict";


const NodeWebcam = require( "./../../" );

//Vlc currently
const Webcam = NodeWebcam.create({
    //device: "/dev/video0",
    videoOutput: "file",
    verbose: true,
    //width: 368,
    //height: 208
}, "vlc");

const RECORDING_TIME = 10 * 1000;

const FILE_LOCATION = __dirname + "/output/test.mp4";

main();

function main() {

    var options = {
        time: RECORDING_TIME,
        location: FILE_LOCATION,
    };

    Webcam.record(options, console.log);

}
