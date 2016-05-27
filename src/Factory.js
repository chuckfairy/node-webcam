/**
 * Factory based on OS output
 *
 */
var OS = require( "os" );

var Platform = OS.platform();


//Webcam types

var FSWebcam = require( __dirname + "/webcams/FSWebcam.js" );

var ImageSnapWebcam = require( __dirname + "/webcams/ImageSnapWebcam.js" );


//Main singleton

var Factory = new function() {

    var scope = this;


    //Main Class get

    scope.create = function( options ) {

        var Type = Factory.Types[ Platform ];

        if( ! Type ) {

            throw new Error( "Sorry, no webcam type specified yet for platform " + Platform );

        }

        return new Type( options );

    };

};


//OS Webcam types

Factory.Types = {

    linux: FSWebcam,

    darwin: ImageSnapWebcam

};


//Export

module.exports = Factory;
