var cv = require('opencv');

function Detector () {
    var _this = this;

    _this.frames = {
        'previous': undefined,
        'current': undefined
    };
}

var _static = Detector,
    _proto = _static.prototype;

_proto._setFrames = function (image) {
    var _this = this;

    _this.frames.previous = _this.frames.current;
    _this.frames.current = image;
};

_proto.detectMotion = function (image) {
    var _this = this;

    if ( _this.frames.previous ) {
        var diff1 = new cv.Matrix(image.width(), image.height()),
            diff2 = new cv.Matrix(image.width(), image.height()),
            processedImage = new cv.Matrix(image.width(), image.height()),
            contours, result = {};

        diff1.absDiff(_this.frames.previous, image);
        diff2.absDiff(_this.frames.current, image);

        processedImage.bitwiseAnd(diff1,diff2);
        processedImage.convertGrayscale();
        processedImage = processedImage.threshold(60, 255, "Binary");
        processedImage.dilate(1.3);

        contours = processedImage.findContours();

        for(var c = 0; c < contours.size(); ++c) {
            result['contour' + c] = [];

            for(var i = 0; i < contours.cornerCount(c); ++i) {
                var point = contours.point(c, i);

                result['contour' + c].push([point.x, point.y]);
            }
        }

        _this._setFrames(image);

        return result;
    }
    else {
        _this._setFrames(image);
    }

    return {};
};

module.exports = _static;