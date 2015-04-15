var betterConsole = require('better-console'),
    colors = require('colors'),
    consoleModule = {};

consoleModule.utils = {};

consoleModule.utils.getConsoleTimestamp = function () {
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

    return (data.date + '.' + data.month + '.' + data.year + ' ' + data.hours + ':' + data.minutes + ':' + data.seconds + '>').green;
};

consoleModule.write = function (string) {
    console.log(string);
};

consoleModule.log = function (string) {
    console.log(consoleModule.utils.getConsoleTimestamp(), string);
};

consoleModule.info = function (string) {
    console.log(consoleModule.utils.getConsoleTimestamp(), string.cyan);
};

consoleModule.warn = function (string) {
    console.log(consoleModule.utils.getConsoleTimestamp(), string.yellow);
};

consoleModule.error = function (string) {
    console.log(consoleModule.utils.getConsoleTimestamp(), string.red);
};

consoleModule.dir = function () {
    this.log('Dir data');
    console.dir.apply(this, arguments);
};

consoleModule.clear = function () {
    process.stdout.write('\u001B[2J\u001B[0;0f');
};

consoleModule.time = function () {
    console.time.apply(this, arguments);
};

consoleModule.timeEnd = function(){
    console.timeEnd.apply(this, arguments);
};

consoleModule.count = function(toCount){
    var toCountString = toCount.toString && toCount.toString(),
        log;

    if (countBuffer[toCountString] == null){
        countBuffer[toCountString] = 0;
    }else{
        countBuffer[toCountString] += 1;
    }

    log = toCountString + ': ' + countBuffer[toCountString].magenta;

    this.log(log);
};

consoleModule.table = function () {
    betterConsole.table(arguments);
};

module.exports = consoleModule;