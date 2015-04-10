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

module.exports = utils;