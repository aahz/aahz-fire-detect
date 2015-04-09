/**
 * Template engine utility
 *
 * @param {string} template Template string
 * @param {Object} replaceObject List of replaces.
 * @returns {string}
 */
module.exports = function (template, replaceObject) {
    for (var replace in replaceObject) {
        if ( replaceObject.hasOwnProperty(replace) ) {
            var replaceRegex = new RegExp('\{' + replace + '\}', 'gi');
            template = template.replace(replaceRegex, replaceObject[replace]);
        }
    }

    return template;
};