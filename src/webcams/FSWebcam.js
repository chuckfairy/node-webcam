/**
 * API for fswebcam
 *
 * @requires [ fswebcam ]
 *
 * @param Object options
 *
 */
"use strict";

var Webcam = require( "./../Webcam.js" );

var Utils = require( "./../utils/Utils.js" );

var Shot = require( "./../Shot.js" );


//Main class

function FSWebcam( options ) {

    var scope = this;

    scope.opts = Utils.setDefaults( options, FSWebcam.Defaults );

    Webcam.call( scope, scope.opts );

    if( scope.opts.output === "png" && scope.opts.quality > 9 ) {

        scope.opts.quality = 9;

    }

}

FSWebcam.prototype = Object.create( Webcam.prototype );

FSWebcam.prototype.constructor = FSWebcam;

FSWebcam.prototype.bin = "fswebcam";


/**
 * @override
 *
 * Create shot possibly from memory stdout
 *
 */

FSWebcam.prototype.createShot = function( location, data ) {

    if( location === null ) {

        var data = Buffer.from( data );

    }

    return new Shot( location, data );

};


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

    // Adding frame rate
    var frames = scope.opts.frames
        ? "-F " + scope.opts.frames
        : "";

    var output = "--" + scope.opts.output;

    var quality = scope.opts.quality;

    var delay = scope.opts.delay
        ? "-D " + scope.opts.delay
        : "";

    var title = scope.opts.title
        ? "--title " + scope.opts.title
        : "";

    var subtitle = scope.opts.subtitle
        ? "--subtitle " + scope.opts.subtitle
        : "";

    var timestamp = scope.opts.timestamp
        ? "--timestamp " + scope.opts.timestamp
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

    var skip = scope.opts.skip
        ? "--skip " + scope.opts.skip
        : "";

    if( scope.opts.saturation ) {

        scope.opts.setValues.Saturation = scope.opts.saturation;

    }


    var setValues = scope.getControlSetString( scope.opts.setValues );

    var verbose = scope.opts.verbose ? "" : " -q"

    // Use memory if null location

    var shellLocation = (location === null)
        ? "- -"
        : location;

    var sh = scope.bin + " "
        + verbose + " "
        + resolution + " "
        + frames + " "
        + output + " "
        + quality + " "
        + delay + " "
        + title + " "
        + subtitle + " "
        + timestamp + " "
        + device + " "
        + grey + " "
        + rotation + " "
        + banner + " "
        + setValues + " "
        + skip + " "
        + shellLocation;

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

        // Add a space to separate values if there are multiple control values being set
        if (str.length > 0) {
            str += " "
        }
        str += `-s ${setName}=${val}`;

    }

    return str

};

/**
 * Get shell statement to get the available camera controls
 *
 * @returns {String}
 *
 */
FSWebcam.prototype.getListControlsSh = function() {

    var scope = this;

    var devSwitch = scope.opts.device ? " --device=" + scope.opts.device.trim() : "";

    return scope.bin + devSwitch + " --list-controls";

}


/**
 * Parse output of list camera controls shell command
 *
 * @param {String} stdout Output of the list camera control shell command
 *
 * @param {Function(Array<CameraControl>)} callback Function that receives
 * camera controls
 *
 */
FSWebcam.prototype.parseListControls = function ( stdout, callback ) {

    var cameraControls = [];

    var inOptions = false;

    var prefixLength = 0;

    var headerRegExp = new RegExp(
        "(?<prefix>.*)------------------\\s+-------------\\s+-----.*"
    );

    var rangeRegExp = new RegExp(
        "(?<name>.*?)" +
            "\\s+-?\\d+(?:\\s+\\(\\d+%\\))?\\s+" +
            "(?<min>-?\\d+)" +
            " - " +
            "(?<max>-?\\d+)",
        "i"
    );

    for ( var line of stdout.split( /\n|\r|\n\r|\r\n/ ) ) {

        line = line.slice( prefixLength ).trim();

        inOptions = inOptions && line.startsWith( "-" ) ? false : inOptions;

        if ( inOptions ) {

            var rangeGroups = line.match( rangeRegExp );

            if ( rangeGroups ) {

                var name = rangeGroups.groups.name;

                var minRange = parseInt( rangeGroups.groups.min );

                var maxRange = parseInt( rangeGroups.groups.max );

                cameraControls.push({
                    name: name,
                    type: "range",
                    min: minRange,
                    max: maxRange,
                });

            } else if ( line.lastIndexOf( "|" ) !== -1 ) {

                var opts = [];

                var opt = "";

                var name = "";

                var idx = line.lastIndexOf( "|" );

                while ( idx !== -1 ) {

                    opt = line.slice( idx + 1 ).trim();

                    opts.push( opt );

                    var firstIdx = line.indexOf( opt );

                    var lastIdx = line.lastIndexOf( opt );

                    if ( !name && firstIdx !== -1 && firstIdx !== lastIdx ) {

                        name = line.slice( 0, firstIdx ).trim();

                        line = line.slice( firstIdx + opt.length );

                        idx = line.lastIndexOf( "|" );
                    }

                    line = line.slice( 0, idx ).trim();

                    idx = line.lastIndexOf( "|" );
                }

                if ( name && line.trim() ) {

                    opts.push( line.trim() );

                } else if ( !name ) {

                    // Find largest number of words with two consecutive matches

                    var words = line
                        .split( " " )
                        .filter( function ( item ) {
                            return Boolean( item );
                        })
                        .reverse();

                        var num_words = 1;

                        opt = words.slice( 0, num_words ).reverse().join( " " );

                        var re = new RegExp( opt + "\\s+" + opt );

                    while ( !re.test( line ) ) {

                        num_words += 1;

                        opt = words.slice( 0, num_words ).reverse().join( " " );

                        re = new RegExp( opt + "\\s+" + opt );
                    }

                    var firstIdx = line.indexOf( opt );

                    name = line.slice( 0, firstIdx ).trim();

                    opts.push( opt );
                }

                cameraControls.push({
                    name: name,
                    type: "list",
                    opts: opts.reverse(),
                });

            }

        }

        var obj = line.match( headerRegExp );

        if ( obj ) {

            inOptions = true;

            // The output of the fswebcam --list-controls command has
            // terminal escape characters at the beginning of the each line

            prefixLength = obj.groups.prefix.length;

        }

    }

    callback && callback( cameraControls );

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

    skip: false,

    setValues: {},

};


//Validations const

FSWebcam.Validations = {

    noWebcam: /no.*such.*(file|device)/i

};


//Export

module.exports = FSWebcam;
