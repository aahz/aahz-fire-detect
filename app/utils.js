var console = require('./console.js'),
    utils = {};

utils.forceGC = function () {
    var memory = process.memoryUsage(),
        rss = memory.rss / 1024 / 1024,
        memoryLeakLimit = 450;

    if ( rss > memoryLeakLimit ) {
        console.log('Memory leak detected from server (' + rss.toFixed(1) + ' Mb)');

        if ( typeof global.gc === 'function' ) {
            console.write('--- Forcing garbage collector');
            global.gc();
        }
        else {
            console.write('--- Cannot get access to garbage collector.');
        }
    }
};

utils.parseConfigString = function (configStr) {
    if ( typeof configStr === 'string' ) {
        var config = {},
            tempConfigArray = configStr.split(';');

        for (var i = 0, ic = tempConfigArray.length - 1; i <= ic; i++ ) {
            var tempConfig = tempConfigArray[i].split('=');

            if ( typeof tempConfig[1] !== 'undefined' ) {
                config[tempConfig[0]] = tempConfig[1];
            }
        }
    }

    return config;
};

module.exports = utils;