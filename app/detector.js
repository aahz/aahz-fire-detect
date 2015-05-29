var cv = require('opencv'),
    extend = require('extend');

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

        diff1.absDiff(_this.frames.current.copy(), image);
        diff2.absDiff(_this.frames.previous.copy(), image);

        processedImage.bitwiseAnd(diff1, diff2);
    }

    return processedImage;
};

_proto._getRawContours = function (image) {
    image.convertGrayscale();
    image = image.threshold(60, 255, "Binary");
    image.dilate(1.5);

    return image.findContours();
};

_proto._getPreparedContoursData = function (contours) {
    var result = {};

    for (var c = 0; c < contours.size(); c++) {
        result['contour' + c] = [];

        for (var i = 0; i < contours.cornerCount(c); ++i) {
            var point = contours.point(c, i);

            result['contour' + c].push([point.x, point.y]);
        }
    }

    return result;
};

_proto._getContoursData = function (image) {
    var _this = this;

    return _this._getPreparedContoursData(_this._getRawContours(image));
};

_proto._isPossibleFireColor = function (point) {
    var breakLine = {
            red: 180,
            saturation: 65,
            value: 150
        },
        fireColorMask = (point.red > breakLine.red && point.red > point.green && point.green > point.blue),
        saturation = (point.value > breakLine.value && point.saturation > breakLine.saturation && fireColorMask ? point.saturation : 0);

    return saturation;
};

_proto.detectMotion = function (image) {
    var _this = this,
        result = {};

    if ( _this._isDetectionAllowed() ) {
        var processedImage = _this._getMovementImage(image);

        result = extend({}, result, _this._getContoursData(processedImage));
    }

    return result;
};

_proto.detectFlame = function (image, detectionBase) {
    var _this = this,
        result = {};

    if ( !detectionBase || typeof detectionBase !== 'string' ) {
        detectionBase = 'common';
    }

    if ( _this._isDetectionAllowed() ) {
        var originalImageSize = image.size(),

            resizedImage = image.copy(),
            resizedImageHSV,
            resizedImageSize,

            movementImage,
            movementImageContours,

            resultMatrix,
            contours;

        if ( originalImageSize[0] < 1 || originalImageSize[1] < 1 ) {
            throw new Error('Got a blank image');
        }

        movementImage = _this._getMovementImage(image);

        movementImage.resize(Math.floor(originalImageSize[1] / 5), Math.floor(originalImageSize[0] / 5));
        resizedImage.resize(Math.floor(originalImageSize[1] / 5), Math.floor(originalImageSize[0] / 5));

        resizedImageHSV = resizedImage.copy();
        resizedImageHSV.convertHSVscale();

        resultMatrix = resizedImage.copy();
        resizedImageSize = resizedImage.size();

        movementImage.dilate(5);
        movementImageContours = _this._getRawContours(movementImage);

        for (var x = 0, xc = resizedImageSize[0]; x < xc; x++) {
            for (var y = 0, yc = resizedImageSize[1]; y < yc; y++) {
                resultMatrix.pixel(x, y, [0, 0, 0]);
            }
        }

        if ( detectionBase === 'movement' ) {
            for (var i = 0, ic = movementImageContours.size(); i < ic; i++) {
                var boundingArea = movementImageContours.boundingRect(i);

                for (var x = boundingArea.y, xc = boundingArea.y + boundingArea.height; x < xc; x++) {
                    for (var y = boundingArea.x, yc = boundingArea.x + boundingArea.width; y < yc; y++) {
                        var pointRGB = resizedImage.pixel(x, y),
                            pointHSV = resizedImageHSV.pixel(x, y),
                            fireColor = _this._isPossibleFireColor({
                                red: pointRGB[2],
                                green: pointRGB[1],
                                blue: pointRGB[0],
                                hue: pointHSV[0],
                                saturation: pointHSV[1],
                                value: pointHSV[2]
                            });

                        resultMatrix.pixel(x, y, [fireColor, fireColor, fireColor]);
                    }
                }
            }
        }
        else {
            for (var x = 0, xc = resizedImageSize[0]; x < xc; x++) {
                for (var y = 0, yc = resizedImageSize[1]; y < yc; y++) {
                    var pointRGB = resizedImage.pixel(x, y),
                        pointHSV = resizedImageHSV.pixel(x, y),
                        fireColor = _this._isPossibleFireColor({
                            red: pointRGB[2],
                            green: pointRGB[1],
                            blue: pointRGB[0],
                            hue: pointHSV[0],
                            saturation: pointHSV[1],
                            value: pointHSV[2]
                        });

                    resultMatrix.pixel(x, y, [fireColor, fireColor, fireColor]);
                }
            }
        }

        // Reduce noise:
        resultMatrix.dilate(0.5);

        resultMatrix.resize(originalImageSize[1], originalImageSize[0]);

        contours = _this._getRawContours(resultMatrix);

        result = extend({}, result, _this._getPreparedContoursData(contours));
    }

    return result;
};

module.exports = _static;