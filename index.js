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


/**
 * Camera list helper
 *
 * @method list
 *
 * @param {Function(Array<String>)} callback
 *
 */

NodeWebcam.list = function( callback ) {

    var cam = NodeWebcam.create({});

    cam.list(callback);

};

/**
 * @typedef CameraControl
 * @type {Object}
 * @param {String} name Control name, as it should appear in the setValues object
 * @param {String} type Either "range" or "list"
 * @param {Number} min For "range" controls, minimum control value
 * @param {Number} max For "range" controls, maximum control value
 * @param {Array(<String>)} opts For "list" controls, available control options
 *
 */

/**
 * Camera options helper
 *
 * @method listControls
 *
 * @param {String} device
 * @param {Function(Array<CameraControl>)} callback
 *
 */

NodeWebcam.listControls = function( device, callback ) {

    var cam = NodeWebcam.create({device});

    cam.listControls(callback);

};


//Export

module.exports = NodeWebcam;
