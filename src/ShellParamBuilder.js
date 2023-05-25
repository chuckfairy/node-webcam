/**
 * Param builder helper
 *
 * @class ShellParamBuilder
 * @constructor
 */
"use strict";


module.exports = function ShellParamBuilder() {

    var scope = this;

    var params = [];


    /**
     * Prefix to append to shell key
     *
     * @property {String} prefix
     */

    scope.prefix = "--";


    /**
     * Key value separator for key to value in shell args
     *
     * @property {String} keyValueSeparator
     */

    scope.keyValueSeparator = " ";


    /**
     * toString main output method
     *
     * @method toString
     *
     * @return String
     */

    scope.toString = function() {
        return params.join(" ");
    }


    /**
     * Add shell build opt
     *
     * @method add
     *
     * @param {String} key to get possible prefix
     * @param {String} value
     * @param {String} noValue option to put if nothing passed in value
     *
     */

    scope.add = function(key, value, noValue) {
        if( value === null ) {
            if( noValue ) {
                params.push(noValue);
            }

            return;
        }

        params.push(
            scope.prefix + key
            + scope.keyValueSeparator + value
        );
    }


    /**
     * Add raw to output
     *
     * @method addRaw
     *
     * @param {String} value
     *
     */

    scope.addRaw = function(value) {
        params.push(value);
    }
}
