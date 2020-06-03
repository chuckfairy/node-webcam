/**
 * API for Windows
 *
 * @requires [ CommandCam ]
 *
 * @param Object options
 *
 */
"use strict";

var CHILD_PROCESS = require('child_process');

var EXEC = CHILD_PROCESS.exec;

var Webcam = require( "./../Webcam.js" );

var Utils = require( "./../utils/Utils.js" );

var Path = require( "path" );


//Main class

function WindowsWebcam( options ) {

    var scope = this;

    scope.opts = Utils.setDefaults( options, WindowsWebcam.Defaults );


    //Construct

    Webcam.call( scope, scope.opts );

    //command cam uses miliseconds

    scope.opts.delay = scope.opts.delay * 1000;

}

WindowsWebcam.prototype = Object.create( Webcam.prototype );

WindowsWebcam.prototype.constructor = WindowsWebcam;

WindowsWebcam.prototype.bin = "\"" + Path.resolve(
    __dirname, "..", "bindings",
    "CommandCam", "CommandCam.exe"
) + "\"";


/**
 * @override
 *
 * Generate shell statement
 *
 * @param String location
 *
 */
WindowsWebcam.prototype.generateSh = function( location ) {

    var scope = this;

    var device = scope.opts.device
        ? "/devnum " + scope.opts.device
        : "";

    var delay = scope.opts.delay
        ? "/delay " + scope.opts.delay
        : "";

    var sh = scope.bin + " "
        + delay + " "
        + device + " "
        + "/filename " + location;

    return sh;

};


/**
 * List webcam devices using bin
 *
 * @param Function callback
 *
 */

WindowsWebcam.prototype.list = function( callback ) {

    var scope = this;

    var sh = scope.bin + " /devlist";

    var cams = [];

    EXEC( sh, function( err, data, out ) {

        if( err ) { throw err; }

        var lines = out.split( "\n" );

        var ll = lines.length;

        var camNum = 1;

        for( var i = 0; i < ll; i ++ ) {

            var line = lines[ i ];
            line = line.replace( "\r", "" );

            if(
                !! line
                && line !== "Available capture devices:"
                && "No video devices found"
            ) {

                cams.push( camNum.toString() );
                camNum++;

            }

        }

        callback && callback( cams );

    });

};

//Defaults

WindowsWebcam.Defaults = {

    output: "bmp"

};


//Export

module.exports = WindowsWebcam;
