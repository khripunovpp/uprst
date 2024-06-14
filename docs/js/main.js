(function (factory) {
    typeof define === 'function' && define.amd ? define(factory) :
    factory();
}(function () { 'use strict';

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

    $(function () {
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

        $('.service-item--hasChildren').on('click', function (e) {
            if (window.innerWidth > 991) return;
            var el = $(e.target).closest('.service-item--hasChildren');
            el.toggleClass('active');
            el.find('.service-item__children').slideToggle();
            e.preventDefault();
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

        $('body').on('click tap', function (e) {
            var insideInner = $(e.target).closest('.touch').length;
            if (!insideInner) {
                $touch.removeClass('opened');
            }
        });

        $('.year').text(new Date().getFullYear());

        var $touch = $('.touch');

        $('.touch__button').on('click', function (e) {
            $touch.toggleClass('opened');
        });

        $(window).on('scroll', function () {
            $touch.removeClass('opened');
        });
    });

}));
