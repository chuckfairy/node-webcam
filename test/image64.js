/**
 * Base 64 image test
 *
 */
"use strict";

var NodeWebcam = require( "./../index.js" );

var Path = require( "path" );

var FS = require( "fs" );

var Chai = require( "chai" );

var assert = Chai.assert;


//Main capture sequence

describe( "Base 64 Capture", function() {


    //Default webcam capture using global API

    it( "Should capture and grab a base64 image", base64Capture );

});


//base 64 capture webcam

function base64Capture( done ) {

    this.timeout( 6000 );

    var url = Path.resolve( __dirname, "output", "test_image" );

    var Webcam = NodeWebcam.Factory.create({
        saveShots: true
    });

    Webcam.capture( url, function( err, url ) {

        Webcam.getBase64( Webcam.shots.length - 1, function( err, base64 ) {

            assert.equal( err, null );

            var writeLocal = __dirname + "/output/test_image_64.html";

            var content = "<img src='" + base64 + "'>";

            FS.writeFile( writeLocal, content, function( err ) {

                assert.typeOf( err, "null" );

                done();

            });

        });

    });

}
