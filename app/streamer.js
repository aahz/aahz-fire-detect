var InfiniteLoop = require('infinite-loop');

function Streamer () {
    return this;
}

var _static = Streamer,
    _proto = _static.prototype;

_proto._getFrequency = function (fps) {
    return (fps !== undefined ? Math.round(1000 / parseInt(fps, 10)) : 100);
};

_proto.getLoop = function (fps, task, handleError) {
    var _this = this,
        loop;

    if (!fps || !task) {
        throw new Error('FPS or task not set for streamer');
    }

    loop = new InfiniteLoop;

    if (typeof handleError === 'function') {
        loop.onError(handleError);
    }

    return loop.setInterval(_this._getFrequency(fps)).add(task);
};

module.exports = _static;