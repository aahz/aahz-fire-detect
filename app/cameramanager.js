var cv = require('opencv'),
    extend = require('extend'),
    hash = require('string-hash'),
    path = require('path'),
    fs = require('fs'),
    utils = require('./utils.js'),

    Streamer = require('./streamer.js'),
    EventBox = require('event-box');

function Camera() {
    var _this = this;

    _this.activeCameras = {};
}

var _static = Camera,
    _proto = _static.prototype;

_static.defaultFPS = 10;

_proto.startCamera = function (configStr) {
    var _this = this,
        cameraConfig = utils.parseConfigString(configStr),
        cameraId = 'cam_' + cameraConfig.uid,
        streamer,
        camera;

    if ( !cameraConfig.type ) {
        cameraConfig.type = 'webcam';
    }

    // Return camera if already started
    if ( _this.activeCameras.hasOwnProperty(cameraId) ) {
        if ( typeof callback === 'function' ) {
            callback(_this.activeCameras[cameraId]);
        }
    }

    streamer = new Streamer;

    _this.activeCameras[cameraId] = extend(true, {
        'id': cameraId,
        'config': cameraConfig
    }, _this._startCamera(cameraConfig.type, cameraConfig));

    camera = _this.activeCameras[cameraId];

    camera.observable = new EventBox(['frame', 'error']);

    camera.getFrameStreamEvents = function () {
        try {
            camera.observable.emit('frame', _this._getFrame(camera));
        }
        catch (error) {
            camera.observable.emit('error', error);
        }
    };

    camera.loop = streamer.getLoop((cameraConfig.fps || _static.defaultFPS),
        function () {
            camera.getFrameStreamEvents();
        },
        function () {
            camera.observable.emit('error', new Error('Videostream error occured for ' + cameraId));
        });

    camera.releaseCamera = function () {
        return _this._releaseCamera(camera);
    };

    return camera;
};

_proto._getFrame = function (camera) {
    var _this = this,
        image;

    // Forcing garbage collector to prevent server memory leak
    utils.forceGC();

    image = camera.videostream.ReadSync();

    var size = image.size();

    if (size[0] > 0 && size[1] > 0) {
        return image;
    }
    else {
        throw new Error('Got a blank image from camera');
    }
};

_proto._releaseCamera = function (camera) {
    var _this = this;

    camera.videostream.Close();
};

_proto._startCamera = function (type, config) {
    var _this = this,
        result = {
            videostream: undefined
        };

    switch (type) {
        case 'webcam':
            result = _this._startWebCamera(config);
            break;
        case 'ipcam':
            result = _this._startIpCamera(config);
            break;
        case 'clip':
            result = _this._startClipCamera(config);
            break;
    }

    return result;
};

_proto._startWebCamera = function (config) {
    var _this = this,
        result = {};

    result.videostream = new cv.VideoCapture(parseInt(config.index, 10));

    return result;
};

_proto._startIpCamera = function (config) {
    var _this = this,
        result = {};

    // TODO: Add support for IP cameras
    result.videostream = undefined;

    return result;
};

_proto._startClipCamera = function (config) {
    var _this = this,

        filePath = path.resolve(__dirname, '..', config.url),

        result = {
            videostream: undefined
        };

    if ( fs.existsSync(filePath) ) {
        result.videostream = new cv.VideoCapture(filePath);
    }

    return result;
};

module.exports = _static;