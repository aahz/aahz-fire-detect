;(function (window, app, require, undefined) {
	var $ = app.$, f = app.framework,

		_staic = Roster,
		_proto = _staic.prototype;

	function Roster (options) {
		var _this = this;

		_this.options = app.utils.extend(true, {}, _staic.defaults, options);

		_this.pageTemplate =
			'<div class="container">' +
				'<div class="col s12">' +
					'<ul class="collapsible popout app-roster" data-collapsible="accordion">' +
						'{ROSTER}' +
					'</ul>' +
				'</div>' +
			'</div>';

		_this.rosterItemTemplate =
			'<li class="app-roster-item app-roster-item__{UID}" data-uid="{UID}" data-connection="{CONNECTION}">' +
				'<div class="app-roster-item__header collapsible-header">' +
					'<i class="{ICON}"></i> ' +
					'{TITLE}' +
				'</div>' +
				'<div class="app-roster_item__body collapsible-body">' +
					'<canvas class="app-roster-item__player app-roster-item__player__{UID}" />' +
				'</div>' +
			'</li>';

		_this.videostream = new app.components.videostream();

		_this.rosterList = [];

		return _this;
	}

	_staic.defaults = {
		'cameras': [
			{
				'title': 'Встроенная камера',
				'type': 'webcam',
				'connection': 0
			}
		]
	};

	_proto.createItem = function (config) {
		var _this = this,
			icon = _this._getIcon(config.type),
			title = (config.title || (config.type === 'webcam' ? 'Веб камера' : 'IP камера')),
			uid = app.utils.hash(JSON.stringify(config)),
			connection = '';

		if ( typeof config.connection === 'object' ) {
			var tempArray = [];

			for (var item in config.connection) {
				if ( config.connection.hasOwnProperty(item) ) {
					tempArray.push(item + '=' + config.connection[item]);
				}
			}

			tempArray.push('uid=' + uid);

			connection = tempArray.join(';');
		}
		else {
			connection = 'index=' + config.connection;
		}

		result = {
			'uid': uid,
			'content': app.utils.templateEngine(_this.rosterItemTemplate, {
				'uid': uid,
				'icon': icon,
				'title': title,
				'connection': connection
			})
		};

		return result;
	};

	_proto._getIcon = function (type) {
		var _this = this,
			result = '';

		switch (type) {
			case 'webcam':
				result = 'mdi-image-camera-alt';
				break;
			case 'ipcam':
				result = 'mdi-image-camera';
				break;
			case 'clip':
				result = 'mdi-action-theaters';
				break;
		}

		return result;
	};

	_proto.render = function () {
		var _this = this,
			list = '';

		$.each(_this.options.cameras, function (index, cameraConfig) {
			var item = _this.createItem(cameraConfig);

			_this.rosterList.push(item);

			list += item.content;
		});

		_this.$rosterPage = $(app.utils.templateEngine(_this.pageTemplate, {
			'roster': list
		}));

		_this.$rosterPage.appendTo($('.app-page'));

		_this._setPlayerDimension();

		$(window).on('resize orientationchange', $.proxy(_this._setPlayerDimension, _this));

		_this._registerHandlers();
	};

	_proto._setPlayerDimension = function () {
		var _this = this;

		_this.$playersCollection = _this.$rosterPage.find('.app-roster-item__player');

		_this.$playersCollection.each(function (index, player) {
			var $player = $(player),
				$item = $player.closest('.app-roster-item');

			$player.css({
				'width': $item.innerWidth(),
				'height': $item.innerWidth() * 9 / 16
			})
		});
	};

	_proto._registerHandlers = function () {
		var _this = this;

		$(window.document).on('click', '.app-roster-item__header', $.proxy(_this._handleCameraChoice, _this));
	};

	_proto._handleCameraChoice = function (event) {
		var _this = this,
			$item = $(event.target).closest('.app-roster-item');

		_this.videostream.setPlayer($item.find('.app-roster-item__player'));

		if ( $item.hasClass('active') ) {
			// Stop existing playback
			_this.videostream.client.send('release');
			_this.videostream.client.send('start|' + $item.data('connection'));
		}
		else {
			_this.videostream.client.send('stop|' + $item.data('uid'));
		}
	};

	module.exports = _staic;
})(window, window._app, window.require);