/**
 * Shot struct
 *
 * @class Shot
 * @constructor
 * @param {String|null} location
 * @param {Buffer|null} data
 *
 */
"use strict";

function Shot( location, data ) {

    var scope = this;

    scope.location = location;
    scope.data = data;

};

Shot.prototype = {

    constructor: Shot,


    /**
     * Shot location
     *
     * @property location
     *
     * @type {String|null}
     *
     */

    location: null,


    /**
     * Shot data or buffer
     *
     * @property data
     *
     * @type {Buffer|null}
     *
     */

    data: null

};


// Export

module.exports = Shot;
