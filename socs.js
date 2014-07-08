/* Socs (pronounced as /soʊˈʃəz/, short for Socials) helps create social sharing widgets */

/*
    // you can set an element as a master
    // and all social buttons will use values from it's data attributes
    // otherwise socs will grab values from individual button data-attributes
    socs.sharing.config.metaElement = '.share-export-thing';


    // You can also override the submit function for each service, which can come in handy when use a service's SDK.
    socs.sharing.config.services.facebook.submit = function() {
        if (typeof FB != 'undefined') {
            var props = this.getShareProps();

            FB.ui(
              {
                method: 'feed',
                name: props.title,
                link: props.url,
                picture: props.image,
                caption: '',
                description: props.desc
              },
              function(response) {
                if (response && response.post_id) {
                  console.log('Post was published.');
                } else {
                  console.log('Post was not published.');
                }
              }
            );
        }

    };

    // once config is set, initialize
    socs.sharing();

*/

(function(exports) {
    'use strict';

    var stamen = exports.socs || (exports.socs = {});

    stamen.sharing = function(){
        var social = {},
            options = {};
        var items, first;

        // set options from config
        utils.extend(options, config);

        social.version = '0.0.1';


        // query DOM for anything matching options.selector
        // set up sharing service for each match
        var getItems = function() {
            var mp = (options.metaElement) ? d3.select(options.metaElement) : null;
            d3.selectAll(options.selector)
                .each(function(){
                    var item = d3.select(this),
                        type = item.attr('data-social-service');


                    if (config.services.hasOwnProperty(type)) {

                        var o = {};
                        o.elm = item;
                        o.type = type;
                        o.metaElement = mp;
                        o.defaults = options.defaults;

                        utils.extend(o, config.services[type]);
                        utils.extend(o, service);
                        items.push( o );

                        (function(o){
                            o.elm.on('click',null)
                                .on('click', function(){
                                    d3.event.preventDefault();
                                    o.click_();
                                    return false;
                                });
                        })(o);
                    }

                });
        };


        // Gathers sharing default properties from meta tags
        var getMetaDefaults = function() {

            if (utils.empty(options.defaults.url)) {
                options.defaults.url = window.location.href.replace(/#.*/, "" );
            }

            if (utils.empty(options.defaults.image)) {
                options.defaults.image = (d3.select('meta[property="og:image"]').node()) ? d3.select('meta[property="og:image"]').attr("content") : "";
            }

            if (utils.empty(options.defaults.title)) {
                options.defaults.title = (d3.select('meta[property="og:title"]').node()) ? d3.select('meta[property="og:title"]').attr("content") : document.title;
            }

            if (utils.empty(options.defaults.desc)) {
                options.defaults.desc = (d3.select('meta[property="og:description"]').node()) ? d3.select('meta[property="og:description"]').attr("content") : "";
            }

        };

        social.refresh = function() {
            if(!first) getMetaDefaults();

            items = [];
            getItems();
            if (!items) return;

            first = true;
        };

        // ...
        social.refresh();

        return social;
    };


    var config = stamen.sharing.config = {
        selector: '.social-item',
        metaElement: null,
        defaults: {
            url: "",
            image: "",
            title: "",
            caption: "",
            desc: ""
        },
        services: {}

    };

    // defaults
    config.services.facebook = {
        label: 'Facebook',
        url: 'http://www.facebook.com/sharer.php',
        method: 'sdk',
        metaProps: {
            url: 'u',
            title: 't'
        },
        miscProps: {
            locale: 'en_US'
        },
        dims: {
            w: 600,
            h: 450
        },
        submit: null
    };

    config.services.twitter = {
        label: 'Twitter',
        url: 'https://twitter.com/share',
        method: 'popup',
        metaProps: {
            url: 'url',
            title: 'text'
        },
        miscProps: {
            lang: 'en'
        },
        dims: {
            w: 600,
            h: 450
        },
        submit: null
    };

    config.services.google = {
        label: 'Google+',
        url: 'https://plus.google.com/share',
        method: 'popup',
        metaProps: {
            url: 'url'
        },
        miscProps: {
            hl: 'en_US'
        },
        dims: {
            w: 600,
            h: 450
        },
        submit: null
    };

    config.services.pinterest = {
        label: 'Pinterest',
        url: 'http://www.pinterest.com/pin/create/button/',
        method: 'popup',
        metaProps: {
            url: 'url',
            image: 'media',
            desc: 'description'
        },
        miscProps: {
        },
        dims: {
            w: 600,
            h: 450
        },
        submit: null
    };

    config.services.linkedin = {
        label: 'LinkedIn',
        url: 'http://www.linkedin.com/shareArticle?mini=true',
        method: 'popup',
        metaProps: {
            url: 'url',
            title: 'title',
            desc: 'summary'
        },
        miscProps: {},
        dims: {
            w: 600,
            h: 450
        },
        submit: null
    };




    var utils = stamen.sharing.utils = {
        __slice: [].slice,
        extend: function() {
            var consumer = arguments[0],
                providers = utils.__slice.call(arguments, 1),
                key,
                i,
                provider,
                except;

            for (i = 0; i < providers.length; ++i) {
                provider = providers[i];
                except = provider['except'] || [];
                except.push('except');
                for (key in provider) {
                    if (except.indexOf(key) < 0 && provider.hasOwnProperty(key)) {
                        consumer[key] = provider[key];
                    };
                };
            };
            return consumer;
        },
        // string & arrays only
        empty: function(p) {
            if (typeof p === "string" || p instanceof Array) {
                if(!p || !p.length) return true;
            }

            return false;
        }
    };

    var service = {
        popup: function(url, title, dims) {
            if (!url) return;

            var w = dims.w || 600,
                h = dims.h || 450;

            // Fixes dual-screen position
            var dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : screen.left;
            var dualScreenTop = window.screenTop !== undefined ? window.screenTop : screen.top;

            var width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
            var height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

            var left = ((width / 2) - (w / 2)) + dualScreenLeft;
            var top = ((height / 3) - (h / 3)) + dualScreenTop;

            var newWindow = window.open(url, title, 'scrollbars=yes, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);

            // Puts focus on the newWindow
            if (window.focus) {
                newWindow.focus();
            }
        },

        popupWithShortner: function(urlToShorten, shareUrl, title, dims) {
            if (!shareUrl) return;

            var w = dims.w || 600,
                h = dims.h || 450;

            // Fixes dual-screen position
            var dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : screen.left;
            var dualScreenTop = window.screenTop !== undefined ? window.screenTop : screen.top;

            var width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
            var height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

            var left = ((width / 2) - (w / 2)) + dualScreenLeft;
            var top = ((height / 3) - (h / 3)) + dualScreenTop;

            var window_content = [
            '<!DOCTYPE HTML>',
            '<html><head>',
            '<script src="http://d3js.org/d3.v3.min.js" charset="utf-8"></scri','pt>',

            '<script type="text/javascript">',
            'function loadShortUrl() {',
                'd3.json("http://is.gd/create.php?format=json&url=',encodeURIComponent(urlToShorten),'", function(e,v){',
                    'if (e) {',
                        'shortenCB("',urlToShorten,'");',
                    '} else {',
                        'shortenCB(v.shorturl);',
                    '}',
                '})',
             '}',
            'function shortenCB(u){',
                'var shareUrl="',shareUrl,'";',
                'shareUrl = shareUrl.replace("{url}",encodeURIComponent(u));',
                'window.location.href = shareUrl;',
            '}',
            '</scri','pt>',
            '</head>',
            '<body onload="loadShortUrl();">',
            '</body></html>'].join('');

            var newWindow = window.open('', title, 'toolbar=0,status=0,height=' + h + ',width=' + w + ',scrollbars=yes,resizable=yes');
            newWindow.document.write(window_content);
            newWindow.document.close(); // needed for chrome and safari

            // Puts focus on the newWindow
            if (window.focus) {
                newWindow.focus();
            }
        },

        getShareProps: function() {
            if (!this.elm || !this.defaults) return null;
            console.log('this.metaElement-> ', this.metaElement);

            var p = {};
            for (var opt in this.defaults) {
                var dataKey = 'data-social-' + opt;
                var el = (this.metaElement) ? this.metaElement : this.elm;
                p[opt] = (el.attr(dataKey)) ? el.attr(dataKey) : this.defaults[opt];
            }

            return p;

        },

        makeURL: function() {
            var data = this.getShareProps(),
                url = this.url,
                params = [],
                p;

            if (this.metaProps) {
                for (p in this.metaProps) {
                    if (data[p]) params.push(this.metaProps[p] + '=' + encodeURIComponent(data[p]));
                }
            }

            if (this.miscProps) {
                for (p in this.miscProps) {
                    params.push( p + '=' + encodeURIComponent(this.miscProps[p]));
                }
            }

            params = params.join("&");

            url += (url.indexOf('?') !== -1) ? '&' : '?';
            url += params;

            return url;
        },

        makeURLWithPlaceholder: function() {
            var data = this.getShareProps(),
                url = this.url,
                params = [],
                p;

            if (this.metaProps) {
                for (p in this.metaProps) {
                    if (data[p]) {
                        if (p == 'url') {
                            params.push(this.metaProps[p] + '={url}');
                        } else {
                            params.push(this.metaProps[p] + '=' + encodeURIComponent(data[p]));
                        }

                    }
                }
            }

            if (this.miscProps) {
                for (p in this.miscProps) {
                    params.push( p + '=' + encodeURIComponent(this.miscProps[p]));
                }
            }

            params = params.join("&");

            url += (url.indexOf('?') !== -1) ? '&' : '?';
            url += params;

            return url;
        },

        click_: function() {
            var url,
                that = this;
            switch (this.method) {
                case 'popup':
                case 'popupWithShortner':
                    var data = this.getShareProps();

                    if (this.method === 'popup') {
                        url = this.makeURL();
                        this.popup(url, this.label, this.dims);
                    } else {
                        url = this.makeURLWithPlaceholder();
                        this.popupWithShortner(data.url, url, this.label, this.dims);
                    }

                break;

                case 'sdk':
                    if (this.hasOwnProperty('submit') && typeof this.submit === 'function') {
                        this.submit();
                    }
                break;
            }


        }
    };


})(this);