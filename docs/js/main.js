var main = (function (exports) {
    'use strict';

    window.isMobile = function () {
        return window.matchMedia('(max-width: 991px)').matches;
    };

    function Dialog() {
        this.$_overlay = $('.overlay');
        this.$_body = $('body');
    }

    Dialog.prototype.init = function () {
        var that = this;
        $('.js-open-dialog').on('click', function (e) {
            e.preventDefault();
            var _dialogId = $(e.target).closest('.js-open-dialog').attr('data-dialog-id');

            that.show.call(that, _dialogId);
        });

        $('.js-close-dialog').on('click', function (e) {
            var _dialogId = $(e.target).closest('.popup').attr('data-dialog-id');
            that.close.call(that, _dialogId);
        });

    };

    Dialog.prototype.overlayDisplay = function (cb) {
        this.$_overlay.fadeIn(200, function () {
            typeof cb === 'function' && cb();
            window.lazyInstance.update();
        });
    };

    Dialog.prototype.show = function (id, withOverlay = true) {
        var _target = $('.popup[data-dialog-id="' + id + '"]');
        this.$_body.addClass('popup-opened');
        if (withOverlay) {
            this.overlayDisplay(function () {
                _target.fadeIn(0, function () {
                    _target.addClass('opened');
                });
            });
        } else {
            _target.fadeIn(0, function () {
                _target.addClass('opened');
            });
        }
    };

    Dialog.prototype.close = function (id, withOverlay = true, cb) {
        var that = this;
        var _target = $('.popup[data-dialog-id="' + id + '"]');
        _target.fadeOut(200, function () {
            _target.removeClass('opened');
            if (withOverlay) {
                that.$_overlay.fadeOut(200);
                that.$_body.removeClass('popup-opened');
            }
            typeof cb === 'function' && cb();
        });
    };


    function Forms() {
        this.$_submit = $('.form__submit');
        this.$_form = $('form');
    }

    Forms.prototype.init = function (deps) {
        var _dialogs = deps['dialogs'];
        var fieldsQuery = '.form__field,.form__checkbox';
        var _that = this;
        _that.$_submit.on('click', function (e) {
            e.preventDefault();

            var $_form = $(e.target).closest('form');
            var _dialogID = $_form.closest('.popup[data-dialog-id]').attr('data-dialog-id');
            var _url = $_form[0].action;
            var _value = $_form.serialize();
            var _formValues = $_form[0].elements;

            hideErrors();

            if (window.location.hostname === 'localhost' || _that.checkCaptcha(_formValues)) {
                $_form.removeClass('invalid-captcha');
                var errors = _that.getFieldWithErrors(_formValues);

                if (!errors.length) {
                    loading(true);
                    $_form.submit();

                } else {
                    setTimeout(showError, 100);
                }
            } else {
                $_form.addClass('invalid-captcha');
                $_form.removeClass('valid-captcha');
            }

            function showError() {
                var errors = _that.getFieldWithErrors(_formValues);
                errors.forEach(function (el) {
                    var input = $(_formValues[el]);
                    input.closest(fieldsQuery).addClass('has-error');
                    input.addClass('error');
                });
                loading(false);
            }

            function loading(show) {
                $_form.closest('.js-loading-wrapper').toggleClass('loading', show);
            }
        });

        _that.$_form.on('change', function () {
            hideErrors();
        });


        function hideErrors() {
            _that.$_form.find(fieldsQuery).removeClass('has-error');
            _that.$_form.find('.error').removeClass('error');
        }
    };

    Forms.prototype.getFieldWithErrors = function (elements) {
        var _fields = [];
        elements['name'].value === '' && _fields.push('name');
        elements['phone'].value === '' && _fields.push('phone');
        elements['agree'].checked === false && _fields.push('agree');
        return _fields;
    };

    Forms.prototype.checkCaptcha = function (elements) {
        if (typeof window['getCaptchaResponse'] === 'function' && elements['g-recaptcha-id']) {
            return !!getCaptchaResponse(elements['g-recaptcha-id'].value);
        }
        return true;
    };

    Forms.prototype.reset = function (elements) {
        elements['name'].value = '';
        elements['phone'].value = '';
        elements['g-recaptcha-id'] && window.resetCaptcha(elements['g-recaptcha-id'].value);
    };

    function HeaderComponent() {
        this.$_header = $('.js-sticky-header');
        this._headerHeight = 0;
        this._openClass = 'nav-open';
        this._lastScrollPosition = 0;
        this.burger$ = $('.burger');
        this.headerNav$ = this.$_header.find('.header__nav');
        this.headerNavBottom$ = this.headerNav$.find('.nav__bottom');
        this.debTimer;
    }

    HeaderComponent.prototype.init = function () {
        var that = this;
        that.$_header.addClass('show');
        that.$_header.css({
            position: 'fixed',
            top: 0,
            left: 0,
            width: "100%",
            zIndex: 5
        });
        that.setHeaderHeight.call(that);
        that.setNavHeight.call(that);
        that.setAnimationProps.call(that);

        var currentScrollPosition = $(window).scrollTop();

        $(window).on('scroll', function () {
            that.toggleMenu.call(that, false);
            if (that.debTimer) {
                clearTimeout(that.debTimer);
            }
            that.debTimer = setTimeout(function () {
                currentScrollPosition = window.scrollY != null ? window.scrollY : $(window).scrollTop();

                that.setHeaderHeight.call(that);

                if (currentScrollPosition < that._headerHeight) {
                    that.$_header.removeClass(['glow']);
                    that.show.call(that, false);
                    return false;
                }

                if (that._lastScrollPosition > currentScrollPosition) {
                    that.show.call(that);
                } else if (that._lastScrollPosition < currentScrollPosition) {
                    that.hide.call(that);
                }

                that._lastScrollPosition = currentScrollPosition;
            }, 15);
        });

        $(window).on('resize', function () {
            that.setHeaderHeight.call(that);
            that.setNavHeight.call(that);
            that.setAnimationProps.call(that);
        });

        that.burger$.on('click', function (e) {
            that.toggleMenu.call(that);
        });
    };

    HeaderComponent.prototype.setHeaderHeight = function () {
        this._headerHeight = this.$_header.outerHeight();
        $('body').css({
            paddingTop: this._headerHeight + "px"
        });
    };

    HeaderComponent.prototype.setNavHeight = function () {
        this.headerNav$.css({
            top: window.isMobile()
                ? this._headerHeight + "px"
                : 'auto',
            height: window.isMobile()
                ? (window.innerHeight - this._headerHeight) + "px"
                : 'auto'
        });
    };

    HeaderComponent.prototype.setAnimationProps = function () {
        var items = Array.from(this.headerNav$.find('li'))
            .concat(Array.from(this.headerNavBottom$.children()));

        items.forEach(function (item, index) {
            $(item).css({
                transitionDelay: window.isMobile()
                    ? index * 50 + 100 + "ms"
                    : '0ms',
            });
        });
    };

    HeaderComponent.prototype.show = function (withShadow) {
        var withShadow = withShadow != null ? withShadow : true;
        this.$_header.addClass(['show', withShadow ? 'glow' : '']);
        this.$_header.css({
            transform: "translate3d(0, 0, 0)",
        });
    };

    HeaderComponent.prototype.hide = function () {
        this.$_header.removeClass(['show', 'glow']);
        this.$_header.css({
            transform: "translate3d(0, -" + this._headerHeight + "px, 0)",
        });
    };

    HeaderComponent.prototype.toggleMenu = function (show) {
        this.burger$.toggleClass(this._openClass, show);
        $('body').toggleClass(this._openClass, show);
    };


    $(function () {
        new HeaderComponent().init();

        window.lazyInstance = $('.lazy').Lazy({
            effect: 'fadeIn',
            effectTime: 300,
            chainable: false,
            threshold: 0,
            afterLoad: function (element) {
                $(element).closest('.lazy-wrapper').addClass('is-loaded');
                typeof cb === 'function' && cb();
            },
        });

        var forms = new Forms();
        var dialogs = new Dialog();
        dialogs.init();
        forms.init({
            dialogs: dialogs
        });

        $('.popup').on('click tap', function (e) {
            var insideInner = $(e.target).closest('.popup__inner').length;
            if (!insideInner) {
                var _dialogId = $(e.target).closest('.popup').attr('data-dialog-id');
                dialogs.close.call(dialogs, _dialogId);
            }
        });
    });

    exports.HeaderComponent = HeaderComponent;

    return exports;

}({}));
