/**
 * Shared camera utils
 *
 */
"use strict";

var OS = require( "os" );

var FS = require( "fs" );


var CameraUtils = {

    getCameras: function( callback ) {

        switch( CameraUtils.Platform ) {

            case "linux": case "darwin":
                return CameraUtils.getLinuxCameras( callback );


        }

    },


    //Linux cameras read /dev dir

    getLinuxCameras: function( callback ) {

        var reg = /^video/i;

        var dir = "/dev/";

        FS.readdir( dir, function( err, data ) {

            if( err ) { throw err; }

            var cams = [];

            var dl = data.length;

            for( var i = 0; i < dl; i ++ ) {

                var camPath = data[ i ];

                if( camPath.match( reg ) ) {

                    cams.push( dir + camPath );

                }

            }

            callback && callback( cams );

        });

    }

};

CameraUtils.Platform = OS.platform();

module.exports = CameraUtils;
