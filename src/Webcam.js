/**
 *
 * Webcam base class
 *
 * @class Webcam
 * @constructor
 * @param {Object} options composition options
 * used to set
 *
 */
"use strict";

var CHILD_PROCESS = require('child_process');

var EXEC = CHILD_PROCESS.exec;

var FS = require( "fs" );

var Utils = require( "./utils/Utils.js" );

var EventDispatcher = require( "./utils/EventDispatcher.js" );

var CameraUtils = require( "./utils/CameraUtils.js" );

var Shot = require( "./Shot.js" );


/*
 * Main class
 *
 */

function Webcam( options ) {

    var scope = this;

    scope.shots = [];

    scope.opts = Utils.setDefaults( options, Webcam.Defaults );

}

Webcam.prototype = {

    constructor: Webcam,


    /**
     * Main opts from construction
     *
     * @property opts
     * @type {Object}
     *
     */

    opts: {},


    /**
     * Array of Shot objects
     *
     * @property shots
     * @type {Shots[]}
     *
     */

    shots: [],


    /**
     * Basic camera instance clone
     *
     * @method clone
     *
     * @return Webcam
     *
     */

    clone: function() {

        return new this.constructor( this.opts );

    },


    /**
     * Clear shot and camera memory data
     *
     * @method clear
     *
     */

    clear: function() {

        var scope = this;

        scope.shots = [];

    },


    /**
     * List available cameras
     *
     * @method list
     *
     * @param {Function} callback returns a list of cameras
     *
     */

    list: CameraUtils.getCameras,


    /**
     * List available camera controls
     *
     * @method listControls
     *
     * @param {Function(Array<CameraControl>)} callback Function that receives
     * camera controls
     *
     * @param {String} stdoutOverride fswebcam command output override (for
     * testing purposes)
     *
     */
    listControls: function ( callback, stdoutOverride ) {

        var scope = this;

        var sh;

        try {

            sh = scope.getListControlsSh();

        } catch(_) {

            callback && callback( [] );

        }

        //Shell execute

        var shArgs = {
            maxBuffer: 1024 * 10000
        };

        EXEC( sh, shArgs, function( err, out, derr ) {

            if( err ) {

                return callback && callback( err );

            }

            if( scope.opts.verbose && derr ) {

                console.log( derr );

            }

            scope.parseListControls( stdoutOverride || out + derr, callback );

        })

    },


    /**
     * Has camera
     *
     * @method hasCamera
     *
     * @param {Function} callback returns a Boolean
     *
     */

    hasCamera: function( callback ) {

        var scope = this;

        scope.list( function( list ) {

            callback && callback( !! list.length );

        });

    },


    /**
     * Capture shot
     *
     * @method capture
     *
     * @param {String} location
     * @param {Function} callback
     * @return void
     *
     */

    capture: function( location, callback ) {

        var scope = this;

        if(
            location === null
            && scope.opts.callbackReturn ===
                Webcam.CallbackReturnTypes.location
        ) {

            console.warn(
                "If capturing image in memory\
                your callback return type cannot be the location"
            );

            scope.opts.callbackReturn = "buffer";

        }

        var fileType = Webcam.OutputTypes[ scope.opts.output ];

        var location = location === null
            ? null
            : ( location.match( /\..*$/ )
                ? location
                : location + "." + fileType
            );


        //Shell statement grab

        var sh = scope.generateSh( location );

        if( scope.opts.verbose ) {

            console.log( sh );

        }


        //Shell execute

        var shArgs = {
            maxBuffer: 1024 * 10000
        };

        EXEC( sh, shArgs, function( err, out, derr ) { 

            if( err ) {

                return callback && callback( err );

            }

            if( scope.opts.verbose && derr ) {

                console.log( derr );

            }


            //Run validation overrides

            var validationErrors;

            if( validationErrors = scope.runCaptureValidations( derr ) ) {

                return callback && callback( validationErrors );

            }


            //Callbacks

            var shot = scope.createShot( location, derr );

            if( scope.opts.saveShots ) {

                scope.shots.push( shot );

            }

            scope.dispatch({ type: "capture", shot: shot });

            callback && (
                scope.handleCallbackReturnType( callback, shot )
            );

        });

    },


    /**
     * Generate cli command string
     *
     * @method generateSh
     *
     * @return {String}
     *
     */

    generateSh: function( location ) { return ""; },


    /**
     * Create a shot overider
     *
     * @method createShot
     *
     * @return {String}
     *
     */

    createShot: function( location, data ) {

        return new Shot( location, data );

    },

    /**
     * Get shot instances from cache index
     *
     * @method getShot
     *
     * @param {Number} shot Index of shots called
     * @param {Function} callback Returns a call from FS.readFile data
     *
     * @throws Error if shot at index not found
     *
     * @return {Boolean}
     *
     */

    getShot: function( index, callback ) {

        var scope = this;

        var shot = scope.shots[ index|0 ];

        if( ! shot ) {

            throw new Error(
                "Shot number " + index + " not found"
            );

            return;

        }

        return shot;

    },


    /**
     * Get last shot taken image data
     *
     * @method getLastShot
     *
     * @throws Error Camera has no last shot
     *
     * @return {Shot}
     *
     */

    getLastShot: function() {

        var scope = this;

        if( ! scope.shots.length ) {

            throw new Error( "Camera has no last shot" );
            return;

        }

        return scope.getShot( scope.shots.length - 1 );

    },


    /**
     * Get shot buffer from location
     * 0 indexed
     *
     * @method getShotBuffer
     *
     * @param {Number} shot Index of shots called
     * @param {Function} callback Returns a call from FS.readFile data
     *
     * @return {Boolean}
     *
     */

    getShotBuffer: function( shot, callback ) {

        var scope = this;

        if( typeof( shot ) === "number" ) {

            shot = scope.getShot( shot );

        }

        if( shot.location ) {

            FS.readFile( shot.location, function( err, data ) {

                callback( err, data );

            });

        } else if( ! shot.data ) {

            callback(
                new Error( "Shot not valid" )
            );

        } else {

            callback( null, shot.data );

        }

    },


    /**
     * Get last shot buffer taken image data
     *
     * @method getLastShotBuffer
     *
     * @throws Error Shot not found
     *
     * @return {Shot}
     *
     */

    getLastShotBuffer: function( callback ) {

        var scope = this;

        var shot = scope.getLastShot();

        scope.getShotBuffer( shot, callback );

    },


    /**
     * Get shot base64 as image
     * if passed Number will return a base 64 in the callback
     *
     * @method getBase64
     *
     * @param {Number|FS.readFile} shot To be converted
     * @param {Function( Error|null, Mixed )} callback Returns base64 string
     *
     * @return {String} Dont use
     *
     */

    getBase64: function( shot, callback ) {

        var scope = this;

        scope.getShotBuffer( shot, function( err, data ) {

            if( err ) {

                callback( err );

                return;

            }

            var base64 = scope.getBase64FromBuffer( data );

            callback( null, base64 );

        });

    },


    /**
     * Get base64 string from bufer
     *
     * @method getBase64
     *
     * @param {Number|FS.readFile} shot To be converted
     * @param {Function( Error|null, Mixed )} callback Returns base64 string
     *
     * @return {String} Dont use
     *
     */

    getBase64FromBuffer: function( shotBuffer ) {

        var scope = this;

        var image = "data:image/"
            + scope.opts.output
            + ";base64,"
            + Buffer.from( shotBuffer ).toString( "base64" );

        return image;

    },


    /**
     * Get last shot taken base 64 string
     *
     * @method getLastShot64
     *
     * @param {Function} callback
     *
     */

    getLastShot64: function( callback ) {

        var scope = this;

        if( ! scope.shots.length ) {

            callback && callback( new Error( "Camera has no last shot" ) );

        }

        scope.getBase64( scope.shots.length - 1, callback );

    },


    /**
     * Get last shot taken image data
     *
     * @method handleCallbackReturnType
     *
     * @param {Function} callback
     * @param {String} location
     *
     * @throws Error callbackReturn Type not valid
     *
     */

    handleCallbackReturnType: function( callback, shot ) {

        var scope = this;

        switch( scope.opts.callbackReturn ) {

            case Webcam.CallbackReturnTypes.location:

                return callback( null, shot.location );


            case Webcam.CallbackReturnTypes.buffer:

                return scope.getShotBuffer( shot, callback );


            case Webcam.CallbackReturnTypes.base64:

                return scope.getBase64( shot, callback );

            default:

                return callback(
                    new Error(
                        "Callback return type not valid " + scope.opts.callbackReturn
                    )
                );

        }

    },


    /**
     * Data validations for a command line output
     *
     * @override
     *
     * @param {String} Command exec output
     *
     * @return {Error|null}
     *
     */

    runCaptureValidations: function( data ) {

        return null;

    }

};

