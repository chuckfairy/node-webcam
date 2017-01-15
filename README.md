# node-webcam

Cross platform webcam usage


# Install

### Linux

```
#Linux relies on fswebcam currently
#Tested on ubuntu

sudo apt-get install fswebcam

```

### Mac OSX

```
#Mac OSX relies on imagesnap
#Repo https://github.com/rharder/imagesnap
#Avaliable through brew

brew install imagesnap

```

### Windows

Standalone exe included. See src/bindings/CommandCam


# Usage

``` javascript
//Config opts

var opts = {

    width: [ Number, 1280 ],

    height: [ Number, 720 ],

    delay: [ Number, 0 ],

    quality: [ Number, 100 ],

    output: [ String, "jpeg" ],

    verbose: [ Boolean, true ],

    help: [ Boolean, false ],

    version: [ Boolean, false ],

    location: Path

};


//Shorthand options

var shorthand = {

    w: [ "--width" ],

    h: [ "--height" ],

    d: [ "--delay" ],

    q: [ "--quality" ],

    out: [ "--output" ],

    h: [ "--help", true ],

    v: [ "--version", true ],

    l: [ "--location" ]

};
```

### Shell Usage

```
#node-webcam will auto output the file type at the end

node-webcam --w 500 --h 500 --d 2 --l picture

```

### API Usage

``` javascript
//Available in nodejs

var NodeWebcam = require( "node-webcam" );


//Default options

var opts = {

    width: 1280,

    height: 720,

    delay: 0,

    quality: 100,

    output: "jpeg",

    verbose: true

}

var Webcam = NodeWebcam.create( opts );


//Will automatically append location output type

Webcam.capture( "test_picture" );
```

# Classes

## NodeWebcam

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

## Webcams

Base webcam class in which all other cameras inherit from

### Webcam.constructor( Object options )

```javascript
//Default options and basic usage

var opts = {

    width: 1280,

    height: 720,

    delay: 0,

    quality: 100,

    output: "jpeg",

    device: false,

    verbose: true

}

var cam = new Webcam( opts );
```

### Webcam.clone()

### Webcam.clear()

Reset data and memory of past shots

### Webcam.capture( String location, Object options, Function callback )

First param of callback will be a possible error or null. Second will return the location of the image or null. The following functions will follow similarly. This function will auto append the output type if not specified in file name.


### Webcam.getShot( Number shot, Function callback )

### Webcam.getLastShot( Function callback )

### Webcam.getBase64( Number|Buffer shot, Function callback )

Get base 64 of shot number or data already grabbed from FS.

### FSWebcam

Uses the fswebcam program. Available in linux (apt-get install fswebca). Extra program addons provided in options.

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
