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

    quality: [ Number, 100 ],

    output: [ String, "jpeg" ],

    verbose: [ Boolean, true ],

    help: [ Boolean, false ],

    version: [ Boolean, false ],

    location: Path

};


//Shorthand options

var shorthand = {

    w: [ "--width" ],

    h: [ "--height" ],

    d: [ "--delay" ],

    q: [ "--quality" ],

    out: [ "--output" ],

    h: [ "--help", true ],

    v: [ "--version", true ],

    l: [ "--location" ]

};


//Parse options

var parsedOpts = Nopt( opts, shorthand, process.argv, 2 );

console.log( "PARSED OPTIONS ", parsedOpts );


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



    //Location check

    if( ! parsedOpts.location ) {

        console.log( "No file location specified. QUITING" );

        return;

    }


    //Main capture

    console.log( NodeWebcam );

    var Webcam = NodeWebcam.create( parsedOpts );

    Webcam.capture( parsedOpts.location, function() {

        console.log( "Webcam took picture" );

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
