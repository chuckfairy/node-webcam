/**
 * Factory based on OS output
 *
 */
var OS = require( "os" );


//Webcam types

var FSWebcam = require( "./webcams/FSWebcam.js" );

var ImageSnapWebcam = require( "./webcams/ImageSnapWebcam.js" );

var WindowsWebcam = require( "./webcams/WindowsWebcam.js" );


//Main singleton

var Factory = new function() {

    var scope = this;


    //Main Class get

    scope.create = function( options, type ) {

        options = options || {};

        var p = type || options.driverType || Factory.Platform;

        var Type = Factory.Types[ p ];

        if( ! Type ) {

            throw new Error( "Sorry, no webcam type specified yet for platform " + p );

        }

        return new Type( options );

    };

};


Factory.Platform = OS.platform();

//OS Webcam types

Factory.Types = {

    linux: FSWebcam,

    darwin: ImageSnapWebcam,

    fswebcam: FSWebcam,

    win32: WindowsWebcam,

    win64: WindowsWebcam,

    gphoto2: require("./webcams/GPhoto2Webcam.js"),

};


//Export

module.exports = Factory;
