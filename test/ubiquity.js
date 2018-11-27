/**
 * Class and executable ubiquity
 *
 */
"use strict";

var NodeWebcam = require( "./../index.js" );

var Async = require( "async" );

var CamTypes = {

    linux: [
        "FSWebcam"
    ],

    darwin: [
        "ImageSnapWebcam"
    ],

    win32: [
        "WindowsWebcam"
    ],

    win64: [
        "WindowsWebcam"
    ]

};


//Main test sequence

describe( "Webcam Ubiquity", function() {


    //webcam class ubiquity

    it( "Should output from it's platforms drivers", ubiquityTest );

});


function ubiquityTest( done ) {

    this.timeout( 6000 );

    var platform = NodeWebcam.Factory.Platform;

    var types = CamTypes[ platform ];

    var url = __dirname + "/output/test_image";

    Async.map( types, captureFromCam, done );

    function captureFromCam( type, callback ) {

        var Webcam = new NodeWebcam[ type ];

        Webcam.capture( url, function() {

            callback();

        });

    }

}
