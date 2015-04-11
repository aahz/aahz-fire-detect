var utils = {};

utils.getConsoleTimestamp = function () {
    var d = new Date(),
        data = {
            date: d.getDate(),
            month: d.getMonth(),
            year: d.getFullYear(),
            hours: d.getHours(),
            minutes: d.getMinutes(),
            seconds: d.getSeconds()
        };

    for (var part in data) {
        if ( data.hasOwnProperty(part) && (data[part] >= 0 && data[part] < 10) ) {
            data[part] = '0' + data[part];
        }
    }

    return data.date + '.' + data.month + '.' + data.year + ' ' + data.hours + ':' + data.minutes + ':' + data.seconds + '> ';
};

utils.forceGC = function () {
    var memory = process.memoryUsage(),
        rss = memory.rss / 1024 / 1024,
        memoryLeakLimit = 450;

    if ( rss > memoryLeakLimit ) {
        console.log(utils.getConsoleTimestamp() + 'Memory leak detected from server (' + rss.toFixed(1) + ' Mb)');

        if ( typeof global.gc === 'function' ) {
            console.log('--- Forcing garbage collector');
            global.gc();
        }
        else {
            console.log('--- Cannot get access to garbage collector.');
        }
    }
};

module.exports = utils;