/**
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

var Utils = require( __dirname + "/utils/Utils.js" );

var EventDispatcher = require( __dirname + "/utils/EventDispatcher.js" );

var CameraUtils = require( __dirname + "/utils/CameraUtils.js" );


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
     * picture shots
     *
     * @property shots
     * @type {Array}
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
     * @param {Function} callback returns a list of camers
     *
     */

    list: CameraUtils.getCameras,


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

        var fileType = Webcam.OutputTypes[ scope.opts.output ];

        var location = location || "";

        location = location.match( /\..*$/ )
            ? location
            : location + "." + fileType;


        //Shell statement grab

        var sh = scope.generateSh( location );

        if( scope.opts.verbose ) {

            console.log( sh );

        }


        //Shell execute

        EXEC( sh, function( err, out, derr ) {

            if( err ) {

                return ( callback && callback( err ) );

            }

            if( scope.opts.verbose && derr ) {

                console.log( derr );

            }


            //Run validation overrides

            var validationErrors;

            if( validationErrors = scope.runCaptureValidations( derr ) ) {

                return ( callback && callback( validationErrors ) );

            }


            //Callbacks

            scope.shots.push( location );

            scope.dispatch({ type: "capture" });

            callback && callback( err, location );

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
     * Get shot buffer from location
     * 0 indexed
     *
     * @method getShot
     *
     * @param {Number} shot Index of shots called
     * @param {Function} callback Returns a call from FS.readFile data
     *
     * @return {Boolean}
     *
     */

    getShot: function( shot, callback ) {

        var scope = this;

        var shotLocation = scope.shots[ shot ];

        if( !shotLocation ) {

            callback && callback(
                new Error( "Shot number " + shot + " not found" )
            );

            return;

        }

        FS.readFile( shotLocation, function( err, data ) {

            callback && callback( err, data );

        });

    },


    /**
     * Get last shot taken image data
     *
     * @method getLastShot
     *
     * @param {Function} callback Returns last shot from getShot return
     *
     * @return {Boolean} Successful getShot
     *
     */

    getLastShot: function( callback ) {

        var scope = this;

        if( ! scope.shots.length ) {

            callback && callback( new Error( "Camera has no last shot" ) );

        }

        scope.getShot( scope.shots.length - 1, callback );

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
     * @return {Boolean|String}
     *
     */

    getBase64: function( shot, callback ) {

        var scope = this;


        //Typeof number for a getShot callback

        if( typeof( shot ) === "number" ) {

            return scope.getShot( shot, function( err, data ) {

                if( err ) {

                    callback( err );

                    return;

                }

                callback( err, scope.getBase64( data ) );

            });

        }


        //Data use

        return "data:image/"
            + scope.opts.output
            + ";base64,"
            + new Buffer( shot ).toString( "base64" );

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

    width: 1280,

    height: 720,

    delay: 0,

    quality: 100,

    output: "jpeg",

    device: false,

    verbose: true

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


//Export

module.exports = Webcam;
