/**
 * Base 64 image test
 *
 */
"use strict";

var NodeWebcam = require( "./../index.js" );

var Path = require( "path" );

var Chai = require( "chai" );

var assert = Chai.assert;

var Async = require( "async" );

var List = [];


//Main test sequence

describe( "Webcam List", function() {


    //Default webcam list

    it( "Should list all availible cameras", listTest );


    it( "Should capture each device", deviceCheck );

});


//base 64 capture webcam

function listTest( done ) {

    var Webcam = NodeWebcam.Factory.create({});

    Webcam.list( function( list ) {

        console.log( "Camera List", list );

        List = list;

        done();


    });

}


//use each camera

function deviceCheck( done ) {

    this.timeout( 6000 );

    var Webcam = NodeWebcam.Factory.create({});

    var url = Path.resolve( __dirname, "output", "test_image" );

     var index = 0;


    //Main device capture

    function captureFunc( device, callback ) {

        Webcam.opts.device = device;

        var urlDevice = url + "_" + index;

        Webcam.capture( urlDevice, function( err, data ) {

            if(err != null && !err.message.includes("VIDIOC_ENUMINPUT: Inappropriate ioctl for device")) assert.typeOf( err, "null" );

            callback();

        });

        index++;

    }

    Async.mapSeries( List, captureFunc, function() {

        done();

    });

}
