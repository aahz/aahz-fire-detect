var DataUri = require('datauri'),
    converter =  new DataUri();

module.exports = function (format, image) {
    var formattedData = converter.format(format, image.toBuffer());

    return formattedData;
};