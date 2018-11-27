/**
 * API for imagesnap Mac OSX
 *
 * @requires [ imagesnap ]
 *
 * @param Object options
 *
 */
"use strict";

var CHILD_PROCESS = require('child_process');

var EXEC = CHILD_PROCESS.exec;

var Webcam = require( "./../Webcam.js" );

var Utils = require( "./../utils/Utils.js" );


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

    var device = scope.opts.device
        ? "-d '" + scope.opts.device + "'"
        : "";

    var sh = scope.bin + " "
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
ImageSnapWebcam.prototype.list = function( callback ) {

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

ImageSnapWebcam.Defaults = {

    delay: 1

};


//Export

module.exports = ImageSnapWebcam;
