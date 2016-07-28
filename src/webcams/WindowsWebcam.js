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

var Webcam = require( __dirname + "/../Webcam.js" );

var Utils = require( __dirname + "/../utils/Utils.js" );

var Path = require( "path" );


//Main class

function WindowsWebcam( options ) {

    var scope = this;

    scope.opts = Utils.setDefaults( options, WindowsWebcam.Defaults );


    //Construct

    Webcam.call( scope, scope.opts );

}

WindowsWebcam.prototype = Object.create( Webcam.prototype );

WindowsWebcam.prototype.constructor = WindowsWebcam;

WindowsWebcam.prototype.bin = Path.resolve(
    __dirname, "..", "bindings",
    "CommandCam", "Commandcam.exe"
);


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
        ? "/devnum" + scope.opts.device
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

    EXEC( sh, function( err, out, out2 ) {

        console.log( out, out2 );

        callback && callback( [] );

    });

};

//Defaults

WindowsWebcam.Defaults = {

    output: "bmp"

};


//Export

module.exports = WindowsWebcam;
