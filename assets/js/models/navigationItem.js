;(function (requre, undefined) {
	var _staic = NavigationItem,
		_proto = _staic.prototype;

	function NavigationItem(text, action) {
		if ( !text || !action ) {
			throw new Error('[model] parameters not set');
		}

		var _this = this;

		_this.text = text;
		_this.action = action;
	}

	module.exports = _staic;
})(window.require);