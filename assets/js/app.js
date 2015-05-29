;(function (window, undefined) {
	// Create base application object
	window._app = (window._app || {});

	var app = window._app,
		requireDir = require('require-dir');

	// jQuery copy
	app.$ = window.jQuery;

	// Knockout copy
	app.framework = window.ko;

	// Application structure
	app.utils = (app.utils || requireDir('./utils'));
		// Node utils
		app.utils.extend = require('extend');
		app.utils.hash = require('string-hash');

	app.config = (app.config || requireDir('./config'));
	app.models = (app.models || requireDir('./models'));
	app.components = (app.components || requireDir('./components'));

	// Initialize application
	app.init = function () {
		var $ = app.$;

		// Runtime
		app.runtime = {
			'navigation': new app.components.navigation({
				'navigationList': app.config.navigation
			}),
			'loader': new app.components.loader(),
			'connector': new app.components.connector(),
			'roster': new app.components.roster({
				'cameras': app.config.cameras
			})
		};

		app.runtime.roster.render();
	};
})(window || {});

// Export application
module.exports = window._app;