/**
 * Base 64 image test
 *
 */
"use strict";

var NodeWebcam = require( __dirname + "/../index.js" );

var Async = require( "async" );


//Main test sequence

describe( "Webcam List", function() {


    //Default webcam list

    it( "Should list all availible cameras", listTest );

});


//base 64 capture webcam

function listTest( done ) {

    var Webcam = NodeWebcam.Factory.create({});

    Webcam.list( function( list ) {

        console.log( "Camera List", list );

        done();

        it( "Should capture each device", deviceCheck( Webcam, list ) );

    });

}


//use each camera

function deviceCheck( Webcam, list ) {

    var ll = list.length;

    var captureFunc = [];

    for( var i = 0; i < ll; i ++ ) {

        var device = list[ i ];

        Webcam.opts.device = device;

        captureFunc.push( Webcam.capture.bind( Webcam ) );

    }

    //async.map(

    return function( done ) {

        this.timeout( 6000 );

        done();

    }

}
