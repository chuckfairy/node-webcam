/**
 * API for imagesnap Mac OSX
 *
 * @requires [ imagesnap ]
 *
 * @param Object options
 *
 */
"use strict";

var Webcam = require( __dirname + "/../Webcam.js" );

var Utils = require( __dirname + "/../utils/Utils.js" );


//Main class

function ImageSnapWebcam( options ) {

    var scope = this;

    scope.opts = Utils.setDefaults( options, ImageSnapWebcam.Defaults );


    //Without a delay imagesnap will not work
    //Test on macbook 2015 13' retina

    if( scope.opts.delay < 1 ) {

        scope.opts.delay = 1;

    }


    //Construct

    Webcam.call( scope, scope.opts );

}

ImageSnapWebcam.prototype = Object.create( Webcam.prototype );

ImageSnapWebcam.prototype.constructor = ImageSnapWebcam;

ImageSnapWebcam.prototype.bin = "imagesnap";


/**
 * @override
 *
 * Generate shell statement
 *
 * @param String location
 *
 */
ImageSnapWebcam.prototype.generateSh = function( location ) {

    var scope = this;

    var verbose = scope.opts.verbose
        ? "-v"
        : "-q";

    var delay = scope.opts.delay
        ? "-w " + scope.opts.delay
        : "";

    var sh = scope.bin + " "
        + delay + " "
        + verbose + " "
        + location;

    return sh;

};


//Defaults

ImageSnapWebcam.Defaults = {

    delay: 1

};



module.exports = ImageSnapWebcam;
