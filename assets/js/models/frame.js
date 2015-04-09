;(function (requre, undefined) {
	var _staic = Frame,
		_proto = _staic.prototype;

	function Frame(buffer) {
		var _this = this;

		_this.buffer = buffer;
	}

	_proto.getDataUri = function () {
		var _this = this,
			DataUri = requre('datauri'),
			converter = new DataUri();

		return converter.format('.jpg', _this.buffer);
	};

	module.exports = _staic;
})(window.require);