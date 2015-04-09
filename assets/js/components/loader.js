;(function (window, app, require, undefined) {
	var $ = app.$, f = app.framework,

		_staic = Loader,
		_proto = _staic.prototype;

	function Loader (options) {
		var _this = this;

		_this.options = app.utils.extend(true, {}, _staic.defaults, options);

		_this.$loader = $('.app-loader');

		return _this;
	}

	_staic.defaults = {};

	_proto.start = function () {
		var _this = this;

		_this.$loader.removeClass('m-hidden');
	};

	_proto.stop = function () {
		var _this = this;

		_this.$loader.addClass('m-hidden');
	};

	module.exports = _staic;
})(window, window._app, window.require);