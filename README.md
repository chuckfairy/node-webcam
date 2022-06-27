# [node-webcam](https://github.com/chuckfairy/node-webcam)

Cross platform webcam usage


# Install


### Linux

```
#Linux relies on fswebcam currently
#ubuntu

sudo apt-get install fswebcam

#arch
#fswebcam requires a build from the AUR, it is not listed for installation on pacman/pamac

sudo pamac build fswebcam
```

### Mac OSX

```
#Mac OSX relies on imagesnap
#Repo https://github.com/rharder/imagesnap
#Avaliable through brew

brew install imagesnap

```

### Windows

Standalone exe included. See [src/bindings/CommandCam](https://github.com/chuckfairy/node-webcam/tree/master/src/bindings/CommandCam)


# Usage

### API Usage

``` javascript
//Available in nodejs

var NodeWebcam = require( "node-webcam" );


//Default options

var opts = {

    //Picture related

    width: 1280,

    height: 720,

    quality: 100,

    // Number of frames to capture
    // More the frames, longer it takes to capture
    // Use higher framerate for quality. Ex: 60

    frames: 60,


    //Delay in seconds to take shot
    //if the platform supports miliseconds
    //use a float (0.1)
    //Currently only on windows

    delay: 0,


    //Save shots in memory

    saveShots: true,


    // [jpeg, png] support varies
    // Webcam.OutputTypes

    output: "jpeg",


    //Which camera to use
    //Use Webcam.list() for results
    //false for default device

    device: false,


    // [location, buffer, base64]
    // Webcam.CallbackReturnTypes

    callbackReturn: "location",


    //Logging

    verbose: false

};


//Creates webcam instance

var Webcam = NodeWebcam.create( opts );


//Will automatically append location output type

Webcam.capture( "test_picture", function( err, data ) {} );


//Also available for quick use

NodeWebcam.capture( "test_picture", opts, function( err, data ) {

});


//Get list of cameras

Webcam.list( function( list ) {

    //Use another device

    var anotherCam = NodeWebcam.create( { device: list[ 0 ] } );

});

//Return type with base 64 image

var opts = {
    callbackReturn: "base64"
};

NodeWebcam.capture( "test_picture", opts, function( err, data ) {

    var image = "<img src='" + data + "'>";

});
```

### Shell Usage

```
#Config opts

--width Picture width

--height Picture height

--delay Delay till shot

--quality Quality of image 0-100

--output Output type [png, jpg, bmp]

--verbose Verbose debugging

--help Usage help text

--version node-webcam version

--location Location to output webcam capture

--list list available camera devices


#Shorthand options

w: [ "--width" ],

h: [ "--height" ],

d: [ "--delay" ],

q: [ "--quality" ],

out: [ "--output" ],

h: [ "--help", true ],

v: [ "--version", true ],

l: [ "--location" ]


#node-webcam will auto output the file type at the end

node-webcam --w 500 --h 500 --d 2 --l picture # ./bin/node-webcam.js

```

# Generated Documentation

```
# install yuidoc and run
./bin/generate_doc.sh
```


# Classes

## [NodeWebcam](https://github.com/chuckfairy/node-webcam/blob/master/index.js)

Main require used. Also has helper functions just for you.

### NodeWebcam.create( Object options )

Main factory creation of a webcam for use. Uses NodeWebcam.Factory to create.

```javascript
//Default options defined in API usage

var NodeWebcam = require( "node-webcam" );

var Webcam = NodeWebcam.create({});
```

### NodeWebcam.capture( String location, Object options, Function callback )

Quick helper for taking pictures via one function. Will return Webcam instance via NodeWebcam.create.

```javascript
NodeWebcam.capture( "my_picture", {}, function( err, data ) {

    if ( !err ) console.log( "Image created!" );

});
```

## [Webcam](https://github.com/chuckfairy/node-webcam/blob/master/src/Webcam.js)

Base webcam class in which all other cameras inherit from

### Webcam.constructor( Object options )

```javascript
//Default options and basic usage

var opts = {

    width: 1280,

    height: 720,

    delay: 0,

    quality: 100,

    // [jpeg, png] support varies
    // Webcam.OutputTypes

    output: "jpeg",

    device: false,


    // [buffer, base64]
    // Webcam.CallbackReturnTypes

    callbackReturn: "location",

    verbose: false

}

var cam = new Webcam( opts );
```

### Webcam.clone()

### Webcam.clear()

Reset data and memory of past shots

### Webcam.capture( String location, Object options, Function callback( Error|Null, Buffer) )

First param of callback will be a possible error or null. Second will return the location of the image or null. The following functions will follow similarly. This function will auto append the output type if not specified in file name.


### Webcam.getShot( Number shot, Function callback( Error|Null, Buffer) )

### Webcam.getLastShot( Function callback )

### Webcam.getBase64( Number|Buffer shot, Function callback( Error|Null, Buffer) )

Get base 64 of shot number or data already grabbed from FS.

## [FSWebcam](https://github.com/chuckfairy/node-webcam/blob/master/src/webcams/FSWebcam.js)

Uses the fswebcam program. Available in linux (apt-get install fswebcam). Extra program addons provided in options.

```javascript
var NodeWebcam = require( "node-webcam" );

var FSWebcam = NodeWebcam.FSWebcam; //require( "node-webcam/webcams/FSWebcam" );

var opts = {};

var cam = new FSWebcam( opts );
```

# What's next?

* Video capture functionality
* Battle testing
* What do you want to see? Leave an issue on the github page!
