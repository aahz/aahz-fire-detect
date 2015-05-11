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

_proto.setFrames = function (image) {
    var _this = this;

    _this.frames.previous = _this.frames.current;
    _this.frames.current = image;
};

_proto._isDetectionAllowed = function () {
    var _this = this;

    return (_this.frames.previous !== undefined);
};

_proto._getMovementImage = function (image) {
    var _this = this,
        processedImage = new cv.Matrix(image.width(), image.height());

    if ( _this._isDetectionAllowed() ) {
        var diff1 = new cv.Matrix(image.width(), image.height()),
            diff2 = new cv.Matrix(image.width(), image.height());

        diff1.absDiff(_this.frames.previous.copy(), image);
        diff2.absDiff(_this.frames.current.copy(), image);

        processedImage.bitwiseAnd(diff1, diff2);
    }

    return processedImage;
};

_proto.detectMotion = function (image) {
    var _this = this,
        result = {};

    if ( _this._isDetectionAllowed() ) {
        var processedImage = _this._getMovementImage(image),
            contours;

        processedImage.convertGrayscale();
        processedImage = processedImage.threshold(60, 255, "Binary");
        processedImage.dilate(1.5);

        contours = processedImage.findContours();

        for (var c = 0; c < contours.size(); ++c) {
            result['contour' + c] = [];

            for (var i = 0; i < contours.cornerCount(c); ++i) {
                var point = contours.point(c, i);

                result['contour' + c].push([point.x, point.y]);
            }
        }
    }

    return result;
};

_proto.detectFlame = function (image) {
    var _this = this,
        result = {};

    if ( _this._isDetectionAllowed() ) {
        var processedImage = _this._getMovementImage(image),
            contours;

        processedImage.convertGrayscale();
        processedImage = processedImage.threshold(100, 250, "Binary");
        processedImage.dilate(1.1);

        contours = processedImage.findContours();

        for (var c = 0; c < contours.size(); ++c) {
            result['contour' + c] = [];

            for (var i = 0; i < contours.cornerCount(c); ++i) {
                var point = contours.point(c, i);

                result['contour' + c].push([point.x, point.y]);
            }
        }
    }

    return result;
};

_proto.detectSmoke = function (image) {
    var _this = this,
        result = {};

    if ( _this._isDetectionAllowed() ) {
        var processedImage = _this._getMovementImage(image),
            contours;

        processedImage.convertGrayscale();
        processedImage = processedImage.threshold(150, 255, "Binary");
        processedImage.dilate(0.1);

        contours = processedImage.findContours();

        for (var c = 0; c < contours.size(); ++c) {
            result['contour' + c] = [];

            for (var i = 0; i < contours.cornerCount(c); ++i) {
                var point = contours.point(c, i);

                result['contour' + c].push([point.x, point.y]);
            }
        }
    }

    return result;
};

module.exports = _static;