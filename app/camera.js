function Camera(options) {
    var _this = this;

    _this.cv = require('opencv');
    _this.extend = require('extend');
    _this.hash = require('string-hash');
    _this.deferred = require('promise-deferred');
    _this.consoleTimestamp = require('./consoleTimestamp.js');

    _this.activeCameras = {};
}

var _static = Camera,
    _proto = _static.prototype;

_proto.startCamera = function (configStr, callback) {
    var _this = this,
        cameraConfig = _this._readConfig(configStr),
        cameraId;

    if ( !cameraConfig.type ) {
        cameraConfig.type = 'webcam';
    }

    cameraId = 'cam_' + _this.hash(JSON.stringify(cameraConfig));

    // Return camera if already started
    if ( _this.activeCameras.hasOwnProperty(cameraId) ) {
        if ( typeof callback === 'function' ) {
            callback(_this.activeCameras[cameraId]);
        }
    }

    _this.activeCameras[cameraId] = _this.extend(true, {
        'id': cameraId,
        'config': cameraConfig
    }, (cameraConfig.type === 'ipcam' ? _this._startIpCam(cameraConfig) : _this._startWebCamera(cameraConfig)));

    _this.activeCameras[cameraId].getFrame = function () {
        return _this.getFrame(_this.activeCameras[cameraId]);
    };

    _this.activeCameras[cameraId].releaseCamera = function () {
        return _this.releaseCamera(_this.activeCameras[cameraId]);
    };

    if ( typeof callback === 'function' ) {
        callback(_this.activeCameras[cameraId]);
    }
};

_proto.getFrame = function (camera) {
    var _this = this,
        deferred = new _this.deferred();

    var image = camera.videostream.read(function (error, image) {
        if (error) {
            console.error(_this.consoleTimestamp() + 'Error while reading image from web camera', error);
        }

        var size = image.size();

        if (size[0] > 0 && size[1] > 0) {
            var imageCopy = image.copy();
            imageCopy.convertGrayscale();
            imageCopy.dilate(4);

            imageCopy.inRange([150, 150, 150], [255, 255, 255]);

            var contours = imageCopy.findContours();

            image.drawAllContours(contours, [200,70,70]);

            deferred.resolve(image);
        }
        else {
            deferred.reject(new Error('Got a blank image from camera'));
        }
    });

    return deferred.promise;
};

_proto.releaseCamera = function (camera) {
    var _this = this;

    camera.videostream.Close();
};

_proto._startWebCamera = function (config) {
    var _this = this,
        result = {};

    result.videostream = new _this.cv.VideoCapture(parseInt(config.index, 10));

    return result;
};

_proto._startIpCam = function (config) {
    var _this = this,
        result = {};

    // TODO: Add support for IP cameras
    result.videostream = undefined;

    return result;
};

_proto._readConfig = function (configStr) {
    var _this = this;

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

module.exports = _static;