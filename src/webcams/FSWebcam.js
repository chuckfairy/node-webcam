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

    var device = scope.opts.device
        ? "-d " + scope.opts.device
        : "";

    var grey = scope.opts.greyscale
        ? "--greyscale"
        : "";

    var rotation = scope.opts.rotation
        ? "--rotate " + scope.opts.rotation
        : "";

    var banner = ! scope.opts.topBanner && ! scope.opts.bottomBanner
        ? "--no-banner"
        : ( scope.opts.topBanner
            ? "--top-banner"
            : "--bottom-banner" );

    if( scope.opts.saturation ) {

        scope.opts.setValues.Saturation = scope.opts.saturation;

    }

    var setValues = scope.getControlSetString( scope.opts.setValues );

    var sh = scope.bin + " "
        + resolution + " "
        + output + " "
        + quality + " "
        + delay + " "
        + device + " "
        + grey + " "
        + rotation + " "
        + banner + " "
        + setValues + " "
        + location;

    return sh;

};


/**
 * Get control values string
 *
 * @param {Object} setValues
 *
 * @returns {String}
 *
 */
FSWebcam.prototype.getControlSetString = function( setValues ) {

    var str = "";

    if( typeof( setValues ) !== "object" ) {

        return str;

    }

    for( var setName in setValues ) {

        var val = setValues[ setName ];

        if( ! val ) { continue; }

        str += setName + "=" + val;

    }

    return str
        ?"-s " + str
        : "";

};


/**
 * Data validations based on fs output
 *
 * @inheritdoc
 *
 */

FSWebcam.prototype.runCaptureValidations = function( data ) {

    if( FSWebcam.Validations.noWebcam.exec( data ) ) {

        return new Error( "No webcam found" );

    }

    return null;

};


//Defaults

FSWebcam.Defaults = {

    topBanner: false,

    bottomBanner: false,

    title: false,

    subTitle: false,

    timestamp: false,

    greyscale: false,

    saturation: false,

    setValues: {}

};


//Validations const

FSWebcam.Validations = {

    noWebcam: /no.*such.*file/i

};


//Export

module.exports = FSWebcam;
