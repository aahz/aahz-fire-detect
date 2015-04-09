;(function (window, app, require, undefined) {
	var $ = app.$, f = app.framework,

		_staic = Navigation,
		_proto = _staic.prototype;

	function Navigation(options) {
		var _this = this;

		_this.options = $.extend(true, {}, _staic.defaults, options);

		_this.actions = [];

		if ( !_this.options.navigationList ) {
			_this.options.navigationList = {};
		}

		_this.builtList = _this._buildNavigationList();

		$($.proxy(_this._renderNavigation, _this));

		return _this;
	}

	_staic.defaults = {
		'navigationSelector': '.app-navigation',
		'navigationToggleSelector': '.app-navigation-toggle'
	};

	_proto._renderNavigation = function () {
		var _this = this;

		$(_this.options.navigationSelector).each(function (index, container) {
			$(container).html(_this.builtList);
		});

		_this._registerActions();
		_this._initSideNavigationToggle();
	};

	_proto._getNavigationItem = function (config) {
		return new app.models.navigationItem(config.text, config.action);
	};

	_proto._buildNavigationList = function () {
		var _this = this,
			result = '';

		$.each(_this.options.navigationList, function (index, item) {
			var navigationItem = _this._getNavigationItem(item);

			result += '<li><a href="' + navigationItem.action + '">' + navigationItem.text + '</a></li>';

			if ( navigationItem.action.indexOf('#') === 0 ) {
				_this.actions.push(navigationItem.action);
			}
		});

		return result;
	};

	_proto._initSideNavigationToggle = function () {
		var _this = this;

		$(_this.options.navigationToggleSelector).sideNav();
	};

	_proto._registerActions = function () {
		var _this = this;

		$.each(_this.actions, function (index, action) {
			$(_this.options.navigationSelector + ' a[href="' + action + '"]')
				.on('click', function(event) {
					event.preventDefault();
					var actionId = action.replace('#', '');

					if ( typeof _this.act[actionId] === 'function' ) {
						_this.act[actionId](event);
					}
				});
		});
	};

	// Navigation actions
	_proto.act = {};

	_proto.act.addCamera = function (event) {
		console.info('addCamera');
	};

	module.exports = _staic;
})(window, window._app, window.require);