EventDispatcher.prototype.apply( Webcam.prototype );


/**
 * Base defaults for option construction
 *
 * @property Webcam.Defaults
 *
 * @type Object
 * @static
 *
 */

Webcam.Defaults = {

    //Picture related

    width: 1280,

    height: 720,

    quality: 100,


    //Delay to take shot

    delay: 0,


    //Title of the saved picture

    title: false,


    //Subtitle of the saved picture

    subtitle: false,


    //Timestamp of the saved picture

    timestamp: false,


    //Save shots in memory

    saveShots: true,


    // [jpeg, png] support varies
    // Webcam.OutputTypes

    output: "jpeg",


    //Which camera to use
    //Use Webcam.list() for results
    //false for default device

    device: false,


    // [location, buffer, base64]
    // Webcam.CallbackReturnTypes

    callbackReturn: "location",


    //Logging

    verbose: false

};


/**
 * Global output types
 * Various for platform
 *
 * @property Webcam.OutputTypes
 *
 * @type Object
 * @static
 *
 */

Webcam.OutputTypes = {

    "jpeg": "jpg",

    "png": "png",

    "bmp": "bmp"

};


/**
 * Global output types
 * Various for platform
 *
 * @property Webcam.CallbackReturnTypes
 *
 * @type Object
 * @static
 *
 */

Webcam.CallbackReturnTypes = {

    "default": "location",

    "location": "location", // Shot location
    "buffer": "buffer", // Buffer object
    "base64": "base64" // String ex : "data..."

};


//Export

module.exports = Webcam;
