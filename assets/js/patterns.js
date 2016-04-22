new Vue({

    el: 'html',

    data: {
        theme: {
            brand_color: '#FEA1AC',
            invert_text: true,
            background_color: '#F4F4F4',
            code_highlight_theme: 'solarized-dark'
        },
        assets: {
            css: [],
            js: []
        },
        font_libraries: {
            typekit_code: null,
            google_web_fonts: null,
            typography_web_fonts: null
        },
        active: {},
        open: {}
    },

    scrollWatch: true,

    ready: function() {
        this.loadDataFile();
    },

    methods: {

        /**
         * Reads the patterns.json file.
         */
        loadDataFile: function() {
            var _this = this;

            $.get('patterns.json', function(data) {
                _this.$data = data;
                _this.activeComponent = null;
                _this.activeGroup = null;
                _this.componentsLoaded = 0;

                _this.loadIntro();
                _this.setupGroups();
                _this.loadComponents();

                if (_this.font_libraries.typekit_code) {
                    _this.loadTypekit();
                }

                _this.scrollWatch();
            });
        },

        /**
         * Update URL hash.
         *
         * @param hash
         */
        updateHash: function(hash) {
            window.location.hash = hash;
        },

        openGroup: function(e) {
            var _this = this,
                group = $(e.target).parent('.ndpl-nav__item');

            if(group.hasClass('open')) {
                group.removeClass('open');
            } else {
                $('.ndpl-nav__item').removeClass('open');
                group.toggleClass('open');
            }
        },

        togglePalmNav: function(e) {
            //var _this = this,
            //    handle = $(e.target);
            //
            //console.log(handle);
            //
            //var body = $('body');
            //
            //// Toggle class on handle
            //handle.toggleClass('open');
            //
            //// Toggle classes on palm nav (finished cancels
            //// transition on close)
            //$('.ndpl-sidebar').toggleClass('open finished');
            //
            //// Toggle class on body (locks overflow to prevent
            //// scrolling)
            //body.toggleClass('js-nav-palm-open');
            //
            //// Disable scrolling on mobile
            //if(body.hasClass('js-nav-palm-open')) {
            //    $(document).bind('touchmove', function(e) {
            //        e.preventDefault();
            //    });
            //} else {
            //    $(document).unbind('touchmove');
            //}
        },

        scrollTo: function(e) {
            var _this = this;
            e.preventDefault();

            $('.ndpl-nav__child-title').removeClass('active');

            _this.scrollWatch = false;
            $('html, body').animate({
                scrollTop: $($(e.target).attr('href')).offset().top
            }, 600, 'swing', function() {
                $(e.target).addClass('active');
                _this.scrollWatch = true;
                _this.updateHash($(e.target).attr('href'));
            });
        },

        scrollWatch: function() {
            var _this = this;

            $(document).on('scroll', function(e) {
                var _document = this;

                $('.ndpl-component').each(function(index, value) {
                    var nextEl = $('.ndpl-component')[index + 1],
                        offsetBottom = nextEl === undefined ? $(_document).height() : $(nextEl).offset().top - 50;

                    if(_this.scrollWatch && $(_document).scrollTop() > $(this).offset().top - 50 && $(_document).scrollTop() < offsetBottom) {

                        $('.ndpl-nav__child-title').removeClass('active');
                        $('.ndpl-nav__child-title[href="#' + $(this).attr('id') + '"]').addClass('active');

                        $('.ndpl-nav__item').removeClass('open');
                        $('.ndpl-nav__child-title[href="#' + $(this).attr('id') + '"]').parents('.ndpl-nav__item').addClass('open');

                        _this.updateHash($(this).attr('id'));
                    }
                });
            });
        },

        /**
         * Loads TypeKit.
         */
        loadTypekit: function() {
            $.getScript('https://use.typekit.net/' + this.font_libraries.typekit_code + '.js', function() {
                try{Typekit.load({ async: true });}catch(e){};
            });
        },

        /**
         * Load intro Markdown.
         */
        loadIntro: function() {
            var _this = this;

            $.get('templates/intro.md', function(data) {
                _this.$set('intro', marked(data));
            })
        },

        /**
         * Load scripts.
         */
        loadScripts: function() {
            for (var i = 0; i < this.assets.js.length; i++) {
                $('body').append('<script src="' + this.assets.js[i] + '"></script>');
            }
        },

        /**
         * Setup component groups.
         */
        setupGroups: function() {

            // Loop through the groups
            for (var i = 0; i < this.groups.length; i++) {
                var group = this.groups[i];
                group.open = false;
                group.components = [];

                for (var j = 0; j < this.components.length; j++) {
                    if (this.components[j].group === group.name) {

                        // Add html and description properties to the component object.
                        this.$set('components[' + j + '].html', '');
                        this.$set('components[' + j + '].description', '');
                        this.$set('components[' + j + '].active', false);

                        group.components.push(this.components[j]);
                    }
                }
            }
        },

        /**
         * Load group components.
         */
        loadComponents: function() {
            for (var i = 0; i < this.groups.length; i++) {
                for (var j = 0; j < this.groups[i].components.length; j++) {
                    var component = this.groups[i].components[j];

                    this.loadComponent(component);
                }
            }
        },

        /**
         * Load component files.
         *
         * @param component
         */
        loadComponent: function(component) {
            var _this = this;

            // Get and set component markup
            $.get('components/' + component.group + '/' + component.name + '/markup.html', function(data) {
                component.html = data;
            }).always(function() {
                _this.incrementComponentsLoaded();
            });

            // Get and set component description
            $.get('components/' + component.group + '/' + component.name + '/description.md', function(data) {
                component.description = marked(data);
            }).always(function() {
                _this.incrementComponentsLoaded();
            });
        },

        /**
         * Increment components loaded.
         */
        incrementComponentsLoaded: function() {
            this.componentsLoaded += 1;

            if (this.componentsLoaded === this.components.length * 2) {

                 // Load custom JavaScripts
                this.loadScripts();

                // Initialize code highlighting
                $('pre code').each(function(i, block) {
                    hljs.highlightBlock(block);
                });
            }
        },

        setActiveComponent: function() {},

        setOpenGroup: function() {}
    }
});
