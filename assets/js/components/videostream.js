;(function (window, app, require, undefined) {
	var $ = app.$, f = app.framework,

		_staic = Videostream,
		_proto = _staic.prototype;

	function Videostream (options) {
		var _this = this;

		_this.options = app.utils.extend(true, {}, _staic.defaults, options);

		_this._registerClient();

		return _this;
	}

	_staic.defaults = {
		'server': {
			'url': 'localhost',
			'port': 6374,
			'protocol': 'videostream-webcam-protocol'
		},
		'type': 'webcam', // Only allow webcam for now. TODO: Add support for ipcam
		'connection': 0,  // Index of webcam or connection for ipcam
		'fps': 15
	};

	_proto._registerClient = function () {
		var _this = this,
			Websocket = require('websocket').w3cwebsocket;

		_this.client = new Websocket('ws://' + _this.options.server.url + ':' + _this.options.server.port + '/', _this.options.server.protocol);

		_this.client.onerror = function() {
			console.error(_this.options.server.protocol + ': Connection error');
		};

		_this.client.onopen = function() {
			console.info(_this.options.server.protocol + ': Connected to server');
		};

		_this.client.onclose = function() {
			console.info(_this.options.server.protocol + ': Client closed connection');
		};

		_this.client.onmessage = function(event) {
			_this.$player.clearCanvas();

			var $item = _this.$player.closest('.app-roster-item');

			if ( $item.hasClass('active') ) {
				_this.$player.drawImage({
					source: event.data,
					layer: true,
					name: 'frame',
					fromCenter: false,
					width: Math.floor(638 / 2),
					height: Math.floor(359 /2)
				});
			}
		};
	};

	_proto.setPlayer = function ($player) {
		var _this = this;

		_this.$player = $player;
	};

	_proto.getPlayer = function () {
		var _this = this;

		return _this.$player;
	};

	_proto.setConnectionConfig = function (config) {
		var _this = this,
			tempArray = [];

		if ( typeof config === 'string' ) {
			_this.configStr = config;
			return;
		}

		for (var item in config) {
			if ( config.hasOwnProperty(item) ) {
				tempArray.push(item + '=' + config[item]);
			}
		}

		_this.configStr = tempArray.join(';');
	};

	module.exports = _staic;
})(window, window._app, window.require);