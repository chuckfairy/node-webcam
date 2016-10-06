/**
 * Webcam base class
 *
 */
"use strict";

var CHILD_PROCESS = require('child_process');

var EXEC = CHILD_PROCESS.exec;

var FS = require( "fs" );

var Utils = require( __dirname + "/utils/Utils.js" );

var EventDispatcher = require( __dirname + "/utils/EventDispatcher.js" );

var CameraUtils = require( __dirname + "/utils/CameraUtils.js" );


//Main Class

function Webcam( options ) {

    var scope = this;

    scope.shots = [];

    scope.opts = Utils.setDefaults( options, Webcam.Defaults );

}

Webcam.prototype = {

    constructor: Webcam,


    //Main opts

    opts: {},


    //picture shots

    shots: [],


    /**
     * Basic clone
     *
     * @return Webcam
     *
     */

    clone: function() {

        return new this.constructor( this.opts );

    },


    /**
     * Clear data
     *
     */

    clear: function() {

        var scope = this;

        scope.shots = [];

    },


    /**
     * List available cameras
     *
     * @param Function callback
     *
     * @callback( Array cameras )
     *
     */

    list: CameraUtils.getCameras,


    /**
     * Capture shot
     *
     *
     * @param String location
     * @param Function callback
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

                callback && callback(err);

                return;

            }

            if( scope.opts.verbose && out ) {

                console.log( out );

            }


            //Callbacks

            scope.shots.push( location );

            scope.dispatch({ type: "capture" });

            callback && callback( err, location );

        });

    },


    //@Override

    generateSh: function( location ) { return ""; },


    /**
     * Get shot buffer from location
     * 0 indexed
     *
     * @param Number shot
     * @param Function callback
     *
     * @return Boolean
     *
     * @callback( FS.readFile data )
     *
     */

    getShot: function( shot, callback ) {

        var scope = this;

        var shotLocation = scope.shots[ shot ];

        if( !shotLocation ) {

            callback(new Error("Not found the shot."));

            return;

        }

        FS.readFile( shotLocation, function( err, data ) {

            callback && callback( err, data );

        });

    },


    /**
     * Get last shots image data
     *
     * @param Function callback
     *
     * @return Boolean
     *
     */

    getLastShot: function( callback ) {

        var scope = this;

        scope.getShot( scope.shots.length - 1, callback );

    },


    /**
     * Get shot base64 as image
     * if passed Number will return a base 64 in the callback
     *
     * @param Number|FS.readFile shot
     * @param Function callback
     *
     * @return Boolean|String
     *
     */

    getBase64: function( shot, callback ) {

        var scope = this;


        //Typeof number for a getShot callback

        if( typeof( shot ) === "number" ) {

            scope.getShot( shot, function( err, data ) {

                if (err) {

                    callback(err);

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

    }

};

EventDispatcher.prototype.apply( Webcam.prototype );


//Defaults

Webcam.Defaults = {

    width: 1280,

    height: 720,

    delay: 0,

    quality: 100,

    output: "jpeg",

    device: false,

    verbose: true

};


//Output types

Webcam.OutputTypes = {

    "jpeg": "jpg",

    "png": "png",

    "bmp": "bmp"

};


//Export

module.exports = Webcam;
