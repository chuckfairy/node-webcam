/**
 * Capture and dont save use memory
 *
 */
"use strict";


var NodeWebcam = require( "./../index.js" );

var Path = require( "path" );

var FS = require( "fs" );

var Chai = require( "chai" );

var assert = Chai.assert;


//Main capture sequence

describe( "Memory Capture", function() {


    //Default webcam capture using global API

    it( "Should capture and save to memory", function( done ) {

        this.timeout( 6000 );

        var opts = {
            callbackReturn: "base64"
        };

        var Webcam = NodeWebcam.capture( null, opts, function( err, data ) {

            assert.typeOf( err, "null" );

            assert.typeOf( data, "string" );

            var writeLocal = __dirname + "/output/test_image_memory_64.html";

            var content = "<img src='" + data + "'>";

            FS.writeFile( writeLocal, content, function( err ) {

                assert.typeOf( err, "null" );

                done();

            });

        });

    });

});
