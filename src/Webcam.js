/**
 * Webcam base class
 *
 */
"use strict";

var Utils = require( __dirname + "/utils/Utils.js" );

var EventDispatcher = require( __dirname + "/utils/EventDispatcher.js" );

var CHILD_PROCESS = require('child_process');

var EXEC = CHILD_PROCESS.exec;


//Main Class

function Webcam( options ) {

    var scope = this;

    scope.opts = Utils.setDefaults( options, Webcam.Defaults );

}

Webcam.prototype = {

    constructor: Webcam,


    //Main opts

    opts: {},


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

                console.log( derr );

                throw err;

            }

            if( scope.opts.verbose && out ) {

                console.log( out );

            }


            //Callbacks

            scope.dispatch({ type: "capture" });

            callback && callback( location );

        });

    },


    //@Override

    generateSh: function( location ) { return ""; }

};

EventDispatcher.prototype.apply( Webcam.prototype );


//Defaults

Webcam.Defaults = {

    width: 1280,

    height: 720,

    delay: 0,

    quality: 100,

    output: "jpeg",

    verbose: true

};


//Output types

Webcam.OutputTypes = {

    "jpeg": "jpg",

    "png": "png"

};


//Export

module.exports = Webcam;
