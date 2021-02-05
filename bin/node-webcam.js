#!/usr/bin/env node

/**
 * Webcam usage CLI
 *
 */
var NodeWebcam = require( "../" );

var Nopt = require( "nopt" );

var Path = require( "path" );


//Config opts

var opts = {

    width: [ Number, 1280 ],

    height: [ Number, 720 ],

    delay: [ Number, 0 ],

    device: [ String, false ],

    quality: [ Number, 100 ],

    output: [ String, "jpeg" ],

    verbose: [ Boolean, true ],

    help: [ Boolean, false ],

    version: [ Boolean, false ],

    greyscale: [ Boolean, false ],

    rotation: [ String, false ],

    topBanner: [ Boolean, false ],

    bottomBanner: [ Boolean, false ],

    skip: [ Number, 0 ],

    list: [ Boolean, false ],

    listControls: [ Boolean, false ],

    location: Path,

};


//Shorthand options

var shorthand = {

    w: [ "--width" ],

    h: [ "--height" ],

    D: [ "--delay" ],

    d: [ "--device" ],

    q: [ "--quality" ],

    out: [ "--output" ],

    h: [ "--help" ],

    v: [ "--version" ],

    g: [ "--greyscale" ],

    r: [ "--rotation" ],

    l: [ "--location" ],

    S: [ "--skip" ]

};


//Parse options

var parsedOpts = Nopt( opts, shorthand, process.argv, 2 );


//Main

main();

function main() {


    //Version text

    if( parsedOpts.version ) {

        return version();

    }


    //Help Text

    if( parsedOpts.help ) {

        return help();

    }


    //Listing cameras helper

    if( parsedOpts.list ) {

        return list();

    }


    if( parsedOpts.listControls ) {

        return listControls(parsedOpts.device);

    }



    //Location check

    if( ! parsedOpts.location ) {

        help();

        console.log( "\n\nNo file location specified. Please use with --l or --location FILE_NAME. QUITING" );

        return;

    }


    //Main capture

    NodeWebcam.capture( parsedOpts.location, parsedOpts, function(err) {

        if (err) {

           console.error(err.stack);

           return;

        }

        console.log( "node-webcam success " + parsedOpts.location );

    });

}


//version display

function version() {

    console.log( "node-webcam revision " + NodeWebcam.REVISION );

}


//Help text

function help() {

    console.log( "Options" );

    console.log( "Main", opts );

    console.log( "Shorthand", shorthand );

}

function list() {

    NodeWebcam.list(function(cams) {
        console.log("Found cameras");
        console.log(cams.join("\n"));
    });

}

function listControls(device) {

    NodeWebcam.listControls(device, function(controls) {
        console.log("Listing Controls");
        console.log(controls);
    });

}
