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

    version: "0.4.1",

    REVISION: 4,

    Factory: require( "./src/Factory.js" ),

    Webcam: require( "./src/Factory.js" ),

    FSWebcam: require( "./src/webcams/FSWebcam.js" ),

    ImageSnapWebcam: require( "./src/webcams/ImageSnapWebcam.js" ),

    WindowsWebcam: require( "./src/webcams/WindowsWebcam.js" )

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
