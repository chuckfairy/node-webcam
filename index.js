/**
 * Main classes and use
 *
 */
"use strict";

var NodeWebcam = {

    REVISION: 1,

    Factory: require( __dirname + "/src/Factory.js" ),

    Webcam: require( __dirname + "/src/Factory.js" ),

    FSWebcam: require( __dirname + "/src/webcams/FSWebcam.js" ),

    ImageSnapWebcam: require( __dirname + "/src/webcams/ImageSnapWebcam.js" )

};


//API

NodeWebcam.create = function( options ) {

    console.log( NodeWebcam.Factory );

    return NodeWebcam.Factory.create( options );

};


//Export

module.exports = NodeWebcam;
