/**
 * API for fswebcam
 *
 * @requires [ fswebcam ]
 *
 * @param Object options
 *
 */
"use strict";

var Webcam = require( __dirname + "/../Webcam.js" );

var Utils = require( __dirname + "/../utils/Utils.js" );



//Main class

function FSWebcam( options ) {

    var scope = this;

    scope.opts = Utils.setDefaults( options, FSWebcam.Defaults );

    Webcam.call( scope, scope.opts );

}

FSWebcam.prototype = Object.create( Webcam.prototype );

FSWebcam.prototype.constructor = FSWebcam;

FSWebcam.prototype.bin = "fswebcam";


/**
 * @override
 *
 * Generate shell statement
 *
 * @param String location
 *
 */
FSWebcam.prototype.generateSh = function( location ) {

    var scope = this;

    var resolution = " -r "
        + scope.opts.width + "x" + scope.opts.height;

    var output = "--" + scope.opts.output;

    var quality = scope.opts.quality;

    var delay = scope.opts.delay
        ? "-D " + scope.opts.delay
        : "";

    var sh = scope.bin + " "
        + resolution + " "
        + output + " "
        + quality + " "
        + delay + " "
        + location;

    return sh;

};


//Defaults

FSWebcam.Defaults = {};



module.exports = FSWebcam;
