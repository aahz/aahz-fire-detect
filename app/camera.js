var Deferred = require('promise-deferred'),
    cv = require('opencv'),
    extend = require('extend'),
    hash = require('string-hash'),
    utils = require('./utils.js');

function Camera() {
    var _this = this;

    _this.activeCameras = {};
}

var _static = Camera,
    _proto = _static.prototype;

_proto.startCamera = function (configStr, callback) {
    var _this = this,
        cameraConfig = utils.parseConfigString(configStr),
        cameraId;

    if ( !cameraConfig.type ) {
        cameraConfig.type = 'webcam';
    }

    cameraId = 'cam_' + hash(JSON.stringify(cameraConfig));

    // Return camera if already started
    if ( _this.activeCameras.hasOwnProperty(cameraId) ) {
        if ( typeof callback === 'function' ) {
            callback(_this.activeCameras[cameraId]);
        }
    }

    _this.activeCameras[cameraId] = extend(true, {
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
        deferred = new Deferred(),
        image;

    try {
        image = camera.videostream.ReadSync();

        var size = image.size();

        if (size[0] > 0 && size[1] > 0) {
            deferred.resolve(image);
        }
        else {
            deferred.reject(new Error('Got a blank image from camera'));
        }
    }
    catch (error) {
        deferred.reject(error);
    }

    // Forcing garbage collector to prevent server memory leak
    image = undefined;
    utils.forceGC();

    return deferred.promise;
};

_proto.releaseCamera = function (camera) {
    var _this = this;

    camera.videostream.Close();
};

_proto._startWebCamera = function (config) {
    var _this = this,
        result = {};

    result.videostream = new cv.VideoCapture(parseInt(config.index, 10));

    return result;
};

_proto._startIpCam = function (config) {
    var _this = this,
        result = {};

    // TODO: Add support for IP cameras
    result.videostream = undefined;

    return result;
};

module.exports = _static;