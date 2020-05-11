/**
 * API for Gphoto2
 *
 * @requires [ gphoto2 ]
 *
 * @param Object options
 *
 */
"use strict";

var Webcam = require( "./../Webcam.js" );

var Utils = require( "./../utils/Utils.js" );

var Shot = require( "./../Shot.js" );

var Builder = require( "../ShellParamBuilder.js" );


//Main class

function GPhoto2Webcam( options ) {

    var scope = this;

    scope.opts = Utils.setDefaults( options, GPhoto2Webcam.Defaults );

    if (scope.opts.output !== "jpg") {
        console.warn("Only jpg is supported");
        scope.opts.output = "jpg";
    }

    Webcam.call( scope, scope.opts );

}

GPhoto2Webcam.prototype = Object.create( Webcam.prototype );

GPhoto2Webcam.prototype.constructor = GPhoto2Webcam;

GPhoto2Webcam.prototype.bin = "gphoto2";


/**
 * @override
 *
 * Generate shell statement
 *
 * @param String location
 *
 */
GPhoto2Webcam.prototype.generateSh = function( location ) {

    var scope = this;

    var build = new Builder;

    build.addRaw(scope.bin);

    build.add("port", scope.opts.inputLocation + ":");

    build.addRaw("--capture-image-and-download");
    build.addRaw("--stdout");
    build.addRaw("> " + location);

    //build.addRaw(location);

    return build.toString();

};

/**
 * @Override
 *
 * Webcam list within gphoto2
 *
 * @param Function callback
 *
 */
GPhoto2Webcam.prototype.list = function( callback ) {

    var scope = this;

    var sh = scope.bin + " -auto-detect";

    var cams = [];

    EXEC( sh, function( err, data, out ) {

        var lines = data.split( "\n" );

        var ll = lines.length;
        var startingLine = 2; //No need for headers

        for( var i = startingLine; i < ll; i ++ ) {

            var line = lines[ i ];

            //imagesnap update adds extra stuff
            line = line.replace(/.*?\[(.*?)\].*/, "$1");

            cams.push( line );

        }

        callback && callback( cams );

    });

};


/**
 * Data validations based on fs output
 *
 * @inheritdoc
 *
 */

GPhoto2Webcam.prototype.runCaptureValidations = function( data ) {

    if( GPhoto2Webcam.Validations.noWebcam.exec( data ) ) {

        return new Error( "No webcam found" );

    }

    return null;

};


//Defaults

GPhoto2Webcam.Defaults = {

    inputLocation: "usb",

    output: "jpg",

};


//Validations const

GPhoto2Webcam.Validations = {

    noWebcam: /no.*such.*(file|device)/i

};


//Export

module.exports = GPhoto2Webcam;
