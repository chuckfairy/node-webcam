/**
 * Callback return type testing
 *
 * @requires mocha
 *
 */
"use strict";

var NodeWebcam = require( "./../index.js" );

var Chai = require( "chai" );

var assert = Chai.assert;

var Async = require( "async" );


//Return types to test

var ReturnTypes = [
    "base64",
    "buffer",
    "location"
];

var ReturnTypeInstances = {
    "base64": "string",
    "buffer": "object",
    "location": "string"
};


//Main test sequence

describe( "Webcam Callback Return Type", function() {

    returnTypesTest();

    badTypeTest();

});


/**
 * Buffer return types
 */

function returnTypesTest() {

    Async.map( ReturnTypes, captureFunc );

    function captureFunc( returnType, callback ) {

        var expectedType = ReturnTypeInstances[ returnType ];

        it( "Should return " + returnType + " on callback",  function( itCallback ) {

            this.timeout( 6000 );

            var options = {
                callbackReturn: returnType
            };

            var Webcam = NodeWebcam.create( options );

            var url = __dirname + "/output/returntype_" + returnType;

            Webcam.capture( url, function( err, data ) {

                assert.equal( typeof( data ), expectedType );

                callback();

                itCallback();

            });

        });

    }

}


/**
 * Bad type test
 */

function badTypeTest() {

    it( "Should return Error on bad return type on callback",  function( itCallback ) {

        this.timeout( 6000 );

        var options = {
            callbackReturn: "OBVISIOUSLY FAKE RETURN TYPE"
        };

        var Webcam = NodeWebcam.create( options );

        var url = __dirname + "/output/returntype_fake";

        Webcam.capture( url, function( err, data ) {

            assert.instanceOf( err, Error );

            itCallback();

        });

    });

}
