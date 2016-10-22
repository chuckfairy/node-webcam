/**
 * Main classes and use
 *
 * @module NodeWebcam
 *
 */
"use strict";


/**
 * @class API
 *
 */

var NodeWebcam = {

    version: "0.3.3",

    REVISION: 3,

    Factory: require( __dirname + "/src/Factory.js" ),

    Webcam: require( __dirname + "/src/Factory.js" ),

    FSWebcam: require( __dirname + "/src/webcams/FSWebcam.js" ),

    ImageSnapWebcam: require( __dirname + "/src/webcams/ImageSnapWebcam.js" ),

    WindowsWebcam: require( __dirname + "/src/webcams/WindowsWebcam.js" )

};


//API



/**
 * Main create
 *
 * @method create
 *
 * @param {Object} options
 *
 */

NodeWebcam.create = function( options ) {

    return NodeWebcam.Factory.create( options );

};


/**
 * Quick capture helper
 *
 * @method capture
 *
 * @param {String} location
 * @param {Object} options
 * @param {Function} callback
 *
 */

NodeWebcam.capture = function( location, options, callback ) {

    var webcam = NodeWebcam.create( options );

    webcam.capture( location, callback );

    return webcam;

};


//Export

module.exports = NodeWebcam;
