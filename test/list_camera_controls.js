/**
 * list-controls test
 *
 */
"use strict";

var NodeWebcam = require( "./../index.js" );

var Chai = require( "chai" );

var should = Chai.should();

//Main test sequence

describe( "Webcam List Controls", function() {


    //Default webcam list

    it( "Should correctly parse camera controls", listControlTest );

    it( "Should correctly handle no cameras", listControlTestNoCamera );

});

//base 64 capture webcam

function listControlTest( done ) {

    this.timeout( 6000 );

    var stdout = [
        "[1m--- Opening /dev/video0...",
        "[0m[0mTrying source module v4l2...",
        "[0m[0m/dev/video0 opened.",
        "[0m[0mNo input was specified, using the first.",
        "[0m[1mAvailable Controls        Current Value   Range",
        "[0m[0m------------------        -------------   -----",
        "[0m[0mBrightness                -64 (0%)        -64 - 64",
        "[0m[0mContrast                  47 (49%)        0 - 95",
        "[0m[0mSaturation                64 (50%)        0 - 128",
        "[0m[0mHue                       -1200 (20%)     -2000 - 2000",
        "[0m[0mWhite Balance Temperature, Auto False           True | False",
        "[0m[0mGamma                     100 (0%)        100 - 300",
        "[0m[0mGain                      0 (0%)          0 - 100",
        "[0m[0mPower Line Frequency      50 Hz           Disabled | 50 Hz | 60 Hz",
        "[0m[0mWhite Balance Temperature 2800 (0%)       2800 - 6500",
        "[0m[0mSharpness                 2               1 - 7",
        "[0m[0mBacklight Compensation    1               0 - 3",
        "[0m[0mExposure, Auto            Aperture Priority Mode Manual Mode | Aperture Priority Mode",
        "[0m[0mExposure (Absolute)       625 (12%)       1 - 5000",
        "[0m[0mExposure, Auto Priority   True            True | False",
        "[0m[0mAdjusting resolution from 384x288 to 320x240.",
        "[0m[1m--- Capturing frame...",
        "[0m[0mCaptured frame in 0.00 seconds.",
        "[0m[1m--- Processing captured image...",
        "[0m[0mThere are unsaved changes to the image.",
        "[0m",
    ].join( "\n" );

    var referenceCameraControls = [
        { name: "Brightness", type: "range", min: -64, max: 64},
        { name: "Contrast", type: "range", min: 0, max: 95},
        { name: "Saturation", type: "range", min: 0, max: 128},
        { name: "Hue", type: "range", min: -2000, max: 2000},
        { name: "White Balance Temperature, Auto", type: "list", opts: ["True", "False"]},
        { name: "Gamma", type: "range", min: 100, max: 300},
        { name: "Gain", type: "range", min: 0, max: 100},
        { name: "Power Line Frequency", type: "list", opts: ["Disabled", "50 Hz", "60 Hz"]},
        { name: "White Balance Temperature", type: "range", min: 2800, max: 6500 },
        { name: "Sharpness", type: "range", min: 1, max: 7},
        { name: "Backlight Compensation", type: "range", min: 0, max: 3},
        { name: "Exposure, Auto", type: "list", opts: ["Manual Mode", "Aperture Priority Mode"]},
        { name: "Exposure (Absolute)", type: "range", min: 1, max: 5000},
        { name: "Exposure, Auto Priority", type: "list", opts: ["True", "False"]},
    ];

    var Webcam = NodeWebcam.Factory.create( {} );

    Webcam.listControls( function( actualControls ) {

        actualControls.should.eql( referenceCameraControls );

        done();

    }, stdout);

}


function listControlTestNoCamera( done ) {

    this.timeout( 6000 );

    var stdout = [
        "[1m--- Opening /dev/video0...",
        "[0m[31mstat: No such file or directory",
        "[0m",
    ].join("\n");

    var referenceCameraControls = [];

    var Webcam = NodeWebcam.Factory.create( {} );

    Webcam.listControls( function( actualControls ) {

        actualControls.should.eql( referenceCameraControls );

        done();

    }, stdout);

}
