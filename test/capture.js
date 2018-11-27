/**
 * Mocha Basic capture setups
 *
 */
"use strict";

var NodeWebcam = require( "./../index.js" );

var Path = require( "path" );

var FS = require( "fs" );

var Chai = require( "chai" );

var assert = Chai.assert;


//Main capture sequence

describe("Capture", function() {


    //Default webcam capture using global API

    it( "Should capture from default webcam", function( done ) {

        this.timeout( 6000 );

        var url = Path.resolve( __dirname, "output", "test_image" );

        var Webcam = NodeWebcam.capture( url, {}, function( err, url ) {

            assert.typeOf( err, 'null' );

            FS.unlinkSync( url );

            done();

        });

    });


    //Default webcam capture using global API

    it( "Should fail to capture from fake webcam", function( done ) {

        this.timeout( 6000 );

        var url = Path.resolve( __dirname, "output", "test_image" );

        var opts = { device: "OBVIOUSLY-FAKE-WEBCAM" };

        var Webcam = NodeWebcam.capture( url, opts, function( err, url ) {

            assert.equal( err instanceof Error, true );

            done();

        });

    });

});
