/**
 * Picture features testing
 *
 * @requires mocha
 *
 */
"use strict";

var NodeWebcam = require( "./../index.js" );

var Chai = require( "chai" );

var assert = Chai.assert;

var Async = require( "async" );

var Features = [
    {
        name: "Grayscale",
        options: {
            greyscale: true
        }
    },
    {
        name: "Rotation",
        options: {
            rotation: "50"
        }
    },
    {
        name: "Saturation",
        options: {
            saturation: "100%"
        }
    },
    {
        name: "Clean",
        options: {}
    },
    {
        name: "Skip",
        options: {
            skip: 1
        }
    },
    {
        name: "NumberOfFrames",
        options: {
            numberOfFrames: 40,
        }
    }
];


//Main test sequence

describe( "Webcam Features", function() {


    //feature test setup

    featureTest();

});


function featureTest() {

    Async.map( Features, captureFeature );

    function captureFeature( feature, callback ) {

        it( "Should use Feature " + feature.name, function( itCallback ) {

            this.timeout( 6000 );

            var Webcam = NodeWebcam.create( feature.options );

            var url = __dirname + "/output/feature_" + feature.name;

            Webcam.capture( url, function( err, data ) {

                assert.typeOf( err, "null" );

                callback();

                itCallback();

            });

        });

    }

}
