/**
 * Factory based on OS output
 *
 */
var OS = require( "os" );

var Platform = OS.platform();


//Webcam types

var FSWebcam = require( __dirname + "/webcams/FSWebcam.js" );

var ImageSnapWebcam = require( __dirname + "/webcams/ImageSnapWebcam.js" );

var WindowsWebcam = require( __dirname + "/webcams/WindowsWebcam.js" );


//Main singleton

var Factory = new function() {

    var scope = this;


    //Main Class get

    scope.create = function( options, type ) {

        var p = type || Platform;

        var Type = Factory.Types[ p ];

        if( ! Type ) {

            throw new Error( "Sorry, no webcam type specified yet for platform " + Platform );

        }

        return new Type( options );

    };

};


//OS Webcam types

Factory.Types = {

    linux: FSWebcam,

    darwin: ImageSnapWebcam,

    fswebcam: FSWebcam,

    win32: WindowsWebcam,

    win64: WindowsWebcam

};


//Export

module.exports = Factory;
