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
			var $item = _this.$player.closest('.app-roster-item'),
				imageData = JSON.parse(event.data),
				image = new window.Image(),
				canvasImageSize = [Math.floor(638 / 2), Math.floor(359 / 2)],
				movementHighlight = {
					strokeStyle: '#fff',
					strokeWidth: 1,
					layer: true,
					name: 'movement'
				},
				flameHighlight,
				smokeHighlight;

			image.src = imageData.content;

			if ( imageData.detection.movement ) {
				movementHighlight = $.extend(true, movementHighlight, _this._getPathDataFromDetection(imageData.detection.movement));
			}

			image.onload = function () {
				if ($item.hasClass('active')) {
					_this.$player
						.removeLayer('frame')
						.removeLayer('movement')
						.clearCanvas()
						.drawImage({
							source: image,
							layer: true,
							name: 'frame',
							fromCenter: false/*,
							width: Math.floor(_this.$player.innerWidth() / 2),
							height: Math.floor(_this.$player.innerHeight() / 2)*/
						})
						.drawPath(movementHighlight);
				}

				// Free memory to prevent client memory leak
				delete this;
			};
		};
	};

	_proto._getPathDataFromDetection = function (detectionObject) {
		var _this = this,

			iterator = 1,
			result = {};

		for (var contour in detectionObject) {
			if ( detectionObject.hasOwnProperty(contour) ) {
				result['p' + iterator] = {
					type: 'line',
					closed: true,
					rounded: true
				};

				for (var point = 0; point < detectionObject[contour].length; point++) {
					result['p' + iterator]['x' + (point + 1)] = detectionObject[contour][point][0];
					result['p' + iterator]['y' + (point + 1)] = detectionObject[contour][point][1];
				}

				iterator++;
			}
		}

		return result;
	};

	_proto.setPlayer = function ($player) {
		var _this = this;

		_this.$player = $player;

		_this.$player
			.restoreCanvas()
			.scaleCanvas({
				x: 0, y: 0,
				scaleX: .47, scaleY: .315
			});
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