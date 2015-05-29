;(function (window, app, require, undefined) {
    var $ = app.$, f = app.framework,

        _staic = Connector,
        _proto = _staic.prototype;

    function Connector(options) {
        var _this = this;

        _this.options = $.extend(true, {}, _staic.defaults, options);

        _this.$app = $('.app-page');

        _this.$modal = _this._buildLoadingModal().appendTo('body');

        _this.$app
            .on('connection-open', function () {
                _this.stop();
            })
            .on('connection-close connection-error', function () {
                _this.start();
            });

        return _this;
    }

    _staic.defaults = {};

    _proto._buildLoadingModal = function () {
        return $(
            '<div class="app-connector modal">' +
                '<div class="modal-content center-align">' +
                    '<h5><i class="mdi-communication-portable-wifi-off"></i> Нет подключения</h5>' +
                    '<br/>' +
                    '<div class="preloader-wrapper big active">' +
                        '<div class="spinner-layer spinner-yellow-only">' +
                            '<div class="circle-clipper left">' +
                                '<div class="circle" />' +
                            '</div>' +
                            '<div class="gap-patch">' +
                                '<div class="circle" />' +
                            '</div>' +
                            '<div class="circle-clipper right">' +
                                '<div class="circle" />' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                    '<br/>' +
                    '<p>' +
                        'Для запуска убедитесь, что сервер <strong>FDSS</strong> запущен и не блокируется брандмаурем.' +
                        '<br/>' +
                        'Запустите сервер, затем перезапустите приложение.' +
                    '</p>' +
                '</div>' +
            '</div>'
        );
    };

    _proto.start = function () {
        var _this = this;

        _this.$modal.openModal();
    };

    _proto.stop = function () {
        var _this = this;

        _this.$modal.closeModal();
    };

    module.exports = _staic;
})(window, window._app, window.require);