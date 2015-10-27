﻿(function ($, document) {

    var guideController;

    function init(page, type) {

        Dashboard.showLoadingMsg();

        var apiClient = ApiClient;

        apiClient.getJSON(apiClient.getUrl('Startup/Configuration')).done(function (config) {

            var providerId = null;

            if ((config.LiveTvGuideProviderType || '').toLowerCase() == type.toLowerCase()) {
                if (config.LiveTvGuideProviderId) {
                    providerId = config.LiveTvGuideProviderId;
                }
            }

            var url = 'components/tvproviders/' + type.toLowerCase() + '.js';

            require([url], function (factory) {

                var instance = new factory(page, providerId, {
                    showCancelButton: false,
                    showSubmitButton: false,
                    showConfirmation: false
                });

                Dashboard.hideLoadingMsg();
                instance.init();
                guideController = instance;

                $(guideController).on('submitted', skip);
            });
        });
    }

    function loadTemplate(page, type) {

        guideController = null;

        ApiClient.ajax({

            type: 'GET',
            url: 'components/tvproviders/' + type + '.template.html'

        }).done(function (html) {

            var elem = page.querySelector('.providerTemplate');
            elem.innerHTML = Globalize.translateDocument(html);

            init(page, type);
        });
    }

    function skip() {
        var apiClient = ApiClient;

        apiClient.getJSON(apiClient.getUrl('Startup/Info')).done(function (info) {

            if (info.SupportsRunningAsService) {
                Dashboard.navigate('wizardservice.html');

            } else {
                Dashboard.navigate('wizardagreement.html');
            }

        });
    }

    function next() {
        guideController.submit();
    }

    function reload(page) {

        $('#selectType', page).trigger('change');
    }

    $(document).on('pageinit', "#wizardGuidePage", function () {

        var page = this;

        $('#selectType', page).on('change', function () {

            loadTemplate(page, this.value);
        });

        $('.btnSkip', page).on('click', skip);
        $('.btnNext', page).on('click', next);

    }).on('pageshow', "#wizardGuidePage", function () {

        var page = this;

        reload(page);
    });

})(jQuery, document, window);
