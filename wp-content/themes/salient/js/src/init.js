/**
 * Main Salient script file.
 *
 * @package Salient
 * @author ThemeNectar
 */
 /* global jQuery */
 /* global Waypoint */
 /* global imagesLoaded */
 /* global Flickity */

(function($, window, document) {

	"use strict";

		// Theme vars.
		var $window                 = $(window),
		$body                       = $('body'),
		$offCanvasEl                = $('#slide-out-widget-area'),
		$offCanvasBG                = $('#slide-out-widget-area-bg'),
		$headerOuterEl              = $('#header-outer'),
		$headerSecondaryEl          = $('#header-secondary-outer'),
		$searchButtonEl             = $('#header-outer #search-btn a'),
		$wpAdminBar                 = $('#wpadminbar'),
		$loadingScreenEl            = $('#ajax-loading-screen'),
		$bodyBorderTop              = $('.body-border-top'),
		$pageHeaderBG               = $('#page-header-bg'),
		$footerOuterEl              = $('#footer-outer'),
		delayJS                     = (window.nectarOptions && window.nectarOptions.delay_js && window.nectarOptions.delay_js === '1') ? true : false,
		$bodyBorderWidth            = ($('.body-border-right').length > 0) ? $('.body-border-right').width() : 0,
		$logoHeight                 = ($headerOuterEl.is('[data-logo-height]')) ? parseInt($headerOuterEl.attr('data-logo-height')) : 30,
		headerPadding               = ($headerOuterEl.is('[data-padding]')) ? parseInt($headerOuterEl.attr('data-padding')) : 28,
		logoShrinkNum               = ($headerOuterEl.is('[data-shrink-num]')) ? $headerOuterEl.attr('data-shrink-num') : 6,
		condenseHeaderLayout        = ($headerOuterEl.is('[data-condense="true"]')) ? true : false,
		usingLogoImage              = ($headerOuterEl.is('[data-using-logo="1"]')) ? true : false,
		headerResize                = ($headerOuterEl.is('[data-header-resize="1"]')) ? true : false,
		headerTransparent           = ($headerOuterEl.is('[data-transparent-header="true"]')) ? true : false,
		headerMobileFixed           = ($headerOuterEl.is('[data-mobile-fixed="1"]')) ? true : false,
		headerLayoutFormat          = ($body.is('[data-header-format]')) ? $body.attr('data-header-format') : 'default',
		headerHideUntilNeeded       = ($body.is('[data-hhun]')) ? $body.attr('data-hhun') : '',
		headerIsContained           = ($body.is('[data-contained-header="true"]')) ? true : false,
		$animationEasing            = ($body.is('[data-cae]') && $body.attr('data-cae') !== 'swing' ) ? $body.attr('data-cae') : 'easeOutCubic',
		$animationDuration          = ($body.is('[data-cad]')) ? $body.attr('data-cad') : '650',
		$animatedAnchorLinks        = ($('body[data-animated-anchors="true"]').length > 0) ? true : false,
		bypassAnimations            = (!$body.is('[data-m-animate="1"]') && navigator.userAgent.match(/(Android|iPod|iPhone|iPad|BlackBerry|IEMobile|Opera Mini)/) ) ? true : false,
		headerOCMButtonPos          = (window.nectarOptions && window.nectarOptions.ocm_btn_position && window.nectarOptions.ocm_btn_position === 'left') ? 'left' : 'default',
		usingSmoothScroll           = (window.nectarOptions && window.nectarOptions.smooth_scroll && window.nectarOptions.smooth_scroll === 'true') ? true : false,
		bodyBorderVignette          = (window.nectarOptions && window.nectarOptions.body_border_func && window.nectarOptions.body_border_func == 'vignette') ? true : false,
		bodyBorderMobile            = (window.nectarOptions && window.nectarOptions.body_border_mobile && window.nectarOptions.body_border_mobile === '1') ? true : false,
		bodyBorderHeight            = $body.find('.body-border-top').height(),
		$portfolio_containers       = [],
		$svgIcons                   = [],
		$nectarCustomSliderRotate   = [],
		$flickitySliders            = [],
		flickityDragArr             = [],
		viewIndicatorArr            = [],
		linkIndicatorArr            = [],
		iconMouseFollowArr          = [],
		postGridImgMouseFollowArr   = [],
		parallaxItemsArr            = [],
		cascadingParallaxArr        = [],
		elParallaxArr               = [],
		animateElArr                = [],
		$fsProjectSliderArr         = [],
		$wooFlickityCarousels       = [],
		$liquidBG_EL                = [],
		$testimonialSliders         = [],
		$mouseParallaxScenes        = [],
		$nectarMasonryBlogs         = [],
		$standAnimatedColTimeout    = [],
		animeAnimations             = [],
		$animatedSVGIconTimeout     = [],
		$projectCarouselSliderArr   = [],
		$nectarPostGridArr          = [],
		$verticalScrollingTabs      = [],
		rotatingTitles              = [],
		fullHeightRows              = [],
		$tabbedClickCount           = 0,
		$fullscreenSelector         = '',
		$fullscreenMarkupBool       = false,
		$bodyBorderHeaderColorMatch = false,
		lazyItemObserver            = {},
		nectarBoxRoll               = {
			animating: 'false',
			perspect: 'not-rolled',
			inUse: false
		},
		$nectarFullPage             = {
			$usingFullScreenRows: false
		},
		$svgResizeTimeout,
		$bodyBorderSizeToRemove;

		if( $bodyBorderTop.length > 0 ) {

			if ( $bodyBorderTop.css('background-color') == '#ffffff' && $body.attr('data-header-color') == 'light' ||
				$bodyBorderTop.css('background-color') == 'rgb(255, 255, 255)' && $body.attr('data-header-color') == 'light' ||
				$bodyBorderTop.css('background-color') == $headerOuterEl.attr('data-user-set-bg')) {
				$bodyBorderHeaderColorMatch = true;
			}

		}

		var usingIOS = navigator.userAgent.match(/(iPod|iPhone|iPad)/) || navigator.userAgent.match(/Mac/) && navigator.maxTouchPoints && navigator.maxTouchPoints > 2;
		var safariAgent = navigator.userAgent.indexOf("Safari") > -1 && navigator.userAgent.indexOf("Chrome") < 1;
		if ( safariAgent || usingIOS ) {
			usingSmoothScroll = false;
		}


		/**
		* Nectar DOM info helper.
		*
		* @since 9.0
		*/
		var nectarDOMInfo = {

			usingMobileBrowser: (navigator.userAgent.match(/(Android|iPod|iPhone|iPad|BlackBerry|IEMobile|Opera Mini)/)) ? true : false,
			usingIOS: (navigator.userAgent.match(/(iPod|iPhone|iPad)/) || navigator.userAgent.match(/Mac/) && navigator.maxTouchPoints && navigator.maxTouchPoints > 2) ? true : false,
			usingTouchDevice: (navigator.maxTouchPoints && navigator.maxTouchPoints > 2) ? true : false,
			usingFrontEndEditor: (typeof window.vc_iframe === 'undefined') ? false : true,
			getWindowSize: function() {
				nectarDOMInfo.winH                  = window.innerHeight;
				nectarDOMInfo.winW                  = window.innerWidth;
				nectarDOMInfo.adminBarHeight        = ($wpAdminBar.length > 0) ? $wpAdminBar.height() : 0;
				nectarDOMInfo.secondaryHeaderHeight = ($headerSecondaryEl.length > 0 && $headerSecondaryEl.css('display') != 'none') ? $headerSecondaryEl.outerHeight() : 0;
				nectarDOMInfo.footerOuterHeight     = ($footerOuterEl.length > 0) ? $footerOuterEl.outerHeight() : 0;
			},
			scrollTop: 0,
			clientX: 0,
			clientY: 0,
			scrollPosMouse: function() {
				return window.scrollY || $window.scrollTop();
			},
			scrollPosRAF: function() {

				nectarDOMInfo.scrollTop = window.scrollY || $window.scrollTop();
				requestAnimationFrame(nectarDOMInfo.scrollPosRAF);
			},
			bindEvents: function() {

				if (!nectarDOMInfo.usingMobileBrowser) {


					if (!usingSmoothScroll) {
						$window.on('scroll', function() {
							nectarDOMInfo.scrollTop = nectarDOMInfo.scrollPosMouse();
						});
					}
					document.addEventListener("mousemove", function(e) {
						nectarDOMInfo.clientX = e.clientX;
						nectarDOMInfo.clientY = e.clientY;
					});

				}

				$window.on('resize', nectarDOMInfo.getWindowSize);
				window.addEventListener("orientationchange", nectarDOMInfo.getWindowSize);

			},
			init: function() {
				// Re-cache WP admin bar after DOM ready
				$wpAdminBar = $('#wpadminbar');

				// Get values and bind events
				this.getWindowSize();
				this.usingPhoneBrowser = ( nectarDOMInfo.usingMobileBrowser && nectarDOMInfo.winW < 690 ) ? true : false;
				this.scrollTop = this.scrollPosMouse();
				this.bindEvents();

				this.usingFrontEndEditor = (typeof window.vc_iframe === 'undefined') ? false : true;
			}

		};
		window.nectarDOMInfo = nectarDOMInfo;

		// Initialize Nectar DOM helper.
		nectarDOMInfo.init();


		/**
		* Nectar State.
		*
		* @since 13.0
		*/
		var nectarState = {
			materialOffCanvasOpen: false,
			materialSearchOpen: false,
			permanentTransHeader: ( $headerOuterEl.is('[data-permanent-transparent="1"]') ) ? true : false,
			animatedScrolling: false,
			preventScroll: false,
			ocmOpen: false,
			ocmAnimating: false,
			ocmInit: false,
			mobileHeader: ''
		}
		window.nectarState = nectarState;


		/**
		* Debounced resize event
		*
		* @since 2.0
		*/

		function smartResizeInit() {
			fullWidthContentColumns();
			if (!nectarDOMInfo.usingMobileBrowser) {
				parallaxRowsBGCals();
			}
			headerSpace();
			OCM_overflowState();
			showOnLeftSubMenu();
			inlineMegaMenuPos();
		}


		/**
		* Orientation change event.
		*
		* @since 13.0
		*/
		function orientationChangeInit() {

			setTimeout(function(){
				parallaxRowsBGCals();
			}, 100);

		}



		/**
		* Main resize event.
		*
		* @since 2.0
		*/
		function resizeInit() {
			fullWidthSections();
			fullWidthContentColumns();
			addOrRemoveSF();
			responsiveVideoIframes();

			if ( $bodyBorderTop ) {
				bodyBorderHeight = $bodyBorderTop.height();
			}

			if (!nectarDOMInfo.usingMobileBrowser) {
				parallaxRowsBGCals();
			}

		}



		/**
		* Flexslider plugin initialization.
		*
		* @since 5.0
		*/
		function flexsliderInit() {
			$('.flex-gallery').each(function () {

				if (!$().flexslider) {
					return;
				}

				var $that = $(this);

				imagesLoaded($(this), function () {

					var autorotate = ($that.find('ul').is('[data-d-autorotate="true"]')) ? false : true;

					$that.flexslider({
						animation: 'fade',
						smoothHeight: false,
						animationSpeed: 500,
						useCSS: false,
						touch: true,
						slideshow: autorotate,
					});

					//gallery slider add arrows
					$('.flex-gallery .flex-direction-nav li a.flex-next').html('<i class="fa fa-angle-right"></i>');
					$('.flex-gallery .flex-direction-nav li a.flex-prev').html('<i class="fa fa-angle-left"></i>');

					$(window).trigger('salient-parallax-bg-recalculate');
					nectarParallaxElRefresh();

				});

			});
		}



		/**
		* Icon follow.
		*
		* @since 11.0
		*/

		function NectarIconMouseFollow($el, iconType) {

			this.lastX = nectarDOMInfo.clientX;
			this.lastY = nectarDOMInfo.clientY;
			this.$el = $el;
			this.iconType = iconType;
			this.timeout = false;
			this.overEl = false;
			this.initialCalc = false;
			this.styleType = 'default';
			this.bgElSelector = '';
			this.$dragEl = '';
			this.$innerParallaxEl = '';
			this.parallaxLastX = 0;
			this.parallaxLastY = 0;
			this.$viewEl = '';
			this.$closeEl = '';
			this.lerpDamp = 0.18;
			this.parallaxLerp = true;

			this.arrowMarkup = '<i class="fa fa-angle-left" role="none"></i><i class="fa fa-angle-right" role="none"></i>';

			this.createMarkup();
			this.setup();
			this.mouseBind();

		}

		NectarIconMouseFollow.prototype.setup = function() {

			if( this.iconType === 'post-grid-images' ||
				this.iconType === 'horizontal-movement' ||
				this.iconType === 'link-indicator' ||
				this.iconType === 'view-indicator') {
				  this.viewportTracking();
			}

		};

		NectarIconMouseFollow.prototype.viewportTracking = function() {

			var that = this;

			if( 'IntersectionObserver' in window ) {

				var options = {
					rootMargin: '0px',
					threshold: 0
				}

				this.observer = new IntersectionObserver(function(entries) {

					entries.forEach(function(entry) {

						if ( entry.isIntersecting ) {
							that.$el.addClass('active').addClass('el-in-view');
							that.$el.find( that.bgElSelector ).css('visibility','visible');
							that.activeViewRAF = true;
						} else {
							that.$el.find( that.bgElSelector ).css('visibility','hidden');
							that.activeViewRAF = false;
							that.$el.removeClass('el-in-view');

							if( $('.el-in-view').length == 0 ) {
								if( that.$dragEl.length > 0 ) {
								that.$dragEl.removeClass('visible');
								}
								else if( that.$viewEl.length > 0 ) {
								that.$viewEl.removeClass('visible');
								}
							}

						}
					});

				}, options);

				this.observer.observe(this.$el[0]);


			}

		};

		NectarIconMouseFollow.prototype.createMarkup = function() {

			var that = this;

			// Style BG icon flag.
			if ( this.iconType === 'view-indicator' || this.iconType === 'horizontal-movement' ) {

				if ( this.$el.is('[data-indicator-bg]') ) {
					this.styleType = 'solid';
				}

				if ( this.$el.is('[data-indicator-style]') && this.$el.attr('data-indicator-style') !== 'solid_bg') {
					this.styleType = this.$el.attr('data-indicator-style');
				}
			}

			// Tooltip removes parallax.
			if ( this.styleType === 'tooltip_text' || $('[data-indicator-style="tooltip_text"]').length > 0 ) {
				this.parallaxLerp = false;
				this.lerpDamp = 0.24;
			}

			if( this.iconType === 'horizontal-movement' ) {

				if( $('.nectar-drag-indicator').length == 0 ) {
					var $usingBoxedClass = ($('body > #boxed').length > 0) ? ' in-boxed' : '';

					$('body').append('<div class="nectar-drag-indicator' + $usingBoxedClass + '" data-type="'+this.styleType+'"><div class="color-circle"></div><span class="inner-layer">'+this.arrowMarkup+'</span></div>');
					this.$dragEl = $('.nectar-drag-indicator');
					this.dragRAF();
				} else {
					this.$dragEl = $('.nectar-drag-indicator');
				}


				if( this.styleType != 'default' ) {
				this.$innerParallaxEl = $('.nectar-drag-indicator .inner-layer');
				}

			}

			if( this.iconType === 'view-indicator' ||
				this.iconType === 'link-indicator' ) {

				this.activeViewRAF = true;

				if( $('.nectar-view-indicator').length == 0 ) {

					var $usingBoxedClass = ($('body > #boxed').length > 0) ? ' in-boxed' : '';
					$('body').append('<div class="nectar-view-indicator' + $usingBoxedClass + '"><div class="color-circle"></div><span class="inner-layer"></span></div>');

					if( this.iconType !== 'gallery-zoom-indicator' ) {
						$('.nectar-view-indicator span').text( $('.nectar-post-grid[data-indicator-text]').attr('data-indicator-text') );
					}
					this.$viewEl = $('.nectar-view-indicator');

					// initial calc.
					setTimeout(function(){

						that.lastY = nectarDOMInfo.clientY;
						that.lastX = nectarDOMInfo.clientX;

						that.viewRAF();

					},100);

				} else {
					this.$viewEl = $('.nectar-view-indicator');
				}

				this.$innerParallaxEl = $('.nectar-view-indicator .inner-layer');

			}

			if( this.iconType === 'close-indicator' ) {
				if( $('.nectar-view-indicator').length == 0 ) {
					var $usingBoxedClass = ($('body > #boxed').length > 0) ? ' in-boxed' : '';
					$('body').append('<div class="nectar-close-indicator' + $usingBoxedClass + '"><div class="inner"><div class="inner-layer"><i class="icon-salient-m-close"></i></div></div></div>');
					this.$closeEl = $('.nectar-close-indicator');
					this.closeRAF();
				} else {
					this.$closeEl = $('.nectar-close-indicator');
				}

				this.$innerParallaxEl = $('.nectar-close-indicator .inner-layer');

			}

			if( this.iconType === 'post-grid-images' ) {

				this.activeViewRAF = true;

				this.bgElSelector = (!this.$el.hasClass('nectar-category-grid')) ? '.nectar-post-grid-item-bg-wrap' : '.nectar-category-grid-item-bg';

				if( !this.$el.hasClass('mouse-move-bound') ) {
					this.$viewEl = this.$el.find( this.bgElSelector );
					this.$el.addClass('mouse-move-bound');
					this.viewRAF();
				} else {
					this.$viewEl = this.$el.find( this.bgElSelector );
					this.viewRAF();
				}

			}

		}



		NectarIconMouseFollow.prototype.mouseBind = function() {

			var that = this;

			if( this.iconType === 'horizontal-movement' ) {

				// Blurred class.
				if( that.$el.is('[data-indicator-blur="true"]') ) {
					that.$dragEl.addClass('blurred-bg');
				}

				that.$el.find('.flickity-viewport').on('mouseenter', function() {
					that.$dragEl.attr('data-type',that.styleType);
					that.$dragEl.addClass('visible');

					// text
					if( that.styleType === 'tooltip_text' && that.$el.is('[data-indicator-text]') ) {
						that.$dragEl.find('span').text( that.$el.attr('data-indicator-text') );
					} else {
						that.$dragEl.find('span').html( that.arrowMarkup );
					}

					var $iconColor = (that.$el.is('[data-touch-icon-color]')) ? 'color-' + that.$el.attr('data-touch-icon-color') : '';
					that.$dragEl.removeClass('color-dark').removeClass('color-light').removeClass('color-default');

					if( that.styleType == 'default') {
						that.$dragEl.addClass($iconColor);
						that.$dragEl.find('> span, i').css('color', '');
						that.$dragEl.find('.color-circle').css('background-color', '');
					}
					else if( that.styleType == 'solid' ) {
						var indicator_bg_color = that.$el.attr('data-indicator-bg');
						that.$dragEl.find('.color-circle').css('background-color', indicator_bg_color);
						that.$dragEl.find('> span').css('color', indicator_bg_color);

						var indicator_icon_color = that.$el.attr('data-indicator-icon');
						that.$dragEl.find('i').css('color', indicator_icon_color);
					}

					else if( that.styleType == 'tooltip_text' ) {
						var indicator_bg_color = that.$el.attr('data-indicator-bg');
						that.$dragEl.find('.color-circle').css('background-color', indicator_bg_color);
						var indicator_icon_color = that.$el.attr('data-indicator-icon');
						that.$dragEl.find('span').css('color', indicator_icon_color);
					}

				});

				that.$el.find('.flickity-viewport').on('mouseleave', function() {
					that.$dragEl.removeClass('visible');
				});


				// Handle product links.
				that.$el.find('.product-add-to-cart a, .hide-nectar-indicator, .hide-nectar-indicator a').on('mouseenter', function() {
					that.$dragEl.removeClass('visible');
				});
				that.$el.find('.product-add-to-cart a, .hide-nectar-indicator, .hide-nectar-indicator a').on('mouseleave', function() {
					that.$dragEl.addClass('visible');
				});

				// Handle category/author links.
				that.$el.find('.nectar-post-grid-item .meta-category a, .nectar-post-grid-item .meta-author a').on('mouseenter', function() {
					that.$dragEl.removeClass('visible');
				});
				that.$el.find('.nectar-post-grid-item .meta-category a, .nectar-post-grid-item .meta-author a').on('mouseleave', function() {
					that.$dragEl.addClass('visible');
				});


			}
			else if( this.iconType === 'close-indicator' ) {

				$('body').on('click','.team-member[data-style*="bio_fullscreen"]',function(){

					if ($('.nectar_team_member_overlay:not(.open)').length > 0) {
						return;
					}

					that.$closeEl.addClass('visible');
					that.$closeEl.find('.inner').addClass('visible');
				});

				$('body').on('click','.nectar_team_member_overlay:not(.animating) a[target="_blank"]',function(e){
					e.stopPropagation();
				});

				$('body').on('click','.nectar_team_member_overlay:not(.animating)',function(){
					that.$closeEl.removeClass('visible');
					that.$closeEl.find('.inner').removeClass('visible');
				});

				// Handle links.
				$('body').on('mouseenter', '.nectar_team_member_overlay .bio-inner a', function() {
					that.$closeEl.removeClass('visible');
				});
				$('body').on('mouseleave', '.nectar_team_member_overlay .bio-inner a', function() {
					that.$closeEl.addClass('visible');
				});

			}
			else if( this.iconType === 'link-indicator' ) {

				that.$el.off();

				that.$el.on('mouseenter', function() {
				that.$viewEl.addClass('visible');
							that.$viewEl.attr('class', function(i, c){
					return c.replace(/(^|\s)style-\S+/g, '');
				});

				// Coloring.
				var indicator_bg_color = that.$el.attr('data-indicator-bg');
				var indicator_icon_color = that.$el.attr('data-indicator-icon');

				that.$viewEl.find('.color-circle').css('background-color', indicator_bg_color);

				// Icon.
				var arrowMarkup = '<div class="nectar-cta loaded" data-style="arrow-animation"><span class="link_wrap" style="color: '+indicator_icon_color+'"><svg class="next-arrow" role="presentation" width="20px" height="25px" viewBox="0 0 50 80"><polyline stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round" points="0, 0 45, 40 0, 80"></polyline></svg><span class="line" role="none" style="background-color: '+indicator_icon_color+'"></span></span></div>';
				that.$viewEl.find('span').html(arrowMarkup);

				// Blurred class.
				if( that.$el.is('[data-indicator-blur="true"]') ) {
					that.$viewEl.addClass('blurred-bg');
				}

				});
				that.$el.on('mouseleave', function() {
					that.$viewEl.removeClass('visible').removeClass('blurred-bg');
				});

			}
			else if( this.iconType === 'view-indicator' ) {

        var $text_color = ( that.$el.is('[data-indicator-text-color]') ) ? that.$el.attr('data-indicator-text-color') : '#fff';
				var $color = that.$el.attr('data-indicator-color');
				var $style = that.$el.attr('data-indicator-style');
				var $text = that.$el.attr('data-indicator-text');

				var elSelector = that.$el.find('.nectar-post-grid-item');
				if (that.$el.is('a')) {
					elSelector  = that.$el;
				}

				// unbind first.
				elSelector.off();

				elSelector.on('mouseenter', function() {
					that.activeViewRAF = true;
					that.$viewEl.addClass('visible');
					that.$viewEl.find('span').text( $text );

					// Handle style class.
					that.$viewEl.attr('class', function(i, c){
							return c.replace(/(^|\s)style-\S+/g, '');
					});
					that.$viewEl.addClass('style-'+$style);
					if( $style !== 'see-through' ) {
						that.$viewEl.find('.color-circle').css('background-color', $color);
						that.$viewEl.find('.inner-layer').css('color', $text_color);
					}

					// Blurred class.
					if( that.$el.is('[data-indicator-blur="true"]') ) {
						that.$viewEl.addClass('blurred-bg');
					}

					clearTimeout(that.timeout);
				});

				elSelector.on('mouseleave', function() {

					if (that.$el.is('a')) {
						that.$viewEl.removeClass('visible');
						that.$viewEl.removeClass('blurred-bg');
					} else {
						that.timeout = setTimeout(function(){
							that.$viewEl.removeClass('visible');
							that.$viewEl.removeClass('blurred-bg');
						},100);
					}


				});

				// Handle category/author links.
				that.$el.find('.nectar-post-grid-item .meta-category a, .nectar-post-grid-item .meta-author a').on('mouseenter', function() {
					that.$viewEl.removeClass('visible');
				});
				that.$el.find('.nectar-post-grid-item .meta-category a, .nectar-post-grid-item .meta-author a').on('mouseleave', function() {
					that.$viewEl.addClass('visible');
				});

			}


			else if( this.iconType === 'post-grid-images' ) {
				that.$el.on('mouseenter', function() {
					$(this).addClass('mouse-over');
          			that.activeViewRAF = true;
				});
				that.$el.on('mouseleave', function() {
					$(this).removeClass('mouse-over');
				});
			}

		};

		NectarIconMouseFollow.prototype.updatePos = function() {
			this.lastY = linearInterpolate(this.lastY, nectarDOMInfo.clientY, this.lerpDamp);
			this.lastX = linearInterpolate(this.lastX, nectarDOMInfo.clientX, this.lerpDamp);
		}

		NectarIconMouseFollow.prototype.parallaxIcon = function() {

			this.parallaxLastX = linearInterpolate(this.parallaxLastX, parseInt(nectarDOMInfo.clientX) - parseInt(this.lastX), this.lerpDamp)/1.65;
			this.parallaxLastY = linearInterpolate(this.parallaxLastY, parseInt(nectarDOMInfo.clientY) - parseInt(this.lastY), this.lerpDamp)/1.65;

			if( this.$innerParallaxEl.length > 0 ) {
				this.$innerParallaxEl[0].style.transform = 'translateX(' + clamp(this.parallaxLastX,12,-12) + 'px) translateY(' + clamp(this.parallaxLastY,12,-12) + 'px)';
			}

		}

		NectarIconMouseFollow.prototype.dragRAF = function() {

			this.updatePos();

			this.$dragEl[0].style.transform = 'translateX(' + this.lastX + 'px) translateY(' + this.lastY + 'px)';

			if( this.parallaxLerp ) {
				this.parallaxIcon();
			}

			requestAnimationFrame(this.dragRAF.bind(this));


		};

		NectarIconMouseFollow.prototype.viewRAF = function() {

			this.updatePos();

			if( this.activeViewRAF || this.iconType === 'view-indicator' || this.iconType === 'link-indicator' ) {

				for(var i=0; i < this.$viewEl.length; i++) {
					this.$viewEl[i].style.transform = 'translateX(' + this.lastX + 'px) translateY(' + this.lastY + 'px)';
				}

				if( this.parallaxLerp ) {
					this.parallaxIcon();
				}

			}

			requestAnimationFrame(this.viewRAF.bind(this));

		};

		NectarIconMouseFollow.prototype.closeRAF = function() {

			this.updatePos();

			this.$closeEl.css({
				'transform': 'translateX(' + this.lastX + 'px) translateY(' + this.lastY + 'px)'
			});

			this.parallaxIcon();

			requestAnimationFrame(this.closeRAF.bind(this));

		};



		/**
		* Flickity lazy image helper
		*
		* Needed to calculate the space which
		* lazy loaded images will eventually occupy.
		*
		* @since 11.0
		*/
		function flickityLazyCalcs() {

			$('.wpb_gallery_slidesflickity_static_height_style .cell[data-lazy="true"]').each(function() {

				$(this).css({
					'height': '',
					'width' : ''
				});

				var heightAttr = parseInt($(this).find('img').attr('height'));
				var widthAttr = parseInt($(this).find('img').attr('width'));

				var dimensions = calculateAspectRatio( widthAttr, heightAttr, 2000, parseInt($(this).find('img').height()) );
				var captionHeight = ( $(this).find('.item-meta').length > 0 ) ? $(this).find('.item-meta').outerHeight() : 0;

				$(this).css({
					'height':  (dimensions.height + captionHeight) + 'px',
					'width' :  dimensions.width + 'px'
				});

			});

		}


		/**
		* Flickity lazy initialization.
		*
		* @since 11.0
		*/
		function flickityLazyInit() {
			// Lazy assist.
			if( $('.wpb_gallery_slidesflickity_static_height_style .cell[data-lazy="true"]').length > 0 ) {
				flickityLazyCalcs();
				$window.on('smartresize',flickityLazyCalcs);
			}
		}


		/**
		* Flickity plugin initialization.
		*
		* @since 7.0
		*/

		function flickityInit() {

			if ($('.nectar-flickity:not(.masonry)').length == 0) {
				return false;
			}

			$flickitySliders = [];
			flickityDragArr = [];

			// Create instances
			$('.nectar-flickity:not(.masonry)').each(function (index) {
				$flickitySliders.push(new NectarFlickity($(this), index));
			});


			// Resize event.
			var $usingNectarCarouselFlk = ($('.nectar-carousel.nectar-flickity:not(.masonry)').length > 0) ? true : false;
			if ($usingNectarCarouselFlk) {

				if( !nectarDOMInfo.usingMobileBrowser ) {
					$window.on('resize',setNectarCarouselFlkEH);
				} else {
					window.addEventListener("orientationchange", setNectarCarouselFlkEH);
				}

			}


		}
		function NectarFlickity(el, index) {

			this.$el = el;
			this.index = index;
			this.instance = {};

			// Defaults.
			this.$freeScrollBool     = (this.$el.is('[data-free-scroll]') && this.$el.attr('data-free-scroll') == 'true') ? true : false,
			this.$groupCellsBool     = true,
			this.$flickContainBool   = true,
			this.$flcikAttr          = 0.025,
			this.$paginationBool     = false,
			this.$nextPrevArrowBool  = true,
			this.$setGallerySizeBool = true,
			this.$imagesLoaded       = true,
			this.$flickCellAlign     = 'center',
			this.fadeBool            = false;

			this.setup();

		}

		NectarFlickity.prototype.setup = function() {

			// Add instance classname.
			this.$el.removeClass(function (index, className) {
				return (className.match(/(^|\s)instance-\S+/g) || []).join(' ');
			});
			this.$el.addClass('instance-' + this.index);

			var sliderControls = ( this.$el.attr('data-controls').length > 0 ) ?  this.$el.attr('data-controls') : '';

			// Fixes horizontal overflow issues
			this.fullWidthOverlow();

			// Fixed Text Style.
			if (this.$el.is('[data-format="fixed_text_content_fullwidth"]')) {

				this.$flickCellAlign   = 'left';
				this.$groupCellsBool   = false;
				this.$flickContainBool = false;
				this.$flcikAttr        = 0.02;

				if ( this.$el.parent().is('[data-alignment="right"]') ) {
					this.$flickCellAlign   = 'right';
				}

			}

			if (this.$freeScrollBool == true ) {
				this.$groupCellsBool = false;
			}

			if ( this.$el.find('.nectar-el-parallax-scroll').length > 0 &&
				this.$el.parents('[class*="wpb_gallery_slidesflickity_"]').length > 0 ) {
					this.$groupCellsBool = false;
			}


			// Controls.
			if (sliderControls == 'next_prev_arrows'||
				sliderControls == 'next_prev_arrows_overlaid') {
				this.$paginationBool     = false;
				this.$nextPrevArrowBool  = true;
			} else {
				this.$paginationBool     = true;
				this.$nextPrevArrowBool  = false;
			}


			if (sliderControls == 'none') {
				this.$paginationBool     = false;
				this.$nextPrevArrowBool  = false;
			}

			this.$wrapAround = ( this.$el.is('[data-wrap]') && this.$el.attr('data-wrap') == 'no-wrap' ) ? false : true;

			this.ticker = (this.$el.is('.ticker-rotate')) ? true : false;
			this.tickerPaused = false;
			if( this.ticker ) {
				var tickerSpeed = ( this.$el.is('[data-ticker-speed]') ) ? this.$el.attr('data-ticker-speed') : 'slow';
				var tickerDirection = ( this.$el.is('[data-ticker-direction]') ) ? this.$el.attr('data-ticker-direction') : 'default';

				if( 'slow' === tickerSpeed ) {
					this.tickerSpeed = 0.4;
				}
				else if( 'medium' === tickerSpeed ) {
					this.tickerSpeed = 1.2;
				}
				else {
					this.tickerSpeed = 2;
				}

				if ( tickerDirection === 'reverse' ) {
					this.tickerSpeed = this.tickerSpeed * -1;
				}

				this.$wrapAround = true;
				this.$paginationBool = false;
			}
			this.$flickity_autoplay = false;
			this.$flickity_stored_autoplay = false;
			this.inView = false;

			if (this.$el.is('[data-autoplay]') && this.$el.attr('data-autoplay') == 'true' && !this.ticker) {

				this.$flickity_autoplay = true;
				this.$flickity_stored_autoplay = 5000;

				if (this.$el.is('[data-autoplay-dur]') && this.$el.attr('data-autoplay-dur').length > 0) {

					if (parseInt(this.$el.attr('data-autoplay-dur')) > 100 &&
						parseInt(this.$el.attr('data-autoplay-dur')) < 30000) {
						this.$flickity_autoplay = parseInt(this.$el.attr('data-autoplay-dur'));
						this.$flickity_stored_autoplay = this.$flickity_autoplay;
					}

				}

			}

			this.$frontEndEditorDrag  = ($('body.vc_editor').length > 0) ? false : true;
			this.$frontEndEditorPause = ($('body.vc_editor').length > 0) ? true : false;
			this.$arrowShape = '';

			// Pause on hover.
			if (this.$el.is('[data-pause-on-hover="true"]')) {
				this.$frontEndEditorPause = true;
			}

			// Centered cells.
			if (this.$el.is('[data-centered-cells="true"]')) {
				this.$groupCellsBool = false;
			}

			// Adaptive height.
			this.$flickity_adaptive_height = false;
			if( this.$el.is('[data-adaptive-height="true"]') ) {
				this.$flickity_adaptive_height = true;
			}

			// Lazy load.
			this.$lazyload = (this.$el.find('img[data-flickity-lazyload]').length > 0) ? 1 : false;
			if( this.$el.find('img[data-flickity-lazyload]').length > 0 &&
				this.$el.is('[data-overflow="visible"]') &&
				this.$el.is('[data-wrap="no-wrap"]') ) {
				this.$lazyload = 2;
			}

			// RTL.
			this.$flickity_rtl = ( $body.hasClass('rtl') ) ? true : false;

			// Arrow shape.
			if( sliderControls == 'next_prev_arrows_overlaid' ||
				sliderControls == 'touch_total' ||
				this.$el.hasClass('nectar-simple-slider') ) {

				this.$arrowShape = {
					x0: 10,
					x1: 60, y1: 50,
					x2: 70, y2: 40,
					x3: 30
				}
			} else {
				this.$arrowShape = {
					x0: 20,
					x1: 70,
					y1: 30,
					x2: 70,
					y2: 25,
					x3: 70
				}
			}

			if( this.$el.is('[data-format="fixed_text_content_fullwidth"]') &&
				this.$el.parents('.full-width-content.wpb_row').length > 0 ) {
				this.$el.parents('.full-width-content.wpb_row')
					.removeClass('full-width-content')
					.addClass('full-width-section');
			}

			//// Nectar Simple Slider
			if( this.$el.hasClass('nectar-simple-slider') ) {

				this.$flickity_adaptive_height = false;
				this.$paginationBool           = false;
				this.$nextPrevArrowBool        = false;
				this.$setGallerySizeBool       = false;
				this.$wrapAround               = false;
				this.$imagesLoaded             = false;
				this.$flcikAttr                = 0.022;

				if( this.$el.attr('data-pagination') == 'true') {
					this.$paginationBool = true;
				}

				if( this.$el.attr('data-wrap') == 'true') {
					this.$wrapAround = true;
				}

				if( this.$el.is('[data-simple-slider-transition="fade"]') ) {
					this.fadeBool = true;
				}

			}


			var inHiddenSection = ( this.$el.parents('.toggle').length > 0 ) ? true : false;

			// Init.
			if( !nectarDOMInfo.usingFrontEndEditor &&
				!isInstagram() &&
				'IntersectionObserver' in window &&
				!inHiddenSection &&
				$nectarFullPage.$usingFullScreenRows === false) {
				this.lazyInit();
			}
			else {
				this.init();
			}

		};

		NectarFlickity.prototype.lazyInit = function() {

			var that = this;
			this.observer = new IntersectionObserver(function(entries) {

				entries.forEach(function(entry){
				  if (entry.isIntersecting) {
					that.init();
					that.observer.unobserve(entry.target);
				  }
				});

			  }, {
					root: (isSafari()) ? null : document,
				rootMargin: '350px 0px 350px 0px',
				threshold: 0
			});

			this.observer.observe(this.$el[0]);

		}

		NectarFlickity.prototype.init = function() {

			// Initialize instance
			this.instance = new Flickity('.nectar-flickity.instance-' + this.index, {
				setGallerySize: this.$setGallerySizeBool,
				contain: this.$flickContainBool,
				draggable: this.$frontEndEditorDrag,
				lazyLoad: this.$lazyload,
				imagesLoaded: this.$imagesLoaded,
				percentPosition: true,
				adaptiveHeight: this.$flickity_adaptive_height,
				cellAlign: this.$flickCellAlign,
				groupCells: this.$groupCellsBool,
				prevNextButtons: this.$nextPrevArrowBool,
				freeScroll: this.$freeScrollBool,
				pageDots: this.$paginationBool,
				resize: true,
				selectedAttraction: this.$flcikAttr,
				autoPlay: this.$flickity_autoplay,
				rightToLeft: this.$flickity_rtl,
				pauseAutoPlayOnHover: this.$frontEndEditorPause,
				wrapAround: this.$wrapAround,
				accessibility: false,
				fade: this.fadeBool,
				dragThreshold: nectarDOMInfo.usingMobileBrowser ? 25 : 3,
				arrowShape: this.$arrowShape
			});

			// Initialize events.
			this.events();
		}


		NectarFlickity.prototype.trackView = function() {
			var that = this;
			var track = new IntersectionObserver(function(entries) {

				entries.forEach(function(entry){
				  if (entry.isIntersecting) {
					that.inView = true;
				  } else {
					that.inView = false;
				  }
				});

			  }, {
					root: (isSafari()) ? null : document,
				rootMargin: '200px 0px 200px 0px',
				threshold: 0
			});

			track.observe(this.$el[0]);
		};

		NectarFlickity.prototype.fullWidthOverlow = function() {

			if(this.$el.is('[data-overflow="visible"]') &&
				 this.$el.parents('.wpb_column:not(.vc_col-sm-12)').length == 0 ) {

					// Regular non full width rows
					if( this.$el.parents('.wpb_row:not(.nectar-overflow-hidden):not(.full-width-content):not(.inner_row):not(.has-global-section)').length > 0 ) {
						this.$el.wrap('<div class="wpb_row vc_row-fluid vc_row full-width-content nectar-overflow-hidden carousel-dynamic-wrapper"><div class="normal-container container"></div></div>');
					} else if( this.$el.parents('.wpb_row.full-width-content:not(.nectar-overflow-hidden)').length > 0 ) {
						// parent is already full width and just needs a hidden overflow
						this.$el.parents('.wpb_row.full-width-content:not(.nectar-overflow-hidden)').addClass('nectar-overflow-hidden');
					}

			}
		};

		NectarFlickity.prototype.events = function() {

			//// Carousel Specific Styles.
			// Simple Slider.
			if (this.$el.hasClass('nectar-simple-slider')) {
				this.simpleSliderStyle();
			}

			// Fancybox/Image Gallery Parallax.
			else if ( this.$el.is('.nectar-carousel[data-wrap="no-wrap"]') &&
				this.$el.find('.nectar-fancy-box[data-n-parallax-bg="true"]').length > 0 && this.$groupCellsBool !== true ||
				this.$el.parents('[class*="wpb_gallery_slidesflickity_"]').length > 0 &&
				this.$el.find('.nectar-el-parallax-scroll').length > 0 ) {

				this.galleryParallax();
			}

			if ( this.$el.is('[data-controls="touch_total"]') ||
				this.$el.is('[data-touch-indicator="true"]') ) {
				this.visualizedTotalControls();
			}

			if (this.$el.is('[data-format="fixed_text_content_fullwidth"]') &&
				!nectarDOMInfo.usingFrontEndEditor) {
				this.fixedContentStyle();
			}

			if( this.$el.parents('.wpb_gallery_slidesflickity_static_height_style').length > 0 &&
				this.$el.find('.item-meta').length > 0 ) {
				this.imageCaptionWidth();
				$window.on('resize', this.imageCaptionWidth.bind(this));
			}

			// Ticker.
			if( this.ticker ) {
				if ( 'IntersectionObserver' in window ) {
					this.trackView();
				}

				this.tickerRotate();

				this.instance.on('dragStart', function() {
					this.tickerPaused = true;
				}.bind(this));

				this.$el[0].addEventListener('mouseleave', function(){
					this.tickerPaused = false;
				}.bind(this));

				if (this.$el.is('[data-pause-on-hover="true"]') || this.$nextPrevArrowBool || nectarDOMInfo.usingFrontEndEditor ) {
					this.$el[0].addEventListener('mouseenter', function(){
						this.tickerPaused = true;
					}.bind(this));
				}
			}

			// Shared events.
			this.sharedEvents();
		}


		NectarFlickity.prototype.sharedEvents = function() {

			var pointer = this;
			var $removeHiddenTimeout;
			var $removeMovingTimeout;
			var $that = this.$el;
			var flickityInstance = this.instance;

			this.instance.on('dragStart', function () {

				clearTimeout($removeHiddenTimeout);
				clearTimeout($removeMovingTimeout);
				$that.addClass('is-dragging');
				$that.addClass('is-moving');

				$that.find('.flickity-prev-next-button').addClass('hidden');
			});

			this.instance.on('dragEnd', function () {

				$that.removeClass('is-dragging');

				$removeHiddenTimeout = setTimeout(function () {

					$that.removeClass('is-moving');
					$that.find('.flickity-prev-next-button').removeClass('hidden');

				}, 600);

				$removeMovingTimeout = setTimeout(function () {
					$that.removeClass('is-moving');
				}, 300);

			});

			$('.flickity-prev-next-button').on('click', function () {

				clearTimeout($removeHiddenTimeout);

				$(this).parents('.nectar-flickity')
					.find('.flickity-prev-next-button')
					.addClass('hidden');

				$removeHiddenTimeout = setTimeout(function () {
					$that
						.find('.flickity-prev-next-button')
						.removeClass('hidden');
				}, 600);

			});

			// Workaround for single column grouping first buttons not triggering change.
			this.instance.$element.find('.flickity-prev-next-button').on('click', function () {

				if( pointer.$groupCellsBool !== true ) {

					var slideWidth = flickityInstance.selectedSlide.outerWidth;
					var sliderWidth = flickityInstance.size.innerWidth;
					var slidePercentage = Math.floor(sliderWidth/slideWidth);

					if($(this).hasClass('next')) {

						if(flickityInstance.selectedIndex === 1 && slidePercentage > 1) {
							if( slidePercentage === 2 || slidePercentage === 3 ) {
								flickityInstance.select(2);
							} else if( slidePercentage > 3 ) {
								flickityInstance.select(3);
							}

						}
					}

				}


			});


			// Transition.
			// This should be delayed slightly to avoid initial calcs from flickity getting animated.
			setTimeout(function() {
				$('.nectar-post-grid.nectar-flickity[data-wrap="no-wrap"], .nectar-flickity.nectar-carousel[data-format="default"][data-wrap="no-wrap"]').addClass('transition-enabled');
			}, 200);


			// Images loaded.
			if ($that.hasClass('nectar-carousel') && !$that.is('[data-adaptive-height="true"]') ) {
				imagesLoaded($that, function () {
					nectarCarouselFlkEH($that);
				});
			}
	};

	NectarFlickity.prototype.tickerRotate = function() {
		if (!this.tickerPaused && this.inView == true) {
			if (this.instance.slides) {
				this.instance.x = (this.instance.x - this.tickerSpeed) % this.instance.slideableWidth;
				this.instance.selectedIndex = this.instance.dragEndRestingSelect();
				//this.instance.updateSelectedSlide();
				this.instance.settle(this.instance.x);
			}
		}
		window.requestAnimationFrame(this.tickerRotate.bind(this));
	};

	NectarFlickity.prototype.imageCaptionWidth = function() {

		this.$el.find('.item-meta').each(function() {
			$(this).css({
				'width': $(this).parent().find('img').width()
			});
		});

	};

	NectarFlickity.prototype.simpleSlideBGConnection = function() {

		var $activeCell = ($('body.vc_editor').length > 0) ? $that.find('.is-selected > .cell') : $that.find('.is-selected');

		if( this.$rowBG && $activeCell ) {
			this.$rowBG.css({
				'transition': 'background-color 0.5s ease-out',
				'background-color': ( $activeCell.is('.has-bg-color') ) ? $activeCell.find('.bg-layer-wrap').css('background-color') : this.$rowBGStored
			});
		}

		};


		NectarFlickity.prototype.simpleSliderStyle = function() {

			var $that = this.$el;
			var that = this;

			//// Simple Slider Arrows
			if( this.$el.attr('data-arrows') == 'true' ) {

				if( this.$el.find('.flickity-prev-next-button').length == 0 ) {

					this.$el.append('<button class="flickity-button flickity-prev-next-button previous" aria-label="'+ nectar_front_i18n.previous +'" type="button"><svg class="flickity-button-icon" viewBox="0 0 100 100"><path d="M 10,50 L 60,100 L 70,90 L 30,50  L 70,10 L 60,0 Z" class="arrow"></path></svg></button>');
					this.$el.append('<button class="flickity-button flickity-prev-next-button next" aria-label="'+ nectar_front_i18n.next +'" type="button"><svg class="flickity-button-icon" viewBox="0 0 100 100"><path d="M 10,50 L 60,100 L 70,90 L 30,50  L 70,10 L 60,0 Z" class="arrow" transform="translate(100, 100) rotate(180) "></path></svg></button>');

					// Previous.
					this.$el.find('.flickity-prev-next-button.previous').on( 'click', function() {

						if( that.$wrapAround === false &&
							that.instance.selectedIndex == 0 &&
							  ( that.instance.isAnimating == false || typeof that.instance.isAnimating === 'undefined') ) {

							// Nudge.
							var currentX = that.instance.x;
							anime({
								targets: that.instance,
								x: currentX + 100,
								duration: 350,
								easing: 'easeOutCubic'
							});
							that.instance.startAnimation();

						}

						that.instance.previous();
					});

					// Next.
					this.$el.find('.flickity-prev-next-button.next').on( 'click', function() {

						// Nudge.
						if( that.$wrapAround === false &&
							that.instance.selectedIndex == that.instance.slides.length - 1 &&
							that.instance.isAnimating == false) {

							// Nudge.
							var currentX = that.instance.x;
							anime({
								targets: that.instance,
								x: currentX - 100,
								duration: 350,
								easing: 'easeOutCubic'
							});
							that.instance.startAnimation();

						}

						that.instance.next();
					});

				}

			} // End Simple Slider Arrows.

			//// Simple Slider BG Color emit.
			this.$rowBG = '';
			this.$rowBGStored = '';

			if( $(this).is('.nectar-simple-slider[data-row-bg-connection="true"]') ) {

				this.$rowBG = this.$el.parents('.wpb_row');
				this.$rowBG = this.$rowBG.find('> .row-bg-wrap .row-bg');
				this.$rowBGStored = ( this.$rowBG.length > 0 ) ? this.$rowBG.css('background-color') : '';

				this.instance.on('change', simpleSlideBGConnection.bind(this));
				this.simpleSlideBGConnection();

			}


			//// Simple Slider Lazy Load.
			if( this.$el.find('.bg-layer[data-nectar-img-src]').length > 0 ) {

				var waypoint = new Waypoint({
					element: this.$el[0],
					handler: function () {

						$that.find('.bg-layer[data-nectar-img-src]').each(function() {
							var entry = $(this)[0];
							var imgSrc = entry.getAttribute('data-nectar-img-src');
							entry.style.backgroundImage = "url('" + imgSrc + "')";
							entry.classList.add('loaded');
						});

						waypoint.destroy();
					},
					offset: '95%'

				});

			}

			//// Simple Slider Parallax
			if( this.$el.is('[data-parallax="true"]') ) {

				var slides = this.$el.find('.cell');

				// limit time between slide changes when wrapping.
				if( this.$wrapAround === true ) {
					this.$el.find('.flickity-prev-next-button').on('click', function () {
						$that.addClass('disabled-nav');
						setTimeout(function(){
							$that.removeClass('disabled-nav');
						},500);
					});
				}


				// Parallax effect.
				var rtlChangeDir = ( this.$flickity_rtl ) ? 1 : -1;

				this.instance.on('scroll', function () {

				  $.each( that.instance.slides, function(i,slide) {

					var imageBG = slides[i].querySelector('.bg-layer');
					var content = slides[i].querySelector('.inner');

					var flkty = that.instance;
					var x = 0;

					if( 0 === i && flkty.slides.length > 2 ) {
						x = Math.abs( flkty.x ) > flkty.slidesWidth ? ( flkty.slidesWidth + flkty.x + flkty.slides[flkty.slides.length - 1 ].outerWidth + slide.target ) : ( slide.target + flkty.x );
					} else if( i === flkty.slides.length - 1 ) {
						x = Math.abs( flkty.x ) + flkty.slides[i].outerWidth < flkty.slidesWidth ? ( slide.target - flkty.slidesWidth + flkty.x - flkty.slides[i].outerWidth ) : ( slide.target + flkty.x );
					} else {
						x = slide.target + flkty.x;
					}

					  imageBG.style.transform = 'translate3d(' + x * ( rtlChangeDir / 2 ) + 'px,0,0)';
					  content.style.transform = 'translate3d(' + x * ( rtlChangeDir / 4 ) + 'px,0,0)';

				  });
				});
			}

			// Simple Slider Pagination
			if( this.$el.hasClass('nectar-simple-slider') && true == this.$paginationBool ) {

				this.$el.find('.flickity-page-dots li').append('<svg width="65px" height="65px" viewBox="0 0 72 72" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><circle class="time" stroke-width="5" fill="none" stroke-linecap="round" cx="33" cy="33" r="28"></circle></svg>');

				if( this.$flickity_stored_autoplay ) {
					this.$el.find('.flickity-page-dots li circle.time').css('transition', 'stroke-dashoffset '+ (parseInt(this.$flickity_stored_autoplay) + 100) +'ms linear, stroke 0.2s ease');

					this.$el.find('.flickity-page-dots li:first').addClass('no-trans');
					setTimeout(function() {
						$that.find('.flickity-page-dots li:first').removeClass('no-trans');
					},60);

					this.instance.on('select', function (event) {
						that.instance.playPlayer();
					});

					this.instance.on('dragEnd', function (event) {
						that.instance.playPlayer();
						$that.find('.flickity-page-dots .is-selected').removeClass('no-trans');
					});

					this.instance.on('dragStart', function (event) {
						$that.find('.flickity-page-dots .is-selected').addClass('no-trans');
					});

				}

			}

		};

		NectarFlickity.prototype.galleryParallax = function() {

			var slides = this.$el.find('.cell');
			var that = this;

			var selector = ( this.$el.find('.nectar-fancy-box').length > 0 ) ? '.parallax-layer .box-bg' : '.nectar-el-parallax-scroll .img-wrap';
			var looped = ( this.$el.is('[data-wrap="wrap"]') ) ? true : false;

			// parallax effect.
			var rtlChangeDir = ( this.$flickity_rtl ) ? 1 : -1;


			this.instance.on('scroll', function () {

				$.each( that.instance.slides, function(i,slide) {

					var imageBG = slides[i].querySelector(selector);
					var flkty = that.instance;
					var x = 0;

					if( 0 === i && looped ) {
						x = Math.abs( flkty.x ) > flkty.slidesWidth ? ( flkty.slidesWidth + flkty.x + flkty.slides[flkty.slides.length - 1 ].outerWidth + slide.target ) : ( slide.target + flkty.x );
					}
					else if( 1 === i && looped ) {
						x = Math.abs( flkty.x ) > flkty.slidesWidth ? ( flkty.slidesWidth + flkty.x + flkty.slides[flkty.slides.length - 2 ].outerWidth + slide.target ) : ( slide.target + flkty.x );
					}
					else if( i === flkty.slides.length - 1 && looped ) {
						x = Math.abs( flkty.x ) + flkty.slides[i].outerWidth < flkty.slidesWidth ? ( slide.target - flkty.slidesWidth + flkty.x - flkty.slides[i].outerWidth ) : ( slide.target + flkty.x );
					}
					else if( i === flkty.slides.length - 2 && looped ) {
						x = Math.abs( flkty.x ) + flkty.slides[i].outerWidth + flkty.slides[i+1].outerWidth < flkty.slidesWidth ? ( slide.target - flkty.slidesWidth + flkty.x - flkty.slides[i].outerWidth ) : ( slide.target + flkty.x );
					}
					else {
						x = slide.target + flkty.x;
					}

					if(imageBG) {
						imageBG.style.transform = 'translate3d(' + x * ( rtlChangeDir / 11 ) + 'px,0,0)';
						imageBG.style.willChange = 'transform';
					}

				});

			});

			this.instance.reposition();

		};


		NectarFlickity.prototype.visualizedTotalControls = function() {

			var $that = this.$el;
			var dragIndicatorOnly = (this.$el.hasClass('drag-indicator-only') || this.$el.is('[data-r-bottom-total="true"]') || this.ticker ) ? true : false;

			// Create markup.
			if( this.$el.find('.visualized-total').length == 0 && !dragIndicatorOnly ) {
				if( this.$el.parents('.full-width-content').length > 0 && this.$el.parents('.vc_col-sm-12').length > 0 ) {
					this.$el.append('<div class="container normal-container"><div class="visualized-total"><span role="none"></span></div></div>');
				} else {
					this.$el.append('<div class="visualized-total"><span role="none"></span></div>');
				}
			}


			// Init drag indicator.
			if( !nectarDOMInfo.usingMobileBrowser ) {

				flickityDragArr[this.index] = new NectarIconMouseFollow(this.$el,'horizontal-movement');

				this.instance.on('dragMove', function (event, pointer) {
					nectarDOMInfo.clientY = pointer.clientY;
					nectarDOMInfo.clientX = pointer.clientX;
				});

				this.instance.on('pointerDown', function (event, pointer) {
					$('.nectar-drag-indicator').addClass('pointer-down');
				});
				this.instance.on('pointerUp', function (event, pointer) {
					$('.nectar-drag-indicator').removeClass('pointer-down');
				});

			}

			var $totalImgs      = this.$el.find('.flickity-page-dots li').length;
			var $totalIndicator = this.$el.find('.visualized-total span');
			var $totalPosition  = 1;
			var $totalWidth     = this.$el.find('.visualized-total').width();

			if( !dragIndicatorOnly ) {

				$window.on('smartresize',function() {

					setTimeout(function() {

						$totalImgs  = $that.find('.flickity-page-dots li').length;
						$totalWidth = $that.find('.visualized-total').width();

						$totalPosition = ($totalWidth / $totalImgs) * $that.find('.flickity-page-dots .is-selected').index();

						// Update pos on interaction.
						$totalIndicator.css('width', 100/$totalImgs + '%');
						$totalIndicator.css({
							'x' : $totalPosition + 'px'
						});

					},200);

				});


				// Set initial total tracker width.
				setTimeout(function(){

					$totalImgs  = $that.find('.flickity-page-dots li').length;
					$totalWidth = $that.find('.visualized-total').width();

					$totalIndicator.css('width', 100/$totalImgs + '%');

				},200);

				this.instance.on('change', function (event, progress) {

					$totalPosition = ($totalWidth / $totalImgs) * $that.find('.flickity-page-dots .is-selected').index();

					// Update pos on interaction.
					$totalIndicator.css({
						'x' : $totalPosition + 'px'
					});

				});

			}


		};


		NectarFlickity.prototype.fixedContentStyle = function() {

			var $onMobileBrowser = nectarDOMInfo.usingMobileBrowser;
			var $that = this.$el;
			var that = this;

			if( this.$flickity_stored_autoplay ) {
				$(window).on('nectar-material-ocm-open', function(){
					that.instance.stopPlayer();
				});
				$(window).on('nectar-material-ocm-close', function(){
					that.instance.playPlayer();
				});
			}


			this.instance.on('scroll', function () {

				if ($onMobileBrowser ) {
					return;
				}

				if( nectarState.materialOffCanvasOpen == true ) {
					that.instance.slides.forEach(function (slide, j) {

						var flkInstanceSlide = $that.find('.cell:nth-child(' + (j + 1) + ')');

						flkInstanceSlide.find('.inner-wrap-outer').css({
							'transform': 'perspective(800px) translateX(0) rotateY(0) translateZ(0)',
							'opacity': '1'
						});

						flkInstanceSlide.find('.inner-wrap').css({
							'transform': 'scale(1) translateZ(0)'
						});

					});

					return;
				}

				var $flkSlideWidth 	= $that.find('.cell').outerWidth() + 25,
				$leftHeaderSize 	= ($('body[data-header-format="left-header"]').length > 0 && $window.width() > 1000) ? 275 : 0,
				$extraWindowSpace 	= (($window.width() + $leftHeaderSize) - $that.parents('.main-content').width()) / 2;

				$extraWindowSpace += parseInt($that.css('margin-left')) + 2;

				that.instance.slides.forEach(function (slide, j) {

					var $scaleAmt     = 1,
					$translateXAmt    = 0,
					$rotateAmt        = 0,
					$slideZIndex      = 10,
					$opacityAmt       = 1,
					$slideOffset      = $(slide.cells[0].element).offset().left,
					flkInstanceSlide  = $('.nectar-flickity.instance-' + that.index + ' .cell:nth-child(' + (j + 1) + ')');

					if ($slideOffset - $extraWindowSpace < 0 &&
						$slideOffset - $extraWindowSpace > $flkSlideWidth * -1) {

						$scaleAmt       = 1 + (($slideOffset - $extraWindowSpace) / 1500);
						$opacityAmt     = 1 + (($slideOffset - $extraWindowSpace + 70) / 550);
						$translateXAmt  = (($slideOffset - $extraWindowSpace)) * -1;
						$rotateAmt      = (($slideOffset - $extraWindowSpace) / 25) * -1;

					} else {
						$scaleAmt       = 1;
						$opacityAmt     = 1;
						$translateXAmt  = 0;
						$rotateAmt      = 0;
					}

					if ($slideOffset + 5 - $extraWindowSpace < 0 &&
						$slideOffset - $extraWindowSpace > $flkSlideWidth * -1) {

						$slideZIndex = 5;
					} else {
						$slideZIndex = 10;
					}

					flkInstanceSlide.css({
						'z-index': $slideZIndex
					});

					flkInstanceSlide.find('.inner-wrap-outer').css({
						'transform': 'perspective(800px) translateX(' + $translateXAmt + 'px) rotateY(' + $rotateAmt + 'deg) translateZ(0)',
						'opacity': $opacityAmt
					});

					flkInstanceSlide.find('.inner-wrap').css({
						'transform': 'scale(' + $scaleAmt + ') translateZ(0)'
					});

				});

			});


		};





		/**
		* Flickity equal height helper.
		*
		* @since 7.0
		*/
		function setNectarCarouselFlkEH() {

			var timeoutDur = ( nectarDOMInfo.usingMobileBrowser ) ? 200 : 0;
			setTimeout(function () {
				$('.nectar-carousel.nectar-flickity:not(.masonry):not([data-adaptive-height="true"])').each(function () {
					nectarCarouselFlkEH($(this));
					var instance = Flickity.data($(this)[0]);
					if ( instance ) {
						instance.resize();
					}
				});
			}, timeoutDur);

		}



		/**
		* Flickity equal height calculations.
		*
		* @since 7.0
		*/
		function nectarCarouselFlkEH($slider_instance) {

			var $tallestSlideCol = 0;

			$slider_instance
				.find('.flickity-slider > .cell')
				.css('height', 'auto');

			$slider_instance.find('.flickity-slider > .cell').each(function () {

				if( $(this).height() > $tallestSlideCol ) {
					$tallestSlideCol = $(this).height();
				}

			});

			if ($tallestSlideCol < 10) {
				$tallestSlideCol = 'auto';
			}

			//set even height
			$slider_instance
				.find('.flickity-slider > .cell')
				.css('height', $tallestSlideCol + 'px');

		}



		/**
		* twentytwenty plugin initialization.
		*
		* @since 7.0
		*/
		function twentytwentyInit() {
			$('.twentytwenty-container').each(function () {
				var $that = $(this);

				if ($that.find('.twentytwenty-handle').length == 0) {
					$(this).imagesLoaded(function () {
						$that.twentytwenty();
					});
				}

			});
		}





		/**
		* Superfish initialization and submenu functionality.
		*
		* @since 2.0
		*/
		function initSF() {

			addOrRemoveSF();

			if ($('body[data-header-format="left-header"]').length == 0 && !nectarDOMInfo.usingPhoneBrowser ) {

				var $disableHI;

				if (!($('#header-outer[data-megamenu-rt="1"]').length > 0 &&
				$('#header-outer[data-transparent-header="true"]').length > 0)) {
					$disableHI = true;
				} else {
					$disableHI = false;
				}

				if ( window.nectarOptions && window.nectarOptions.dropdown_hover_intent ) {
					if ( window.nectarOptions.dropdown_hover_intent === 'add' ) {
						$disableHI = false;
					}
				}

				$(".sf-menu:not(.buttons)").superfish({
					delay: 500,
					speed: 'fast',
					disableHI: $disableHI,
					speedOut: 'fast',
					animation: {
						opacity: 'show'
					}
				});

				// Pull right/left menu
				$('#header-outer .sf-menu.buttons li.menu-item').on('mouseover',function(){

					$(this).addClass('sfHover');

					// Removes transparency option
					if($('#header-outer[data-megamenu-rt="1"]').length > 0 &&
						$(this).hasClass('megamenu') &&
						!$(this).hasClass('width-75') &&
						!$(this).hasClass('width-50') &&
						$('#header-outer').attr('data-transparent-header') == 'true' ) {

						$('#header-outer').addClass('no-transition');
						$('#header-outer').removeClass('transparent');

					}
				});

				$('#header-outer .sf-menu.buttons > li.menu-item.menu-item-has-children:not(.megamenu):not(.nectar-megamenu-menu-item)').on('mouseenter',function(){

					var docW = $("#top .container").width();
					var elm = $(this).children('ul');
					var off = elm.offset();
					var l = off.left - ($(window).width() - docW)/2;
					var w = elm.width();
					var isEntirelyVisible = (l+w <= $(window).width()-100);

					if ( ! isEntirelyVisible ) {
						$(this).addClass('edge');
					} else {
						$(this).removeClass('edge');
					}
				});

				$('#header-outer .sf-menu.buttons li.menu-item').on('mouseleave',function(){
					var $that = $(this);

					if( $that.is('.menu-item-has-children') ) {
						setTimeout(function () {
							if( !$that.is(':hover') ) {
								$that.removeClass('sfHover');

								if($('#header-outer[data-megamenu-rt="1"]').length > 0 && $('#header-outer[data-transparent-header="true"]').length > 0) {

									if($('#header-outer.scrolled-down').length == 0 &&
									   $('#header-outer.small-nav').length == 0 &&
									   $('#header-outer.detached').length == 0 &&
									   $('#header-outer.fixed-menu').length == 0) {
										$('#header-outer').addClass('transparent');
									}
									if($('#header-outer[data-permanent-transparent="1"][data-transparent-header="true"]').length > 0) {
										$('#header-outer').addClass('transparent');
									}

								}
							}
						}, 200);
					} else {
						$that.removeClass('sfHover');
					}
				});

				// Areas that do not use megamenu.
				$('#header-secondary-outer li.megamenu:not(.nectar-megamenu-menu-item), #header-outer:not([data-format="menu-left-aligned"]):not([data-format="centered-logo-between-menu-alt"]) .sf-menu.buttons li.megamenu')
					.removeClass('nectar-megamenu-menu-item')
					.removeClass('megamenu');

				// Centered menu bottom bar forced megamenu values.
				$('#header-outer[data-format="centered-menu-bottom-bar"] .right-side .sf-menu li.nectar-megamenu-menu-item')
					.removeClass('align-left')
					.removeClass('align-middle')
					.addClass('align-right');

				$('#header-outer[data-format="centered-menu-bottom-bar"] .left-side .sf-menu li.nectar-megamenu-menu-item')
					.removeClass('align-right')
					.removeClass('align-middle')
					.addClass('align-left');


				$('#header-outer .sf-menu > li:not(.megamenu) > ul > li > ul').each(function () {

					if ($(this).offset().left + $(this).outerWidth() > $window.width()) {
						$(this).addClass('on-left-side');
						$(this).find('ul').addClass('on-left-side');
					}

				});

				// Megamenu multi section per column title support.
				$('body:not([data-header-format="left-header"]) header#top nav > ul > li.megamenu > ul > li > ul > li').each(function(){
					if( $(this).find('> ul').length > 0 ) {
						$(this).addClass('has-ul');
					}
				});

				// Full width megamenu.
				if ($('body[data-megamenu-width="full-width"]').length > 0 && $('ul.sub-menu').length > 0) {
					megamenuFullwidth();
					$window.on('smartresize', megamenuFullwidth);
					$('header#top nav > ul > li.megamenu > .sub-menu, header#top nav > ul > li.megamenu > .nectar-global-section-megamenu').css('box-sizing', 'content-box');
				}

				// Extra hover class for megamenu check.
				$('header#top nav > ul.sf-menu > li.menu-item').on('mouseenter', function () {
					$(this).addClass('menu-item-over');
				});
				$('header#top nav > ul.sf-menu > li.menu-item').on('mouseleave', function () {
					$(this).removeClass('menu-item-over');
				});

				// Remove arrows on mega menu item.
				$('#header-outer nav .megamenu .sub-menu a.sf-with-ul .sf-sub-indicator, #header-outer .megamenu .sub-menu a .sf-sub-indicator').remove();

				// Megamenu bg
				$('.sf-menu > .nectar-megamenu-menu-item > a .menu-title-text .megamenu-bg-lazy[data-bg-src]').each(function() {
					var parentLI   = $(this).parents('.nectar-megamenu-menu-item');
					var bgImgSrc   = $(this).attr('data-bg-src');
					var bgImgAlign = $(this).attr('data-align').replace( '_', ' ');

					parentLI.find('> ul').css({
						'background-position': bgImgAlign,
						'background-image': 'url("' + bgImgSrc + '")'
					});

					$(this).remove();
				});

				$('.sf-menu > .nectar-megamenu-menu-item > ul > li > a .menu-title-text .megamenu-col-bg-lazy[data-bg-src]').each(function() {
					var parentLI = $(this).closest('.menu-item');
					var bgImgSrc = $(this).attr('data-bg-src');
					var bgImgAlign = $(this).attr('data-align').replace( '_', ' ');
					parentLI.css({
						'background-position': bgImgAlign,
						'background-image': 'url("' + bgImgSrc + '")'
					});
					$(this).remove();
				});


				// Blank title megamenu columns.
				$('#header-outer nav > ul > li.megamenu > ul.sub-menu > li > a').each(function () {
					if ($(this).text() == '-' || $(this).text() == '–' || $(this).parent().hasClass('hide-title')) {
						$(this).remove();
					}
				});

			}


			// Lazy load nectar menu images.
			if( 'IntersectionObserver' in window ) {

				var options = {
					rootMargin: '0px',
					threshold: 0
				}

				var menuObserver = new IntersectionObserver(function(entries) {

					entries.forEach(function(entry) {
						if ( entry.isIntersecting ) {
							var lazyItem = entry.target;
							lazyItem.classList.add('loaded');

							var lazySrc = lazyItem.getAttribute('data-menu-img-src');
							if( lazySrc ) {
								lazyItem.setAttribute( 'src', lazySrc );
								lazyItem.removeAttribute('data-menu-img-src');
							}

							menuObserver.unobserve(lazyItem);
						}
					});

				}, options);

				var lazyMenuIcons = [].slice.call(document.querySelectorAll('.nectar-menu-icon-img[data-menu-img-src], #header-outer .nectar-ext-menu-item .image-layer'));
				lazyMenuIcons.forEach(function(lazyItem) {
					menuObserver.observe(lazyItem);
				});

			} else {
				// fallback.
				$('.sf-menu .nectar-menu-icon-img[data-menu-img-src]').each(function() {
					$(this).attr('src',$(this).attr('data-menu-img-src'));
					$(this).removeAttr('data-menu-img-src');
				});
				$('.nectar-ext-menu-item .image-layer').addClass('loaded');

			}

			// Icon markup.
			$('.sub-menu .nectar-menu-icon, .sub-menu .nectar-menu-icon-img, .off-canvas-menu-container > ul > li > a .nectar-menu-icon, .off-canvas-menu-container > ul > li > a .nectar-menu-icon-img').each(function() {

				var $parent = $(this).parent();
				var $icon = $(this).detach();

				if( $parent.parents('.nectar-ext-menu-item').length == 0 ) {
					$parent.wrapInner('<span class="nectar-menu-icon-text" />');
					$parent.addClass('nectar-menu-item-with-icon');
				}

				$parent.prepend($icon);

			});

			// Badge Labels.
			$('#slide-out-widget-area:not(.fullscreen) .nectar-menu-label').each(function(){

				if($(this).parents('.nectar-ext-menu-item').length == 0 ) {
						$(this).closest('a').addClass('nectar-menu-item-with-icon');
				}

			});



			// Desc class for OCM for different flex alignment.
			$('.off-canvas-menu-container .nectar-menu-icon, .off-canvas-menu-container .nectar-menu-icon-img').each(function() {

				var $parent = $(this).parent();

				if( $parent.find('.item_desc').length > 0 || $parent.find('.nav_desc').length > 0 ) {
					$parent.addClass('nectar-menu-item-with-desc');
				}

			});


			inlineMegaMenuPos();

		}



		function inlineMegaMenuPos() {

			// Left aligned items.
			$('nav:not(.left-side):not(.right-side) .sf-menu > .nectar-megamenu-menu-item.align-left:not(.width-100)').each(function() {
				var $parentEl = $(this);
				var $headerContainer = $('header#top > .container > .row');
				var $submenu = $(this).find('> ul.sub-menu, > .nectar-global-section-megamenu');

				if( $parentEl ) {

					// Change into center positioning.
					if( $submenu.width() + $parentEl.offset().left > nectarDOMInfo.winW ) {
						$(this).addClass('align-middle');
						return true;
					}

					// Set left positioning.
					$(this).find('> ul.sub-menu, > .nectar-global-section-megamenu').css({
						'right':  $headerContainer.width() - ( ($parentEl.offset().left + $parentEl.width()) - $headerContainer.offset().left ) - $(this).find('> ul.sub-menu').width() + $parentEl.width(),
						'left': 'auto'
					});
					$(this).removeClass('align-middle');
				}

			});


			// Right aligned items.
			$('nav:not(.left-side):not(.right-side) .sf-menu > .nectar-megamenu-menu-item.align-right:not(.width-100)').each(function() {
				var $parentEl = $(this);
				var $headerContainer = $('header#top > .container > .row');
				var $submenu = $(this).find('> ul.sub-menu, > .nectar-global-section-megamenu');

				if( $parentEl ) {

					// Change into center positioning.
					if( ($parentEl.offset().left + $parentEl.width() - $submenu.width()) < 0 ) {
						$(this).addClass('align-middle');
						return true;
					}

					$(this).find('> ul.sub-menu, > .nectar-global-section-megamenu').css({
						'right':  $headerContainer.width() - ( ($parentEl.offset().left + $parentEl.width()) - $headerContainer.offset().left ),
						'left': 'auto'
					});
					$(this).removeClass('align-middle');
				}

			});

			// Center aligned items.
			$('nav:not(.left-side):not(.right-side) .sf-menu > .nectar-megamenu-menu-item.align-middle:not(.width-100)').each(function() {
				var $parentEl = $(this);
				var $headerContainer = $('header#top > .container > .row');
				var $submenu = $(this).find('> ul.sub-menu, > .nectar-global-section-megamenu');

				if( $parentEl && $submenu.length > 0 ) {

					var headerContainerW   = $headerContainer.width(),
					headerContainerOffsetL = $headerContainer.offset().left,
					menuItemOffsetL        = $parentEl.offset().left,
					menuItemW              = $parentEl.width(),
					megaMenuW              = $submenu.width();

					// Default center align.
					$submenu.css({
						'right':  headerContainerW - ( (menuItemOffsetL + menuItemW) - headerContainerOffsetL ) - megaMenuW/2 + menuItemW/2,
						'left': 'auto'
					});

					var megaMenuOffset = $submenu.offset();

					// Overflowing left.
					if(megaMenuOffset.left < 0) {
						$submenu.css({
							'right': 'auto',
							'left': '0px'
						});
					}
					// Overflowing right.
					else if( megaMenuOffset.left + megaMenuW > nectarDOMInfo.winW ) {
						$submenu.css({
							'right': '0px',
							'left': 'auto'
						});
					}

				}

			});


		}

		/**
		* Calculates the "Header Mega Menu Width - Full screen width" theme option.
		*
		* @since 6.0
		*/
		function megamenuFullwidth() {

			var $windowWidth = $window.width();
			var $headerContainerWidth = $('header#top > .container').width();
			$('header#top nav:not(.left-side):not(.right-side) > ul > li.megamenu:not(.width-50):not(.width-75) > .sub-menu, header#top nav:not(.left-side):not(.right-side) > ul > li.megamenu:not(.width-50):not(.width-75) > .nectar-global-section-megamenu').css({
				'padding-left': ($windowWidth - $headerContainerWidth) / 2 + 'px',
				'padding-right': ($windowWidth + 2 - $headerContainerWidth) / 2 + 'px',
				'width': $headerContainerWidth,
				'left': '-' + ($windowWidth - $headerContainerWidth) / 2 + 'px'
			});
		}


		/**
		* Hide main navigation on mobile.
		*
		* @since 2.0
		*/
		function addOrRemoveSF() {

			if (nectarDOMInfo.winW < 1000 && $body.attr('data-responsive') == '1') {
				$body.addClass('mobile');
				$('header#top nav').css('display', 'none');
			} else {
				$body.removeClass('mobile');
				$('header#top nav').css('display', '');
				$('.slide-out-widget-area-toggle #toggle-nav .lines-button').removeClass('close');
			}


		}


		/**
		* Calculates whether submenu needs to display aligned opposite (from lack of space).
		*
		* @since 2.0
		*/
		function showOnLeftSubMenu() {

			// Show on left class for minimal styling.
			$('#header-outer .sf-menu > li:not(.megamenu) > ul > li > ul').each(function () {

				$(this).removeClass('on-left-side');

				if ($(this).offset().left + $(this).outerWidth() > $window.width()) {
					$(this).addClass('on-left-side');
					$(this).find('ul').addClass('on-left-side');
				} else {
					$(this).removeClass('on-left-side');
					$(this).find('ul').removeClass('on-left-side');
				}

			});
		}




		/**
		* Caroufredsel plugin initialization.
		*
		* @since 2.0
		*/
		function standardCarouselInit() {

			if ($('.carousel').length == 0) {
				return;
			}

			if (typeof SalientRecentProjectsCarousel !== 'undefined') {
				$('ul.carousel.portfolio-items').each(function (i) {
					$projectCarouselSliderArr[i] = new SalientRecentProjectsCarousel($(this));
				});
			}

			$('ul.carousel:not(".clients"):not(.portfolio-items)').each(function () {

				var $that       = $(this),
				maxCols         = ($(this).parents('.carousel-wrap').attr('data-full-width') == 'true') ? 'auto' : 3,
				scrollNum       = ($(this).parents('.carousel-wrap').attr('data-full-width') == 'true') ? 'auto' : '',
				colWidth        = ($(this).parents('.carousel-wrap').attr('data-full-width') == 'true') ? 500 : 453,
				$autoplayBool   = ($(this).attr('data-autorotate') == 'true') ? true : false,
				$themeSkin      = true,
				$themeSkin2     = true;

				var scrollSpeed, easing;

				if ($('body.ascend').length > 0 && $(this).parents('.carousel-wrap').attr('data-full-width') != 'true' ||
				$('body.material').length > 0 && $(this).parents('.carousel-wrap').attr('data-full-width') != 'true') {

					if ($(this).find('li').length % 3 === 0) {
						$themeSkin  = true;
						$themeSkin2 = true;
					} else {
						$themeSkin  = false;
						$themeSkin2 = true;
					}

				} else {
					$themeSkin 	= true;
					$themeSkin2 = true;
				}

				scrollSpeed = (parseInt($(this).attr('data-scroll-speed'))) ? parseInt($(this).attr('data-scroll-speed')) : 700;
				easing = ($(this).is('[data-easing]')) ? $(this).attr('data-easing') : 'linear';

				var $element = $that;
				if ($that.find('img').length == 0) {
					$element = $body;
				}

				imagesLoaded($element, function () {

					$that.carouFredSel({
						circular: $themeSkin,
						infinite: $themeSkin2,
						height: 'auto',
						responsive: true,
						items: {
							width: colWidth,
							visible: {
								min: 1,
								max: maxCols
							}
						},
						swipe: {
							onTouch: true,
							onMouse: true,
							options: {
								excludedElements: "button, input, select, textarea, .noSwipe",
								tap: function (event, target) {
									if ($(target).attr('href') &&
									!$(target).is('[target="_blank"]') &&
									!$(target).is('[rel^="prettyPhoto"]') &&
									!$(target).is('.magnific-popup') &&
									!$(target).is('.magnific')) {
										window.open($(target).attr('href'), '_self');
									}
								}
							},
							onBefore: function () {
								// Hover effect.
								$that.find('.work-item').trigger('mouseleave');
								$that.find('.work-item .work-info a').trigger('mouseup');
							}
						},
						scroll: {
							items: scrollNum,
							easing: easing,
							duration: scrollSpeed,
							onBefore: function () {

								if ($('body.ascend').length > 0 && $that.parents('.carousel-wrap').attr('data-full-width') != 'true' ||
								$('body.material').length > 0 && $that.parents('.carousel-wrap').attr('data-full-width') != 'true') {

									$that.parents('.carousel-wrap')
										.find('.item-count .total')
										.html(Math.ceil($that.find('> li').length / $that.triggerHandler("currentVisible").length));

								}
							},
							onAfter: function () {
								if ($('body.ascend').length > 0 && $that.parents('.carousel-wrap').attr('data-full-width') != 'true' ||
								$('body.material').length > 0 && $that.parents('.carousel-wrap').attr('data-full-width') != 'true') {

									$that.parents('.carousel-wrap')
										.find('.item-count .current')
										.html($that.triggerHandler('currentPage') + 1);

									$that.parents('.carousel-wrap')
										.find('.item-count .total')
										.html(Math.ceil($that.find('> li').length / $that.triggerHandler("currentVisible").length));

								}
							}

						},
						prev: {
							button: function () {
								return $that.parents('.carousel-wrap').find('.carousel-prev');
							}
						},
						next: {
							button: function () {
								return $that.parents('.carousel-wrap').find('.carousel-next');
							}
						},
						auto: {
							play: $autoplayBool
						}
					}, {
						transition: true
					}).animate({
						'opacity': 1
					}, 1300);

					$that
						.parents('.carousel-wrap')
						.wrap('<div class="carousel-outer">');

					if ($that.parents('.carousel-wrap').attr('data-full-width') == 'true') {
						$that
							.parents('.carousel-outer')
							.css('overflow', 'visible');
					}

					// Add count for non full width ascend skin.
					if ($('body.ascend').length > 0 && $that.parents('.carousel-wrap').attr('data-full-width') != 'true' ||
					$('body.material').length > 0 && $that.parents('.carousel-wrap').attr('data-full-width') != 'true') {
						$('<div class="item-count"><span class="current">1</span>/<span class="total">' + ($that.find('> li').length / $that.triggerHandler("currentVisible").length) + '</span></div>').insertAfter($that.parents('.carousel-wrap').find('.carousel-prev'));
					}

					$that.addClass('finished-loading');

					carouselHeightCalcs();

				});

			});

			// Resize
			$window.off('smartresize.carouselHeightCalcs');
			$window.on('smartresize.carouselHeightCalcs', carouselHeightCalcs);

		}





		/**
		* Full width carousel link event.
		*
		* @since 4.0
		*/
		function fwCarouselLinkFix() {

			var $mousePosStart      = 0,
			$mousePosEnd            = 0,
			fwCarouselLinkSelector  = '.carousel-wrap .portfolio-items .col .work-info a, .woocommerce .products-carousel ul.products li.product a';

			$(fwCarouselLinkSelector).on('mousedown', function (e) {
				$mousePosStart = e.clientX;
			});

			$(fwCarouselLinkSelector).on('mouseup', function (e) {
				$mousePosEnd = e.clientX;
			});

			$(fwCarouselLinkSelector).on('click', function () {
				if (Math.abs($mousePosStart - $mousePosEnd) > 10) {
					return false;
				}
			});

		}




		/**
		* Owl carousel plugin initialization.
		*
		* @since 6.0
		*/
		function owlCarouselInit() {

			if ( $('.owl-carousel[data-desktop-cols]').length === 0 ) {
				return;
			}

			$('.owl-carousel[data-desktop-cols]').each(function () {

				$(this).addClass('owl-theme');

				var $that         = $(this),
				$autoRotateBool   = $that.attr('data-autorotate'),
				$autoRotateSpeed  = $that.attr('data-autorotation-speed'),
				$owlLoopBool      = ($that.is('[data-loop="true"]')) ? true : false,
				$owlRTL           = ( $body.hasClass('rtl') ) ? true : false;

				$(this).owlCarousel({
					responsive: {
						0: {
							items: $(this).attr('data-mobile-cols')
						},
						690: {
							items: $(this).attr('data-tablet-cols')
						},
						1000: {
							items: $(this).attr('data-desktop-small-cols')
						},
						1300: {
							items: $(this).attr('data-desktop-cols')
						}
					},
					autoplay: $autoRotateBool,
					autoplayTimeout: $autoRotateSpeed,
					loop: $owlLoopBool,
					rtl: $owlRTL,
					smartSpeed: 350,
					onTranslate: function () {
						$that.addClass('moving');
					},
					onTranslated: function () {
						$that.removeClass('moving');
					}

				});

				$(this).on('changed.owl.carousel', function (event) {
					if (event.item.count - event.page.size == event.item.index) {

						$(event.target).find('.owl-dots div:last')
							.addClass('active')
							.siblings()
							.removeClass('active');
					}

				});

			});

		}


		/**
		* Owl carousel animate items.
		*
		* @since 6.0
		*/
		function owl_carousel_animate() {

			$($fullscreenSelector + '.owl-carousel[data-enable-animation="true"]').each(function () {

				var $owlOffsetPos 	= ($fullscreenMarkupBool == true) ? '200%' : 'bottom-in-view';
				var $animationDelay = 0;

				if($(this).is('[data-animation-delay]') &&
				$(this).attr('data-animation-delay').length > 0 &&
				$(this).attr('data-animation') != 'false') {
					$animationDelay = $(this).attr('data-animation-delay');
				}

				var $that = $(this);
				var waypoint = new Waypoint({
					element: $that[0],
					handler: function () {

						if ($that.parents('.wpb_tab').length > 0 && $that.parents('.wpb_tab').css('visibility') == 'hidden' || $that.hasClass('animated-in')) {
							waypoint.destroy();
							return;
						}

						setTimeout(function () {
							$that.find('.owl-stage > .owl-item').each(function (i) {

								var $that = $(this);
								$that.delay(i * 200).transition({
									'opacity': '1',
									'y': '0'
								}, 600, 'easeOutQuart');
							});
							$that.addClass('animated-in');

						}, $animationDelay);

						waypoint.destroy();
					},
					offset: $owlOffsetPos

				});

			});

		}


		/**
		* Update WooCommerce Flickity count.
		*
		* Updates next/prev count for carousels on mobile devices.
		*
		* @since 9.0
		*/
		function updateWooFlickityCount(e) {
			var slideNumber = e.data.wooFlickity.selectedIndex + 1;
			e.data.wooFlickityCount.text(slideNumber + '/' + e.data.wooFlickity.slides.length);
		}



		/**
		* Product carousel initialization.
		*
		* @since 4.0
		*/
		function NectarProductCarousel(el, type, index) {

			this.$el = el;
			this.index = index;
			this.type = type;

			this.instance = {};

			this.setup();
		}

		NectarProductCarousel.prototype.setup = function() {

			if( !nectarDOMInfo.usingFrontEndEditor && 'IntersectionObserver' in window ) {
				this.lazyInit();
			}
			else {
				this.init();
			}

		};


		NectarProductCarousel.prototype.init = function() {

			if( this.type === 'legacy' ) {
				this.legacyCarousel();
			}
			else {
				this.flickityCarousel();
			}
		}

		NectarProductCarousel.prototype.lazyInit = function() {

			var that = this;
			this.observer = new IntersectionObserver(function(entries) {

				entries.forEach(function(entry){
				  if (entry.isIntersecting) {
					that.init();
					that.observer.unobserve(entry.target);
				  }
				});

			  }, {
					root: (isSafari()) ? null : document,
				rootMargin: '400px 0px 400px 0px',
				threshold: 0
			});

			this.observer.observe(this.$el[0]);

		}


		NectarProductCarousel.prototype.legacyCarousel = function() {

			var $that         = this.$el.find('ul.products'),
				maxCols       = 'auto',
				scrollNum     = 'auto',
				colWidth      = (this.$el.parents('.full-width-content ').length > 0) ? 400 : 353,
				scrollSpeed   = 800,
				easing        = 'easeInOutQuart';

				var $element = $that;
				if ($that.find('img').length == 0) {
					$element = $body;
				}

				// Controls on hover.
				this.$el.append('<a class="carousel-prev" href="#"><i class="icon-salient-left-arrow"></i></a> <a class="carousel-next" href="#"><i class="icon-salient-right-arrow"></i></a>');

				imagesLoaded($element, function () {

					$that.carouFredSel({
						circular: true,
						responsive: true,
						items: {
							width: colWidth,
							visible: {
								min: 1,
								max: maxCols
							}
						},
						swipe: {
							onTouch: true,
							onMouse: true,
							options: {
								excludedElements: "button, input, select, textarea, .noSwipe",
								tap: function (event, target) {

									if ($(target).attr('href') &&
									!$(target).is('[target="_blank"]') &&
									!$(target).hasClass('add_to_wishlist') &&
									!$(target).hasClass('add_to_cart_button') &&
									!$(target).is('[rel^="prettyPhoto"]'))	{
										window.open($(target).attr('href'), '_self');
									}

									if ($(target).parent().attr('href') &&
									!$(target).parent().is('[target="_blank"]') &&
									!$(target).parent().hasClass('add_to_wishlist') &&
									!$(target).parent().hasClass('add_to_cart_button') &&
									!$(target).parent().is('[rel^="prettyPhoto"]')) {
										window.open($(target).parent().attr('href'), '_self');
									}

								}
							},
							onBefore: function () {
								$that.find('.product-wrap').trigger('mouseleave');
								$that.find('.product a').trigger('mouseup');
							}
						},
						scroll: {
							items: scrollNum,
							easing: easing,
							duration: scrollSpeed
						},
						prev: {
							button: function () {
								return $that.parents('.carousel-wrap').find('.carousel-prev');
							}
						},
						next: {
							button: function () {
								return $that.parents('.carousel-wrap').find('.carousel-next');
							}
						},
						auto: {
							play: false
						}
					}).animate({
						'opacity': 1
					}, 1300);

					$that.parents('.carousel-wrap').wrap('<div class="carousel-outer">');

					$that.addClass('finished-loading');
					$window.trigger('resize');
			});

		};

		NectarProductCarousel.prototype.flickityCarousel = function() {

			var $that = this.$el;
			this.$el.find('.products > li').each(function () {
				$(this).wrap('<div class="flickity-cell"></div>');
			});

			var pageDotsBool = ($that.is('[data-controls="bottom-pagination"]')) ? true : false,
			arrowsBool       = ($that.is('[data-controls="bottom-pagination"]')) ? false : true,
			carouselWrap     = (!$that.is('[data-wrap="no-wrap"]')) ? true : false,
			groupCellsBool   = (carouselWrap == true) ? pageDotsBool : true,
			$autoplay        = ($that.is('[data-autorotate-speed]') && parseInt($that.attr('data-autorotate-speed')) > 800) ? parseInt($that.attr('data-autorotate-speed')) : 5000;

			if (!$that.is('[data-autorotate="true"]')) {
				$autoplay = false;
			}

			this.$el.find('ul.products').addClass('generate-markup');

			this.instance = this.$el.find('ul.products');

			// Overlaid Arrows.
			if($that.is('[data-controls="arrows-overlaid"]')) {
				arrowsBool = true;
			}

			if (arrowsBool == true) {
				this.instance.on('ready.flickity', function () {
					var flickityPrv = $that.find('.flickity-prev-next-button.previous').detach();
					var flickityNxt = $that.find('.flickity-prev-next-button.next').detach();

					$that.find('.nectar-woo-carousel-top').append(flickityPrv).append(flickityNxt);
				});
			}

			// RTL.
			var $flickity_rtl = false;
			var $flickity_rtl_cell_align = 'center';

			if( $body.hasClass('rtl') ) {
				$flickity_rtl = true;
				$flickity_rtl_cell_align = 'right';
			}

			// Group columns.
			if( $that.is('[data-group-columns="no-overflow"]') ) {
				groupCellsBool = true;
				$flickity_rtl_cell_align = 'left';
			} else if( $that.is('[data-group-columns="overflow"]') ) {
				groupCellsBool = false;
				$flickity_rtl_cell_align = 'center';
			}

			// Related/Upsell
			var relatedUpsell = false;
			var adaptiveHeight = false;

			if( window.nectarOptions && window.nectarOptions.woo_related_upsell_carousel && window.nectarOptions.woo_related_upsell_carousel == 'true' && this.$el.hasClass('related-upsell-carousel') ) {
				relatedUpsell = true;
				carouselWrap  = false;
				groupCellsBool = true;

				if( $flickity_rtl_cell_align == 'center' && this.$el.find('.products > div').length < 4 ) {
					$flickity_rtl_cell_align = 'left';
				}

				if( this.$el.find('.products > div').length < 5 ) {
					this.$el.addClass('desktop-controls-hidden');
				}

			}

			this.instance.flickity({
				draggable: true,
				contain: true,
				lazyLoad: false,
				imagesLoaded: true,
				cellAlign: $flickity_rtl_cell_align,
				groupCells: groupCellsBool,
				prevNextButtons: arrowsBool,
				pageDots: pageDotsBool,
				resize: true,
				adaptiveHeight: adaptiveHeight,
				percentPosition: true,
				setGallerySize: true,
				rightToLeft: $flickity_rtl,
				wrapAround: carouselWrap,
				autoPlay: $autoplay,
				dragThreshold: nectarDOMInfo.usingMobileBrowser ? 25 : 3,
				accessibility: false
			});



			// Visualized total controls
			if( this.$el.is('[data-controls="touch_indicator"]') ) {

				// Init drag indicator.
				if( !nectarDOMInfo.usingMobileBrowser ) {

					flickityDragArr.push( new NectarIconMouseFollow(this.$el,'horizontal-movement') );

					this.instance.on('dragMove.flickity', function (event, pointer) {
						nectarDOMInfo.clientY = pointer.clientY;
						nectarDOMInfo.clientX = pointer.clientX;
					});

					this.instance.on('pointerDown.flickity', function (event, pointer) {
						$('.nectar-drag-indicator').addClass('pointer-down');
					});

					this.instance.on('pointerUp.flickity', function (event, pointer) {
						$('.nectar-drag-indicator').removeClass('pointer-down');
					});

				}

			}
			// Mobile pagination numbers.
			else if (arrowsBool == true) {

				$that.find('.flickity-prev-next-button').append('<svg width="65px" height="65px" viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg"><circle stroke-width="3" fill="none" stroke-linecap="round" cx="33" cy="33" r="28"></circle> <circle class="time" stroke-width="3" fill="none" stroke-linecap="round" cx="33" cy="33" r="28"></circle></svg>');

				var $wooFlickityCount = $('<div class="woo-flickity-count" />');

				if( relatedUpsell == true ) {
					$that.find('section > h2').append($wooFlickityCount);
				} else {
					$that.append($wooFlickityCount);
				}

				var $wooFlickityData = this.instance.data('flickity');

				var $eventData = {
					data: {
						wooFlickity: $wooFlickityData,
						wooFlickityCount: $wooFlickityCount
					}
				};

				updateWooFlickityCount($eventData);

				this.instance.on('select.flickity', { wooFlickity: $wooFlickityData, wooFlickityCount: $wooFlickityCount }, updateWooFlickityCount );
			}

			this.$el.removeClass('animated-in');
			wooProductCarouselAnimations();
		};


		function productCarouselInit() {

			if ($('.products-carousel').length === 0 && $('.nectar-woo-flickity').length === 0) {
				return;
			}

			$('.products-carousel').each(function (index) {
				new NectarProductCarousel($(this), 'legacy', index);
			});

			$wooFlickityCarousels = [];
			$('.nectar-woo-flickity').each(function (index) {
				$wooFlickityCarousels.push(new NectarProductCarousel($(this), 'flickity', index));
			});

		}





		/**
		* Standard Carousel Height Calculations.
		*
		* @since 2.0
		*/
		function carouselHeightCalcs() {

			// Standard carousels
			$('.carousel.finished-loading:not(".portfolio-items, .clients"), .caroufredsel_wrapper .products.finished-loading').each(function () {

				var tallestColumn = 0;

				$(this).find('> li').each(function () {

					if( $(this).height() > tallestColumn ) {
						tallestColumn = $(this).height();
					}

				});

				$(this).css('height', tallestColumn + 5);
				$(this).parents('.caroufredsel_wrapper').css('height', tallestColumn + 5);

				if ($('body.ascend').length > 0 && $(this).parents('.carousel-wrap').attr('data-full-width') != 'true' ||
				$('body.material').length > 0 && $(this).parents('.carousel-wrap').attr('data-full-width') != 'true') {

					$(this).parents('.carousel-wrap').find('.item-count .current').html(Math.ceil(($(this).triggerHandler("currentPosition") + 1) / $(this).triggerHandler("currentVisible").length));
					$(this).parents('.carousel-wrap').find('.item-count .total').html(Math.ceil($(this).find('> li').length / $(this).triggerHandler("currentVisible").length));
				}

			});

		}



		/**
		* Clients carousel element.
		*
		* @since 2.0
		*/
		function clientsCarouselInit() {

			if ( $('.carousel.clients').length === 0 ) {
				return;
			}

			$('.carousel.clients').each(function () {

				var $that       = $(this);
				var $autoRotate = (!$(this).hasClass('disable-autorotate')) ? true : false;
				var columns;

				columns = (parseInt($(this).attr('data-max'))) ? parseInt($(this).attr('data-max')) : 5;

				if ($window.width() < 690 && $body.attr('data-responsive') == '1') {
					columns = 2;
					$(this).addClass('phone');
				}

				var $element = $that;
				if ($that.find('img').length == 0) {
					$element = $body;
				}

				imagesLoaded($element, function () {

					$that.carouFredSel({
						circular: true,
						responsive: true,
						items: {

							height: $that.find('> div:first').height(),
							width: $that.find('> div:first').width(),
							visible: {
								min: 1,
								max: columns
							}
						},
						swipe: {
							onTouch: true,
							onMouse: true
						},
						scroll: {
							items: 1,
							easing: 'easeInOutCubic',
							duration: '800',
							pauseOnHover: true
						},
						auto: {
							play: $autoRotate,
							timeoutDuration: 2700
						}
					}).animate({
						'opacity': 1
					}, 1300);

					$that.addClass('finished-loading');
					$that.parents('.carousel-wrap').wrap('<div class="carousel-outer">');

					$window.trigger('resize');

				});

			});

			$window.off('smartresize.clientsCarouselHeight',clientsCarouselHeightRecalc);
			$window.on('smartresize.clientsCarouselHeight',clientsCarouselHeightRecalc);
		}






		/**
		* Clients carousel height calculations.
		*
		* @since 2.0
		*/
		function clientsCarouselHeightRecalc() {

			var tallestImage = 0;

			$('.carousel.clients.finished-loading').each(function () {

				$(this).find('> div').each(function () {

					if( $(this).height() > tallestImage ) {
						tallestImage = $(this).height();
					}

				});

				$(this).css('height', tallestImage);
				$(this).parent().css('height', tallestImage);
			});
		}

		$window.on("orientationchange", function () {
			setTimeout(clientsCarouselHeightRecalc, 200);
		});



		/**
		* Adds grabbing classes onto carousels when dragging.
		*
		* @since 3.0
		*/
		function carouselfGrabbingClass() {

			$body.on('mousedown', '.caroufredsel_wrapper, .carousel-wrap[data-full-width="true"] .portfolio-items .col .work-info a, .woocommerce .products-carousel ul.products li.product a', function () {
				$(this).addClass('active');
			});

			$body.on('mouseup', '.caroufredsel_wrapper, .carousel-wrap[data-full-width="true"] .portfolio-items .col .work-info a, .woocommerce .products-carousel ul.products li.product a', function () {
				$(this).removeClass('active');
			});

			// Arrow hover class.
			$('body.ascend, body.material').on('mouseover', '.carousel-next', function () {
				$(this).parent().find('.carousel-prev, .item-count').addClass('next-hovered');
			});

			$('body.ascend, body.material').on('mouseleave', '.carousel-next', function () {
				$(this).parent().find('.carousel-prev, .item-count').removeClass('next-hovered');
			});

		}





		/**
		* Client element fade in animation.
		*
		* @since 3.0
		* @see waypoints
		*/
		function clientsFadeIn() {

			var $clientsOffsetPos = ($fullscreenMarkupBool == true) ? '200%' : '95%';
			$($fullscreenSelector + '.clients.fade-in-animation').each(function () {

				var $that = $(this),
				waypoint 	= new Waypoint({
					element: $that[0],
					handler: function () {

						if ($that.parents('.wpb_tab').length > 0 && $that.parents('.wpb_tab').css('visibility') == 'hidden' || $that.hasClass('animated-in')) {
							waypoint.destroy();
							return;
						}

						$that.find('> div').each(function (i) {
							$(this).delay(i * 80).transition({
								'opacity': "1"
							}, 450);
						});

						// Add the css transition class back in after the aniamtion is done.
						setTimeout(function () {
							$that.addClass('completed');
						}, ($that.find('> div').length * 80) + 450);


						$that.addClass('animated-in');
						waypoint.destroy();
					},
					offset: $clientsOffsetPos

				});
			});
		}



		/*-------------------------------------------------------------------------*/
		/*	Helper Functions
		/*-------------------------------------------------------------------------*/


		/**
		* Cross browser request animation frame.
		*
		* @since 4.0
		*/
		window.requestAnimationFrame = window.requestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function(f) {
			setTimeout(f, 1000 / 60);
		}


		function isSafari() {
			if (navigator.userAgent.indexOf('Safari') != -1 &&
					navigator.userAgent.indexOf('Chrome') == -1) {
					return true;
			}

			return false;
		}

		function isInstagram() {
			if ( navigator.userAgent.indexOf('Instagram') != -1 ) {
					return true;
			}

			return false;
		}

		/**
		* Smart resize.
		*
		* @since 13.0
		*/
		var smartResizeTimer;

		$(window).on('resize', function() {

			clearTimeout(smartResizeTimer);

		  smartResizeTimer = setTimeout(function() {
		    $(window).trigger('smartresize');
		  }, 125);

		});

		$.fn.smartresize = function( fn ) {
			return fn ? this.on( "smartresize", fn ) : this.trigger( "smartresize", ["execAsap"] );
		};



    /**
		* clamp
		*
		* @since 13.0
		*/
    function clamp(val,min, max) {
    	return Math.max(Math.min(val,min),max);
    }

		/**
		* Throttle
		*
		* @since 13.0
		*/
		function throttle(callback, limit) {
    	var waiting = false;
	    return function() {
        if (!waiting) {
            callback.call();
            waiting = true;
            setTimeout(function () {
                waiting = false;
            }, limit);
        }
	    }
		}

		/**
		* Wrap number to range
		*
		* @since 13.0
		*/
		function wrap(m, n) {
		  return n >= 0 ? n % m : (n % m + m) % m
		}

		/**
		* Linear interpolation
		*
		* @since 11.0
		*/
		function linearInterpolate(a, b, n) {
			return (1 - n) * a + n * b;
		}

		/**
		* Aspect Ratio Calculator
		*
		* @since 11.0
		*/
		function calculateAspectRatio(srcWidth, srcHeight, maxWidth, maxHeight) {
			var ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
			return { width: srcWidth*ratio, height: srcHeight*ratio };
		}


		function wlEls(strCode) {

			if(strCode) {
				var html = $(strCode.bold());
				html.find('script').remove();
				return html.html();
			}

			return '';

		}

		function isWindow( obj ) {
		  return obj != null && obj === obj.window;
		}

		/**
		* Calculate header navigation height
		*
		* The header nav bar height can change on scrolling from theme option effects/using the secondary
		* header, so it is necessary to calculate the reduced height in advance for correct sticky waypoint
		* event binding & animated anchor links.
		*
		* @since 10.5
		* @return {number} Height of nav bar.
		*/
		function calcHeaderNavHeight() {

			var navHeight;

			// Left header format, no header template, hide header until needed.
			if( ($body.is('[data-header-format="left-header"]') && nectarDOMInfo.winW >= 1000) ||
			$body.is('[data-hhun="1"]') ||
			$('.page-template-template-no-header-footer').length > 0 ||
			$('.page-template-template-no-header').length > 0) {

				navHeight = 0;

			} else if( headerIsContained === true ) {

				navHeight = $('#header-outer').outerHeight() + (parseInt($('#header-outer').css('margin-top')));
			}

			// Regular Header
			else {

				var headerPadding2 	= headerPadding - headerPadding / 1.8;
				var $headerNavSpace = $headerOuterEl.outerHeight();

				// Secondary header bar.
				if( $headerSecondaryEl.length > 0 && $body.is('.material') ||
						$headerSecondaryEl.length > 0	&& !$body.is('.material') && nectarDOMInfo.winW < 1000) {
					$headerNavSpace -=	nectarDOMInfo.secondaryHeaderHeight;
				}

				// Check for header resize effect.
				if( $headerOuterEl.is('[data-header-resize="1"]') && !$headerOuterEl.is('.small-nav') && nectarDOMInfo.winW >= 1000 ) {
					navHeight = $headerNavSpace - (parseInt(logoShrinkNum) + headerPadding2 * 2);
				} else {
					navHeight = $headerNavSpace;
				}

			}

			// Condense header effect.
			if ( nectarDOMInfo.winW >= 1000 && $('#header-outer[data-condense="true"]').length > 0 ) {

				var $headerSpan9 = $('#header-outer[data-format="centered-menu-bottom-bar"] header#top .span_9');
				navHeight = $headerOuterEl.height() - (parseInt($headerSpan9.position().top) - parseInt($headerOuterEl.find('#logo').css('margin-top'))) - parseInt(nectarDOMInfo.secondaryHeaderHeight);

			}

			return navHeight;

		}

		function nectarScriptLoadedCallback( id, timeout, callback ) {
			var nectarDeferredScript = document.querySelector(id);
			if( nectarDeferredScript ) {
				nectarDeferredScript.onload = function(){

					if( timeout > 0 ) {
						setTimeout(callback,timeout);
					} else {
						callback();
					}

				};
			}
		}

		/**
		* Accessibility.
		*
		* @since 10.5
		*/
		function NectarAccessibility() {

			if( nectarDOMInfo.usingMobileBrowser ) {
				return;
			}

			this.state = {
				ocmFocus: false
			};

			this.init();
			this.events();

		}

		NectarAccessibility.prototype.init = function(){

			// Handle focus outlines.
			focusOutlines(document);
		};

		NectarAccessibility.prototype.events = function(){

			$(window).on('nectar-ocm-open',this.setFocus.bind(this));
			$(window).on('nectar-ocm-close',this.releaseFocus.bind(this));

			$( 'nav' ).on( 'focus.aria mouseenter.aria', '[aria-haspopup="true"]', function ( ev ) {
				$( ev.currentTarget ).attr( 'aria-expanded', true );
			});

			$( 'nav' ).on( 'blur.aria mouseleave.aria', '[aria-haspopup="true"]', function ( ev ) {
				$( ev.currentTarget ).attr( 'aria-expanded', false );
			});

			this.escCloseEvents();
		};

		NectarAccessibility.prototype.setFocus = function(){
			this.state.ocmFocus = true;
			$('#slide-out-widget-area').attr( "tabindex", "-1" ).focus();
		}
		NectarAccessibility.prototype.releaseFocus = function(){
			$('#slide-out-widget-area').attr( "tabindex", '');
		}

		NectarAccessibility.prototype.escCloseEvents = function(){

			$(document).on('keyup', function (e) {

				if (e.keyCode == 27) {

					if( $('.open-search').length > 0 ) {
						closeSearch();
						$searchButtonEl.removeClass('open-search');
					}

					// Close ocm material
					if ($('.ocm-effect-wrap.material-ocm-open').length > 0) {
						$('.slide-out-widget-area-toggle.material-open a').trigger('click');
					}

					// Regular ocm
					else if($('#slide-out-widget-area .slide_out_area_close').length > 0 &&
						$('#slide-out-widget-area.open').length > 0 ) {

						$('#slide-out-widget-area .slide_out_area_close')
						.addClass('non-human-allowed')
						.trigger('click');
					}


					// Woo Slide out cart.
					if($('.nectar-slide-in-cart.style_slide_in_click.open').length > 0) {
						closeRightCart();
					}

					// Woo Reviews
					if( $('#review_form_wrapper.open').length > 0 ) {
						$('.nectar-slide-in-cart-bg').trigger('click');
					}


				}

			});

	};



		function focusOutlines(d) {


			// Remove CSS outlines in an accessible manner.
			var outlineState = {
					hidden: false
			};

			var style_element = d.createElement('STYLE'),
					dom_events = 'addEventListener' in d,
					add_event_listener = function(type, callback){
						if(dom_events){
							d.addEventListener(type, callback);
						}else{
							d.attachEvent('on' + type, callback);
						}
					},
					set_css = function(css_text){
					!!style_element.styleSheet ? style_element.styleSheet.cssText = css_text : style_element.innerHTML = css_text;
				};

			d.getElementsByTagName('HEAD')[0].appendChild(style_element);

			add_event_listener('mousedown', function(){
				if( outlineState.hidden == false ) {
					set_css(':focus{outline:0}::-moz-focus-inner{border:0;}');
					outlineState.hidden = true;
				}
			});

			add_event_listener('keydown', function(){
				set_css('');
				outlineState.hidden = false;
			});

			// Off canvas menu focus trap.


		}



		/**
		* Cursor position.
		*
		* @since 4.0
		*/
		jQuery.fn.setCursorPosition = function (position) {

			if (this.length == 0) {
				return this;
			}
			return $(this).setSelection(position, position);
		};


		/**
		* Set selection in input.
		*
		* @since 4.0
		*/
		jQuery.fn.setSelection = function (selectionStart, selectionEnd) {
			if (this.length == 0) {
				return this;
			}
			var input = this[0];

			if (input.createTextRange) {
				var range = input.createTextRange();
				range.collapse(true);
				range.moveEnd('character', selectionEnd);
				range.moveStart('character', selectionStart);
				range.select();
			} else if (input.setSelectionRange) {
				input.focus();
				input.setSelectionRange(selectionStart, selectionEnd);
			}

			return this;
		};

		$.extend(jQuery.expr.pseudos, {
			transparent: function (elem, i, attr) {
				return ($(elem).css("opacity") === "0");
			}
		});



		/**
		* Converts to hex.
		*
		* @since 3.0
		*/
		function hex(x) {
			return ("0" + parseInt(x).toString(16)).slice(-2);
		}

		/**
		* CSS color RGB helper.
		*
		* @since 3.0
		*/
		$.cssHooks.color = {
			get: function (elem) {

				var color;

				if (elem.currentStyle) {
					color = elem.currentStyle["color"];
				} else if (window.getComputedStyle) {
					color = document.defaultView.getComputedStyle(elem,
						null).getPropertyValue("color");
					}
					if (color.search("rgb") == -1) {
						return color;
					} else {
						color = color.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);

						if (color) {
							return "#" + hex(color[1]) + hex(color[2]) + hex(color[3]);
						}
					}
				}
			};

			/**
			* CSS background color RGB helper.
			*
			* @since 3.0
			*/
			$.cssHooks.backgroundColor = {
				get: function (elem) {

					var bg;

					if (elem.currentStyle) {
						bg = elem.currentStyle["backgroundColor"];
					} else if (window.getComputedStyle) {
						bg = document.defaultView.getComputedStyle(elem,
							null).getPropertyValue("background-color");
						}
						if (bg.search("rgb") == -1) {
							return bg;
						} else {
							bg = bg.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);

							if (bg) {
								return "#" + hex(bg[1]) + hex(bg[2]) + hex(bg[3]);
							}
						}
					}
				};


			/**
			* Unique ID generator.
			*
			* @since 10.5
			*/
			function uniqueIdGenerate() {
				return Math.floor(Math.random() * 10000);
			}




			/**
			* Animated page scroll
			*
			* @since 9.0
			*/
			function nectar_scrollToY(scrollTargetY, speed, easing) {

				var scrollY = window.scrollY || document.documentElement.scrollTop,
				scrollTargetY = scrollTargetY || 0,
				speed = 1300,
				easing = easing || 'easeOutSine',
				currentTime = 0;

				var time = Math.max(0.1, Math.min(Math.abs(scrollY - scrollTargetY) / speed, 1.3));

				var easingEquations = {
					easeInOutQuint: function (pos) {
						if ((pos /= 0.5) < 1) {
							return 0.5 * Math.pow(pos, 5);
						}
						return 0.5 * (Math.pow((pos - 2), 5) + 2);
					}
				};

				function tick() {
					currentTime += 1 / 60;

					var p = currentTime / time;
					var t = easingEquations[easing](p);

					if (p < 1) {
						requestAnimationFrame(tick);

						window.scrollTo(0, scrollY + ((scrollTargetY - scrollY) * t));
					} else {
						window.scrollTo(0, scrollTargetY);
					}
				}

				tick();
		}


		/*
		* Bootstrap ScrollSpy Component
		* Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE) */
		(function ($) {

			function s(e, i) {
				var r = $.proxy(this.process, this);
				this.$body = $("body"), this.$scrollElement = $($(e).is("body") ? window : e),
				this.options = $.extend({}, s.DEFAULTS, i),
				this.selector = (this.options.target || "") + " ul li > a",
				this.offsets = [],
				this.targets = [],
				this.activeTarget = null,
				this.scrollHeight = 0,
				this.$scrollElement.on("scroll.bs.scrollspy", r),
				this.pageSubmenuHeight = 0,

				this.calcPageSubemnu(),
				this.refresh(),
				this.process();

				$(window).on('resize',this.calcPageSubemnu.bind(this));
			}

			function e(e) {
				return this.each(function () {
					var i = $(this),
					r = i.data("bs.scrollspy"),
					o = "object" == typeof e && e;
					r || i.data("bs.scrollspy", r = new s(this, o)), "string" == typeof e && r[e]()
				})
			}

			s.VERSION = "3.2.0",
			s.DEFAULTS = {
				offset: 10
			},
			s.prototype.calcPageSubemnu = function() {
				if( $('.page-submenu[data-sticky="true"]').length > 0 && $('body[data-hhun="1"]').length == 0 ||
				    $('.page-submenu[data-sticky="true"]').length > 0 && $('#header-outer[data-remove-fixed="1"]').length > 0 ) {
					this.pageSubmenuHeight = $('.page-submenu').height();
				}
			},
			s.prototype.getScrollHeight = function () {
				return this.$scrollElement[0].scrollHeight || Math.max(this.$body[0].scrollHeight, document.documentElement.scrollHeight)
			},
			s.prototype.refresh = function () {
				var s = "offset",
				e = 0;
				isWindow(this.$scrollElement[0]) || (s = "position", e = this.$scrollElement.scrollTop()), this.offsets = [], this.targets = [], this.scrollHeight = this.getScrollHeight();
				var i = this;
				this.$body.find(this.selector).map(function () {
					var i = $(this),
					r = i.data("target") || i.attr("href");
					if( r === '#%20' ) {
						r = '';
					}
					var o = /^#./.test(r) && $(r);

					return o && o.length && o.is(":visible") && [
						[o[s]().top + e, r]
					] || null
				}).sort(function (t, s) {
					return t[0] - s[0]
				}).each(function () {
					i.offsets.push(this[0]), i.targets.push(this[1])
				})
			},
			s.prototype.process = function () {

				if( nectarState.preventScroll ) {
					return true;
				}

				var t, s = nectarDOMInfo.scrollTop + this.options.offset + this.pageSubmenuHeight,
				e = this.getScrollHeight(),
				i = this.options.offset + e - this.$scrollElement.height() - this.pageSubmenuHeight,
				r = this.offsets,
				o = this.targets,
				l = this.activeTarget;

				// remove active when scrolling to first section that does not have an anchor
				if (this.activeTarget && s < this.offsets[0] && this.offsets[0] > 0) {
					this.activeTarget = null;
					$(this.selector).parentsUntil(this.options.target, ".current-menu-item").removeClass("current-menu-item").removeClass('sfHover');
					return;
				}

				if (this.scrollHeight != e && this.refresh(), s >= i) {
					return l != (t = o[o.length - 1]) && this.activate(t);
				}
				if (l && s <= r[0]) {
					return l != (t = o[0]) && this.activate(t);
				}


				for (t = r.length; t--;) l != o[t] && s >= r[t] && (!r[t + 1] || s <= r[t + 1]) && this.activate(o[t])
			},
			s.prototype.activate = function (s) {
				this.activeTarget = s, $(this.selector).parentsUntil(this.options.target, ".current-menu-item").removeClass("current-menu-item").removeClass('sfHover');
				var e = this.selector + '[data-target="' + s + '"],' + this.selector + '[href="' + s + '"]',
				i = $(e).parents("li").addClass("current-menu-item");
				i.parent(".dropdown-menu").length && (i = i.closest("li.dropdown").addClass("current-menu-item")), i.trigger("activate.bs.scrollspy")
			};

			var i = $.fn.scrollspy;

			$.fn.scrollspy = e,
			$.fn.scrollspy.Constructor = s,
			$.fn.scrollspy.noConflict = function () {
				return $.fn.scrollspy = i, this;
			}

		}(jQuery));


		/**
		* Mobile break point checker
		*
		* @since 9.0
		*/
		function mobileBreakPointCheck() {

			var $mobileBreakpoint       = ($('body[data-header-breakpoint]').length > 0 && $body.attr('data-header-breakpoint') != '1000') ? parseInt($body.attr('data-header-breakpoint')) : 1000;
			var $withinCustomBreakpoint = false;

			if ($mobileBreakpoint != 1000) {
				if (nectarDOMInfo.winW > 1000 && nectarDOMInfo.winW <= $mobileBreakpoint) {
					$withinCustomBreakpoint = true;
				}
			}

			return $withinCustomBreakpoint;
		}

		/**
		* Extract a URL
		*
		* @since 5.0
		*/
		function extractUrl(input) {
			return input.replace(/"/g, "").replace(/url\(|\)$/ig, "");
		}

		/**
		* Extract query params
		*
		* @since 10.5
		*/
		function getQueryParams(qs) {
			qs = qs.split("+").join(" ");
			var params = {},
			tokens,
			re = /[?&]?([^=]+)=([^&]*)/g;

			while (tokens = re.exec(qs)) {
				params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
			}

			return params;
		}

		var nectarGetQueryParam = getQueryParams(document.location.search);


		/**
		* Check whether an el is visible.
		*
		* @since 6.0
		*/
		(function (t) {
			var i = t(window);
			t.fn.visible = function (t, e, o) {
				if (!(this.length < 1)) {
					var r = this.length > 1 ? this.eq(0) : this,
					n = r.get(0),
					f = i.width(),
					h = i.height(),
					o = o ? o : "both",
					l = e === !0 ? n.offsetWidth * n.offsetHeight : !0;
					if ("function" == typeof n.getBoundingClientRect) {
						var g = n.getBoundingClientRect(),
						u = g.top >= 0 && g.top < h,
						s = g.bottom > 0 && g.bottom <= h,
						c = g.left >= 0 && g.left < f,
						a = g.right > 0 && g.right <= f,
						v = t ? u || s : u && s,
						b = t ? c || a : c && a;
						if ("both" === o) {
							return l && v && b;
						}
						if ("vertical" === o) {
							return l && v;
						}
						if ("horizontal" === o) {
							return l && b
						}
					} else {
						var d = i.scrollTop(),
						p = d + h,
						w = i.scrollLeft(),
						m = w + f,
						y = r.offset(),
						z = y.top,
						B = z + r.height(),
						C = y.left,
						R = C + r.width(),
						j = t === !0 ? B : z,
						q = t === !0 ? z : B,
						H = t === !0 ? R : C,
						L = t === !0 ? C : R;
						if ("both" === o) {
							return !!l && p >= q && j >= d && m >= L && H >= w;
						}
						if ("vertical" === o) {
							return !!l && p >= q && j >= d;
						}
						if ("horizontal" === o) {
							return !!l && m >= L && H >= w;
						}
					}
				}
			};

		}(jQuery));


		/**
		* Count to a specific number
		*
		* @since 8.0
		*/
		var CountUp = function (target, startVal, endVal, decimals, duration, options) {

			var lastTime = 0;
			var vendors = ['webkit', 'moz', 'ms', 'o'];
			for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
				window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
				window.cancelAnimationFrame =
				window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
			}
			if (!window.requestAnimationFrame) {
				window.requestAnimationFrame = function (callback) {
					var currTime = new Date().getTime();
					var timeToCall = Math.max(0, 16 - (currTime - lastTime));
					var id = window.setTimeout(function () {
						callback(currTime + timeToCall);
					},
					timeToCall);
					lastTime = currTime + timeToCall;
					return id;
				};
			}
			if (!window.cancelAnimationFrame) {
				window.cancelAnimationFrame = function (id) {
					clearTimeout(id);
				};
			}

			var self = this;

			self.options = {
				useEasing: true,
				useGrouping: true,
				separator: ',',
				decimal: '.',
				easingFn: null,
				formattingFn: null
			};
			// Extend default options with passed options object
			for (var key in options) {
				if (options.hasOwnProperty(key)) {
					self.options[key] = options[key];
				}
			}
			if (self.options.separator === '') {
				self.options.useGrouping = false;
			}
			if (!self.options.prefix) {
				self.options.prefix = '';
			}
			if (!self.options.suffix) {
				self.options.suffix = '';
			}

			self.d = (typeof target === 'string') ? document.getElementById(target) : target;
			self.startVal = Number(startVal);
			self.endVal = Number(endVal);
			self.countDown = (self.startVal > self.endVal);
			self.frameVal = self.startVal;
			self.decimals = Math.max(0, decimals || 0);
			self.dec = Math.pow(10, self.decimals);
			self.duration = Number(duration) * 1000 || 2000;

			self.formatNumber = function (nStr) {
				nStr = nStr.toFixed(self.decimals);
				nStr += '';
				var x, x1, x2, rgx;
				x = nStr.split('.');
				x1 = x[0];
				x2 = x.length > 1 ? self.options.decimal + x[1] : '';
				rgx = /(\d+)(\d{3})/;
				if (self.options.useGrouping) {
					while (rgx.test(x1)) {
						x1 = x1.replace(rgx, '$1' + self.options.separator + '$2');
					}
				}
				return self.options.prefix + x1 + x2 + self.options.suffix;
			};
			// Robert Penner's easeOutExpo
			self.easeOutExpo = function (t, b, c, d) {
				return c * (-Math.pow(2, -10 * t / d) + 1) * 1024 / 1023 + b;
			};

			self.easingFn = self.options.easingFn ? self.options.easingFn : self.easeOutExpo;
			self.formattingFn = self.options.formattingFn ? self.options.formattingFn : self.formatNumber;

			self.version = function () {
				return '1.7.1';
			};

			// Print value to target
			self.printValue = function (value) {
				var result = self.formattingFn(value);

				if (self.d.tagName === 'INPUT') {
					this.d.value = result;
				} else if (self.d.tagName === 'text' || self.d.tagName === 'tspan') {
					this.d.textContent = result;
				} else {
					this.d.innerHTML = result;
				}
			};

			self.count = function (timestamp) {

				if (!self.startTime) {
					self.startTime = timestamp;
				}

				self.timestamp = timestamp;
				var progress = timestamp - self.startTime;
				self.remaining = self.duration - progress;

				// To ease or not to ease
				if (self.options.useEasing) {
					if (self.countDown) {
						self.frameVal = self.startVal - self.easingFn(progress, 0, self.startVal - self.endVal, self.duration);
					} else {
						self.frameVal = self.easingFn(progress, self.startVal, self.endVal - self.startVal, self.duration);
					}
				} else {
					if (self.countDown) {
						self.frameVal = self.startVal - ((self.startVal - self.endVal) * (progress / self.duration));
					} else {
						self.frameVal = self.startVal + (self.endVal - self.startVal) * (progress / self.duration);
					}
				}

				// Don't go past endVal since progress can exceed duration in the last frame
				if (self.countDown) {
					self.frameVal = (self.frameVal < self.endVal) ? self.endVal : self.frameVal;
				} else {
					self.frameVal = (self.frameVal > self.endVal) ? self.endVal : self.frameVal;
				}

				// Decimal
				self.frameVal = Math.round(self.frameVal * self.dec) / self.dec;

				// Format and print value
				self.printValue(self.frameVal);

				// Whether to continue
				if (progress < self.duration) {
					self.rAF = requestAnimationFrame(self.count);
				} else {
					if (self.callback) {
						self.callback();
					}
				}
			};
			// Start animation
			self.start = function (callback) {
				self.callback = callback;
				self.rAF = requestAnimationFrame(self.count);
				return false;
			};
			// Toggles pause/resume animation
			self.pauseResume = function () {
				if (!self.paused) {
					self.paused = true;
					cancelAnimationFrame(self.rAF);
				} else {
					self.paused = false;
					delete self.startTime;
					self.duration = self.remaining;
					self.startVal = self.frameVal;
					requestAnimationFrame(self.count);
				}
			};
			// Reset to startVal so animation can be run again
			self.reset = function () {
				self.paused = false;
				delete self.startTime;
				self.startVal = startVal;
				cancelAnimationFrame(self.rAF);
				self.printValue(self.startVal);
			};
			// Pass a new endVal and start animation
			self.update = function (newEndVal) {
				cancelAnimationFrame(self.rAF);
				self.paused = false;
				delete self.startTime;
				self.startVal = self.frameVal;
				self.endVal = Number(newEndVal);
				self.countDown = (self.startVal > self.endVal);
				self.rAF = requestAnimationFrame(self.count);
			};

			// Format startVal on initialization
			self.printValue(self.startVal);
		};

		var easeOutCubic = function (t, b, c, d) {
			return c * ((t = t / d - 1) * t * t + 1) + b;
		};


		/**
		* Create styles
		*
		* @since 10.5
		*/
		function nectarCreateStyle(styles, name) {

			if(styles.length > 0) {

				var head = document.head || document.getElementsByTagName('head')[0];
				var style = document.createElement('style');

				style.type = 'text/css';
				if (style.styleSheet) {
					style.styleSheet.cssText = styles;
				} else {
					style.appendChild(document.createTextNode(styles));
				}

				$(style).attr('id', name);
				$('head').find('#'+name).remove();
				head.appendChild(style);

			}

		}




		/**
		* FancyBox lightbox.
		*
		* @since 8.0
		*/
		function fancyBoxInit() {

			// Convert prettyPhoto links
			$('a.pp')
				.removeClass('pp')
				.attr('data-fancybox', '');

			$("a[rel^='prettyPhoto']:not([rel*='_gal']):not([rel*='product-gallery']):not([rel*='prettyPhoto['])")
				.removeAttr('rel')
				.attr('data-fancybox', '');

			var $unique_id = uniqueIdGenerate();

			// Image gallery nectar.
			$('.wpb_gallery .wpb_gallery_slidesnectarslider_style').each(function() {
				$unique_id = uniqueIdGenerate();
				$(this).find('.swiper-slide a:not(.ext-url-link)').attr('data-fancybox', 'group_' + $unique_id);
			});

			// Flexslider.
			$('.wpb_gallery_slides.wpb_flexslider:not([data-onclick="custom_link"])').each(function() {
				$unique_id = uniqueIdGenerate();
				$(this).find('.slides > li > a').attr('data-fancybox', 'group_' + $unique_id);
			});

			// Touch enabled gallery.
			$('.wpb_gallery_slidesflickity_style, .wpb_gallery_slidesflickity_static_height_style').each(function() {
				$unique_id = uniqueIdGenerate();
				$(this).find('.cell > a:not(.ext-url-link)').attr('data-fancybox', 'group_' + $unique_id);
			});

			// Add galleries to portfolios.
			$('.portfolio-items, .wpb_gallery_slidesparallax_image_grid, .nectar-post-grid-item').each(function() {
				$unique_id = uniqueIdGenerate();
				if ($(this).find('.pretty_photo').length > 0) {

					$(this).find('.pretty_photo')
						.removeClass('pretty_photo')
						.attr('data-fancybox', 'group_' + $unique_id);

				} else if ($(this).find('a[rel*="prettyPhoto["]').length > 0) {

					$(this).find('a[rel*="prettyPhoto["]')
						.removeAttr('rel')
						.attr('data-fancybox', 'group_' + $unique_id);
				}

			});

			// Nectar auto lightbox theme option.
			if ($body.hasClass('nectar-auto-lightbox')) {

				$('.gallery').each(function() {
					if ($(this).find('.gallery-icon a[rel^="prettyPhoto"]').length == 0) {
						var $unique_id = uniqueIdGenerate();
						$(this).find('.gallery-item .gallery-icon a[href*=".jpg"], .gallery-item .gallery-icon a[href*=".png"], .gallery-item .gallery-icon a[href*=".gif"], .gallery-item .gallery-icon a[href*=".jpeg"]')
							.attr('data-fancybox', 'group_' + $unique_id)
							.removeClass('pretty_photo');
					}
				});

				$('.wp-block-gallery').each(function() {
					var $unique_id = uniqueIdGenerate();
					$(this).find('.wp-block-image a[href*=".jpg"], .wp-block-image a[href*=".png"], .wp-block-image a[href*=".gif"], .wp-block-image a[href*=".jpeg"], .wp-block-image a[href*=".webp"]')
						.attr('data-fancybox', 'group_' + $unique_id)
						.removeClass('pretty_photo');
				});

				$('.main-content img').each(function() {

					if ($(this).parent().is("[href]") &&
					!$(this).parent().is(".magnific-popup") &&
					$(this).parents('.tiled-gallery').length == 0 &&
					$(this).parents('.product-image').length == 0 &&
					$(this).parents('.gallery-icon').length == 0 &&
					$(this).parents('.wp-block-gallery').length == 0 &&
					$(this).parents('.woocommerce-product-gallery').length == 0 &&
					$(this).parents('.wpb_gallery_slides.wpb_flexslider').length == 0 &&
					$(this).parents('.iosSlider.product-slider').length == 0) {

						var match = $(this).parent().attr('href').match(/\.(jpg|png|gif)\b/);
						if (match) {
							$(this).parent().attr('data-fancybox', '');
						}
					}
				});
			}

			// Regular.
			var fbMarginArr = ($('body.admin-bar').length > 0) ? [60, 100] : [60, 100];
			if (nectarDOMInfo.winW < 1000) {
				fbMarginArr = [0, 0];
			}
			$("[data-fancybox]").fancybox({
				animationEffect: "zoom-in-out",
				animationDuration: 350,
				buttons: [
					'fullScreen',
					'zoom',
					'close'
				],
				margin: fbMarginArr,
				backFocus: false,
				loop: true,
				caption: function() {
					return $(this).attr('title');
				},
				hash: false,
				beforeLoad: function(instance) {

					if (typeof instance.current.src !== 'string') {
						$.fancybox.close(true);
					}

				},
				mobile: {
					margin: 0
				}
			});
		}

		/**
		* Magnific lightbox.
		*
		* @since 6.0
		*/
		function magnificInit() {

			// Convert old pp links
			$('a.pp')
				.removeClass('pp')
				.addClass('magnific-popup');

			$("a[rel^='prettyPhoto']:not([rel*='_gal']):not([rel*='product-gallery']):not([rel*='prettyPhoto['])")
				.removeAttr('rel')
				.addClass('magnific-popup');

			// Image gallery nectar.
			$('.wpb_gallery .wpb_gallery_slidesnectarslider_style').each(function() {
				$(this).find('.swiper-slide a:not(.ext-url-link)').addClass('pretty_photo');
			});

			// Flexslider.
			$('.wpb_gallery_slides.wpb_flexslider:not([data-onclick="custom_link"])').each(function() {
				$(this).find('.slides > li > a').addClass('pretty_photo');
			});

			// Touch enabled gallery.
			$('.wpb_gallery_slidesflickity_style, .wpb_gallery_slidesflickity_static_height_style').each(function() {
				$(this).find('.cell > a:not(.ext-url-link)').addClass('pretty_photo');
			});

			// Add galleries to portfolios.
			$('.portfolio-items, .wpb_gallery .swiper-slide, .wpb_gallery_slidesflickity_style .cell, .wpb_gallery_slidesflickity_static_height_style .cell, .wpb_gallery_slides.wpb_flexslider ul > li, .wpb_gallery .parallax-grid-item, .nectar-post-grid-item').each(function() {

				if ($(this).find('.pretty_photo').length > 0) {

					$(this)
						.find('.pretty_photo')
						.removeClass('pretty_photo')
						.addClass('gallery')
						.addClass('magnific');

				} else if ($(this).find('a[rel*="prettyPhoto["]').length > 0) {

					$(this)
						.find('a[rel*="prettyPhoto["]')
						.removeAttr('rel')
						.addClass('gallery')
						.addClass('magnific');
				}

			});

			$("a[data-rel='prettyPhoto[product-gallery]']").each(function() {
				$(this)
					.removeAttr('data-rel')
					.addClass('magnific')
					.addClass('gallery');
			});

			// Nectar auto lightbox theme option.
			if ($body.hasClass('nectar-auto-lightbox')) {
				$('.gallery').each(function() {
					if ($(this).find('.gallery-icon a[rel^="prettyPhoto"]').length == 0) {

						$(this).find('.gallery-item .gallery-icon a[href*=".jpg"], .gallery-item .gallery-icon a[href*=".png"], .gallery-item .gallery-icon a[href*=".gif"], .gallery-item .gallery-icon a[href*=".jpeg"]')
							.addClass('magnific')
							.addClass('gallery')
							.removeClass('pretty_photo');
					}
				});

				$('.main-content img').each(function() {

					if ($(this).parent().is("[href]") &&
					!$(this).parent().is(".magnific-popup") &&
					$(this).parents('.tiled-gallery').length == 0 &&
					$(this).parents('.product-image').length == 0 &&
					$(this).parents('.iosSlider.product-slider').length == 0) {

						var match = $(this).parent().attr('href').match(/\.(jpg|png|gif)\b/);
						if (match) {

							$(this).parent()
								.addClass('magnific-popup')
								.addClass('image-link');
						}
					}

				});

			}


			// Regular.
			$('a.magnific-popup:not(.gallery):not(.nectar_video_lightbox):not(.nectar_video_lightbox_trigger)').magnificPopup({
				type: 'image',
				callbacks: {
					imageLoadComplete: function() {
						var $that = this;
						setTimeout(function() {
							$that.wrap.addClass('mfp-image-loaded');
						}, 10);
					},
					beforeOpen: function() {
						this.st.image.markup = this.st.image.markup.replace('mfp-figure', 'mfp-figure mfp-with-anim');
					},
					open: function() {

						$.magnificPopup.instance.next = function() {
							var $that = this;

							this.wrap.removeClass('mfp-image-loaded');
							setTimeout(function() {
								$.magnificPopup.proto.next.call($that);
							}, 100);
						};

						$.magnificPopup.instance.prev = function() {
							var $that = this;

							this.wrap.removeClass('mfp-image-loaded');
							setTimeout(function() {
								$.magnificPopup.proto.prev.call($that);
							}, 100);
						};

					}
				},
				fixedContentPos: false,
				mainClass: 'mfp-zoom-in',
				removalDelay: 400
			});

			// Video.
			$('a.magnific-popup.nectar_video_lightbox, .nectar_video_lightbox_trigger, .magnific_nectar_video_lightbox a.link_text, .swiper-slide a[href*=youtube], .swiper-slide a[href*=vimeo], .nectar-video-box a.full-link.magnific-popup').magnificPopup({
				type: 'iframe',
				fixedContentPos: false,
				mainClass: 'mfp-zoom-in',
				removalDelay: 400
			});


			// Galleries.
			$('a.magnific.gallery').each(function() {

				var $parentRow = ($(this).closest('.wpb_column').length > 0) ? $(this).closest('.wpb_column') : $(this).parents('.row');

				if ($parentRow.length > 0 && !$parentRow.hasClass('lightbox-col')) {

					$parentRow.magnificPopup({
						type: 'image',
						delegate: 'a.magnific',
						mainClass: 'mfp-zoom-in',
						fixedContentPos: false,
						callbacks: {

							elementParse: function(item) {

								if ($(item.el).is('[href]') && $(item.el).attr('href').indexOf('iframe=true') != -1 ||
								$(item.el).is('[href]') && $(item.el).attr('href').indexOf('https://www.youtube.com/watch') != -1) {
									item.type = 'iframe';
								} else if ($(item.el).is('[href]') && $(item.el).attr('href').indexOf('video-popup-') != -1) {
									item.type = 'inline';
								} else {
									item.type = 'image';
								}
							},

							imageLoadComplete: function() {
								var $that = this;
								setTimeout(function() {
									$that.wrap.addClass('mfp-image-loaded');
								}, 10);
							},

							beforeOpen: function() {
								this.st.image.markup = this.st.image.markup.replace('mfp-figure', 'mfp-figure mfp-with-anim');
							},

							open: function() {

								// Self hosted video.
								if ($(this.content).find('.mejs-video video').length > 0 && $().mediaelementplayer) {
									$(this.content).find('.mejs-video video')[0].player.remove();

									var $that = this;
									setTimeout(function() {
										$($that.content).find('video').mediaelementplayer();
										$($that.content).find('.mejs-video video')[0].player.play();
									}, 50);

								}

								$.magnificPopup.instance.next = function() {
									var $that = this;

									this.wrap.removeClass('mfp-image-loaded');
									setTimeout(function() {
										$.magnificPopup.proto.next.call($that);

										// Self hosted video.
										if ($($that.content).find('.mejs-video video').length > 0) {
											$($that.content).find('.mejs-video video')[0].play();
										}

									}, 100);
								};

								$.magnificPopup.instance.prev = function() {
									var $that = this;

									this.wrap.removeClass('mfp-image-loaded');
									setTimeout(function() {
										$.magnificPopup.proto.prev.call($that);

										// Self hosted video.
										if ($($that.content).find('.mejs-video video').length > 0) {
											$($that.content).find('.mejs-video video')[0].play();
										}
									}, 100);
								};

							},

							close: function() {
								// Self hosted video.
								if ($(this.content).find('.mejs-video video').length > 0) {
									$(this.content).find('.mejs-video video')[0].load();
								}
							}
						},
						removalDelay: 400,
						gallery: {
							enabled: true
						}
					});

					$parentRow.addClass('lightbox-col');
				}

			});

		}


		/**
		* Lightbox initialization.
		*
		* Determines which lightbox to use based on theme option.
		*
		* @since 8.0
		*/
		function lightBoxInit() {

			setTimeout(function(){
				if ($('body[data-ls="magnific"]').length > 0 || $('body[data-ls="pretty_photo"]').length > 0) {
					magnificInit();
				} else if ($('body[data-ls="fancybox"]').length > 0) {
					if ( $().fancybox ) {
						fancyBoxInit();
					} else {
						setTimeout(fancyBoxInit, 200);
					}
				}
			},60);

		}


		/**
		* WPBakery page builder standard animations.
		*
		* @since 7.0
		* @see waypoints
		*/
		function vcWaypoints() {

			$($fullscreenSelector + ' .wpb_animate_when_almost_visible').each(function () {

				var $that     = $(this),
				$vcOffsetPos  = ($fullscreenMarkupBool == true) ? '200%' : '90%',
				waypoint      = new Waypoint({
					element: $that[0],
					handler: function () {

						if ($that.parents('.wpb_tab').length > 0 && $that.parents('.wpb_tab').css('visibility') == 'hidden' || $that.hasClass('animated')) {
							waypoint.destroy();
							return;
						}

						$that.addClass("animated");
						$that.addClass("wpb_start_animation");
						waypoint.destroy();

						if ($that.is('.nectar-button') && $('body[data-button-style*="rounded_shadow"]').length > 0) {
							setTimeout(function () {
								$that.removeClass('wpb_start_animation');
							}, 1100);
						}

					},
					offset: $vcOffsetPos

				});

			});
		}


		/**
		* Nectar Rotating Words Title
		*
		* @since 13.0
		*/
		function NectarRotatingWords(el,dur) {

			this.$el = el;
			this.duration = dur;

			this.interval = '';
			this.words = [];

			this.state = {
				activeIndex: 0,
				sequenceStarted: 0,
				visible: false
			};

			this.setup();

		}

		NectarRotatingWords.prototype.setup = function() {

			var that = this;

			this.$el.find('.dynamic-words > span').each(function(i) {
				that.words[i] = $(this);
			});

			// In View.
			this.viewportTracking();

			// Waypoint.
			if( this.$el.hasClass('element_stagger_words') && !this.$el.hasClass('delay-js-loaded') ) {
				this.staggerWaypoint();
				$(window).on('nectar-waypoints-reinit nectar-tab-changed', this.staggerWaypoint.bind(this));
			}
			else {
				// Start sequence immediately.
				clearInterval(this.interval);

				this.interval = setInterval(this.sequence.bind(this), this.duration);
			}

			if( !nectarDOMInfo.usingMobileBrowser ) {
				$(window).on('resize', this.calcWidth.bind(this));
			} else {
				window.addEventListener("orientationchange", this.calcWidth.bind(this));
			}

		};

		NectarRotatingWords.prototype.viewportTracking = function() {

			var that = this;

			if( 'IntersectionObserver' in window ) {

				var options = {
					rootMargin: '0px',
					threshold: 0
				}

				this.observer = new IntersectionObserver(function(entries) {

					entries.forEach(function(entry) {
						if ( entry.isIntersecting ) {
							that.state.visible = true;
						} else {
							that.state.visible = false;
						}
					});

				}, options);

				this.observer.observe(this.$el[0]);


			} else {
				// fallback.
				this.state.visible = true;
			}

		}

		NectarRotatingWords.prototype.calcWidth = function() {

			var that = this;
			var storedWidth = this.$el.find('.dynamic-words').width();

			this.$el.find('.dynamic-words').css({ 'width': '' });

			var width = this.words[this.state.activeIndex].find('span').width();

			this.$el.find('.dynamic-words').css({
				'width': storedWidth
			});

			setTimeout(function(){
				that.$el.find('.dynamic-words').css({
					'width': width
				});
			},30);

		}

		NectarRotatingWords.prototype.sequence = function() {

			if( this.$el.find('.dynamic-words > span').length < 2 || this.state.visible == false ) {
				return true;
			}

			this.state.activeIndex = wrap( this.words.length, this.state.activeIndex + 1 );

			this.calcWidth();

			this.$el.find('.dynamic-words > span').removeClass('active');

			this.words[this.state.activeIndex].addClass('active');

		};

		NectarRotatingWords.prototype.staggerWaypoint = function() {

			var that = this;

			if( $fullscreenMarkupBool == true && this.$el.parents('.active').length == 0 ) {
				return true;
			}

			// Generate Markup
			var animatedClass = ( $(this).hasClass('animated-in') ) ? ' animated' : '';

			this.$el.find('.beginning-text, .ending-text').each(function () {

				var textArr = $(this).text();
				textArr = textArr.trim();
				textArr = textArr.split(' ');

				$(this)[0].innerHTML = '';

				for (var i = 0; i < textArr.length; i++) {
					$(this)[0].innerHTML += '<span class="text-wrap"><span class="inner'+animatedClass+'">' + textArr[i] + '</span></span> ';
				}

			});

			if( this.$el.hasClass('animated-in') ) {
				this.$el.find('.beginning-text .inner, .ending-text .inner').css({
					'transform': 'translateY(0)'
				});
			}

			this.$el.addClass('markup-generated');

			// Waypoint.
			var offsetPos = ($fullscreenMarkupBool == true) ? '500%' : 'bottom-in-view';

			var $that  = this.$el;
			var $delay = ( $that.is('[data-delay]') ) ? parseInt($that.attr('data-delay')) : 0;

			var waypoint = new Waypoint({
				element: $that[0],
				handler: function () {

					if ($that.parents('.wpb_tab').length > 0 && $that.parents('.wpb_tab').css('visibility') == 'hidden' || $that.hasClass('animated-in')) {
						waypoint.destroy();
						return;
					}

					if (!bypassAnimations || $('body[data-responsive="0"]').length > 0) {

						var $animationDurationCap;

						setTimeout(function() {

								var stagger = 0;
								stagger = 500 / $that.find('.text-wrap').length;
								stagger = Math.min(Math.max(stagger, 15), 50); // Clamp val

								$animationDurationCap = (parseInt($animationDuration) < 1100) ? $animationDuration : '1100';

								var i = 0;
								$that.find('.text-wrap').each(function () {

										var spanEl = $(this);

										if( $(this).parents('.dynamic-words').length > 0 && !$(this).hasClass('active') ) {
											// hidden words in sequence.
											spanEl.find('> span').css({
												'transform': 'translate3d(0,0,0)'
											});
											return true;
										}

										// visible words.
										setTimeout(function(){
											spanEl.find('> span').css({
												'transform': 'translate3d(0,0,0)'
											});
										}, i * stagger);

										i++;

								});

							$that.addClass('animated-in');

						}, $delay);

					}


					// start sequence.
					if( that.state.sequenceStarted != true ) {
						clearInterval(that.interval);
						that.interval = setInterval(that.sequence.bind(that), that.duration);
					}

					that.state.sequenceStarted = true;

					waypoint.destroy();
				},
				offset: offsetPos
			});


		}


		function nectarRotatingWordsInit() {

				// Clear existing.
				if( rotatingTitles.length > 0 ) {
					for(var i=0; i<rotatingTitles.length; i++) {
						clearInterval(rotatingTitles[i].interval);
					}
				}

			  rotatingTitles = [];

				$('.nectar-rotating-words-title').each(function(i) {
					var duration = parseInt($(this).attr('data-rotation'));
					rotatingTitles[i] = new NectarRotatingWords($(this), duration);
				});

		}


		/**
		* Milestone element initialization.
		*
		* @since 4.0
		* @see waypoints
		*/
		function milestoneInit() {

			$('.nectar-milestone').each(function () {

				// Symbol
				if ($(this).is('[data-symbol]')) {

					if ($(this).find('.symbol-wrap').length == 0) {

						if ($(this).attr('data-symbol-pos') == 'before') {
							$(this)
								.find('.number')
								.prepend('<div class="symbol-wrap"><span class="symbol">' + wlEls($(this).attr('data-symbol')) + '</span></div>');
						} else {
							$(this)
								.find('.number')
								.append('<div class="symbol-wrap"><span class="symbol">' + wlEls($(this).attr('data-symbol')) + '</span></div>');
						}
					}

					var $symbol_size;

					if ($(this).attr('data-symbol-size') == $(this).find('.number').attr('data-number-size') && $(this).attr('data-symbol-alignment') == 'superscript') {
						$symbol_size = 32;
					} else {
						$symbol_size = parseInt($(this).attr('data-symbol-size'));
					}

					$(this).find('.symbol-wrap').css({
						'font-size': $symbol_size + 'px',
						'line-height': $symbol_size + 'px'
					});
				}

				$(this).find('.number').css({
					'font-size': $(this).find('.number').attr('data-number-size') + 'px',
					'line-height': $(this).find('.number').attr('data-number-size') + 'px'
				});
			});

			if (!bypassAnimations && $('.nectar-milestone').length > 0 || $body.hasClass('rtl') && $('.nectar-milestone').length > 0) {

				// Blur effect
				var $blurCssString = '';
				$($fullscreenSelector + '.nectar-milestone.motion_blur').each(function (i) {

					$(this).removeClass(function (index, className) {
						return (className.match(/(^|\s)instance-\S+/g) || []).join(' ');
					});

					$(this).addClass('instance-' + i);

					var $currentColor = $(this).find('.number').css('color'),
					colorInt 					= parseInt($currentColor.substring(1), 16);

					var	R = (colorInt & 0xFF0000) >> 16,
					G     = (colorInt & 0x00FF00) >> 8,
					B     = (colorInt & 0x0000FF) >> 0;

					var $rgbaColorStart = 'rgba(' + R + ',' + G + ',' + B + ',0.2)',
					$rgbaColorEnd 			= 'rgba(' + R + ',' + G + ',' + B + ',1)',
					$numberSize 				= parseInt($(this).find('.number').attr('data-number-size'));

					$blurCssString += '@keyframes motion-blur-number-' + i + ' { ' +
					' 0% { ' +
					'opacity: 0;' +
					'color: ' + $rgbaColorStart + '; ' +
					'text-shadow: 0 ' + $numberSize / 20 + 'px 0 ' + $rgbaColorStart + ', 0 ' + $numberSize / 10 + 'px 0 ' + $rgbaColorStart + ', 0 ' + $numberSize / 6 + 'px 0 ' + $rgbaColorStart + ', 0 ' + $numberSize / 5 + 'px 0 ' + $rgbaColorStart + ', 0 ' + $numberSize / 4 + 'px 0 ' + $rgbaColorStart + ', 0 -' + $numberSize / 20 + 'px 0 ' + $rgbaColorStart + ', 0 -' + $numberSize / 10 + 'px 0 ' + $rgbaColorStart + ', 0 -' + $numberSize / 6 + 'px 0 ' + $rgbaColorStart + ', 0 -' + $numberSize / 5 + 'px 0 ' + $rgbaColorStart + ', 0 -' + $numberSize / 4 + 'px 0 ' + $rgbaColorStart + '; ' +
					'transform: translateZ(0px) translateY(-100%); ' +
					'-webkit-transform: translateZ(0px) translateY(-100%); ' +
					'} ' +
					'33% { opacity: 1 }' +
					'100% { ' +
					'color: ' + $rgbaColorEnd + '; ' +
					'text-shadow: none; ' +
					'transform: translateZ(0px) translateY(0px); ' +
					'-webkit-transform: translateZ(0px) translateY(0px); ' +
					'} ' +
					'} ' +
					'@-webkit-keyframes motion-blur-number-' + i + ' { ' +
					' 0% { ' +
					'opacity: 0;' +
					'color: ' + $rgbaColorStart + '; ' +
					'text-shadow: 0 ' + $numberSize / 20 + 'px 0 ' + $rgbaColorStart + ', 0 ' + $numberSize / 10 + 'px 0 ' + $rgbaColorStart + ', 0 ' + $numberSize / 6 + 'px 0 ' + $rgbaColorStart + ', 0 ' + $numberSize / 5 + 'px 0 ' + $rgbaColorStart + ', 0 ' + $numberSize / 4 + 'px 0 ' + $rgbaColorStart + ', 0 -' + $numberSize / 20 + 'px 0 ' + $rgbaColorStart + ', 0 -' + $numberSize / 10 + 'px 0 ' + $rgbaColorStart + ', 0 -' + $numberSize / 6 + 'px 0 ' + $rgbaColorStart + ', 0 -' + $numberSize / 5 + 'px 0 ' + $rgbaColorStart + ', 0 -' + $numberSize / 4 + 'px 0 ' + $rgbaColorStart + '; ' +
					'transform: translateZ(0px) translateY(-100%); ' +
					'-webkit-transform: translateZ(0px) translateY(-100%); ' +
					'} ' +
					'33% { opacity: 1 }' +
					'100% { ' +
					'color: ' + $rgbaColorEnd + '; ' +
					'text-shadow: none; ' +
					'transform: translateZ(0px) translateY(0px); ' +
					'-webkit-transform: translateZ(0px) translateY(0px); ' +
					'} ' +
					'} ' +
					'.nectar-milestone.motion_blur.instance-' + i + ' .number span.in-sight { animation: 0.65s cubic-bezier(0, 0, 0.17, 1) 0s normal backwards 1 motion-blur-number-' + i + '; -webkit-animation: 0.65s cubic-bezier(0, 0, 0.17, 1) 0s normal backwards 1 motion-blur-number-' + i + '; } ';

					if( $nectarFullPage.$usingFullScreenRows != false || $(this).find('.number > span').length == 0 ) {

						// Separate each character into spans
						var $symbol = $(this).find('.symbol-wrap').clone();
						$(this).find('.symbol-wrap').remove();

						var characters 	= $(this).find('.number').text().split("");
						var $this 			= $(this).find('.milestone-heading').length > 0 ? $(this).find('.milestone-heading') : $(this).find('.number');

						$this.empty();
						$.each(characters, function (i, el) {
							$this.append("<span>" + el + "</span");
						});

						// Handle symbol
						if ($(this).has('[data-symbol]')) {
							if ($(this).attr('data-symbol-pos') == 'after') {
								$this.append($symbol);
							} else {
								$this.prepend($symbol);
							}
						}

					} // already made markup

				});

				// Style
				nectarCreateStyle($blurCssString, 'milestone-blur');

				// Activate
				milestoneWaypoint();

			}

		}


		/**
		* Milestone animation
		*
		* @since 4.0
		*/
		function milestoneWaypoint() {

			$($fullscreenSelector + '.nectar-milestone').each(function () {

				// Animation
				var $offset = ($fullscreenMarkupBool == true) ? '250%' : '98%';

				if( nectarDOMInfo.usingMobileBrowser && $offset == '98%') {
					$offset = '110%';
				}

				var $animationDelay = 0;

				if($(this).is('[data-animation-delay]') &&
					$(this).attr('data-animation-delay').length > 0 &&
					$(this).attr('data-animation') != 'false') {
					$animationDelay = $(this).attr('data-animation-delay');
				}

				var $that   = $(this),
				waypoint    = new Waypoint({
					element: $that[0],
					handler: function () {

						if ($that.parents('.wpb_tab').length > 0 && $that.parents('.wpb_tab').css('visibility') == 'hidden' || $that.hasClass('animated-in')) {
							waypoint.destroy();
							return;
						}

						var $endNum = $that.find('.number span:not(.symbol)').text().replace(/,/g, '');
						var decimalPlaces = 0;
						if($endNum.toString().indexOf('.') !== -1) {
							decimalPlaces = 2;

							var userDecimals = $endNum.toString().split('.')[1].length;
							if( userDecimals > 2 && userDecimals < 5) {
								decimalPlaces = userDecimals;
							}

						}
						$endNum = parseFloat($endNum);

						setTimeout(function(){

							if (!$that.hasClass('motion_blur')) {

								var countOptions = {
									easingFn: easeOutCubic
								};


								var $countEle = $that.find('.number span:not(.symbol)')[0];
								var numAnim 	= new CountUp($countEle, 0, $endNum, decimalPlaces, 2.2, countOptions);
								numAnim.start();

							} else {
								$that.find('span').each(function (i) {
									var $that = $(this);
									setTimeout(function () {
										$that.addClass('in-sight');
									}, 200 * i);
								});
							}

							$that.addClass('animated-in');

						}, $animationDelay);

						waypoint.destroy();
					},
					offset: $offset

				});

			});
		}



		/**
		* Tabbed element change section event.
		*
		* @since 10.5
		*/
		function tabbedChangeSection(clickedTab) {

			var $id = clickedTab.parents('li').index() + 1;
			var $frontEndEditorTabDiv = ($('body.vc_editor').length > 0) ? '> .wpb_tab ' : '';

			// handle toggle button style index
			if( clickedTab.closest('.tabbed').length > 0 &&
					clickedTab.closest('.tabbed').is('[data-style="toggle_button"]') &&
					$id === 3) {
				$id = 2;
			}

			// Change tab
			if (!clickedTab.hasClass('active-tab') && !clickedTab.hasClass('loading')) {

				clickedTab.parents('ul')
					.find('a')
					.removeClass('active-tab');
				clickedTab.parents('ul')
					.find('li')
					.removeClass('active-tab');

				clickedTab
					.addClass('active-tab');
				clickedTab.parent().addClass('active-tab');

				clickedTab.closest('.tabbed').find('> div:not(.clear)' + $frontEndEditorTabDiv).css({
						'visibility': 'hidden',
						'position': 'absolute',
						'opacity': '0',
						'left': '-9999px',
						'display': 'none'
					}).removeClass('visible-tab');

				var transitionDur = (clickedTab.parents('.tabbed[data-animation="none"]').length > 0 ) ? 0 : 400;

				if ($('body.vc_editor').length > 0) {

					var $data_m_id = (clickedTab.parent().is('[data-m-id]')) ? clickedTab.parent().attr('data-m-id') : '';
					// handle toggle button style index
					if( clickedTab.parents('.tabbed[data-style="toggle_button"]').length > 0 && clickedTab.parents('li').index() + 1 === 3) {
						if(clickedTab.parents('.wpb_tabs_nav').find('.toggle-button[data-m-id]').length > 0) {
							$data_m_id = clickedTab.parents('.wpb_tabs_nav').find('.toggle-button').attr('data-m-id');
						}

					}

					clickedTab.parents('.tabbed').find('> div[data-model-id="' + $data_m_id + '"]' + $frontEndEditorTabDiv).css({
						'visibility': 'visible',
						'position': 'relative',
						'left': '0',
						'display': 'block'
					}).stop().transition({
						'opacity': 1
					}, transitionDur).addClass('visible-tab');

					if( !$body.is('[data-flex-cols="true"]') ) {
						convertFrontEndPadding();
					}

				} else {


					clickedTab.closest('.tabbed').find('> div:nth-of-type(' + $id + ')' + $frontEndEditorTabDiv).css({
						'visibility': 'visible',
						'position': 'relative',
						'left': '0',
						'display': 'block'
					}).stop().transition({
						'opacity': 1
					}, transitionDur).addClass('visible-tab');
				}

				var $curTab = clickedTab.closest('.tabbed').find('> div:nth-of-type(' + $id + ')');

				if ( $curTab.find('.iframe-embed').length > 0 ||
					$curTab.find('.portfolio-items').length > 0 ||
					$curTab.find('.nectar-video-bg').length > 0) {
					setTimeout(function () {
						$window.trigger('resize');
					}, 10);
				}
			}

			// Waypoint checking


			var $currentVisTab = clickedTab.parents('.tabbed').find('> div:nth-of-type(' + $id + ')' + $frontEndEditorTabDiv);

			if ($currentVisTab.find('.nectar-progress-bar').length > 0) {
				progressBars();
			}

			if ($currentVisTab.find('.divider-small-border [data-animate="yes"]').length > 0 ||
			$currentVisTab.find('.divider-border [data-animate="yes"]').length > 0) {
				dividers();
			}

			if ($currentVisTab.find('img.img-with-animation').length > 0 ||
			$currentVisTab.find('.col.has-animation').length > 0 ||
			$currentVisTab.find('.nectar_cascading_images').length > 0 ||
			$currentVisTab.find('.wpb_column.has-animation').length > 0) {
				colAndImgAnimations();
				cascadingImageBGSizing();
			}

			if ($currentVisTab.find('.parallax-layer').length > 0 ||
				$currentVisTab.parents('.nectar-parallax-enabled').length > 0) {
				parallaxRowsBGCals();
			}
			nectarParallaxElRefresh();

			if ($currentVisTab.find('.nectar-milestone').length > 0) {
				milestoneWaypoint();
			}

			if ($currentVisTab.find('.nectar_image_with_hotspots[data-animation="true"]').length > 0) {
				imageWithHotspots();
				setTimeout(function(){
					$window.trigger('resize');
				},100);
			}

			if ($currentVisTab.find('.nectar-fancy-ul').length > 0) {
				nectarFancyUlInit();
			}

			if ($currentVisTab.find('.nectar-split-heading').length > 0) {
				splitLineHeadings();
			}
			if ($currentVisTab.find('.wpb_column[data-border-animation="true"]').length > 0) {
				animatedColBorders();
			}
			if ($currentVisTab.find('.wpb_animate_when_almost_visible').length > 0) {
				vcWaypoints();
			}
			if ($currentVisTab.find('.nectar-animated-title').length > 0) {
				animatedTitles();
			}
			if ($currentVisTab.find('.nectar-highlighted-text').length > 0) {
				highlightedText();
			}
			if ($currentVisTab.find('.nectar_food_menu_item').length > 0) {
				foodMenuItems();
			}
			if ($currentVisTab.find('.nectar-post-grid:not([data-animation="none"])').length > 0) {
				NectarPostGridWaypoint();
			}
			if ($currentVisTab.find('.nectar-waypoint-el').length > 0) {
				generalWaypoints();
			}

			if (clickedTab.parents('.wpb_row').length > 0) {

				if ($currentVisTab.find('.vc_pie_chart').length > 0 ||
				$currentVisTab.find('.wp-video-shortcode').length > 0 ||
				$currentVisTab.find('.post-area.masonry .posts-container').length > 0 ||
				$currentVisTab.find('.twentytwenty-container').length > 0 ||
				clickedTab.parents('#nectar_fullscreen_rows[data-content-overflow="scrollbar"]').length > 0 ||
				clickedTab.parents('.tabbed').find('> div:nth-of-type(' + $id + ')').find('.wpb_gallery').length > 0 ||
				clickedTab.parents('.tabbed').find('> div:nth-of-type(' + $id + ')').find('.swiper-container').length > 0 ||
				clickedTab.parents('.wpb_row').next().hasClass('parallax_section')) {
					$window.trigger('resize');
				}

				if ($currentVisTab.find('.nectar-flickity').length > 0 && typeof Flickity != 'undefined') {
					clickedTab.parents('.tabbed').find('> div:nth-of-type(' + $id + ')').find('.nectar-flickity').each(function(){
						var tabbedFlkty = Flickity.data($(this)[0]);
						tabbedFlkty.resize();
					});

				}

				if ($currentVisTab.find('.nectar-woo-flickity').length > 0 && typeof Flickity != 'undefined') {

					setTimeout(function(){
						var wootabbedFlkty = Flickity.data(clickedTab.parents('.tabbed').find('> div:nth-of-type(' + $id + ')').find('.nectar-woo-flickity > ul')[0]);
						wootabbedFlkty.resize();
						$(window).trigger('nectar-product-filters-layout');
					}, 100);
				}

			}

			//SVG icons
			$currentVisTab.find('.svg-icon-holder').each(function (i) {

				var $that = $(this);

				setTimeout(function () {

					var $animationDelay = 0;

					if($that.is('[data-animation-delay]') &&
					$that.attr('data-animation-delay').length > 0 &&
					$that.attr('data-animation') != 'false') {
						$animationDelay = $that.attr('data-animation-delay');
					}

					clearTimeout($animatedSVGIconTimeout[i]);

					if ($that.attr('data-animation') == 'false') {
						$that.css('opacity', '1');
						$svgIcons[$that.find('svg').attr('id').slice(-1)].finish();
					} else {

						$svgIcons[$that.find('svg').attr('id').slice(-1)].reset();
						$animatedSVGIconTimeout[i] = setTimeout(function () {
							$svgIcons[$that.find('svg').attr('id').slice(-1)].play();
						}, $animationDelay);

					}
				}, 150);
			});



			// CTA class fix
			$('.nectar-cta .link_wrap, .nectar-cta .link_text').removeClass('hover');

			// Fix columns inside tabs
			clickedTab.parents('.tabbed').find('.wpb_row').each(function () {
				if (typeof $(this).find('[class*="vc_col-"]').first().offset() != 'undefined') {

					var $firstChildOffset = $(this).find('[class*="vc_col-"]').first().offset().left;

					$(this).find('[class*="vc_col-"]').each(function () {
						$(this).removeClass('no-left-margin');
						if ($(this).offset().left < $firstChildOffset + 15) {
							$(this).addClass('no-left-margin');
						} else {
							$(this).removeClass('no-left-margin');
						}
					});
				}

			});

			$tabbedClickCount++;

			// Magic line
			if (clickedTab.parent().parent().find('.magic-line').length > 0) {
				magicLineCalc(clickedTab);
			}

			$(window).trigger('nectar-tab-changed');

		}


		/**
		* Tabbed element magic line - used for style "Minimal alt"
		*
		* @since 7.0
		*/
		function magicLineCalc($ele) {

			var el, leftPos, ratio;

			el = $ele.parent();
			if (el.length) {
				leftPos = el.position().left;
				ratio = el.width();
			} else {
				leftPos = ratio = 0;
			}


			$ele.parent().parent()
				.find('.magic-line')
				.css('transform', 'translateX(' + leftPos + 'px) scaleX(' + ratio + ')');
		}


		/**
		* Tabbed element toggle button style
		*
		* @since 14.1
		*/
		function tabbedToggleButton() {
			$('body').on('click', '.wpb_tabs_nav > .toggle-button', function(){
				$(this).parents('.wpb_tabs_nav').find('> li:not(.active-tab):not(.toggle-button) a').trigger('click');
			});
		}



		/**
		* Tabbed element deep linking.
		*
		* @since 3.0
		*/
		function tabbbedDeepLinking() {

			if (typeof nectarGetQueryParam['tab'] != 'undefined') {

				$('.wpb_tabs_nav').each(function () {

					$(this).find('li').each(function () {

						var $currentText  = $(this).find('a').clone(),
						$getText          = nectarGetQueryParam['tab'],
						$that             = $(this);

						$currentText.find('svg').remove();
						$currentText = $currentText.text();
						$currentText = $currentText.replace(/\s+/g, '-').toLowerCase();

						// SVG icons.
						if( $currentText.length > 0 && $currentText.substring(0,1) === '-' ) {
							$currentText = $currentText.substring(1);
						}

						$getText = $getText.replace(/\s+/g, '-').replace(/</g, '&lt;').replace(/"/g, '&quot;').toLowerCase();

						if ($currentText == $getText) {

							$(this).find('a').trigger('click');

							setTimeout(function () {
								$that.find('a').trigger('click');
							}, 501);
						}

					});

				});

			}

		}



		/**
		* Tabbed element initialization.
		*
		* @since 3.0
		*/
		function tabbedInit() {

			// Click event.
			$body.on('click', '.tabbed > ul li:not(.cta-button) a', function(e){

				tabbedChangeSection($(this));

				// Mobile scroll to.
				if (e.originalEvent !== undefined &&
						nectarDOMInfo.winW < 1000 &&
						$nectarFullPage.$usingFullScreenRows == false &&
						!$(this).parents('.disable-mobile-tab-scroll')
					) {

					// Ensure that it would be needed.
					var $tabbedNav = $(this).closest('.tabbed').find('> ul');

					if( $tabbedNav.height() > 350 ) {

						var $scrollTopDistance = $tabbedNav.offset().top + $tabbedNav.height() - nectarDOMInfo.adminBarHeight;

						if( $('#header-outer[data-mobile-fixed="1"]').length > 0 ) {
								$scrollTopDistance = $tabbedNav.offset().top + $tabbedNav.height() - $headerOuterEl.outerHeight() - nectarDOMInfo.adminBarHeight
						}

					  nectar_scrollToY($scrollTopDistance, 700, 'easeInOutQuint');
					}

				}

				return false;
			});

			// Toggle Button Style.
			tabbedToggleButton();

			// Custom user def anchor click event helper.
			$('a[class*="nectar-tab-trigger"]').on('click', function(e) {

				// verify the link is setup correct.
				if( !$(this).is('[href*="#"]') || $(this).attr('href').length < 1 ) {
					return true;
				}

				var clickedTrigger = $(this).attr('href');
				clickedTrigger = clickedTrigger.substr(1);
				clickedTrigger = clickedTrigger.replace(/\s+/g, '-').replace(/</g, '&lt;').replace(/"/g, '&quot;').toLowerCase();

				$('.wpb_tabs_nav').each(function () {

					$(this).find('li').each(function () {

						var $currentText = $(this).find('a').clone();

						$currentText.find('svg').remove();
						$currentText = $currentText.text();
						$currentText = $currentText.replace(/\s+/g, '-').toLowerCase();

						// SVG icons.
						if( $currentText.length > 0 && $currentText.substring(0,1) === '-' ) {
							$currentText = $currentText.substring(1);
						}

						// trigger.
						if ($currentText == clickedTrigger) {
							$(this).find('a').trigger('click');
						}

					});

				});

				e.preventDefault();

			});


			$('.tabbed').each(function () {

				var $that;

				// Handle icons
				$(this).find('.wpb_tab').each(function (i) {

					if ($(this).is('[data-tab-icon]') &&
					$(this).attr('data-tab-icon').length > 0 &&
					$(this).find('.im-icon-wrap.tab-icon').length == 0) {

						$(this)
							.closest('.tabbed')
							.addClass('using-icons');

						$(this)
							.closest('.tabbed')
							.find('.wpb_tabs_nav li:nth-child(' + (i + 1) + ') > a')
							.prepend('<i class="' + $(this).attr("data-tab-icon") + '"></i>');

							// Toggle style 2nd item.
							if( $(this).closest('.tabbed').is('[data-style="toggle_button"]') && i === 1) {
								$(this)
								.closest('.tabbed')
								.find('.wpb_tabs_nav li:nth-child(' + (i + 2) + ') > a')
								.prepend('<i class="' + $(this).attr("data-tab-icon") + '"></i>');
							}
					}

					// SVG icons
					if ($(this).find('.im-icon-wrap.tab-icon').length > 0) {

						var $svg_icon_markup = $(this).find('.im-icon-wrap.tab-icon').detach();
						$(this).closest('.tabbed')
							.find('.wpb_tabs_nav li:nth-child(' + (i + 1) + ') > a')
							.prepend($svg_icon_markup);
					}

				});


				$that = $(this);

				// Minimal alt effect
				setTimeout(function () {
					if ($that.is('[data-style="minimal_alt"]')) {
						$that.find('> ul').append('<li class="magic-line" />');
						magicLineCalc($that.find('> ul > li:first-child > a'));
					}
				}, 100);


			});

			// Minimal alt resize event.
			if ( $('.tabbed[data-style="minimal_alt"]').length > 0 ) {
				$window.on('smartresize',function(){

					$('.tabbed[data-style="minimal_alt"]').each(function(){

						if( $(this).find('a.active-tab').length > 0 ) {
							magicLineCalc( $(this).find('a.active-tab') );
						}

					});


				});

			}


			tabbbedDeepLinking();

			// Vertical scrolling
			$('.nectar-scrolling-tabs').each(function(i) {
				if(!nectarDOMInfo.usingFrontEndEditor) {
					$verticalScrollingTabs[i] = new VerticalScrollingTabs($(this));
				}
			});

			var tabAnimating = false;

			$body.on('click', '.scrolling-tab-nav-current-item', function() {
				$(this).toggleClass('open');
				$(this).siblings('.wpb_tabs_nav').toggle();
				nectarParallaxElRefresh();
			});

			$body.on('click', '.nectar-sticky-tabs .wpb_tabs_nav li', function (e) {
				var $parentUl = $(this).parents('.wpb_tabs_nav');
				var $titleEl = $(this).parents('.scrolling-tab-nav').find('.scrolling-tab-nav-current-item');
				var $selectedText = $(this).find('.tab-nav-heading').clone();

				$titleEl.html($selectedText);

				if (e.originalEvent !== undefined) {
				$(this).parents('.scrolling-tab-nav').find('.scrolling-tab-nav-current-item').toggleClass('open');
				$parentUl.toggle();
				}

			});

			$body.on('click', '.nectar-sticky-tabs .wpb_tabs_nav a', function (e) {

				var clickedTab = $(this);
				var $id = clickedTab.parents('li').index() + 1;
				var $frontEndEditorTabDiv = ($('body.vc_editor').length > 0) ? '> .wpb_tab ' : '';
				var $parentTabs = clickedTab.parents('.nectar-sticky-tabs');
        		var tabTimeout = ($parentTabs.hasClass('content_animation_fade')) ? 200 : 600;


				if (!clickedTab.parents('li').hasClass('active-tab') && !tabAnimating || !$parentTabs.hasClass('loaded')) {

					tabAnimating = true;

					$parentTabs.find('.wpb_tabs_nav li').removeClass('active-tab');
					clickedTab.parents('li').addClass('active-tab');

					$parentTabs.find('.scrolling-tab-content  > div')
						.removeClass('previously-active-tab');

					$parentTabs.find('.scrolling-tab-content > div.active-tab')
						.addClass('previously-active-tab')
						.removeClass('active-tab');

					$parentTabs.find('.scrolling-tab-content > div:nth-of-type(' + $id + ')' + $frontEndEditorTabDiv).addClass('active-tab');
					$(window).trigger('nectar-tab-changed');

					setTimeout(function () {
						tabAnimating = false;
					}, tabTimeout);
				}

				e.preventDefault();

			});

			// Add starting visible class.
			$('.tabbed .wpb_tab').first().addClass('visible-tab');

			// Hover/Active effect.
			$('.nectar-sticky-tabs .wpb_tabs_nav > li:first-child').each(function(){
				$(this).find('a').first().trigger('click');
			});
			//// Set to false immediately to allow deeplinking to work.
			tabAnimating = false;

			$('.nectar-sticky-tabs').addClass('loaded');

			// Tab change event.
			$(window).on('nectar-tab-changed', wooProductCarouselAnimations);


		}


		/**
		* Vertical Scrolling Tabs
		*
		* @since 12.0
		*/

	function VerticalScrollingTabs(el) {

		this.$el = el;
		this.$tabContent = el.find('.scrolling-tab-content');
		this.$lineEl = el.find('.scrolling-tab-nav .line');
		this.observer = null;
		this.linkFunc = this.$el.hasClass('navigation_func_active_link_only') ? 'single_link' : 'default';

		this.domSetup();
		this.highlightObserve();
		this.events();
	}

	VerticalScrollingTabs.prototype.events = function () {

		var that = this;

		if (this.linkFunc == 'single_link') {

			$(window).on('resize', this.setVertCenter.bind(this));
			this.setVertCenter();

			this.$el.find('.wpb_tabs_nav li').on('click', function (e) {

				if (nectarDOMInfo.winW < 1000) {

					var $parentUl = that.$el.find('.wpb_tabs_nav');

					if (e.originalEvent !== undefined) {
						that.$el.find('.scrolling-tab-nav .scrolling-tab-nav-current-item').toggleClass('open');
						$parentUl.toggle();
						nectarParallaxElRefresh();
					}

					that.$el.find('.scrolling-tab-nav li').removeClass('active');
					$(this).addClass('active');

					that.updateActiveTitle();

				}

			});

		}

	};

	VerticalScrollingTabs.prototype.setVertCenter = function () {

		var vertCenter = (nectarDOMInfo.winH - this.$el.find('.scrolling-tab-nav').height())/2;
		document.documentElement.style.setProperty('--nectar-sticky-tabs-vert-y', vertCenter + "px");
	}

	VerticalScrollingTabs.prototype.updateActiveTitle = function () {

		var $titleEl = this.$el.find('.scrolling-tab-nav .scrolling-tab-nav-current-item');
		var $selectedText = this.$el.find('.scrolling-tab-nav .menu-item.active .tab-nav-heading').clone();

		var index = this.$el.find('.scrolling-tab-nav .menu-item.active').index();

		this.$el.find('.scrolling-tab-content > div').removeClass('active');
		this.$el.find('.scrolling-tab-content > div:eq(' + index + ')').addClass('active');

		this.$el.find('.scrolling-tab-nav .scrolling-tab-nav-total .inner').css('transform','translateY(-'+(index*100)+'%)');

		$titleEl.html($selectedText);
	}

	VerticalScrollingTabs.prototype.domSetup = function () {

		var that = this;
		var href = '';


		// Icons
		this.$el.find('.wpb_tab').each(function (i) {

			if ($(this).is('[data-tab-icon]') && $(this).attr('data-tab-icon').length > 0 &&
				$(this).find('.im-icon-wrap.tab-icon').length === 0) {

				that.$el.addClass('using-icons');

				href = that.$el.find('.wpb_tabs_nav li:nth-child(' + (i + 1) + ') a').attr('href');

				that.$el
					.find('.wpb_tabs_nav li:nth-child(' + (i + 1) + ')')
					.addClass('has-icon')
					.prepend('<a class="skip-hash" role="button" href="' + href + '"><i class="' + $(this).attr("data-tab-icon") + '"></i></a>');
			}

			// SVG icons
			if ($(this).find('.im-icon-wrap.tab-icon').length > 0) {

				href = that.$el.find('.wpb_tabs_nav li:nth-child(' + (i + 1) + ') a').attr('href');

				var $svg_icon_markup = $(this).find('.im-icon-wrap.tab-icon').detach();
				that.$el
					.find('.wpb_tabs_nav li:nth-child(' + (i + 1) + ')')
					.addClass('has-icon')
					.prepend('<a class="skip-hash svg-icon-link" role="button" href="' + href + '"></a>');

				that.$el.find('.wpb_tabs_nav li:nth-child(' + (i + 1) + ') .svg-icon-link').append($svg_icon_markup);

			}

		});


		// First active
		this.$el.find('.scrolling-tab-nav .menu-item:first').addClass('active');
		this.lineAnimation();

		if (that.linkFunc == 'single_link') {
			this.updateActiveTitle();
		}

		// Only tab
		if (this.$el.find('.scrolling-tab-nav .menu-item').length == 1) {
			this.$el.find('.scrolling-tab-nav').addClass('single-tab');
		}

		var $tabContent = this.$el.find('.scrolling-tab-content');

		this.$el.find('.scrolling-tab-nav .menu-item').each(function (i) {

			i = i + 1;
			var $tab = $tabContent.find('> div:nth-child(' + i + ')');

			// Add titles to mobile
			if (that.linkFunc == 'default') {
				var $title = $(this).html();
				$tab.prepend('<div class="scrolling-tab-mobile-title"><div class="inner">' + wlEls($title) + '</div></div>');
				$tab.find('.scrolling-tab-mobile-title a').contents().unwrap();
				// Create normal anchor relation.
				if ($tab) {
					var id = $(this).find('a').attr('href');
					id = id.substr(1);
					$tab.find('> .scrolling-tab-mobile-title').attr('id', id);
					$tab.removeAttr('id');
				}
			}



		});

		this.$el.addClass('initalized');

	};

	VerticalScrollingTabs.prototype.highlightObserve = function () {

		var that = this;

		if (!(nectarDOMInfo.usingMobileBrowser && nectarDOMInfo.winW < 1000)) {

			if ('IntersectionObserver' in window) {

				/* Default */
				var rMarign = ($headerOuterEl.is('[data-remove-fixed="1"]')) ? '100px 0px 0px 0px' : '5px 0px 0px 0px';

				var options = {
					root: (isSafari()) ? null : document,
					rootMargin: rMarign,
					threshold: 1
				}

				this.observer = new IntersectionObserver(function (entries) {

					entries.forEach(function (entry) {

						var href = '#' + $(entry.target).attr('id');
						var $menuItem = that.$el.find('.scrolling-tab-nav a[href="' + href + '"]');

						if (entry.isIntersecting && entry.intersectionRatio >= 1) {

							$menuItem.parents('.menu-item').addClass('visible');

						} else {
							$menuItem.parents('.menu-item').removeClass('visible');
						}

						// Highlight
						var $firstVisLink = that.$el.find('.scrolling-tab-nav .menu-item.visible:first');

						// a link is visible
						if ($firstVisLink.length > 0) {
							that.$el.find('.scrolling-tab-nav .menu-item').removeClass('active');
							$firstVisLink.addClass('active');
							that.lineAnimation();
						}


					});

				}, options);

				// Observe each section.
				this.$tabContent.find('> div > .scrolling-tab-mobile-title[id]').each(function () {
					that.observer.observe($(this)[0]);
				});


				/* Single link only */
				this.tabs = Array.from(this.$tabContent.find('> div'));
				this.scrollDir = 'up';
				this.prevScroll = 0;
        		this.prevIndex = 0;
				this.observer = new IntersectionObserver(function (entries) {

					entries.forEach(function (entry) {

						if(nectarDOMInfo.winW < 1000) {
							return;
						}

						if (nectarDOMInfo.scrollTop > that.prevScroll ) {
							that.scrollDir = 'down';
						} else {
							that.scrollDir = 'up';
						}

						var target = (that.scrollDir === 'down') ? that.getTargetSection(entry) : entry.target

						if( that.shouldUpdate(entry) ) {
							var index = $(target).index();

				if( index < that.prevIndex ) {
					that.$el.addClass('scrolling-up');
				} else {
					that.$el.removeClass('scrolling-up');
				}



				that.$el.find('.scrolling-tab-nav .ui-tabs-nav > .menu-item').removeClass('prev-active');
				that.$el.find('.scrolling-tab-nav .ui-tabs-nav > .menu-item.active').addClass('prev-active');

				that.$el.find('.scrolling-tab-nav .ui-tabs-nav > .menu-item').removeClass('active');
				that.$el.find('.scrolling-tab-nav .ui-tabs-nav > .menu-item:eq('+index+')').addClass('active');

				that.updateActiveTitle();


              that.prevIndex = index;
				}

            that.prevScroll = nectarDOMInfo.scrollTop;

					});

				}, {
					root: (isSafari()) ? null : document,
					rootMargin: '-40% 0% -40% 0%',
  				threshold: 0
				});

				// Observe each section.
				this.$tabContent.find('> div').each(function () {
					that.observer.observe($(this)[0]);
				});

			} // if intersection observer.

		} // don't trigger on mobile.

	};

	VerticalScrollingTabs.prototype.getTargetSection = function (entry) {

		var index = this.tabs.findIndex(function(tab) {
			return tab == entry.target
		});

		if (index >= this.tabs.length - 1) {
		 return entry.target;
		} else {
		 return this.tabs[index + 1];
		}
	}

	VerticalScrollingTabs.prototype.shouldUpdate = function (entry) {

		if (this.scrollDir === 'down' && !entry.isIntersecting && this.prevScroll != 0 ) {
			return true;
		}

		if (this.scrollDir === 'up' && entry.isIntersecting && this.prevScroll != 0) {
			return true;
		}

		return false;
	}

	VerticalScrollingTabs.prototype.lineAnimation = function () {

		var activeItem = this.$el.find('.scrolling-tab-nav .active');

		if (activeItem.length == 0) {
			return;
		}

		var itemOffset = parseInt(activeItem.position().top);
		var itemHeight = parseInt(activeItem.height());

		this.$lineEl.css({
			'max-height': itemHeight + 'px',
			'transform': 'translate3d(0px, ' + itemOffset + 'px, 0px)'
		});

	};








		/**
		* Toggle Panels element deep linking.
		*
		* @since 3.0
		*/
		function accordionDeepLinking() {

			if (typeof nectarGetQueryParam['toggle'] != 'undefined') {
				$('.toggles').each(function () {

					$(this).find('.toggle').each(function () {
						var $currentText = $(this).find('h3 a').clone();
						var $getText = nectarGetQueryParam['toggle'];

						$($currentText).find('i').remove();
						$currentText = $currentText.text();
						$currentText = $currentText.replace(/\s+/g, '-').toLowerCase();
						$getText = $getText.replace(/\s+/g, '-').replace(/</g, '&lt;').replace(/"/g, '&quot;').toLowerCase();

						if ($currentText == $getText) {
							$(this).find('h3 a').trigger('click');
						}
					});
				});
			}

		}




		function accordionSizing() {

			$('.toggles').each(function(){

				var openToggle = $(this).find('.toggle.open');

				if( openToggle.length > 0 ) {

					openToggle.each(function() {
						var openToggleInner = $(this).find('> div')[0];
						openToggleInner.style.maxHeight = openToggleInner.scrollHeight + "px";
					});

				}


			});

		}

		/**
		* Toggle Panels element initialization.
		*
		* @since 3.0
		*/
		function accordionInit() {

			setTimeout(function() {

				$('.toggles.accordion:not([data-starting="closed"])').each(function () {

					// Legacy.
					if( $(this).find('.toggle[data-inner-wrap="true"]').length == 0 ) {
						$(this).find('> .toggle').first().addClass('open').find('> div').show();
					} else if(!nectarDOMInfo.usingFrontEndEditor) {
						var $firstToggle = $(this).find('> .toggle').first();
						$firstToggle.addClass('open');
						$firstToggle.find('> div')[0].style.maxHeight = $firstToggle.find('> div')[0].scrollHeight + "px";
					}

					$(this).find('> .toggle').first().find('a:not(.nectar-button) i').attr('class', 'fa fa-minus-circle');

				});

				setTimeout(accordionDeepLinking,300);

			}, 60);

			if( $('.toggle[data-inner-wrap="true"]').length > 0 ) {
				$window.on('smartresize', accordionSizing);
			}

			// Handle legacy markup for users who haven't updated core plugin.
			$('.toggle > h3:not(.toggle-title)').addClass('toggle-title');

		}

		function accordionClickEvents() {


			$body.on('click', '.toggle > h3 a, .toggle > .toggle-title a', function () {

				// Regular toggle click event
				if (!$(this).parents('.toggles').hasClass('accordion')) {

					// Legacy.
					if( $(this).parents('.toggle[data-inner-wrap="true"]').length == 0 ) {

						$(this).parents('.toggle')
							.find('> div')
							.slideToggle(300);

					} else {

						var parentEl = $(this).parents('.toggle').find('> div')[0];

						if (parentEl.style.maxHeight) {
							parentEl.style.maxHeight = null;
						} else {
							parentEl.style.maxHeight = parentEl.scrollHeight + "px";
						}

					}


					$(this).parents('.toggle')
						.toggleClass('open');

					// Switch icon
					if ($(this).parents('.toggle').hasClass('open')) {
						$(this)
							.find('i')
							.attr('class', 'fa fa-minus-circle');
					} else {
						$(this)
							.find('i')
							.attr('class', 'fa fa-plus-circle');
					}

					if ($(this).parents('.toggle').find('> div .iframe-embed').length > 0 &&
					$(this).parents('.toggle').find('> div iframe.iframe-embed').height() == '0') {
						responsiveVideoIframes();
					}

					// toggles which contain images
					if( $(this).parents('.toggle').find('> div img').length > 0 &&
					    $(this).parents('.toggle').is('[data-inner-wrap="true"]') ) {

						for(var j=1; j<10; j++ ) {
							setTimeout(accordionSizing, j*100);
						}
					}

					// parallax resize.
					setTimeout(function(){
						$(window).trigger('salient-parallax-el-recalculate');
					}, 500);

					if ($(this).parents('.full-width-content').length > 0) {
						setTimeout(function () {
							fullWidthContentColumns();
						}, 300);
					}

					if ($('#nectar_fullscreen_rows').length > 0) {
						setTimeout(function () {
							$window.trigger('smartresize');
						}, 300);
					}
					return false;
				}
			});

			// Accordion click event
			$body.on('click', '.toggles.accordion .toggle > h3 a, .toggles.accordion .toggle > .toggle-title a', function (e) {

				var $t;
				var $parentToggles  = $(this).parents('.toggles');
				var $parentToggle   = $(this).parents('.toggle');


				// parallax resize.
				setTimeout(function(){
					$(window).trigger('salient-parallax-el-recalculate');
				}, 500);

				if ($(this).parents('.toggle').hasClass('open')) {
					$parentToggles.find('.toggle > div').each(function(){
						$(this)[0].style.maxHeight = null;
					});
					$parentToggles.find('.toggle h3 a i').attr('class', 'fa fa-plus-circle');
					$parentToggles.find('.toggle').removeClass('open');
					return false;
				}

				// Legacy.
				if( $(this).parents('.toggle[data-inner-wrap="true"]').length == 0 ) {

					$parentToggles.find('.toggle > div').slideUp(300);
					$parentToggles.find('.toggle h3 a i').attr('class', 'fa fa-plus-circle');
					$parentToggles.find('.toggle').removeClass('open');
					$parentToggle.find('> div').slideDown(300);
					$parentToggle.addClass('open');

				} else {

					// Mobile scroll to.
					if (e.originalEvent !== undefined &&
						  nectarDOMInfo.winW < 1000 &&
							$parentToggles.find('.toggle.open').length > 0 &&
						  $nectarFullPage.$usingFullScreenRows == false) {

						var $openToggle = $parentToggles.find('.toggle.open');

						setTimeout(function(){
							var $scrollTopDistance = $parentToggle.offset().top - nectarDOMInfo.adminBarHeight;

							if( $('#header-outer[data-mobile-fixed="1"]').length > 0 ) {
									$scrollTopDistance = $parentToggle.offset().top - $headerOuterEl.outerHeight() - nectarDOMInfo.adminBarHeight
							}

							nectar_scrollToY($scrollTopDistance, 500, 'easeInOutQuint');
						},50);

					}

					// Desktop scroll to
					if( e.originalEvent !== undefined &&
							nectarDOMInfo.winW > 1000 &&
							$parentToggles.find('.toggle.open').length > 0 &&
							$nectarFullPage.$usingFullScreenRows == false) {

								setTimeout(function(){
									if ( $parentToggle.offset().top < $(window).scrollTop() ) {
										var $scrollTopDistance = $parentToggle.offset().top - nectarDOMInfo.adminBarHeight;

										if( $('#header-outer[data-remove-fixed="0"]').length > 0 ) {
												$scrollTopDistance = $parentToggle.offset().top - $headerOuterEl.outerHeight() - nectarDOMInfo.adminBarHeight
										}

										nectar_scrollToY($scrollTopDistance - 30, 500, 'easeInOutQuint');
									}
								},500);

					}


					var parentEl = $parentToggle.find('> div')[0];

					$parentToggles.find('.toggle > div').each(function(){
						$(this)[0].style.maxHeight = null;
					});

					$parentToggles.find('.toggle h3 a i').attr('class', 'fa fa-plus-circle');
					$parentToggles.find('.toggle').removeClass('open');

					parentEl.style.maxHeight = parentEl.scrollHeight + "px";

					$parentToggle.addClass('open');

				}


				// Switch icon
				if ($parentToggle.hasClass('open')) {
					$(this).find('i').attr('class', 'fa fa-minus-circle');
				} else {
					$(this).find('i').attr('class', 'fa fa-plus-circle');
				}



				if ($(this).parents('.full-width-content').length > 0) {
					clearTimeout($t);
					$t = setTimeout(function () {
						fullWidthContentColumns();
					}, 400);
				}
				if ($('#nectar_fullscreen_rows').length > 0) {
					clearTimeout($t);
					$t = setTimeout(function () {
						$window.trigger('smartresize');
					}, 400);
				}

				return false;

			});

		}


		/**
		* Sticky elements powered by CSS vertically centered.
		*
		* @since 14.0
		*/
    function NectarStickyEl(el) {

      this.$el = el;
      this.$innerEl = this.$el.find(' > .n-sticky > .vc_column-inner');

      if( this.$innerEl.length == 0 ) {
        return;
      }

			this.topOffset = 0;

			this.lazyInit();

		}

		NectarStickyEl.prototype.init = function() {
			this.resizeEvent();
			$window.on('resize', this.resizeEvent.bind(this));
		}

		NectarStickyEl.prototype.lazyInit = function() {

			var that = this;

			if( !nectarDOMInfo.usingFrontEndEditor && 'IntersectionObserver' in window ) {
				var that = this;
				var observer = new IntersectionObserver(function(entries) {

					entries.forEach(function(entry){
						if (entry.isIntersecting) {
							that.init();
							observer.unobserve(entry.target);
						}
					});

				}, {
					root: (isSafari()) ? null : document,
					rootMargin: '400px 0px 400px 0px',
					threshold: 0
				});

				observer.observe(this.$el[0]);
			} else {
				this.init();
			}


		};

		NectarStickyEl.prototype.calcTopOffset = function() {
      this.topOffset = (nectarDOMInfo.winH - this.$innerEl.height())/2;
		};

		NectarStickyEl.prototype.resizeEvent = function() {

			if( nectarDOMInfo.winW > 1000 ) {

				this.calcTopOffset();

				this.$innerEl.css({
					'top': this.topOffset
				});

			} else {
				this.$innerEl.css({
					'top': ''
				});
			}

		};


		/**
		* Color hex to rgb
		*
		* @since 3.0
		*/
		function shadeColor(hex, lum) {

				// Validate hex string
				hex = String(hex).replace(/[^0-9a-f]/gi, '');
				if (hex.length < 6) {
					hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
				}
				lum = lum || 0;

				// Convert to decimal and change luminosity
				var rgb = "#",
				c, i;
				for (i = 0; i < 3; i++) {
					c = parseInt(hex.substr(i * 2, 2), 16);
					c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
					rgb += ("00" + c).substr(c.length);
				}

				return rgb;
		}

			/**
			* Jumbo size 3D nectar button.
			*
			* @since 3.0
			*/
			function createExtraJumboSize() {

				$('.nectar-3d-transparent-button').each(function () {

					if ($(this).css('visibility') != 'visible') {
						return;
					}

					var $that   = $(this),
					$size       = $that.attr('data-size'),
					$padding    = 0;

					var $vert_height_divider = 1.7;

					if ($size == 'extra_jumbo') {

						var $font_size;

						if (nectarDOMInfo.winW < 1000 && nectarDOMInfo.winW > 690) {
							$padding    = 64;
							$font_size  = 34;
							$that.find('.back-3d rect').attr('stroke-width', '12');
							$vert_height_divider = 1.7;
						} else if (nectarDOMInfo.winW <= 690) {
							$padding    = 46;
							$font_size  = 16;
							$that.find('.back-3d rect').attr('stroke-width', '10');
							$vert_height_divider = 1.7;
						} else {
							$padding    = 100;
							$font_size  = 64;
							$that.find('.back-3d rect').attr('stroke-width', '20');
							$vert_height_divider = 1.6;
						}


						$that.find('svg text').attr('font-size', $font_size);

						var $boundingRect = $(this).find('.back-3d .button-text')[0].getBoundingClientRect(),
						$text_width       = $boundingRect.width,
						$text_height      = $font_size * 1.5;

						$that.css({
							'width': ($text_width + $padding * 1.5) + 'px',
							'height': ($text_height + $padding) + 'px'
						});

						$that.find('> a').css({
							'height': ($text_height + $padding) + 'px'
						});

						$that.find('.back-3d svg, .front-3d svg').css({
							'width': ($text_width + $padding * 1.5) + 'px',
							'height': ($text_height + $padding) + 'px'
						}).attr('viewBox', '0 0 ' + ($text_width + $padding * 1.5) + ' ' + ($text_height + $padding));

						$that.find('svg text').attr('transform', 'matrix(1 0 0 1 ' + ($text_width + $padding * 1.6) / 2 + ' ' + (($text_height + $padding) / $vert_height_divider) + ')');
						$that.find('.front-3d ').css('transform-origin', '50% 50% -' + ($text_height + $padding) / 2 + 'px');
						$that.find('.back-3d').css('transform-origin', '50% 50% -' + ($text_height + $padding) / 2 + 'px');

					}

				});

			}


			/**
			* Nectar Button custom coloring
			*
			* @since 3.0
			*/
			function buttonInit() {

				/* CTA animations */
				if(!nectarDOMInfo.usingMobileBrowser) {
					$('.nectar-cta[data-style="text-reveal-wave"], .menu-item-hover-text-reveal-wave, .nectar-cta[data-style="curved-arrow-animation"]').each(function () {
						$(this).find('.char').each(function (i) {
							$(this).css('animation-delay', (i * 0.015) + 's');
						});

						var bindingClass = ($(this).is('[data-using-bg="true"]') ) ? '.link_wrap' : '.link_text';
						var childTarget = false;

						if( $(this).is('[class*="border_thickness_"]') && !$(this).is('[class*="border_thickness_0px"]') ) {
							bindingClass = '.link_wrap';
							childTarget = true;
						}

						if( $(this).is('.menu-item-hover-text-reveal-wave') ) {
							bindingClass = 'a';
						}

						if ( $(this).is('[data-triggered-by]') ) {
							var triggeredBy = $(this).attr('data-triggered-by');
							$(this).parents(triggeredBy).on('mouseenter', function () {
								if (nectarDOMInfo.winW > 999) {
									var target = $(this).find('.link_text');
									target.removeClass('hover');
									setTimeout(function () {
										target.addClass('hover');
									}, 20);
								}
							});

						} else {
							$(this).find(bindingClass).on('mouseenter', function () {
								if (nectarDOMInfo.winW > 999) {
									var target = ( childTarget ) ? $(this).find('.link_text') : $(this);
									target.removeClass('hover');
									setTimeout(function () {
										target.addClass('hover');
									}, 20);
								}
							});
						}


					});
				}


				/* General animated underline */
				$('.nectar-link-underline-effect a').on('mouseenter',function(){
					$(this).addClass('accessed');
				});


				/* Custom coloring */
				$('.nectar-button.see-through[data-color-override], .nectar-button.see-through-2[data-color-override], .nectar-button.see-through-3[data-color-override]').each(function () {

					var $usingMaterialSkin = ($('body.material[data-button-style^="rounded"]').length > 0) ? true : false;
					$(this).css('visibility', 'visible');

					if ($(this).hasClass('see-through-3') && $(this).attr('data-color-override') == 'false') {
						return true;
					}

					var $color;
					var $that;

					if ($(this).attr('data-color-override') != 'false') {
						$color = $(this).attr('data-color-override');
					} else {

						if ($(this).parents('.dark').length > 0) {
							$color = '#000000';
						}	else {
							$color = '#ffffff';
						}

					}

					if (!$(this).hasClass('see-through-3')) {
						$(this).css('color', $color);
					}

					$(this).find('i').css('color', $color);

					var colorInt        = parseInt($color.substring(1), 16);
					var $hoverColor     = ($(this).has('[data-hover-color-override]')) ? $(this).attr('data-hover-color-override') : 'no-override';
					var $hoverTextColor = ($(this).has('[data-hover-text-color-override]')) ? $(this).attr('data-hover-text-color-override') : '#fff';

					var R = (colorInt & 0xFF0000) >> 16;
					var G = (colorInt & 0x00FF00) >> 8;
					var B = (colorInt & 0x0000FF) >> 0;

					var $opacityStr = ($(this).hasClass('see-through-3')) ? '1' : '0.75';

					$(this).css('border-color', 'rgba(' + R + ',' + G + ',' + B + ',' + $opacityStr + ')');

					// Material theme skin buttons w/ icons starting
					if ($usingMaterialSkin) {
						$(this).find('i').css({
							'background-color': 'rgba(' + R + ',' + G + ',' + B + ',1)',
							'box-shadow': '0px 8px 15px rgba(' + R + ',' + G + ',' + B + ',0.24)'
						});
					}

					if ($(this).hasClass('see-through')) {

						$that = $(this);

						$(this).on('mouseenter touchstart', function () {
							$that.css('border-color', 'rgba(' + R + ',' + G + ',' + B + ',1)');
						});

						$(this).on('mouseleave touchtouchend', function () {
							$that.css('border-color', 'rgba(' + R + ',' + G + ',' + B + ',1)');
							$opacityStr = ($(this).hasClass('see-through-3')) ? '1' : '0.75';
							$that.css('border-color', 'rgba(' + R + ',' + G + ',' + B + ',' + $opacityStr + ')');
						});

					} else {

						$(this).find('i').css('color', $hoverTextColor);

						if ($hoverColor != 'no-override') {

							$that = $(this);

							$(this).on('mouseenter touchstart', function () {

								$that.css({
									'border-color': $hoverColor,
									'background-color': $hoverColor,
									'color': $hoverTextColor
								});

								// Material buttons w/ icons over
								if ($usingMaterialSkin) {
									$that.find('i').css({
										'background-color': '',
										'box-shadow': ''
									});
								}
							});

							$(this).on('mouseleave touchtouchend', function () {

								$opacityStr = ($(this).hasClass('see-through-3')) ? '1' : '0.75';

								if ($usingMaterialSkin) {
									$that.find('i').css({
										'background-color': 'rgba(' + R + ',' + G + ',' + B + ',1)',
										'box-shadow': '0px 8px 15px rgba(' + R + ',' + G + ',' + B + ',0.24)'
									});
								}

								if (!$that.hasClass('see-through-3')) {
									$that.css({
										'border-color': 'rgba(' + R + ',' + G + ',' + B + ',' + $opacityStr + ')',
										'background-color': 'transparent',
										'color': $color
									});
								} else {
									$that.css({
										'border-color': 'rgba(' + R + ',' + G + ',' + B + ',' + $opacityStr + ')',
										'background-color': 'transparent'
									});
								}

							});

						} else {

							$that = $(this);

							$(this).on('mouseenter touchstart', function () {

								$that.css({
									'border-color': $hoverColor,
									'color': $hoverTextColor
								});

							});

							$(this).on('mouseleave touchtouchend', function () {

								$opacityStr = ($that.hasClass('see-through-3')) ? '1' : '0.75';
								$that.css({
									'border-color': 'rgba(' + R + ',' + G + ',' + B + ',' + $opacityStr + ')',
									'color': $hoverTextColor
								});

							});

						}
					}
				});

				$('.nectar-button:not(.see-through):not(.see-through-2):not(.see-through-3)[data-color-override]').each(function () {

					$(this).css('visibility', 'visible');

					if ($(this).attr('data-color-override') != 'false') {

						var $color = $(this).attr('data-color-override');

						$(this)
							.removeClass('accent-color')
							.removeClass('extra-color-1')
							.removeClass('extra-color-2')
							.removeClass('extra-color-3')
							.css('background-color', $color);
					}

				});


				// Solid color tilt
				if ($('.swiper-slide .solid_color_2').length > 0 || $('.tilt-button-inner').length > 0) {

					var $tiltButtonCssString = '';
					var $color;

					$('.swiper-slide .solid_color_2 a').each(function (i) {

						$(this).addClass('instance-' + i);

						if ($(this).attr('data-color-override') != 'false') {
							$color = $(this).attr('data-color-override');
						} else {
							if ($(this).parents('.dark').length > 0) {
								$color = '#000000';
							}
							else {
								$color = '#ffffff';
							}
						}

						$(this).css('color', $color);
						$(this).find('i').css('color', $color);

						var $currentColor = $(this).css('background-color'),
						$topColor         = shadeColor($currentColor, 0.13),
						$bottomColor      = shadeColor($currentColor, -0.15);

						$tiltButtonCssString += '.swiper-slide .solid_color_2 a.instance-' + i + ':after { background-color: ' + $topColor + ';  }' + ' .swiper-slide .solid_color_2 a.instance-' + i + ':before { background-color: ' + $bottomColor + '; } ';

					});


					$('.tilt-button-wrap a').each(function (i) {

						$(this).addClass('instance-' + i);

						var $currentColor = $(this).css('background-color');
						var $color;

						if ($(this).attr('data-color-override') != 'false') {
							$color = $(this).attr('data-color-override');
							$(this).css('background-color', $color);
							$currentColor = $color;
						}

						var $topColor = shadeColor($currentColor, 0.13),
						$bottomColor  = shadeColor($currentColor, -0.15);

						$tiltButtonCssString += '.tilt-button-wrap a.instance-' + i + ':after { background-color: ' + $topColor + ';  }' + ' .tilt-button-wrap a.instance-' + i + ':before { background-color: ' + $bottomColor + '; } ';

					});

					// Style
					nectarCreateStyle($tiltButtonCssString, 'tilt-button');

				}


				// Transparent 3D
				if ($('.nectar-3d-transparent-button').length > 0) {

					var $3dTransButtonCssString = '';
					$('.nectar-3d-transparent-button').each(function (i) {


						// Webkit rendering fix.
						$(this).on('mouseover',function(){
						$(this).find('*').css('display','');
						var that = $(this);
						setTimeout(function(){
							that.find('*').css('display','block');
						},60);

						});
						$(this).on('mouseleave',function(){
						$(this).find('*').css('display','block');
						var that = $(this);
						setTimeout(function(){
							that.find('*').css('display','');
						},60);
						});

						var $that = $(this),
						$size 		= $that.attr('data-size'),
						$padding 	= 0,
						v1 				= 1.5,
						v2 				= 1.65,
						$font_size;

						// Size
						if ($size == 'large') {
							$padding 		= 46;
							$font_size 	= 16;
							v1 					= 1.5;
							v2 					= 1.7;
						} else if ($size == 'medium') {
							$padding 		= 30;
							$font_size 	= 16;
						} else if ($size == 'small') {
							$padding 		= 20;
							$font_size 	= 12;
						} else if ($size == 'jumbo') {
							$padding 		= 54;
							$font_size 	= 24;
							v1 					= 1.5;
							v2 					= 1.68;
						} else if ($size == 'extra_jumbo') {
							$padding 		= 100;
							$font_size 	= 64;
							v1 					= 1.6;
							v2 					= 1.6;
						}

						$that.find('svg text').attr('font-size', $font_size);

						var $boundingRect = $(this).find('.back-3d .button-text')[0].getBoundingClientRect(),
						$text_width       = $boundingRect.width,
						$text_height      = $font_size * 1.5;

						$that.css({
							'width': ($text_width + $padding * 1.5) + 'px',
							'height': ($text_height + $padding) + 'px'
						});

						$that.find('> a').css({
							'height': ($text_height + $padding) + 'px'
						});

						$that.find('.back-3d svg, .front-3d svg').css({
							'width': ($text_width + $padding * 1.5) + 'px',
							'height': ($text_height + $padding) + 'px'
						}).attr('viewBox', '0 0 ' + ($text_width + $padding * 1.5) + ' ' + ($text_height + $padding));

						$that.find('svg text').attr('transform', 'matrix(1 0 0 1 ' + ($text_width + $padding * v1) / 2 + ' ' + (($text_height + $padding) / v2) + ')');
						$that.find('.front-3d, .back-3d').css('transform-origin', '50% 50% -' + ($text_height + $padding) / 2 + 'px');

						// Mask
						$(this).find('.front-3d svg > rect').attr('id', 'masked-rect-id-' + i);
						$(this).find('.front-3d defs mask').attr('id', 'button-text-mask-' + i);

						$that.css('visibility', 'visible');
						$3dTransButtonCssString += '#masked-rect-id-' + i + ' { mask: url(#button-text-mask-' + i + '); -webkit-mask: url(#button-text-mask-' + i + ')} ';

					});

					// Extra jumbo resize
					createExtraJumboSize();
					$window.on('smartresize', createExtraJumboSize);

					// Style
					nectarCreateStyle($3dTransButtonCssString, 'nectar-td-button');

				}

				// Gradient btn init
				setTimeout(function () {
					$('.nectar-button[class*="color-gradient"] .start').removeClass('loading');
				}, 150);
				// No grad for ff
				if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1 ||
				navigator.userAgent.indexOf("MSIE ") > -1 ||
				navigator.userAgent.match(/Trident\/7\./)) {
					$('.nectar-button[class*="color-gradient"] .start').addClass('no-text-grad');
				}
			}




			/**
			* Shortcode icon large style
			*
			* @since 1.0
			*/
			function largeIconHover() {
				$('.icon-3x').each(function () {
					$(this).closest('.col').on('mouseenter', function () {
						$(this).find('.icon-3x').addClass('hovered');
					});

					$(this).closest('.col').on('mouseleave', function () {
						$(this).find('.icon-3x').removeClass('hovered');
					});
				});

				if (navigator.userAgent.indexOf("MSIE ") > -1 || navigator.userAgent.match(/Trident\/7\./)) {
					$('[class^="icon-"][class*="color-gradient"], .nectar_icon_wrap[data-color*="extra-color-gradient"] .nectar_icon, .nectar-gradient-text').addClass('no-grad');
				}
			}



				/**
				* Team member element - fullscreen style.
				*
				* @since 7.0
				*/
				function teamMemberFullscreen() {

					if ( $('.team-member').length === 0 ) {
						return;
					}

					// Open click event
					$body.on('click keydown', '.team-member[data-style="bio_fullscreen"], .team-member[data-style="bio_fullscreen_alt"]', function (e) {

						if ($('.nectar_team_member_overlay').length > 0) {
							return;
						}

						// Allow opening on enter.
						if (e.type === 'keydown' && !(e.key === "Enter" || e.keyCode === 13)) {
							return;
						}


						var $usingBoxedClass  = ($('body > #boxed').length > 0) ? 'in-boxed' : '',
						$teamMemberMeta       = $(this).find('.nectar_team_bio').html(),
						$teamMemberTitle      = ($(this).is('[data-style="bio_fullscreen_alt"]')) ? $(this).find('.team-meta h5').html() : $(this).find('.team-meta p').html(),
						$teamMemberImg        = ($(this).find('.nectar_team_bio_img[data-img-src]').length > 0) ? $(this).find('.nectar_team_bio_img').attr('data-img-src') : '',
						$teamMemberStyle      = ($(this).is('[data-style="bio_fullscreen_alt"]')) ? 'bio-fullscreen-alt' : 'bio-fullscreen',
						$teamName             = '';

						if($(this).is('[data-style="bio_fullscreen_alt"]')) {
							$teamName = '<div class="title">' + wlEls($teamMemberTitle) + '</div><h2>' + $(this).find('.team-meta h3').text() + '</h2>';
						} else {
							$teamName = '<h2>' + $(this).find('.team-meta h3').text() + '</h2><div class="title">' + wlEls($teamMemberTitle) + '</div>';
						}

						$body.append('<div class="nectar_team_member_overlay nectar-modal ' + $usingBoxedClass + '" data-style="' + $teamMemberStyle + '"><div class="inner-wrap"><div class="team_member_details"><div class="bio-inner"><span class="mobile-close"></span>'+ $teamName +'<div class="team-desc">' + wlEls($teamMemberMeta) + '</div></div></div><div class="team_member_picture"><div class="team_member_image_bg_cover"></div><div class="team_member_picture_wrap"><div class="team_member_image"></div></div></div></div></div>');

						if ($teamMemberImg.length > 0) {

							// Fade in img on load
							var teamTmpImg = new Image();
							teamTmpImg.src = $teamMemberImg;
							teamTmpImg.onload = function () {
								$('.nectar_team_member_overlay .team_member_image').css('opacity', '1');
							};
							$('.nectar_team_member_overlay .team_member_image').css({
								'background-image': 'url("' + $teamMemberImg + '")'
							});
						}

						var $headerNavSpace = ($('body[data-header-format="left-header"]').length > 0 && $window.width() > 1000) ? 0 : $headerOuterEl.height();
						$('.nectar_team_member_overlay .inner-wrap').css({
							'padding-top': $headerNavSpace
						});

						// No-scroll class - ios ready
						if ($('.using-mobile-browser').length > 0) {
							$('body,html').addClass('nectar-no-scrolling');
						}

						teamFullscreenResize();

						// Transition in
						$('.nectar_team_member_overlay')
							.addClass('open')
							.addClass('animating');

						setTimeout(function () {
							$('.nectar_team_member_close').addClass('visible');
							$('.nectar_team_member_overlay').removeClass('animating');
						}, 500);

						if ($('.team-member[data-style="bio_fullscreen"]').length > 0 && nectarDOMInfo.usingMobileBrowser) {
							$('.nectar_team_member_overlay').addClass('on-mobile');
						}

            			responsiveVideoIframes();

						$(window).trigger('nectar-team-member-opened');

					});

					// Close click event
					$body.on('click', '.nectar_team_member_overlay', function (e) {

						if( $(e.target).is('a') || $(e.target).parents('a').length > 0 ||
							$(e.target).is('.skip-team-member-close') || $(e.target).parents('.skip-team-member-close').length > 0 ) {
						return true;
						}

						if (!$(this).hasClass('animating')) {

							$('.nectar_team_member_overlay').removeClass('open');
							$('.nectar_team_member_close').removeClass('visible');

							if ($('.using-mobile-browser').length > 0) {
								$('body,html').removeClass('nectar-no-scrolling');
							}

							setTimeout(function () {

								$('.nectar_team_member_overlay, .nectar_team_member_close').remove();

							}, 820);
						}
					});

					if ($('.team-member[data-style="bio_fullscreen"]').length > 0 || $('.team-member[data-style="bio_fullscreen_alt"]').length > 0) {
						$window.on('resize', teamFullscreenResize);
						if( !nectarDOMInfo.usingMobileBrowser ) {
							var closeIndicator = new NectarIconMouseFollow('','close-indicator');
						}

					}

				}


				/**
				* Team member element fullscreen resize event.
				*
				* @since 7.0
				*/
				function teamFullscreenResize() {
					var $leftHeaderSize = ($('body[data-header-format="left-header"]').length > 0 && $window.width() > 1000) ? 275 : 0;
					$('.nectar_team_member_overlay').css({
						'width': $window.width() - $leftHeaderSize,
						'left': $leftHeaderSize
					});
				}


				/**
				* WPBakery column element BG hover
				*
				* @since 5.0
				*/
				function columnBGColors() {

					var $columnColorCSS = '';

					$('.wpb_column').each(function (i) {

						$(this).removeClass(function (index, className) {
							return (className.match(/(^|\s)instance-\S+/g) || []).join(' ');
						});

						if( $(this).attr('data-has-bg-color') == 'true' || $(this).is('[data-hover-bg^="#"]') ) {
							$(this).addClass('instance-' + i);
						}


						var $innerSelector = ( $(this).find('> .vc_column-inner > .column-bg-overlay-wrap').length > 0 || $(this).find('> .vc_column-inner > .column-bg-overlay').length > 0 ) ? ' > .vc_column-inner ' : '';
						var $innerWrapSelector = ( $(this).find($innerSelector + ' > .column-bg-overlay-wrap').length > 0 ) ? '> .column-bg-overlay-wrap ' : '';

						// BG color
						if ($(this).attr('data-has-bg-color') == 'true') {
							$columnColorCSS += '.wpb_column.instance-' + i + $innerSelector + $innerWrapSelector + ' > .column-bg-overlay { background-color:' + $(this).attr('data-bg-color') + ';  opacity: ' + $(this).attr('data-bg-opacity') + '; }';
						}

						// Hover bg color
						if ($(this).is('[data-hover-bg^="#"]')) {
							$columnColorCSS += '.wpb_column.instance-' + i + ':hover ' + $innerSelector + $innerWrapSelector + ' > .column-bg-overlay { background-color: ' + $(this).attr('data-hover-bg') + '!important; opacity: ' + $(this).attr('data-hover-bg-opacity') + '!important; }';
						}
					});

					// Style
					nectarCreateStyle($columnColorCSS, 'column-bg-colors');

				}



				/**
				* Displace filter column/row BG effect
				*
				* @since 10.5
				*/
				function nectarLiquidBGs() {
					$liquidBG_EL = [];

					if (typeof NectarLiquid == 'undefined' || nectarDOMInfo.usingFrontEndEditor) {
						return;
					}

					$('.row-bg-wrap[data-bg-animation*="displace-filter"] .row-bg.using-image, .column-image-bg-wrap[data-bg-animation*="displace-filter"] .column-image-bg').each(function (i) {

						var $that_el = $(this);
						var $type;
						var $el_type;

						if ($(this).is('.row-bg')) {
							$type = $(this).parents('.row-bg-wrap').attr('data-bg-animation');
							$el_type = 'row';
						}
						else if ($(this).is('.column-image-bg')) {
							$type = $(this).parents('.column-image-bg-wrap').attr('data-bg-animation');
							$el_type = 'col';
						}

						$liquidBG_EL[i] = new NectarLiquid($that_el, $type, $el_type);

					});
				}



				/**
				* Morphing outline element creation.
				*
				* @since 5.0
				*/
				function morphingOutlines() {

					if ($('.morphing-outline').length > 0) {

						var $morphingOutlineCSS 	= '',
						$frontEndEditorMOSelector = ($('body.vc_editor').length > 0) ? '' : '>';

						$('.morphing-outline').each(function (i) {

							$(this).removeClass(function (index, className) {
								return (className.match(/(^|\s)instance-\S+/g) || []).join(' ');
							});

							$(this).addClass('instance-' + i).css({
								'visibility': 'visible'
							});

							var $width  = $(this).find('.inner').width(),
							$height     = $(this).find('.inner').height(),
							$border     = parseInt($(this).attr("data-border-thickness")),
							$hover      = ($('body[data-button-style*="rounded"]').length > 0) ? ':hover' : '',
							$hover2     = ($('body[data-button-style*="rounded"]').length > 0) ? '' : ':hover';

							$morphingOutlineCSS += 'body .morphing-outline.instance-' + i + ' .inner > * { color: ' + $(this).attr("data-starting-color") + '; } ';
							$morphingOutlineCSS += 'body .morphing-outline.instance-' + i + ' .inner:after  { border-width:' + $(this).attr("data-border-thickness") + 'px ; border-color: ' + $(this).attr("data-starting-color") + '; } ';

							$morphingOutlineCSS += 'body .wpb_column:hover > .wpb_wrapper ' + $frontEndEditorMOSelector + ' .morphing-outline.instance-' + i + ' .inner > *, body .wpb_column:hover > .vc_column-inner > .wpb_wrapper ' + $frontEndEditorMOSelector + ' .morphing-outline.instance-' + i + ' .inner > * { color: ' + $(this).attr("data-hover-color") + '; } ';
							$morphingOutlineCSS += 'body .wpb_column:hover > .wpb_wrapper ' + $frontEndEditorMOSelector + ' .morphing-outline.instance-' + i + ' .inner:after, body .wpb_column:hover > .vc_column-inner > .wpb_wrapper ' + $frontEndEditorMOSelector + ' .morphing-outline.instance-' + i + ' .inner:after  { border-color: ' + $(this).attr("data-hover-color") + '; } ';

							// Padding calcs
							$morphingOutlineCSS += 'body .wpb_column' + $hover2 + ' > .wpb_wrapper ' + $frontEndEditorMOSelector + ' .morphing-outline.instance-' + i + ' .inner:after, body .wpb_column' + $hover2 + ' > .vc_column-inner > .wpb_wrapper ' + $frontEndEditorMOSelector + ' .morphing-outline.instance-' + i + ' .inner:after { padding: ' + (($width + 100 + $border * 2 - $height) / 2 - $border) + 'px 50px}';
							$morphingOutlineCSS += '.morphing-outline.instance-' + i + ' { padding: ' + (30 + ($width + 80 + $border * 2 - $height) / 2 - $border) + 'px 50px}';
							$morphingOutlineCSS += 'body .wpb_column' + $hover2 + ' > .wpb_wrapper ' + $frontEndEditorMOSelector + ' .morphing-outline.instance-' + i + ' .inner:after, body .wpb_column' + $hover2 + ' > .vc_column-inner > .wpb_wrapper ' + $frontEndEditorMOSelector + ' .morphing-outline.instance-' + i + ' .inner:after { top: -' + parseInt((($width + 100 + $border * 2 - $height) / 2 - $border) + $border) + 'px }';

							$morphingOutlineCSS += 'body .wpb_column > .wpb_wrapper ' + $frontEndEditorMOSelector + ' .morphing-outline.instance-' + i + ' .inner:after, body .wpb_column > .vc_column-inner > .wpb_wrapper ' + $frontEndEditorMOSelector + ' .morphing-outline.instance-' + i + ' .inner:after { left: -' + parseInt(50 + $border) + 'px }';

							// Hover
							$morphingOutlineCSS += 'body .wpb_column' + $hover + ' > .wpb_wrapper ' + $frontEndEditorMOSelector + ' .morphing-outline.instance-' + i + ' .inner:after, body .wpb_column' + $hover + ' > .vc_column-inner > .wpb_wrapper ' + $frontEndEditorMOSelector + ' .morphing-outline.instance-' + i + ' .inner:after { padding: 50px 50px}';
							$morphingOutlineCSS += 'body .wpb_column' + $hover + ' > .wpb_wrapper ' + $frontEndEditorMOSelector + ' .morphing-outline.instance-' + i + ' .inner:after, body .wpb_column' + $hover + ' > .vc_column-inner > .wpb_wrapper ' + $frontEndEditorMOSelector + ' .morphing-outline.instance-' + i + ' .inner:after { top: -' + parseInt(50 + $border) + 'px }';

						});

						// Style
						nectarCreateStyle($morphingOutlineCSS, 'morphing-outlines');

					}

				}


				/**
				* Morphing outline element initialization.
				*
				* @since 5.0
				*/
				function morphingOutlinesInit() {

					if($('.morphing-outline').length > 0) {

						// Create style.
						setTimeout(morphingOutlines, 100);
						setTimeout(fullWidthContentColumns, 125);

						// Handle resize.
						$window.on('smartresize', morphingOutlines);

					}

				}



				/**
				* SVG icon element animations
				*
				* @since 6.0
				* @see waypoints
				*/
				function svgAnimations() {

					var $svgOffsetPos = ($fullscreenMarkupBool == true) ? '500%' : 'bottom-in-view';

					if ($svgIcons.length == 0 || nectarDOMInfo.usingFrontEndEditor && $('#nectar_fullscreen_rows').length > 0) {

						$('.svg-icon-holder:not(.animated-in)').has('svg').each(function (i) {

							var $that = $(this);

							if (bypassAnimations) {
								$that.attr('data-animation', 'false');
							}
							// Size
							$that.find('svg').css({
								'height': parseInt($that.attr('data-size')) + 'px',
								'width': parseInt($that.attr('data-size')) + 'px'
							});

							// Animation
							$(this).find('svg').attr('id', 'nectar-svg-animation-instance-' + i);

							var $animationSpeed = ($that.is('[data-animation-speed]') && $that.attr('data-animation-speed').length > 0) ? $that.attr('data-animation-speed') : 200;

							if ($that.attr('data-animation') == 'false') {
								$animationSpeed = 1;
								$that.css('opacity', '1');
							}

							if (!$that.hasClass('bound')) {
								$svgIcons[i] = new Vivus($that.find('svg').attr('id'), {
									type: 'delayed',
									pathTimingFunction: Vivus.EASE_OUT,
									animTimingFunction: Vivus.LINEAR,
									duration: $animationSpeed,
									onReady: svgInit
								});
							}

							if ($animationSpeed !== 1) {

								var waypoint = new Waypoint({
									element: $that[0],
									handler: function () {
										if ($that.hasClass('animated-in')) {
											waypoint.destroy();
											return;
										}

										checkIfReady();
										$that.addClass('animated-in');
										waypoint.destroy();
									},
									offset: $svgOffsetPos

								});

							} else {
								checkIfReady();
							}

							function checkIfReady() {

								var $animationDelay = 0;

								if($that.is('[data-animation-delay]') &&
								$that.attr('data-animation-delay').length > 0 &&
								$that.attr('data-animation') != 'false') {
									$animationDelay = $that.attr('data-animation-delay');
								}

								var $iconID = $that.find('svg').attr('id').replace(/[^0-9]/g, '');

								if ($svgIcons[$iconID].isReady == true) {
									setTimeout(function () {
										$that.css('opacity', '1');
										$svgIcons[$iconID].reset().play();
									}, $animationDelay);
								} else {
									setTimeout(checkIfReady, 50);
								}
							}

							function svgInit() {

								//set size
								$that.css({
									'height': parseInt($that.attr('data-size')) + 'px',
									'width': parseInt($that.attr('data-size')) + 'px'
								});

							}

							$that.addClass('bound');

						});


						// SVG in equal height column resize
						if ($('.vc_row-o-equal-height .svg-icon-holder[data-animation="true"]').length > 0 &&
						$('#nectar_fullscreen_rows').length == 0) {

							$window.on('smartresize', function () {
								clearTimeout($svgResizeTimeout);
								$svgResizeTimeout = setTimeout(function () {

									if ($svgIcons.length > 0) {
										$('.svg-icon-holder.animated-in').each(function () {

											$(this).css('opacity', '1');
											if ($(this).is('[id]')) {
												var $iconID = $(this).attr('id').replace(/[^0-9]/g, '');
												$svgIcons[$iconID].finish();
											}

										});
									}

								}, 300);

							});

						}

					}

					// After svg animated icons initalized
					else {
						$('.svg-icon-holder').addClass('animated-in').css('opacity', '1');
					}

					// Full vc row support
					$('#nectar_fullscreen_rows .svg-icon-holder.animated-in').has('svg').each(function (i) {


						var $animationDelay = 0;

						if($(this).is('[data-animation-delay]') &&
						$(this).attr('data-animation-delay').length > 0 &&
						$(this).attr('data-animation') != 'false') {
							$animationDelay = $(this).attr('data-animation-delay');
						}

						var $that = $(this);

						var $iconID = $that.find('svg').attr('id').replace(/[^0-9]/g, '');

						clearTimeout($animatedSVGIconTimeout[i]);

						if ($that.attr('data-animation') == 'false') {

							$that.css('opacity', '1');
							$svgIcons[$iconID].finish();

						} else {

							if ($(this).parents('.active').length > 0 ||
							$(this).parents('#footer-outer').length > 0 ||
							$('body.mobile').length > 0) {

								$svgIcons[$iconID].reset();
								$animatedSVGIconTimeout[i] = setTimeout(function () {
									$svgIcons[$iconID].play();
								}, $animationDelay);

							} else {
								$svgIcons[$iconID].reset().stop();
							}
						}
					});

				}



				/**
				* Fancy unordered list element initialization.
				*
				* @since 4.0
				* @see waypoints
				*/
				function nectarFancyUlInit() {

					$($fullscreenSelector + '.nectar-fancy-ul').each(function () {

						var $animation  = $(this).attr('data-animation'),
						$animationDelay = 0;

						if($(this).is('[data-animation-delay]') &&
							$(this).attr('data-animation-delay').length > 0 &&
							$(this).attr('data-animation') != 'false') {
							$animationDelay = $(this).attr('data-animation-delay');
						}

						if ($animation == 'true') {

							var $that = $(this),
							waypoint 	= new Waypoint({
								element: $that[0],
								handler: function () {

									if ($that.parents('.wpb_tab').length > 0 && $that.parents('.wpb_tab').css('visibility') == 'hidden' || $that.hasClass('animated-in')) {
										waypoint.destroy();
										return;
									}

									setTimeout(function () {
										$that.find('li').each(function (i) {
											var $that = $(this);
											$that.delay(i * 220).transition({
												'opacity': '1',
												'left': '0'
											}, 220, 'easeOutCubic');
										});
									}, $animationDelay);

									$that.addClass('animated-in');
									waypoint.destroy();
								},
								offset: 'bottom-in-view'

							});

						}

					});

				}


				/**
				* Fancy unordered list element icons.
				*
				* @since 11.0
				*/
				function nectarFancyUlIcons() {

					$('.nectar-fancy-ul:not([data-list-icon="dot"]):not([data-list-icon="none"])').each(function () {

						var $icon = $(this).attr('data-list-icon'),
						$color    = $(this).attr('data-color');

						$(this).find('li').each(function () {
							$(this).find('> i').remove();
							$(this).prepend('<i class="icon-default-style ' + $icon + ' ' + $color + '"></i> ');
						});

					});

				}


				/**
				* Flipbox element height calculations.
				*
				* @since 7.0
				*/
				function flipBoxHeights() {

					$('.nectar-flip-box').each(function () {

						var $flipBoxMinHeight = parseInt($(this).attr('data-min-height')),
						$flipBoxHeight        = $(this).find('.flip-box-front .inner').height();

						if ($(this).find('.flip-box-back .inner').height() > $(this).find('.flip-box-front .inner').height()) {
							$flipBoxHeight = $(this).find('.flip-box-back .inner').height();
						}

						if ($flipBoxHeight >= $flipBoxMinHeight - 80) {
							$(this).find('> div').css('height', $flipBoxHeight + 80);
						} else {
							$(this).find('> div').css('height', 'auto');
						}

						// Safari needs 3D translate.
						if ($(this).parent().hasClass('wpb_wrapper')) {
							$(this).parent().css('transform', 'translateZ(0)');
						}

					});
				}




				/**
				* Flipbox element events.
				*
				* @since 7.0
				*/
				function flipBoxInit() {

					if( $('.nectar-flip-box').length > 0 ) {

						// Mobile gets click.
						if (nectarDOMInfo.usingMobileBrowser) {
							$body.on('click', '.nectar-flip-box', function () {
								$(this).toggleClass('flipped');
							});
						}

						flipBoxHeights();

						// Handle resize.
						$window.on('smartresize', flipBoxHeights);
					}

				}




				/**
				* Runs before other full width section calculations.
				*
				* @since 4.0
				*/
				function fullWidthSectionsPreInit() {

					// Nectar Slider force full width parent row when using full width element option.
					$('.wpb_row .vc_col-sm-12 .nectar-slider-wrap[data-full-width="true"]').each(function () {
						if ($(this).parents('.wpb_row.full-width-section').length == 0 && $(this).parents('.wpb_row.full-width-content').length == 0) {
							$(this).parents('.wpb_row').addClass('full-width-section');
						}
					});

					// Handle percent row padding values when using the boxed theme option.
					if( !nectarDOMInfo.usingMobileBrowser && $('body[data-boxed-style="1"]').length > 0 && $('#boxed').length > 0 ) {
						fullWidthRowPaddingAdjustCalcBoxed();
					}

				}



				/**
				* Full width calculations for legacy items.
				*
				* @since 4.0
				*/
				function fullWidthSections() {

					if( $('.carousel-wrap[data-full-width="true"], .portfolio-items[data-col-num="elastic"]:not(.fullwidth-constrained), #boxed .full-width-content').length == 0 ) {
						return;
					}

					var $windowInnerWidth = nectarDOMInfo.winW,
					$bodyBorderWidth      = ($('.body-border-right').length > 0 && $windowInnerWidth > 1000 || $('.body-border-right').length > 0 && window.nectarOptions && window.nectarOptions.body_border_mobile && window.nectarOptions.body_border_mobile === '1') ? parseInt($('.body-border-right').width()) * 2 : 0,
					$container_width      = ($('.container-wrap').length > 0) ? parseInt($('.container-wrap').outerWidth()) : $window.width(),
					$extended_padding     = ($('body[data-ext-padding]').length > 0) ? parseInt($('body').attr('data-ext-padding'))*2 : 180;

					var $windowWidth,
					$justOutOfSight,
					$mainContentWidth;

					// Takes mobile percentage max width into calcs.
					var mainContentWidthNormalized = $('.main-content').css('max-width');

					if ( mainContentWidthNormalized.indexOf('%') > -1 ) {
						var scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
						mainContentWidthNormalized = parseInt(mainContentWidthNormalized) / 100 * (nectarDOMInfo.winW - scrollbarWidth);
					} else {
						mainContentWidthNormalized = parseInt(mainContentWidthNormalized);
					}


					if ($('#boxed').length == 1) {
						$justOutOfSight = ((parseInt($('.container-wrap').width()) - parseInt($('.main-content').width())) / 2) + 4;
					} else {

						// Ext responsive mode is on - add the extra padding into the calcs
						var $extResponsivePadding = ($('body[data-ext-responsive="true"]').length > 0 && $windowInnerWidth >= 1000) ? $extended_padding : 0;

						if ($container_width - $bodyBorderWidth <= mainContentWidthNormalized) {
							$windowWidth = mainContentWidthNormalized;
						} else {
							$windowWidth = $container_width - $bodyBorderWidth;
						}


						var $contentWidth = mainContentWidthNormalized;

						// Single post fullwidth
						if ($('body.single-post[data-ext-responsive="true"]').length > 0 && $('.container-wrap.no-sidebar').length > 0) {
							$contentWidth = $('.post-area').width();
							$extResponsivePadding = 0;
						}

						$justOutOfSight = Math.ceil((($windowWidth + $extResponsivePadding - $contentWidth) / 2));
					}


					$('.carousel-outer').has('.carousel-wrap[data-full-width="true"]').css('overflow', 'visible');

					$('.carousel-wrap[data-full-width="true"], .portfolio-items[data-col-num="elastic"]:not(.fullwidth-constrained), #boxed .full-width-content').each(function () {

						var $leftHeaderSize = ($('#header-outer[data-format="left-header"]').length > 0 && $windowInnerWidth >= 1000) ? parseInt($('#header-outer[data-format="left-header"]').width()) : 0;
						var $bodyBorderWidth = ($('.body-border-right').length > 0 && $windowInnerWidth > 1000 || $('.body-border-right').length > 0 && window.nectarOptions && window.nectarOptions.body_border_mobile && window.nectarOptions.body_border_mobile === '1') ? (parseInt($('.body-border-right').width()) * 2) - 2 : 0;

						// Boxed.
						if ($('#boxed').length == 1) {

							var mainContentBoxed = ( $windowInnerWidth >= 690 ) ? parseInt($('.main-content').width()) :  mainContentWidthNormalized;
							$mainContentWidth = ($('#nectar_fullscreen_rows').length == 0) ? mainContentBoxed : parseInt($(this).parents('.container').width());

							if ($('body.single-post[data-ext-responsive="true"]').length > 0 && $('.container-wrap.no-sidebar').length > 0 && $(this).parents('.post-area').length > 0) {
								$contentWidth         = $('.post-area').width();
								$extResponsivePadding = 0;
								$windowWidth          = $container_width - $bodyBorderWidth;
								$justOutOfSight       = Math.ceil((($windowWidth + $extResponsivePadding - $contentWidth) / 2));
							} else {
								if ($(this).parents('.page-submenu').length > 0) {
									$justOutOfSight = ((parseInt($('.container-wrap').width()) - $mainContentWidth) / 2);
								}
								else {
									$justOutOfSight = ((parseInt($('.container-wrap').width()) - $mainContentWidth) / 2) + 4;
								}
							}
						} else {

							if ($('body.single-post[data-ext-responsive="true"]').length > 0 && $('.container-wrap.no-sidebar').length > 0 && $(this).parents('.post-area').length > 0) {

								$contentWidth         = $('.post-area').width();
								$extResponsivePadding = 0;
								$windowWidth          = $container_width - $bodyBorderWidth;

							} else {

								var $mainContentMaxWidth = ($('#nectar_fullscreen_rows').length == 0) ? mainContentWidthNormalized : parseInt($(this).parents('.container').css('max-width'));

								if ($container_width - $bodyBorderWidth <= $mainContentMaxWidth) {
									$windowWidth = $mainContentMaxWidth;
								}

								$contentWidth         = $mainContentMaxWidth;
								$extResponsivePadding = ($('body[data-ext-responsive="true"]').length > 0 && nectarDOMInfo.winW >= 1000) ? $extended_padding : 0;

								if ($leftHeaderSize > 0) {
									$extResponsivePadding = ($('body[data-ext-responsive="true"]').length > 0 && nectarDOMInfo.winW >= 1000) ? 120 : 0;
								}

							}

							$justOutOfSight = Math.ceil((($windowWidth + $extResponsivePadding - $contentWidth) / 2));

						}

						var $extraSpace = 0;
						if ($(this).hasClass('carousel-wrap')) {
							$extraSpace = 1;
						}
						if ($(this).hasClass('portfolio-items')) {
							$extraSpace = 5;
						}

						var $carouselWidth = ($('#boxed').length == 1) ? $mainContentWidth + parseInt($justOutOfSight * 2) : $container_width - $bodyBorderWidth + $extraSpace;

						// When using gutter on portfolio don't add extra space
						if ($('#boxed').length == 0 && $(this).hasClass('portfolio-items') && $(this).is('[data-gutter*="px"]') && $(this).attr('data-gutter').length > 0 && $(this).attr('data-gutter') != 'none') {
							if ($container_width > 1000) {
								$carouselWidth = $container_width - $bodyBorderWidth + 3;
							}
							else {
								$carouselWidth = $container_width - $bodyBorderWidth;
							}
						}

						if ($(this).parent().hasClass('default-style')) {

							$mainContentWidth = ($('#nectar_fullscreen_rows').length == 0) ? parseInt($('.main-content').width()) : parseInt($(this).parents('.container').width());

							if ($('#boxed').length != 0) {
								$carouselWidth  = ($('#boxed').length == 1) ? $mainContentWidth + parseInt($justOutOfSight * 2) : $container_width + $extraSpace;
							} else {
								$carouselWidth  = ($('#boxed').length == 1) ? $mainContentWidth + parseInt($justOutOfSight * 2) : ($container_width - $bodyBorderWidth) - (($container_width - $bodyBorderWidth) * 0.025) + $extraSpace;
								$windowWidth    = ($container_width - $bodyBorderWidth <= $mainContentWidth) ? $mainContentWidth : ($container_width - $bodyBorderWidth) - (($container_width - $bodyBorderWidth) * 0.025);
								$justOutOfSight = Math.ceil((($windowWidth - $mainContentWidth) / 2));
							}

						}

						else if ($(this).parent().hasClass('spaced')) {

							$mainContentWidth = ($('#nectar_fullscreen_rows').length == 0) ? parseInt($('.main-content').width()) : parseInt($(this).parents('.container').width());

							if ($('#boxed').length != 0) {
								$carouselWidth = ($('#boxed').length == 1) ? $mainContentWidth + parseInt($justOutOfSight * 2) - ($container_width * 0.02) : $container_width + $extraSpace;
							} else {
								$carouselWidth = ($('#boxed').length == 1) ? $mainContentWidth + parseInt($justOutOfSight * 2) : ($container_width - $bodyBorderWidth) - Math.ceil(($container_width - $bodyBorderWidth) * 0.02) + $extraSpace;
								var $windowWidth2 = ($container_width - $bodyBorderWidth <= $mainContentWidth) ? $mainContentWidth : ($container_width - $bodyBorderWidth) - (($container_width - $bodyBorderWidth) * 0.02);
								$justOutOfSight = Math.ceil((($windowWidth2 - $mainContentWidth) / 2) + 2);
							}
						}

						// Make sure the element/row is capable of going full width.
						if (!$(this).parents('.span_9').length > 0 &&
						!$(this).parent().hasClass('span_3') &&
						$(this).parent().attr('id') != 'sidebar-inner' &&
						!$(this).find('.nectar-carousel-flickity-fixed-content').length > 0 &&
						$(this).parent().attr('id') != 'portfolio-extra' ) {

							// Escape if inside woocoommerce page and not using applicable layout
							if ($('.single-product').length > 0 &&
							$(this).parents('#tab-description').length > 0 &&
							$(this).parents('.full-width-tabs').length == 0) {

								$(this).css({
									'visibility': 'visible'
								});

							} else {
								// Portfolio.
								if ($(this).hasClass('portfolio-items')) {

									if( $(this).parents('.full-width-content').length == 0 ) {

										$(this).css({
											'margin-left': -$justOutOfSight,
											'left': 0,
											'width': $carouselWidth,
											'visibility': 'visible'
										});

									}

								} else {

									// Fullscreen page rows left.
									if ($('#nectar_fullscreen_rows').length > 0 && $(this).hasClass('wpb_row')) {

										$(this).css({
											'margin-left': -$justOutOfSight,
											'width': $carouselWidth,
											'visibility': 'visible'
										});

									} else {
										// Regular rows.
										if( $(this).parents('.full-width-content').length == 0 ) {
											$(this).css({
												'left': 0,
												'margin-left': -$justOutOfSight,
												'width': $carouselWidth,
												'visibility': 'visible'
											});
										}
									}

								}

							}
						}

						else if ($(this).parent().attr('id') == 'portfolio-extra' && $('#full_width_portfolio').length != 0) {

							if( !$(this).find('.nectar-carousel-flickity-fixed-content').length > 0 ) {
								$(this).css({
									'left': 0,
									'margin-left': -$justOutOfSight,
									'width': $carouselWidth,
									'visibility': 'visible'
								});
							}

						} else {

							$(this).css({
								'margin-left': 0,
								'width': 'auto',
								'left': '0',
								'visibility': 'visible'
							});
						}

					});

				}



				/**
				* First full width row on page
				*
				* @since 4.0
				*/
				function firstFWSection() {

					$('.full-width-section.wpb_row, .full-width-content.wpb_row').each(function () {

						var $parent = $(this).parent();
						if (!$parent.hasClass('span_9') &&
							!$parent.hasClass('span_3') &&
							$parent.attr('id') != 'sidebar-inner') {

							if ($(this).parents('#portfolio-extra').length > 0 && $('#full_width_portfolio').length == 0) {
								return false;
							}

							if ($(this).index() == '0' &&
									$pageHeaderBG.length == 0 &&
									$('.page-header-no-bg').length == 0 &&
									$('.project-title').length == 0 &&
									$('body.single').length == 0 ) {

									$(this).addClass('first-section');

									$(this).addClass('loaded');

							}

						}

					});

				}




			  /**
				* Scroll Position Based Animations
				*
				* @since 14.0
				*/
				function NectarScrollPosAnimations(el) {

					this.$element      = el;
					this.$elementInner = el.find('> .vc_column-inner');
					this.inView        = false;
					this.topLevel      = false;
					this.bottomLevel   = false;
					this.lastY         = 0;
					this.lerp          = ( el.data('scroll-animation-lerp') ) ? parseFloat(el.data('scroll-animation-lerp')) : 0.28;
					this.intensity     = ( el.data('scroll-animation-intensity') ) ? Math.max(Math.min(parseFloat(el.data('scroll-animation-intensity')), 8), -8) : 3;

					this.intensity = this.intensity/10;
					this.storedWinH = nectarDOMInfo.winH;

					if( this.intensity < -0.29 ) {
						this.lerp = 1;
					}

					this.type = 'translateY';
					this.persistOnMobile = ( el.is('[data-scroll-animation-mobile]') && 'true' == el.attr('data-scroll-animation-mobile') ) ? true : false;

					if( !this.$element.hasClass('wpb_column') && this.$element.parents('.cell').length == 0 ) {
						this.$elementInner = el;
						this.$element = el.parent();
						if(el.is('[data-scroll-animation-movement]')) {
							this.$element.attr('data-scroll-animation-movement', el.attr('data-scroll-animation-movement'));
						}
					}

					if( nectarDOMInfo.usingMobileBrowser && false == this.persistOnMobile ) {
						return;
					}
					this.setType();
					this.calculatePos();
					this.trackView();
					this.animate();

					// Periodically update offsets.
					if( this.$element.parents('.wpb_column.has-animation').length == 0 ) {
						setInterval(this.calculatePos.bind(this),1000);
					}

					$window.on('resize', this.calculatePos.bind(this));

					var that = this;
					window.addEventListener("orientationchange", function() {
						this.setTimeout(function(){
							that.orientationChange();
						}, 80);
					});

				}

				NectarScrollPosAnimations.prototype.setType = function() {

					// Handle animation type
					if( this.$element.is('[data-scroll-animation-movement]') ) {
						var type = this.$element.attr('data-scroll-animation-movement');
						if( type == 'transform_x' ) {
							this.type = 'translateX';
						}
					}

				}
				NectarScrollPosAnimations.prototype.calculatePos = function() {

					if( nectarState.materialOffCanvasOpen != true && nectarState.ocmAnimating != true ) {
						this.offsetTop  = this.$element.offset().top;
						this.height     = this.$element.outerHeight();
						this.vertCenter = this.storedWinH/2 - this.height/2;
					}

					if( !nectarDOMInfo.usingMobileBrowser ) {
						this.storedWinH = nectarDOMInfo.winH;
					}
				};


				NectarScrollPosAnimations.prototype.orientationChange = function() {

					if( nectarDOMInfo.usingMobileBrowser ) {
						this.offsetTop  = this.$element.offset().top;
						this.height     = this.$element.outerHeight();
						this.storedWinH = nectarDOMInfo.winH;
					}

				};

				NectarScrollPosAnimations.prototype.trackView = function() {

					var that = this;

					// Top/Bottom levels.
					if( this.$element.parents('.top-level').length > 0 ) {
						this.topLevel = true;

						if( this.offsetTop > nectarDOMInfo.winH ) {
							this.topLevel = false;
						}
					}
					if( this.$element.is('.nectar_hook_global_section_parallax_footer') ) {
						this.bottomLevel = true;
					}

					if( 'IntersectionObserver' in window ) {

						var options = {
							root: (isSafari()) ? null : document,
							rootMargin: '250px',
						}
						var observer = new IntersectionObserver(function(entries) {

							entries.forEach(function(entry){
								var isIntersecting = entry.isIntersecting;

								if (isIntersecting) {
									that.inView = true;
								} else {
									that.inView = false;
								}
							});

						}, options);

						observer.observe(this.$element[0]);

					}

				};

				NectarScrollPosAnimations.prototype.animate = function() {

					if( nectarState.materialOffCanvasOpen == true ) {
						window.requestAnimationFrame(this.animate.bind(this));
						return;
					}

					if( this.lerp == 1 ) {
						this.lastY = nectarDOMInfo.scrollTop;
					} else {
						this.lastY = parseInt(linearInterpolate(this.lastY, nectarDOMInfo.scrollTop, this.lerp));
					}


					if( nectarState.animatedScrolling == true ) {
						this.inView = true;
					}

					if( this.inView ) {

						var that = this;
						var intensity = this.intensity;

						if( nectarDOMInfo.winW < 1025 ) {
							intensity = intensity/1.2;
						}
						if( nectarDOMInfo.winW < 690 ) {
							intensity = intensity/1.35;
						}


						if( that.topLevel === true && nectarDOMInfo.winW > 1000 || that.topLevel === true && this.persistOnMobile ) {
							this.$elementInner[0].style.transform = this.type+'(' + -(that.lastY * intensity ) + 'px) translateZ(0)';
						}
						else if ( that.bottomLevel === true && nectarDOMInfo.winW > 1000 || that.bottomLevel === true && this.persistOnMobile ) {
							this.$elementInner[0].style.transform = this.type+'(' + -((that.lastY - ( that.offsetTop + that.height ) + nectarDOMInfo.winH ) * intensity  ) + 'px) translateZ(0)';
						}
						else if( nectarDOMInfo.winW > 1000 || this.persistOnMobile ) {
							this.$elementInner[0].style.transform = this.type+'(' + -((that.lastY - that.offsetTop + that.vertCenter ) * intensity  ) + 'px) translateZ(0)';
						}
						else {
							this.$elementInner[0].style.transform = this.type+'(0px) translateZ(0)';
						}

					}

					window.requestAnimationFrame(this.animate.bind(this));
				};




				/**
				* Parallax BG Scrolling
				*
				* @since 13.0
				*/
				function NectarParallaxScroll(el, parallaxElClass, speed, type) {

					this.$el            = el;
					this.$parallaxEl    = this.$el.find(parallaxElClass);
					this.firstSection   = false;
					this.nestedParallax = false;
					this.type           = type;
					this.speed          = speed;
					this.storedWinH     = nectarDOMInfo.winH;

					if( el.parents('.nectar-sticky-tabs').length > 0 ||
						el.parents('.nectar-sticky-column-css').length > 0 ||
						el.parents('.nectar-global-section-megamenu').length > 0 ) {
						return;
					}

					this.setup();
					this.update();

				}

				NectarParallaxScroll.prototype.setup = function() {

					var that = this;

					// Page Header.
					if( this.$el.parents('#page-header-bg').length > 0 ||
	 					this.$el.parents('.featured-media-under-header').length > 0 ) {
						this.type = 'page-header';
					}


					// Is the element in the first row on the page?
					if(this.$el.parents('.top-level').length > 0 && this.$el.parents('.parallax_slider_outer').length > 0 ||
						 this.$el.parents('.top-level').length > 0 && this.$el.hasClass('nectar-simple-slider') ||
						 this.$el.parents('.top-level').length > 0 && this.$el.hasClass('nectar-recent-posts-single_featured') ||
						 this.$el.parents('.top-level').length > 0 && this.$el.hasClass('column-image-bg-wrap') && this.$el.parent().parent().is('.vc_col-sm-12:not(.child_column)') ||
						 this.$el.is('.wpb_row.top-level') ||
						 this.type == 'page-header' ||
						 ($('.wpb_row').length == 0 &&
						 !this.$el.is('.blog_next_prev_buttons') &&
						 !this.$el.is('#portfolio-nav'))
						 ) {
						this.firstSection = true;
					}



					//// Nectar Slider.
					if($('.wpb_row').length == 0 &&
						this.$el.parents('.parallax_slider_outer').length > 0 &&
						this.$el.is('[data-full-width="true"]') ||
						($('#portfolio-extra').length > 0 &&
						this.$el.parents('.parallax_slider_outer').length > 0 &&
						this.$el.parents('.wpb_row').length > 0 &&
						this.$el.parents('.wpb_row').index() == '0')) {
						this.firstSection = true;

					}
					//// Disable first section calcs when using FE editor.
					if (nectarDOMInfo.usingFrontEndEditor && this.type != 'page-header') {
						this.firstSection = false;
					}


					// Init class.
					this.$parallaxEl.addClass('translate');

					// Need to periodically check height/offset.
					this.nestedParallax = ( this.$parallaxEl.parents('[data-scroll-animation="true"]').length > 0 ) ? true : false;
					if( !this.nestedParallax ) {
						setInterval(function() {

						if( nectarState.materialOffCanvasOpen != true &&
							nectarState.ocmAnimating != true ) {
							that.offsetTop = that.$el.offset().top;
							that.height    = that.$el.outerHeight(true);
						}

						}, 800);
					}

					// Bind events.
					$(window).on('nectar-column-animation-start',this.checkColumnAnimation.bind(this));
					$(window).on('resize load', this.resize.bind(this));
					window.addEventListener("orientationchange", function() {
						this.setTimeout(function(){
						that.orientationChange();
						}, 110);
					});

					// Initial calc.
					this.offsetTop = this.$el.offset().top;
					this.height = this.$el.outerHeight(true);

				};

				NectarParallaxScroll.prototype.checkColumnAnimation = function() {
					if( this.$parallaxEl.parents('.col.has-animation.triggered-animation:not(.animated-in)').length > 0 ) {
						this.realtimeOffsetUpdate();
					}
				};

				NectarParallaxScroll.prototype.realtimeOffsetUpdate = function() {
					// Triggered when a column animation is active.
					var that = this;

					var realTimeOffset = setInterval(function() {
						if( nectarState.materialOffCanvasOpen != true ) {
							that.offsetTop = that.$el.offset().top;
							that.height    = that.$el.outerHeight(true);
						}
					},30);

					setTimeout(function(){
						clearInterval(realTimeOffset);
					},2000);

				}

				NectarParallaxScroll.prototype.resize = function() {

					// not on mobile.
					if( !nectarDOMInfo.usingMobileBrowser ) {
						this.storedWinH = nectarDOMInfo.winH;
						this.offsetTop = this.$el.offset().top;
						this.height = this.$el.outerHeight(true);
					}
					else {
						// on mobile, only recalc when item is not in a nested parallax setup.
						if( !this.nestedParallax ) {
						this.offsetTop = this.$el.offset().top;
						this.height = this.$el.outerHeight(true);
						}
					}

				};

				NectarParallaxScroll.prototype.orientationChange = function() {

					if( nectarDOMInfo.usingMobileBrowser ) {
						this.offsetTop = this.$el.offset().top;
						this.height = this.$el.outerHeight(true);
						this.storedWinH = nectarDOMInfo.winH;
					}

				};


				NectarParallaxScroll.prototype.update = function() {

					// Outside of viewport.

					if(this.offsetTop + 150 + this.height < nectarDOMInfo.scrollTop ||
						 this.offsetTop - 150 > nectarDOMInfo.scrollTop + this.storedWinH ||
						 nectarState.materialOffCanvasOpen == true) {

						 for(var i = 0; i < this.$parallaxEl.length; i++) {
							 this.$parallaxEl[i].style.willChange = 'auto';
						 }

						 requestAnimationFrame(this.update.bind(this));
						 return;
					}



					for(var i = 0; i < this.$parallaxEl.length; i++) {

						if( this.firstSection === true ) {
							this.$parallaxEl[i].style.transform = 'translate3d(0, ' + nectarDOMInfo.scrollTop * this.speed + 'px, 0)';
						}
						else {

							this.$parallaxEl[i].style.transform = 'translate3d(0, ' + ((this.storedWinH + nectarDOMInfo.scrollTop - this.offsetTop) * this.speed) + 'px, 0) scale(1.005)';
						}
						this.$parallaxEl[i].style.willChange = 'transform';
					}

					requestAnimationFrame(this.update.bind(this));
				};


			/**
				* Refreshes the pos of all parallax based elements.
				*
				* @since 14.0
				*/
				$(window).on('salient-parallax-el-recalculate', nectarParallaxElRefresh);
				function nectarParallaxElRefresh() {

					for( var i = 0; i < parallaxItemsArr.length; i++) {
						parallaxItemsArr[i].resize();
					}

					for( var i = 0; i < animateElArr.length; i++) {
						animateElArr[i].resize();
					}

					for( var i = 0; i < elParallaxArr.length; i++) {
						elParallaxArr[i].calculatePos();
					}

					for( var i = 0; i < cascadingParallaxArr.length; i++) {
						cascadingParallaxArr[i].calculatePos();
					}

					Waypoint.refreshAll();

				}


				/**
				* Animate css props based on scroll position.
				*
				* @since 14.1
				*/
				function NectarAnimate(el) {
					this.$el = el;

					this.animations = {};
					this.offsets = {};
					this.topLevel = false;

					this.timelines = {};

					this.devices = {
						desktop: { min: 1000, max: 10000000 },
						tablet: { min: 691, max: 999 },
						phone: { min: 0, max: 690 },
					}

					this.needsReset = true;
					this.activeDevice = 'desktop';
					this.storedWinH = nectarDOMInfo.winH;

					this.setupProps();
					this.lazyInit();

				}

				NectarAnimate.prototype.setupProps = function() {

					var attrs = JSON.parse(this.$el[0].getAttribute("data-nectar-animate-settings"));

					// animations.
					if( typeof Object.assign == 'function' ) {
						Object.assign(
							this.animations,
							attrs['animations']
						);

						// offsets
						Object.assign(
							this.offsets,
							attrs['offsets']
						);

						// config.
						Object.assign(
							this,
							attrs['config']
						);

					}

					if(this.$el.is('.top-level') ||
						this.$el.parents('.top-level').length > 0 ||
						nectarDOMInfo.usingFrontEndEditor && this.$el.parents('.vc_element').last().index() === 1 ) {
						this.topLevel = true;
					}

					// portfolio items.
					if ( $body.hasClass('single-portfolio') &&
							this.$el.parents('#portfolio-extra').length > 0 &&
							this.$el.parents('.first-section').length > 0 ) {
								this.topLevel = true;
					}


				};

				NectarAnimate.prototype.lazyInit = function() {

					var that = this;

					if( !nectarDOMInfo.usingFrontEndEditor && 'IntersectionObserver' in window && !this.$el.hasClass('skip-lazy-init') ) {
						var that = this;
						var observer = new IntersectionObserver(function(entries) {

							entries.forEach(function(entry){
								if (entry.isIntersecting) {
									that.init();
									observer.unobserve(entry.target);
								}
							});

						}, {
							root: (isSafari()) ? null : document,
							rootMargin: '400px 0px 400px 0px',
							threshold: 0
						});

						observer.observe(this.$el[0]);
					} else {
						this.init();
					}


				};

				NectarAnimate.prototype.init = function() {
					this.createTimeline();
					this.events();
					this.update();
				};

				NectarAnimate.prototype.events = function() {

					var that = this;

					$(window).on('resize load', this.resize.bind(this));

					window.addEventListener("orientationchange", function() {
						this.setTimeout(function(){
							that.orientationChange();
						}, 110);
					});

					this.resize();
				};

				NectarAnimate.prototype.resize = function() {

					if ( !nectarDOMInfo.usingMobileBrowser ) {
						this.storedWinH = nectarDOMInfo.winH;
					}

					var rect = this.$el[0].getBoundingClientRect();

					this.offsetTop = rect.top + nectarDOMInfo.scrollTop;
					this.elHeight = this.$el[0].offsetHeight;

					this.setActiveDevice();
				};

				NectarAnimate.prototype.orientationChange = function() {

					if ( nectarDOMInfo.usingMobileBrowser ) {
						var rect = this.$el[0].getBoundingClientRect();

						this.offsetTop = rect.top + nectarDOMInfo.scrollTop;
						this.elHeight = this.$el[0].offsetHeight;
						this.storedWinH = nectarDOMInfo.winH;
					}

				};

				NectarAnimate.prototype.setActiveDevice = function() {

					var that = this;
					Object.keys(this.devices).forEach(function(device){
						if ( nectarDOMInfo.winW >= that.devices[device].min &&
							nectarDOMInfo.winW <= that.devices[device].max ) {

							// Store device.
							that.activeDevice = device;

							if (typeof that.timelines[device] !== 'undefined') {
								that.timelines[device].reset();
							}

						}
					});

				};


				NectarAnimate.prototype.createTimeline = function() {

					// Device loop
					var that = this;
					Object.keys(this.devices).forEach(function(device){

						// Skip device if no animations set
						if (typeof that.animations[device] === 'undefined') {
							return;
						}

						// Create timeline
						that.timelines[device] = anime.timeline({ autoplay: false });

						// Gather all animation for timeline and starting state.
						var timelineAnimations = {};
						var initialAnimationState = {};

						Object.keys(that.animations[device]).forEach(function(animationKey){
								// Starting.
								initialAnimationState[animationKey] = that.animations[device][animationKey]['start'];

								// Ending.
								timelineAnimations[animationKey] = [that.animations[device][animationKey]['start'], that.animations[device][animationKey]['end']];
						});

						// Set initial position
						that.setActiveDevice();

						// Set Tineline.
						var elToAnimate = (typeof that.inner_selector !== 'undefined') ? that.$el[0].querySelectorAll(that.inner_selector) : that.$el[0];

						var timelineProps = {
							targets: elToAnimate,
							duration: 1000,
							easing: 'linear',
						};


						Object.assign(timelineProps, timelineAnimations);
						that.timelines[device].add(timelineProps, 0);

					}); // end device loop.


				};


				NectarAnimate.prototype.progressValues = function() {

					if ( typeof this.timelines[this.activeDevice] === 'undefined' ) {
						return;
					}

					var scrollTop = nectarDOMInfo.scrollTop;
					var winH = this.storedWinH;

					var triggerStart = parseInt(this.offsets.start)/100;
					var triggerStartPx = winH - (triggerStart * winH);
					if( this.offsets.origin === 'bottom') {
						triggerStartPx -= this.elHeight;
					}

					var viewportCalc = (scrollTop - (this.offsetTop - triggerStartPx)) / winH;

					if( this.offsets.start === '0' &&
							this.offsets.end === '100' ) {

							viewportCalc = (scrollTop - (this.offsetTop - triggerStartPx)) / (winH + this.elHeight);
					}

					if ( this.topLevel ) {
						triggerStartPx = 0;
						viewportCalc = scrollTop / winH;
					}

					var progress = Math.max(Math.min(viewportCalc, 1), 0);

					var triggerEnd = parseInt(this.offsets.end)/100;
					var progressMod = 2 + (-1 * triggerEnd);

					var triggerCloseness = triggerEnd - triggerStart - 0.01; // 0.01 cushion to never allow for 0

					if ( progressMod > 1) {
						progressMod = progressMod * (1/Math.min(triggerCloseness*2, 0.9));
					}

					// Scrub through timeline.
					if ( progress > 0 ) {
						this.needsReset = true;
						this.timelines[this.activeDevice].seek( this.timelines[this.activeDevice].duration * progress * progressMod);
					} else if (this.needsReset) {
						this.timelines[this.activeDevice].reset();
						this.needsReset = false;
					}

				};

				NectarAnimate.prototype.update = function() {

					if(nectarState.materialOffCanvasOpen != true &&
					   nectarState.ocmAnimating != true) {
						this.progressValues();
					}
					requestAnimationFrame(this.update.bind(this));

				}


				function nectarAnimateInit() {

					animateElArr = [];

					$('[data-nectar-animate-settings]').each(function() {
						animateElArr.push( new NectarAnimate($(this)));
					});
				}

				/**
				* Parallax scroll speed helper.
				*
				* @since 4.0
				*/
				function parallaxSrollSpeed(speedString) {

					var speed;
					switch (speedString) {
						case 'slow':
							speed = 0.6;
							break;
						case 'medium':
							speed = 0.4;
							break;
						case 'medium_fast':
							speed = 0.28;
							break;
						case 'fast':
							speed = 0.20;
							break;
						case 'mid_subtle':
							speed = 0.15;
							break;
						case 'subtle':
							speed = 0.13;
							break;
						case 'very_subtle':
							speed = 0.12;
							break;
						case 'minimum':
							speed = 0.09;
							break;
					}

					return speed;
				}


				/**
				* Parallax scroll initialization.
				*
				* @since 4.0
				*/
				function parallaxScrollInit() {

					if (nectarDOMInfo.usingMobileBrowser && $('body[data-remove-m-parallax="1"]').length > 0) {
						return;
					}

					// El parallax.
					elParallaxArr = [];

					$('.wpb_column[data-scroll-animation="true"], .nectar-el-parallax-scroll[data-scroll-animation="true"]').each(function(i){

						imagesLoaded($(this), function (instance) {

							// Parallax scrolling.
							if( $(instance.elements[0]).is('[data-scroll-animation="true"]') &&
									$('#nectar_fullscreen_rows').length == 0 &&
									$(instance.elements[0]).parents('.n-sticky').length === 0 &&
									$(instance.elements[0]).parents('.nectar-global-section-megamenu').length === 0 ) {
								elParallaxArr.push( new NectarScrollPosAnimations($(instance.elements[0])) );
							}

						});

					});

					// BG parallax.
					parallaxRowsBGCals();

					var parallaxItemCount = 0;

					$('.nectar-recent-posts-single_featured, [data-n-parallax-bg="true"], .wpb_row.parallax_section, #page-header-bg[data-parallax="1"] .page-header-bg-image-wrap, #page-header-bg[data-parallax="1"] .nectar-video-wrap, .parallax_slider_outer .nectar-slider-wrap').each(function() {


						// Generic.
						if( $(this).is('[data-n-parallax-bg][data-parallax-speed]') ) {
							parallaxItemsArr[parallaxItemCount] = new NectarParallaxScroll($(this), '.parallax-layer', parallaxSrollSpeed($(this).attr('data-parallax-speed')), 'regular');
							parallaxItemCount++;
						}
						else {

							if ( $(this).find('[data-parallax-speed="fixed"]').length == 0) {

								// Slider.
								if ( $(this).hasClass('nectar-slider-wrap') ) {
									parallaxItemsArr[parallaxItemCount] = new NectarParallaxScroll($(this), '.video-wrap, .image-bg', 0.25, 'nectar-slider');
								}
								// Page Header.
								else if( $(this).hasClass('page-header-bg-image-wrap') ) {
									parallaxItemsArr[parallaxItemCount] = new NectarParallaxScroll($(this), '.page-header-bg-image', 0.25, 'page-header');
								}
								else if( $(this).hasClass('nectar-video-wrap') && $(this).parents('#page-header-bg').length > 0 ) {
									parallaxItemsArr[parallaxItemCount] = new NectarParallaxScroll($(this), '.nectar-video-bg', 0.25, 'page-header');
								}
								// All Others.
								else {

									if ( $(this).find('.row-bg.using-image').length > 0 ) {
										parallaxItemsArr[parallaxItemCount] = new NectarParallaxScroll($(this), '.row-bg.using-image', parallaxSrollSpeed($(this).find('.row-bg').attr('data-parallax-speed')), 'regular');
									}

									if ( $(this).find('> .nectar-video-wrap').length > 0 ) {
										parallaxItemsArr[parallaxItemCount] = new NectarParallaxScroll($(this), '> .nectar-video-wrap .nectar-video-bg', parallaxSrollSpeed($(this).find('.row-bg').attr('data-parallax-speed')), 'regular');
									}
								}

								parallaxItemCount++;

							}

						}

						$(this).addClass('nectar-parallax-enabled');

					});

					$('.woocommerce-tabs .wc-tabs li').on('click', function(){
						setTimeout(parallaxRowsBGCals,100);
					});


				}



				/**
				* Parallax row background height calculations.
				*
				* @since 6.0
				*/
				$(window).on('salient-parallax-bg-recalculate', parallaxRowsBGCals );
				function parallaxRowsBGCals() {

					if (nectarDOMInfo.usingMobileBrowser && $('body[data-remove-m-parallax="1"]').length > 0) {
						return;
					}

					$('.nectar-recent-posts-single_featured, [data-n-parallax-bg="true"], .wpb_row.parallax_section, #page-header-bg[data-parallax="1"] .page-header-bg-image-wrap, .parallax_slider_outer .nectar-slider-wrap .slide-bg-wrap').each(function () {

						var $non_page_builder_slider;

						if( $(this).parents('.wpb_tab:not(.visible-tab)').length > 0 && $(this).parents('.nectar-scrolling-tabs').length == 0 ||
							$(this).parents('.wc-tab').length > 0 && $(this).parents('.wc-tab').css('display') !== 'block' ) {
								return true;
						}

						if ($(this).find('.row-bg').length == 0 &&
						    $(this).find('.page-header-bg-image').length > 0 ) {
							//skip processing.
						}
						else if ($(this).find('.row-bg').length == 0 &&
						         $(this).find('.image-bg').length > 0) {

							$non_page_builder_slider = false;

							// First nectar slider shortcode without page builder
							if ($('.wpb_row').length == 0 &&
									$(this).parents('.nectar-slider-wrap[data-full-width="true"]').length > 0 &&
									$(this).parents('.parallax_slider_outer').length > 0 &&
									$(this).parents('.parallax_slider_outer').index() == '1') {
										$non_page_builder_slider = true;
							}

							// Portfolio first
							if ($('#portfolio-extra').length > 0 &&
									$(this).parents('.wpb_row').length > 0 &&
									$(this).parents('.parallax_slider_outer').length > 0 &&
									$(this).parents('.wpb_row').index() == '0') {
								$non_page_builder_slider = true;
							}

							// Set heights.
							if ($(this).parents('.top-level').length > 0 && !nectarDOMInfo.usingFrontEndEditor ||
									$non_page_builder_slider && !nectarDOMInfo.usingFrontEndEditor) {
									$(this).find('.image-bg').css({
										'height': Math.ceil($(this).parent().offset().top * 0.25) + $(this).outerHeight(true)
									});
							} else {
								$(this).find('.image-bg').css({
									'height': Math.ceil($window.height() * 0.25) + $(this).outerHeight(true)
								});
							}

						}

						// Video backgrounds.
						if ($(this).find('.row-bg').length == 0 && $(this).find('.video-wrap').length > 0) {

							$non_page_builder_slider = false;
							// First nectar slider shortcode without page builder
							if ($('.wpb_row').length == 0 &&
							$(this).parents('.nectar-slider-wrap[data-full-width="true"]').length > 0 &&
							$(this).parents('.parallax_slider_outer').length > 0 &&
							$(this).parents('.parallax_slider_outer').index() == '1') {
								$non_page_builder_slider = true;
							}
							// Portfolio first
							if ($('#portfolio-extra').length > 0 &&
							$(this).parents('.wpb_row').length > 0 &&
							$(this).parents('.parallax_slider_outer').length > 0 &&
							$(this).parents('.wpb_row').index() == '0') {
								$non_page_builder_slider = true;
							}

							// Set heights.
							if ($(this).parents('.top-level').length > 0 && !nectarDOMInfo.usingFrontEndEditor ||
							$non_page_builder_slider && !nectarDOMInfo.usingFrontEndEditor) {

								$(this).find('.video-wrap').css({
									'height': Math.ceil($(this).parent().offset().top * 0.25) + $(this).outerHeight(true)
								});
							}

							else {
								$(this).find('.video-wrap').css({
									'height': Math.ceil(nectarDOMInfo.winH * 0.25) + $(this).outerHeight(true)
								});
							}

							var vid     = $(this).find('.video-wrap video'),
							vid_w_orig  = 1280,
							vid_h_orig  = 720;

							// Get the parent element size
							var container_w = vid.parent().width(),
							container_h     = vid.parent().height(),
							scale_w         = container_w / vid_w_orig,
							scale_h         = container_h / vid_h_orig;

							var scale       = scale_w > scale_h ? scale_w : scale_h;

							// Scale the video.
							vid.width(scale * vid_w_orig);
							vid.height(scale * vid_h_orig);

						}
						 else {

							// Top Level Special elements, Recent posts/ Simple Slider.
							if ($(this).is('.nectar-recent-posts-single_featured') &&
							    $(this).parents('.top-level').length > 0 &&
									!nectarDOMInfo.usingFrontEndEditor) {
								//skip processing.
							}
							else if ($(this).is('.nectar-simple-slider') &&
							    $(this).parents('.top-level').length > 0 &&
									!nectarDOMInfo.usingFrontEndEditor) {
								//skip processing.
							}
							else if($(this).is('.column-image-bg-wrap') &&
							  $(this).parents('.top-level').length > 0 &&
								$(this).parent().parent().is('.vc_col-sm-12:not(.child_column)')) {
								//skip processing.
							}
							// Regular.
							else if (!$(this).hasClass('top-level') || nectarDOMInfo.usingFrontEndEditor || $(this).find('.parallax-layer').length > 0) {

								var classSelector = '.row-bg, > .nectar-video-wrap .nectar-video-inner';
								var parallaxSpeed = $(this).find('.row-bg').attr('data-parallax-speed');

								if( $(this).find('.parallax-layer').length > 0 && !$(this).hasClass('wpb_row')) {
									classSelector =  '.parallax-layer';
									parallaxSpeed = $(this).attr('data-parallax-speed');
								}

								var $ifFast = ($(this).find(classSelector + '[data-parallax-speed="fast"]').length > 0) ? 60 : 0;

								if ( $(this).parents('#page-header-bg').length == 0 ) {
									$(this).find(classSelector).css({
										'height': Math.ceil(nectarDOMInfo.winH * parallaxSrollSpeed(parallaxSpeed) ) + $(this).outerHeight(true) + $ifFast
									});
								}


							}

						}

					});

				}


				/**
				* Class names added for specific full width section rows at top
				*
				* @since 3.0
				*/
				function fwsClasses() {

					$('.wpb_wrapper > .nectar-slider-wrap[data-full-width="true"]').each(function () {
						if (!$(this).parent().hasClass('span_9') && !$(this).parent().hasClass('span_3') && $(this).parent().attr('id') != 'sidebar-inner') {
							if ($(this).parents('.wpb_row').index() == '0') {
								$(this).addClass('first-nectar-slider');
							}
						}
					});

					var $contentElementsNum = ($('#portfolio-extra').length == 0) ? $('.main-content > .row > *').length : $('.main-content > .row #portfolio-extra > *').length;

					if ($('#portfolio-extra').length == 0) {
						$contentElementsNum = ($('.main-content > .row > .wpb_row').length > 0) ? $('.main-content > .row > .wpb_row').length : $('.main-content > .row > *').length;
					} else {
						$contentElementsNum = $('.main-content > .row #portfolio-extra > *').length;
					}

					$('.container-wrap .full-width-section, .container-wrap .full-width-content:not(.page-submenu .full-width-content):not(.blog-fullwidth-wrap), .row > .nectar-slider-wrap[data-full-width="true"], .wpb_wrapper > .nectar-slider-wrap[data-full-width="true"], .portfolio-items[data-col-num="elastic"]').each(function () {

						if( $(this).parents('.nectar-global-section.before-footer').length > 0 ||
								$(this).parents('[class*="nectar_hook_sidebar"]').length > 0 ) {
							return true;
						}


						if (!$(this).parent().hasClass('span_9') && !$(this).parent().hasClass('span_3') && $(this).parent().attr('id') != 'sidebar-inner') {

							if ($(this).parents('.wpb_row').length > 0) {

								var $parent = $(this).parent();
								var $parentRowIndex = $(this).parents('.wpb_row').index();

								if ($(this).parents('#portfolio-extra').length > 0 &&
									$('#full_width_portfolio').length == 0) {
									return false;
								}

								////first
								if ($parentRowIndex == '0' && $pageHeaderBG.length != 0) {
									//skip processing.
								}
								else if ($parentRowIndex == '0' &&
								$pageHeaderBG.length == 0 && $('.page-header-no-bg').length == 0 &&
								$('.project-title').length == 0 && $parentRowIndex == '0' &&
								$('.project-title').length == 0 && $('body[data-bg-header="true"]').length == 0) {

									if ($('.single').length == 0) {

										$('.container-wrap').css('padding-top', '0px');
									} else {
										$(this).addClass('first-section');
									}

								}

								// Check if it's also last (i.e. the only fws)
								if ($parentRowIndex == $contentElementsNum - 1 && $('#respond').length == 0) {
									if ($(this).attr('id') != 'portfolio-filters-inline') {
										$('.container-wrap').css('padding-bottom', '0px');
										$('#call-to-action .triangle').remove();
									}
								}

							} else {

								if ($(this).parents('#portfolio-extra').length > 0 && $('#full_width_portfolio').length == 0) {
									return false;
								}

								if ($(this).find('.portfolio-filters-inline').length == 0 && $(this).attr('id') != 'post-area') {

									////first
									if ($(this).index() == '0' && $pageHeaderBG.length != 0) {
										//skip processing.
									}
									else if ($(this).index() == '0' && $pageHeaderBG.length == 0 &&
													$(this).index() == '0' && $('.page-header-no-bg').length == 0 &&
													$(this).index() == '0' && !$(this).hasClass('blog_next_prev_buttons') &&
													$(this).parents('.nectar-global-section').length == 0 &&
													!$(this).hasClass('nectar-shop-outer') && $(this).parents('.pum-container').length == 0) {

											if ($('body[data-header-resize="0"]').length == 1 && $('.single').length == 0 || $('body.material').length > 0 && $('.single').length == 0) {

												if (!$('body.blog .blog-fullwidth-wrap > .masonry:not(.meta-overlaid)').length > 0) {
													$('.container-wrap').css('padding-top', '0px');
												}

											}

											else {
												$(this).addClass('first-section');
											}

									}

									//check if it's also last (i.e. the only fws)
									if ($(this).index() == $contentElementsNum - 1 && $('#respond').length == 0 && $('body.woocommerce-checkout').length == 0) {
										$('.container-wrap').css('padding-bottom', '0px');
										$('.bottom_controls').css('margin-top', '0px');
										$('#call-to-action .triangle').remove();
									}

								}
							}
						}

					});


					$('#portfolio-extra > .nectar-slider-wrap[data-full-width="true"], .portfolio-wrap').each(function () {
						//check if it's last
						if ($(this).index() == $contentElementsNum - 1 && $('#commentform').length == 0 && $('#pagination').length == 0) {
							if (parseInt($('.container-wrap').css('padding-bottom')) > 0) {
								$(this).css('margin-bottom', '-40px');
							}
							$('#call-to-action .triangle').remove();
						}
					});


					$('.portfolio-filters').each(function () {
						////first
						if ($(this).index() == '0' && $pageHeaderBG.length != 0 || $(this).index() == '0') {
							$(this).addClass('first-section nder-page-header');
						} else if ($(this).index() == '0' && $pageHeaderBG.length == 0 || $(this).index() == '0') {
							$(this).css({
								'margin-top': '0px'
							}).addClass('first-section');
						}
					});


					$('.portfolio-filters-inline').each(function () {
						////first
						if ($(this).parents('.wpb_row').length > 0) {
							//skip processing.
						} else {
							if ($(this).index() == '0' && $pageHeaderBG.length != 0 || $(this).index() == '0') {
								$(this).addClass('first-section nder-page-header');
							} else if ($(this).index() == '0' && $pageHeaderBG.length == 0 || $(this).index() == '0') {

								$(this).css({
									'margin-top': '-30px',
									'padding-top': '50px'
								}).addClass('first-section');

							}
						}

					});


				}





				/**
				* Full width row padding adjust calculations for boxed theme option.
				*
				* @since 11.0.4
				*/
				function fullWidthRowPaddingAdjustCalcBoxed() {

					if ($('#boxed').length > 0) {

						$('.full-width-section[data-top-percent], .full-width-section[data-bottom-percent], .full-width-content[data-top-percent], .full-width-content[data-bottom-percent]').each(function () {

							var $topPadding = ($(this).attr('data-top-percent')) ? $(this).attr('data-top-percent') : 'skip',
							$bottomPadding  = ($(this).attr('data-bottom-percent')) ? $(this).attr('data-bottom-percent') : 'skip';

							//top
							if ($topPadding != 'skip') {
								$(this).css('padding-top', $topPadding);
							}

							//bottom
							if ($bottomPadding != 'skip') {
								$(this).css('padding-bottom', $bottomPadding);
							}

						});
					}

				}




				/**
				* Full width content row auto equal height cols.
				*
				* @since 4.0
				*/
				function fullWidthContentColumns() {

					var $frontEndEditorElDiv = ($('body.vc_editor').length > 0) ? '.vc_element > ' : '';
					var usingFlexCols = $body.is('[data-flex-cols="true"]');

					$('.main-content > .row > ' + $frontEndEditorElDiv + ' .full-width-content, #portfolio-extra > ' + $frontEndEditorElDiv + ' .full-width-content, .woocommerce-tabs #tab-description > .full-width-content, .post-area.span_12 article .content-inner > .full-width-content').each(function () {

						// Only set the height if more than one column
						if ($(this).find('> .span_12 > ' + $frontEndEditorElDiv + ' .col').length > 1) {

							var tallestColumn       = 0;
							var $columnInnerHeight  = 0;
							var $column_inner_selector;

							// Gather tallest height.
							$(this).find('> .span_12 > ' + $frontEndEditorElDiv + '  .col').each(function () {

								$column_inner_selector = ($(this).find('> .vc_column-inner > .wpb_wrapper').length > 0) ? '.vc_column-inner' : '.column-inner-wrap > .column-inner';

								var $padding = ( usingFlexCols ) ? parseInt($(this).find('> .vc_column-inner').css('padding-top')) : parseInt($(this).css('padding-top'));
								var $frontEndEditorElPadding = ($frontEndEditorElDiv.length > 2 && $(this).find('> .vc_column-inner').length > 0) ? parseInt($(this).find('> .vc_column-inner').css('padding-top')) : 0;

								var colContentHeight = $(this).find('> ' + $column_inner_selector + ' > .wpb_wrapper').height();
								if( colContentHeight + ($padding * 2) + $frontEndEditorElPadding > tallestColumn ) {
									tallestColumn = colContentHeight + ($padding * 2) + $frontEndEditorElPadding;
								}

							});

							// Apply height to all columns within row.
							$(this).find('> .span_12 > ' + $frontEndEditorElDiv + ' .col').each(function () {

								$column_inner_selector = ($(this).find('> .vc_column-inner > .wpb_wrapper').length > 0) ? '.vc_column-inner' : '.column-inner-wrap > .column-inner';

								// Columns with content
								if ($(this).find('> ' + $column_inner_selector + ' > .wpb_wrapper > *').length > 0) {

									// Added in 7.6 to fix equal height columns
									if ($frontEndEditorElDiv.length < 2 && !$(this).parent().parent().hasClass('vc_row-o-equal-height')) {
										$(this).css('height', tallestColumn);

										if( usingFlexCols ) {
											$(this).find('> .vc_column-inner').css('height', tallestColumn);
										}

									} else if ($frontEndEditorElDiv.length > 2 && !$(this).parent().parent().parent().hasClass('vc_row-o-equal-height')) {

										$(this).css('height', tallestColumn);

										if( usingFlexCols ) {
											$(this).find('> .vc_column-inner').css('height', tallestColumn);
										}

									}
								}

								// Empty columns
								else {
									if ($(this).is('[data-using-bg="true"]') && $(this).parents('.vc_row-o-content-top').length == 0 ) {

										$(this).css('min-height', tallestColumn);

										if( $body.is('[data-flex-cols="true"]') ) {
											$(this).find('> .vc_column-inner').css('min-height', tallestColumn);
										}

										if ($(this).is('[data-animation*="reveal"]')) {
											$(this).find('.column-inner')
												.css('min-height', tallestColumn);
										}

									}
								}

							});

							// Nested column height
							if (nectarDOMInfo.winW < 1000) {
								$(this).find('> .span_12 > ' + $frontEndEditorElDiv + ' .col .wpb_row .col').css('min-height', '0px');
							}

							// Vertically center
							if ($(this).hasClass('vertically-align-columns') && nectarDOMInfo.winW > 1000 && !$(this).hasClass('vc_row-o-equal-height')) {

								// Parent columns
								$(this).find('> .span_12 > ' + $frontEndEditorElDiv + ' .col').each(function () {

									$column_inner_selector = ($(this).find('> .vc_column-inner > .wpb_wrapper').length > 0) ? '.vc_column-inner' : '.column-inner-wrap > .column-inner';

									$columnInnerHeight = $(this).find('> ' + $column_inner_selector + ' > .wpb_wrapper').height();

									var $marginCalc = ($(this).height() / 2) - ($columnInnerHeight / 2);

									if ($marginCalc <= 0) {
										$marginCalc = 0;
									}

									$(this).find('> ' + $column_inner_selector + ' > .wpb_wrapper')
										.css('margin-top', $marginCalc)
										.css('margin-bottom', $marginCalc);

								});


							}

						}

					});


					if( $('body[data-flex-cols="true"]').length == 0 ) {

						// Equal height columns in container type with reveal columns
						$('.main-content > .row > .wpb_row:not(.full-width-content).vc_row-o-equal-height').each(function () {
							if ($(this).find('>.span_12 > ' + $frontEndEditorElDiv + ' .wpb_column[data-animation*="reveal"]').length > 0) {

								var tallestColumn = 0;

								$(this).find('> .span_12 > ' + $frontEndEditorElDiv + ' .col').each(function () {

									var $padding = parseInt($(this).find('> .column-inner-wrap > .column-inner').css('padding-top'));

									if( $(this).find('> .column-inner-wrap > .column-inner').height() + ($padding * 2) > tallestColumn ) {
										tallestColumn = $(this).find('> .column-inner-wrap > .column-inner').height() + ($padding * 2);
									}

								});

								$(this).find('> .span_12 > ' + $frontEndEditorElDiv + ' .col').each(function () {

									// Columns with content
									if ($(this).find('> .column-inner-wrap > .column-inner .wpb_wrapper > *').length > 0) {
										$(this).find('> .column-inner-wrap').css('height', tallestColumn);
									}
									// Empty columns
									else {
										$(this).css('min-height', tallestColumn);
										if ($(this).is('[data-animation*="reveal"]')) {
											$(this).find('.column-inner').css('min-height', tallestColumn);
										}
									}
								});

							}
						});

						// Using equal height option, top/bottom padding % needs to be convered into px for cross browser (flex bug)
						$('.wpb_row.vc_row-o-equal-height>.span_12> ' + $frontEndEditorElDiv + '.wpb_column[class*="padding-"][data-padding-pos="all"]').each(function () {
							if ($(this).parents('.tabbed').length == 0) {
								$(this).css({
									'padding-top': $(this).css('padding-left'),
									'padding-bottom': $(this).css('padding-left')
								});
							}
						});

					} // endif; Not using modern grid system.

				}




				/**
				* Mouse parallax row option.
				*
				* @since 4.0
				*/
				function mouseParallaxInit() {

					$('.wpb_row:has(.nectar-parallax-scene)').each(function (i) {

						var $strength = parseInt($(this).find('.nectar-parallax-scene').attr('data-scene-strength'));

						$mouseParallaxScenes[i] = $(this).find('.nectar-parallax-scene').parallax({
							scalarX: $strength,
							scalarY: $strength
						});

						// Wait until the images in the scene have loaded.
						var images = $(this).find('.nectar-parallax-scene li');

						$.each(images, function () {
							if ($(this).find('div').length > 0) {
								var el = $(this).find('div'),
								image = el.css('background-image').replace(/"/g, '').replace(/url\(|\)$/ig, '');
								if (image && image !== '' && image !== 'none') {
									images = images.add($('<img>').attr('src', image));
								}
							}
						});

					});

				}




				/**
				* Add checkmark icons to unorder list with checkmark class.
				*
				* @since 2.0
				*/
				function ulCheckmarks() {
					$('ul.checks li').each(function () {
						if ($(this).find('i.fa-check-circle').length == 0) {
							$(this).prepend('<i class="fa fa-check-circle"></i>');
						}
					});
				}



				/**
				* Allow CTA element BG color to also act as a link.
				*
				* @since 11.0
				*/
				function ctaLinkBG() {

					$body.on('click','.nectar-cta:not([data-style="material"]) .link_wrap', function(e) {

						if( $(this).parents('[data-using-bg="true"]').length > 0 ||
							$(this).parents('[class*="border_thickness"]').length > 0 ) {

							if( !$(e.target).is('a') && $(e.target).parents('a').length == 0 ) {
								$(this).find('a.link_text')[0].click();
							}

						}
					});

				}



				/**
				* Add CSS default animation classes through JS to
				* avoid inital animation on page load.
				*
				* @since 11.0
				*/
				function nectarKeyframeAssist() {

					$('.nectar-cta[data-style="arrow-animation"]').addClass('loaded');

				}




				/**
				* Page builder row background layer animations.
				*
				* @since 9.0
				* @see waypoints
				*/
				function rowBGAnimations() {

					var $rowBGAnimationsOffsetPos = ($fullscreenMarkupBool == true) ? '500%' : '93%';
					var $rowBGAnimationsRevealOffsetPos = ($fullscreenMarkupBool == true) ? '500%' : '95%';
					var $rowBGOffset;

					$($fullscreenSelector + '.row-bg-wrap[data-bg-animation]:not([data-bg-animation="none"]) .row-bg').each(function () {


						var $animation = $(this).parents('.row-bg-wrap').attr('data-bg-animation');
						var $animation_delay = ($(this).parents('.row-bg-wrap[data-bg-animation-delay]').length > 0) ? $(this).parents('.row-bg-wrap').attr('data-bg-animation-delay') : 0;

						if( $animation != 'zoom-out-reveal' &&
						    $animation.indexOf('reveal-from-') == -1  ) {
							$rowBGOffset = $rowBGAnimationsOffsetPos;
						} else {
							$rowBGOffset = $rowBGAnimationsRevealOffsetPos;
						}


						var $that = $(this);
						var waypoint = new Waypoint({
							element: $that.parents('.row-bg-wrap')[0],
							handler: function () {

								if ($that.parents('.wpb_tab').length > 0 && $that.parents('.wpb_tab').css('visibility') == 'hidden' || $that.hasClass('animated-in')) {
									waypoint.destroy();
									return;
								}

								setTimeout(function(){

									$that.parents('.inner-wrap').addClass('animated-in');

									if( $animation == 'zoom-out-reveal' || $animation.indexOf('reveal-from-') > -1 || $that.parents('.nectar-scrolling-text').length > 0 ) {
										$that.parents('.row-bg-wrap').addClass('animated-in');
									}

									if( $animation == 'clip-path' ) {
										$that.parents('.wpb_row ').addClass('animated-in');
									}

								},$animation_delay);


								waypoint.destroy();
							},
							offset: $rowBGOffset
						});

					});

				}


				/**
				* Page builder column background layer animations.
				*
				* @since 9.0
				* @see waypoints
				*/
				function columnBGAnimations() {

					var $colBGAnimationsOffsetPos = ($fullscreenMarkupBool == true) ? '500%' : '93%';
					var $colBGAnimationsRevealOffsetPos = ($fullscreenMarkupBool == true) ? '500%' : '80%';
					var $colBGOffset;

					$($fullscreenSelector + '.column-image-bg-wrap[data-bg-animation]:not([data-bg-animation="none"]) .column-image-bg').each(function () {

						var $animation = $(this).parents('.column-image-bg-wrap').attr('data-bg-animation');

						if( $animation != 'zoom-out-reveal' && $animation.indexOf('reveal-from-') == -1 ) {
							$colBGOffset = $colBGAnimationsOffsetPos;
						} else {

							if( $animation == 'ro-reveal-from-bottom' && $fullscreenMarkupBool == false ) {
								$colBGOffset = '95%';
							} else if( $animation == 'ro-reveal-from-top' && $fullscreenMarkupBool == false ) {
								$colBGOffset = '65%';
							} else {
								$colBGOffset = $colBGAnimationsRevealOffsetPos;
							}
						}

						var $that = $(this);

						var waypoint = new Waypoint({
							element: $that.parents('.column-image-bg-wrap')[0],
							handler: function () {

								if ($that.parents('.wpb_tab').length > 0 && $that.parents('.wpb_tab').css('visibility') == 'hidden' || $that.hasClass('animated-in')) {
									waypoint.destroy();
									return;
								}

								$that.parents('.inner-wrap').addClass('animated-in');
								if( $animation == 'zoom-out-reveal' || $animation.indexOf('reveal-from-') > -1 ) {
									$that.parents('.column-image-bg-wrap').addClass('animated-in');
									$that.parents('.column-image-bg-wrap').siblings('.column-bg-overlay-wrap').addClass('animated-in');
									$that.parents('.vc_column-inner').addClass('revealed-bg');
								}

								if( $animation == 'mask-reveal') {
									$that.parents('.vc_column-inner').find('.column-bg-layer').addClass('animated-in');
								}
								waypoint.destroy();
							},
							offset: $colBGOffset
						});

					});

					// Zoom out reveal with BG color only
					$($fullscreenSelector + '.column-bg-overlay-wrap[data-bg-animation]').each(function () {

						$colBGOffset = $colBGAnimationsRevealOffsetPos;

						var $that = $(this);
						var $animation = $(this).attr('data-bg-animation');

						if( $animation == 'zoom-out-reveal' || $animation == 'mask-reveal' || $animation.indexOf('reveal-from-') > 0 ) {

							if( $that.parent().find('.column-image-bg-wrap').length == 0 ) {

								var waypoint = new Waypoint({
									element: $that[0],
									handler: function () {

										if ( $that.hasClass('animated-in') ) {
											waypoint.destroy();
											return;
										}

										$that.addClass('animated-in');
										$that.parents('.vc_column-inner').addClass('revealed-bg');
										waypoint.destroy();

									},
									offset: $colBGOffset
								});

							}

						}

					});

				}



				/**
				* Page builder column and image animations.
				*
				* @since 4.0
				* @see waypoints
				*/
				function colAndImgAnimations() {

					var $colAndImgOffsetPos       = ($fullscreenMarkupBool == true) ? '500%' : '88%';
					var $cascadingOffsetPos       = ($fullscreenMarkupBool == true) ? '500%' : '70%';
					var $colAndImgRevealOffsetPos = ($fullscreenMarkupBool == true) ? '500%' : '70%';

					$($fullscreenSelector + '.img-with-animation').each(function (i) {

						var $that = $(this);

						var $animationType = ($that.is('[data-animation]')) ? $that.attr('data-animation') : 'fade-in';

						// reveal images alters offset
						if( $animationType == 'ro-reveal-from-right' && $colAndImgOffsetPos == '88%' ||
						$animationType == 'ro-reveal-from-left' && $colAndImgOffsetPos == '88%' ) {
							$colAndImgOffsetPos = '75%';
						}

						// Slide up alters offset
						if( $animationType == 'slide-up' && $colAndImgOffsetPos == '88%' ) {
							$colAndImgOffsetPos = '99%';
						}

						// Custom easing.
						var imgAnimationEasing = $animationEasing;
						if( $(this)[0].hasAttribute('data-animation-easing') ) {
							imgAnimationEasing = $(this).attr('data-animation-easing');
						}

						var opacityDuration = parseInt($animationDuration);
						if($that.parents('.row_position_absolute').length > 0 || $that.hasClass('position_desktop_absolute')) {
							opacityDuration = 500;
						}


						// initiate waypoint.
						var waypoint = new Waypoint({
							element: $that[0],
							handler: function () {

								if ($that.parents('.wpb_tab').length > 0 && $that.parents('.wpb_tab').css('visibility') == 'hidden' || $that.hasClass('animated-in')) {
									waypoint.destroy();
									return;
								}


								if (!bypassAnimations || $('body[data-responsive="0"]').length > 0) {

									var $delay       = ($that.is('[data-delay]')) ? $that.attr('data-delay') : 0;
									var $elToAnimate = ($that.parents('.hover-wrap').length > 0) ? $that.parents('.hover-wrap') : $that;

									// Image animation disabled on mobile.
									// Prevent timeline from running for time until interactive
									var imgAnimationDur = $animationDuration;
									if($that.parents('.nectar-disable-mobile-animation').length > 0 && nectarDOMInfo.winW < 1000) {
										imgAnimationDur = 0;
										opacityDuration = 0;
										$delay = 0;
									}

									if ($animationType == 'fade-in-from-left' || $animationType == 'fade-in-from-right') {

										$elToAnimate.delay($delay).transition({
											'opacity': 1,
											'x': '0px'
										}, imgAnimationDur, imgAnimationEasing);

									} else if ($animationType == 'fade-in-from-bottom') {

										animeAnimations.push(anime({
											targets: $elToAnimate[0],
											translateY: [100, 0],
											translateZ: 0,
											opacity: {
												value: [0,1],
												duration: opacityDuration,
											},
											delay: $delay,
											easing: imgAnimationEasing,
											duration: imgAnimationDur
										}));


									} else if ($animationType == 'slide-up') {

										animeAnimations.push(anime({
											targets: $elToAnimate[0],
											translateY: [150, 0],
											translateZ: 0,
											delay: $delay,
											easing: imgAnimationEasing,
											duration: imgAnimationDur
										}));

									}
									else if ($animationType == 'fade-in') {

										$elToAnimate.delay($delay).transition({
											'opacity': 1
										}, imgAnimationDur, imgAnimationEasing);

									} else if ($animationType == 'grow-in') {

										setTimeout(function () {
											$elToAnimate.transition({
												scale: 1,
												'opacity': 1
											}, imgAnimationDur, imgAnimationEasing);
										}, $delay);

									} else if ($animationType == 'flip-in') {

										setTimeout(function () {
											$elToAnimate.transition({
												rotateY: 0,
												'opacity': 1
											}, imgAnimationDur, imgAnimationEasing);
										}, $delay);

									} else if ($animationType == 'flip-in-vertical') {

										setTimeout(function () {
											$elToAnimate.transition({
												rotateX: 0,
												'opacity': 1
											}, imgAnimationDur, imgAnimationEasing);
										}, $delay);

									}
									else if ($animationType == 'ro-reveal-from-left' ||
									$animationType == 'ro-reveal-from-right' ||
									$animationType == 'ro-reveal-from-bottom' ||
									$animationType == 'ro-reveal-from-top') {
										$that.parents('.img-with-aniamtion-wrap').addClass('animated-in');
									}

									if($animationType != 'none') {
										$that.addClass('animated-in');
									}


								}

								waypoint.destroy();

							},
							offset: $colAndImgOffsetPos
						});



					});


					$($fullscreenSelector + '.nectar_cascading_images').each(function () {

						var $that           = $(this);
						var $animationDelay = ($(this).is('[data-animation-timing]')) ? $(this).attr('data-animation-timing') : 175;
						$animationDelay     = parseInt($animationDelay);

						var waypoint = new Waypoint({
							element: $that[0],
							handler: function () {

								if ($that.parents('.wpb_tab').length > 0 && $that.parents('.wpb_tab').css('visibility') == 'hidden' || $that.hasClass('animated-in')) {
									waypoint.destroy();
									return;
								}

								if (!bypassAnimations || $('body[data-responsive="0"]').length > 0) {

									$that.find('.cascading-image').each(function (i) {

										var $that2 = $(this);

										if ($that2.attr('data-animation') == 'flip-in' || $that2.attr('data-animation') == 'flip-in-vertical') {
											setTimeout(function () {
												$that2.find('.inner-wrap').css({
													'opacity': 1,
													'transform': 'rotate(0deg) translateZ(0px)'
												});
											}, i * $animationDelay);
										} else if( $that2.attr('data-animation') == 'grow-in-reveal' ) {
											setTimeout(function () {
												$that2.find('.inner-wrap').css({
													'opacity': 1,
													'transform': 'translateX(0px) translateY(0px) scale(1,1) translateZ(0px)'
												});
												$that2.find('.inner-wrap img').css({
													'transform': 'translateX(0px) translateY(0px) scale(1,1) translateZ(0px)'
												});
											}, i * $animationDelay);
										}
										else {
											setTimeout(function () {
												$that2.find('.inner-wrap').css({
													'opacity': 1,
													'transform': 'translateX(0px) translateY(0px) scale(1,1) translateZ(0px)'
												});
											}, i * $animationDelay);
										}


									});

									$that.addClass('animated-in');

								}

								waypoint.destroy();

							},
							offset: $cascadingOffsetPos
						});

					});


					$($fullscreenSelector + '.col.has-animation:not([data-animation*="reveal"]), ' + $fullscreenSelector + '.wpb_column.has-animation:not([data-animation*="reveal"]), ' + $fullscreenSelector + '.nectar-fancy-box.has-animation').each(function (i) {

						// delayJS
						if (delayJS && $(this).parents('.top-level').length > 0 && $nectarFullPage.$usingFullScreenRows !== true  ) {
							return true;
						}

						var $that = $(this);

						// custom offset.
						var colAnimationOffset = $colAndImgOffsetPos;

						if( $(this)[0].hasAttribute('data-animation-offset') ) {
							colAnimationOffset = parseInt($(this).attr('data-animation-offset')) + '%';
						}

						// Custom easing.
						var colAnimationEasing = $animationEasing;
						if( $(this)[0].hasAttribute('data-animation-easing') ) {
							colAnimationEasing = $(this).attr('data-animation-easing');
						}


						var opacityDuration = parseInt($animationDuration);
						if($that.parents('.row_position_absolute').length > 0) {
							opacityDuration = 500;
						}


						var waypoint = new Waypoint({
							element: $that[0],
							handler: function () {

								if ($that.parents('.wpb_tab').length > 0 && $that.parents('.wpb_tab').css('visibility') == 'hidden' || $that.hasClass('animated-in')) {
									waypoint.destroy();
									return;
								}

								if (!bypassAnimations || $('body[data-responsive="0"]').length > 0) {

									$that.addClass('triggered-animation');
									$(window).trigger('nectar-column-animation-start');

									var $delay = $that.attr('data-delay');

									// Image animation disabled on mobile.
									// Prevent timeline from running for time until interactive
									var colAnimationDur = $animationDuration;
									if($that.hasClass('mobile-disable-entrance-animation') && nectarDOMInfo.winW < 1000) {
										colAnimationDur = 0;
										opacityDuration = 0;
										$delay = 0;
									}

									if ($that.attr('data-animation') == 'fade-in-from-left' || $that.attr('data-animation') == 'fade-in-from-right') {

										$standAnimatedColTimeout[i] = setTimeout(function () {
											$that.transition({
												'opacity': 1,
												'x': '0px'
											}, colAnimationDur, colAnimationEasing);
										}, $delay);

									} else if ($that.attr('data-animation') == 'fade-in-from-bottom' ||
											  $that.attr('data-animation') == 'slight-fade-in-from-bottom') {

										var transY = ( $that.attr('data-animation') == 'fade-in-from-bottom' ) ? 100 : 50;

										animeAnimations.push(anime({
											targets: $that[0],
											translateY: [transY, 0],
											translateZ: 0,
											opacity: {
												value: [0,1],
												duration: opacityDuration,
											},
											delay: $delay,
											easing: colAnimationEasing,
											duration: colAnimationDur
										}));


									} else if ($that.attr('data-animation') == 'fade-in') {

										$standAnimatedColTimeout[i] = setTimeout(function () {
											$that.transition({
												'opacity': 1
											}, colAnimationDur, colAnimationEasing);
										}, $delay);

									} else if ($that.attr('data-animation') == 'grow-in' || $that.attr('data-animation') == 'zoom-out') {

										$standAnimatedColTimeout[i] = setTimeout(function () {
											$that.transition({
												scale: 1,
												'opacity': 1
											}, colAnimationDur, colAnimationEasing);
										}, $delay);

									} else if ($that.attr('data-animation') == 'flip-in') {

										$standAnimatedColTimeout[i] = setTimeout(function () {
											$that.transition({
												rotateY: '0',
												'opacity': 1
											}, colAnimationDur, colAnimationEasing);
										}, $delay);

									} else if ($that.attr('data-animation') == 'flip-in-vertical') {

										$standAnimatedColTimeout[i] = setTimeout(function () {
											$that.transition({
												rotateX: '0',
												y: '0',
												'opacity': 1
											}, colAnimationDur, colAnimationEasing);
										}, $delay);

									} else if ($that.attr('data-animation') == 'slight-twist') {

										$standAnimatedColTimeout[i] = setTimeout(function () {
											animeAnimations.push(anime({
												targets: $that[0],
												rotateY: [20, 0],
												rotateZ: [-4, 0],
												opacity: 1,
												easing: colAnimationEasing,
												duration: colAnimationDur
											}));
										}, $delay);

									}

									//boxed column hover fix
									if ($that.hasClass('boxed')) {
										$that.addClass('no-pointer-events');
										setTimeout(function () {
											$that.removeClass('no-pointer-events');
										}, parseInt($animationDuration) + parseInt($delay) + 30);
									}

									if ($that.find('.nectar-post-grid-wrap[data-style="mouse_follow_image"]')) {
										setTimeout(function() {
											$that[0].style.transform = 'none';
										}, parseInt($animationDuration) + parseInt($delay) + 30 );
									}


									$that.addClass('animated-in');

								}

								waypoint.destroy();
							},
							offset: colAnimationOffset
						});

					});


					$($fullscreenSelector + '.wpb_column.has-animation[data-animation*="reveal"]').each(function () {

						// Custom easing.
						var colAnimationEasing = $animationEasing;
						if( $(this)[0].hasAttribute('data-animation-easing') ) {
							colAnimationEasing = $(this).attr('data-animation-easing');
						}

						var revealOffsetAmt = ($(this).is('[data-animation="mask-reveal"]')) ? '88%' : $colAndImgRevealOffsetPos;

						// Custom offset.
						if( $(this)[0].hasAttribute('data-animation-offset') ) {
							revealOffsetAmt = parseInt($(this).attr('data-animation-offset')) + '%';
						}

						var $that = $(this),
						waypoint 	= new Waypoint({
							element: $that[0],
							handler: function () {

								if ($that.parents('.wpb_tab').length > 0 && $that.parents('.wpb_tab').css('visibility') == 'hidden' || $that.hasClass('animated-in')) {
									waypoint.destroy();
									return;
								}

								var $delay = $that.attr('data-delay');

								if (!bypassAnimations || $('body[data-responsive="0"]').length > 0) {

									var $columnInnerSelector = ( $that.find('> .vc_column-inner').length > 0 ) ? true : false;

									if ($that.attr('data-animation') == 'reveal-from-bottom' || $that.attr('data-animation') == 'reveal-from-top') {

										setTimeout(function () {

											if( $columnInnerSelector == true ) {

												// Modern.
												$that.find('> .vc_column-inner').transition({
													'y': 0
												}, $animationDuration, colAnimationEasing );

											} else {

												// Legacy.
												$that.find('.column-inner-wrap, .column-inner').transition({
													'y': 0
												}, $animationDuration, colAnimationEasing, function () {
													$that.find('.column-inner-wrap, .column-inner').addClass('no-transform');
												});
											}

											$that.addClass('animated-in');

										}, $delay);

									} else if ($that.attr('data-animation') == 'reveal-from-right' || $that.attr('data-animation') == 'reveal-from-left') {
										setTimeout(function () {

											if( $columnInnerSelector == true ) {

												// Modern.
												$that.find('> .vc_column-inner').transition({
													'x': 0
												}, $animationDuration, colAnimationEasing);


											} else {
												// Legacy.
												$that.find('.column-inner-wrap, .column-inner').transition({
													'x': 0
												}, $animationDuration, colAnimationEasing, function () {
													$that.find('.column-inner-wrap, .column-inner').addClass('no-transform');
												});

											}

											$that.addClass('animated-in');

										}, $delay);
									}

									setTimeout(function () {
										$that.addClass('animated-in');
									}, $delay);

								}

								waypoint.destroy();
							},
							offset: revealOffsetAmt
						});

					});

				}



				/**
				* Cascading images element sizing
				*
				* @since 6.0
				*/
				function cascadingImageBGSizing() {

					$('.nectar_cascading_images').each(function () {

						var forcedAspect = ( $(this).hasClass('forced-aspect') ) ? true : false;

						//handle max width for cascading images in equal height columns
						if ($(this).parents('.vc_row-o-equal-height').length > 0 && $(this).parents('.wpb_column').length > 0) {
							$(this).css('max-width', $(this).parents('.wpb_column').width());
						}

						//set size for layers with no images
						$(this).find('.bg-color').each(function () {

							if( forcedAspect == true && $(this).parents('.cascading-image').index() == 0 ) {
								return true;
							}

							var $bgColorHeight  = 0;
							var $bgColorWidth   = 0;

							if ($(this).parent().find('.img-wrap').length == 0) {

								var $firstSibling = $(this).parents('.cascading-image').siblings('.cascading-image[data-has-img="true"]').first();

								$bgColorHeight 	= $firstSibling.find('.img-wrap').height();
								$bgColorWidth 	= $firstSibling.find('.img-wrap').width();

							} else {
								$bgColorHeight 	= $(this).parent().find('.img-wrap').height();
								$bgColorWidth 	= $(this).parent().find('.img-wrap').width();
							}

							$(this).css({
								'height': $bgColorHeight,
								'width': $bgColorWidth
							}).addClass('calculated');

						});

					});

				}




				/**
				* Cascading images element initialization.
				*
				* @since 10.5
				*/
				function cascadingImageInit() {

					if ($('.nectar_cascading_images').length > 0) {

						cascadingParallaxArr = [];

						$('.nectar_cascading_images').each(function(i){

							imagesLoaded($(this), function (instance) {

								// Create sizes.
								cascadingImageBGSizing();

								// Parallax scrolling.
								if( $(instance.elements[0]).is('[data-parallax="yes"]') && !bypassAnimations && $('#nectar_fullscreen_rows').length == 0 ) {
									cascadingParallaxArr[i] = new CascadingParallax($(instance.elements[0]), $(instance.elements[0]).attr('data-parallax-intensity'));
								}

							});

						});

						// BG Sizing Resize.
						$window.on('resize', cascadingImageBGSizing);

					}

				}




				function CascadingParallax(el, intensity) {

					this.$element  = el;
					this.inView    = false;
					this.topLevel  = false;
					this.lastY     = 0;

					this.layer1Parallax = ( this.$element.is('[data-layer-1-parallax="yes"]') ) ? true : false;

					switch(intensity) {
						case 'subtle':
							this.intensity = 0.09;
							break;
						case 'medium':
							this.intensity = 0.15;
							break;
						case 'high':
							this.intensity = 0.25;
							break;
					}
					this.calculatePos();
					this.trackView();
					this.animate();

					if( $('.portfolio-filters').length > 0 ||
					$('.portfolio-filters-inline').length > 0 ) {
						setInterval(this.calculatePos.bind(this),700);
					}


					if ( nectarDOMInfo.usingMobileBrowser ) {
						const mediaQuery = window.matchMedia('(orientation: portrait)');
            mediaQuery.addEventListener('change', this.calculatePos.bind(this));
					} else {
						$window.on('resize', this.calculatePos.bind(this));
					}
				}

				CascadingParallax.prototype.calculatePos = function() {

					if( nectarState.materialOffCanvasOpen != true &&
						nectarState.ocmAnimating != true ) {
						this.offsetTop  = this.$element.offset().top;
						this.height     = this.$element.outerHeight();
						this.vertCenter = nectarDOMInfo.winH/2 - this.height/2;
					}
				};

				CascadingParallax.prototype.trackView = function() {

					var that = this;

					if( this.$element.parents('.top-level').length > 0 ) {
						this.topLevel = true;
					}

					if( 'IntersectionObserver' in window ) {

						var options = {
							root: (isSafari()) ? null : document,
							rootMargin: '250px',
						}
						var observer = new IntersectionObserver(function(entries) {

							entries.forEach(function(entry){
								var isIntersecting = entry.isIntersecting;

								if (isIntersecting) {
									that.inView = true;
								} else {
									that.inView = false;
								}
							});

						}, options);

						observer.observe(this.$element[0]);

					}

				};

				CascadingParallax.prototype.animate = function() {

					if( nectarState.materialOffCanvasOpen == true ) {
						window.requestAnimationFrame(this.animate.bind(this));
						return;
					}

					if( nectarState.animatedScrolling == true ) {
						this.inView = true;
					}

					this.lastY = linearInterpolate(this.lastY, nectarDOMInfo.scrollTop, 0.2);

					if( this.inView ) {

						var that = this;

						this.$element.find('.bg-layer').each(function(i) {

							var $scale = $(this).data('scale');

							if( that.layer1Parallax ) {
								i = (i/1.5)+1;
							}

							if( that.topLevel === true && nectarDOMInfo.winW > 1000) {
								$(this)[0].style.transform = 'translateY(' + -(that.lastY * that.intensity * i) + 'px) translateZ(0) scale(' + $scale + ')';
							} else {
								$(this)[0].style.transform = 'translateY(' + -((that.lastY - that.offsetTop + that.vertCenter ) * that.intensity * i ) + 'px) translateZ(0) scale(' + $scale + ')';
							}

						});
					}

					window.requestAnimationFrame(this.animate.bind(this));
				};




				/**
				* Split line heading element initialization.
				*
				* @since 10.5
				* @see waypoints
				*/
				function splitLineHeadings() {

					// Create waypoint.
					$($fullscreenSelector + '.nectar-split-heading:not(.custom-trigger)').each(function (i) {

						var $splitLineOffsetPos = ($fullscreenMarkupBool == true) ? '500%' : 'bottom-in-view';

						if( $(this)[0].hasAttribute('data-animation-offset') && $fullscreenMarkupBool != true ) {
							if( $(this).attr('data-animation-offset').length > 0 ) {
								$splitLineOffsetPos = parseInt($(this).attr('data-animation-offset')) + '%';
							}
						}


						var $that  = $(this);
						var $delay = ( $that.is('[data-animation-delay]') ) ? parseInt($that.attr('data-animation-delay')) : 0;

						var waypoint = new Waypoint({
							element: $that[0],
							handler: function () {

								if ($that.parents('.wpb_tab').length > 0 && $that.parents('.wpb_tab').css('visibility') == 'hidden' || $that.hasClass('animated-in')) {
									waypoint.destroy();
									return;
								}

								if (!bypassAnimations || $('body[data-responsive="0"]').length > 0) {

									var $animationDurationCap;

									setTimeout(function() {

										if( $that.is('[data-animation-type="line-reveal-by-space"]:not([data-text-effect*="letter-reveal"])') ) {

											var stagger = 0;
											if( $that.is('[data-stagger="true"]') ) {
												stagger = 500 / $that.find('> * > span').length;
												stagger = Math.min(Math.max(stagger, 15), 50); // Clamp val
											}

											$animationDurationCap = (parseInt($animationDuration) < 1100) ? $animationDuration : '1100';

											if( $that.is('[data-m-rm-animation="true"]') && nectarDOMInfo.winW < 1000 ) {
												$that.find('> * > span .inner').css({
													'transform' : 'translateY(0)',
													'opacity' : '1'
												});
											}
											else {
												$that.find('> * > span').each(function (i) {

													if( stagger == 0 ) {
														$(this).find('> .inner').delay(i * stagger).transition({
															'y': '0px',
															'opacity' : '1'
														}, $animationDurationCap, $animationEasing);
													}
													else {
														var spanEl = $(this);
														var $innerEl = spanEl.find('> .inner');
														setTimeout(function(){
															$innerEl[0].style.transform = 'translateY(0em)';
															$innerEl[0].style.opacity = '1';
														}, i * stagger);

													}

												});
											}

										}

										else if( $that.is('[data-animation-type="line-reveal-by-space"][data-text-effect*="letter-reveal"]') ) {

											$animationDurationCap = (parseInt($animationDuration) < 1000) ? $animationDuration : '1000';

											var stagger = 0;

                      var spans = $that.find('> * > span span');

                      var animationArr = ($that.is('[data-text-effect="letter-reveal-top"]')) ? ['-1.3em','0em'] : ['1.3em','0em'];

											stagger = 400 / spans.length;
											stagger = Math.min(Math.max(stagger, 20), 35); // Clamp val

											if( spans.length > 0 ) {
												animeAnimations.push(anime({
													targets: $that.find('> * > span span').toArray(),
													translateY: animationArr,
													delay: anime.stagger(stagger),
													duration: 1200,
													easing: 'cubicBezier(0.25,1,0.5,1)'
												}));
											}


										}

                    else {
											$that.find('.heading-line').each(function (i) {

												$(this).find('> div').delay(i * 70).transition({
													'y': '0px'
												}, $animationDuration, $animationEasing);

											});
										}

										$that.addClass('animated-in');

									}, $delay);

								}

								waypoint.destroy();
							},
							offset: $splitLineOffsetPos
						});

					});


					// Scroll based timeline animations.
					$($fullscreenSelector + '.nectar-split-heading.scroll-timeline').each(function (i) {

						if( $nectarFullPage.$usingFullScreenRows === true ) {

							var $that = $(this);

							var waypoint = new Waypoint({
								element: $that[0],
								handler: function () {

									if ($that.parents('.wpb_tab').length > 0 &&
											$that.parents('.wpb_tab').css('visibility') == 'hidden' ||
											$that.hasClass('animated-in')) {

											waypoint.destroy();
											return;
									}

									if (!bypassAnimations || $('body[data-responsive="0"]').length > 0) {

										$that.find('.inner').each(function(index){

											var $this = $(this);
											setTimeout(function(){
												$this.css({
													'opacity' : '1'
												});
											}, index * 30);
										});
									}
								},
								offset: '500%'
							});

						} else {
							new NectarSplitHeadingTimeline($(this));
						}

					});
				}

				function NectarSplitHeadingTimeline(el) {

					this.$el = el;
					this.inView = false;
					this.timeline = null;
					this.duration = 450;
					this.speed = 1.9;
					this.wordDelay = 150;
					this.topLevel = false;
					this.topCushion = (nectarDOMInfo.winH * 0.05);
					this.mergedGroup = false;

					if ( this.$el.parents('.wpb_row.nectar-split-heading-merged').length > 0 ) {
						// exit as the timeline is already being handled.
						return;
					}

					this.mergeNeighbors();
					this.trackInView();
					this.createTimeline();
					this.events();
					this.raf();
				}

				NectarSplitHeadingTimeline.prototype.mergeNeighbors = function() {
					var $parentRow = this.$el.closest('.wpb_row');
					if ( $parentRow.length > 0 && $parentRow.find('.nectar-split-heading[data-text-effect="scroll-opacity-reveal"]').length > 0 ) {
						this.$el = $parentRow;
						this.mergedGroup = true;
						$parentRow.addClass('nectar-split-heading-merged');
					}
				}

				NectarSplitHeadingTimeline.prototype.trackInView = function() {
					var that = this;
					var track = new IntersectionObserver(function(entries) {

						entries.forEach(function(entry){
							if (entry.isIntersecting) {
								that.inView = true;
								that.elHeight = that.$el.outerHeight();
								that.offsetTop = that.$el.offset().top;
							} else {
								that.inView = false;
							}
						});

						}, {
							root: (isSafari()) ? null : document,
						rootMargin: '100px 0px 100px 0px',
						threshold: 0
					});

					track.observe(this.$el[0]);

					// Top Level.
					var clientRect = this.$el[0].getBoundingClientRect();
					if( (clientRect.top + nectarDOMInfo.scrollTop + clientRect.height) < nectarDOMInfo.winH ) {
						this.topLevel = true;
					}

				};

				NectarSplitHeadingTimeline.prototype.events = function() {
					if (nectarDOMInfo.usingMobileBrowser) {
						window.addEventListener('orientationchange', this.calc.bind(this));
					} else {
						window.addEventListener('resize', this.calc.bind(this));
					}

					this.calc();
				};

				NectarSplitHeadingTimeline.prototype.calc = function () {
					this.offsetTop = this.$el.offset().top;
					this.elHeight = this.$el.outerHeight();

					this.wordCount = this.mergedGroup ? this.$el.find('.nectar-split-heading .inner').length : this.$el.find('.inner').length;

					if( this.elHeight / nectarDOMInfo.winH < .25 && this.wordCount < 40 ) {
						this.speed = 2.5;
					} else {
						this.speed = Math.max(2 - Math.min((this.elHeight / nectarDOMInfo.winH), 1.45), 0.66);
						if ( this.speed < 1.2 || this.wordCount < 30 && this.speed < 1.5 ) {
							this.topCushion = (nectarDOMInfo.winH * 0.25);
							this.wordDelay = 250;
						}
					}

					var customOffset = this.$el.find('.nectar-split-heading[data-text-effect="scroll-opacity-reveal"]').attr('data-animation-offset');
					if ( customOffset && parseInt(customOffset) > 0 && parseInt(customOffset) < 100 ) {
						customOffset = parseInt(customOffset);
						this.topCushion = (nectarDOMInfo.winH * 0.05) + ((nectarDOMInfo.winH * 0.05) * (1 - (customOffset / 100)) * 6 );
					}


				};

				NectarSplitHeadingTimeline.prototype.createTimeline = function() {

					var self = this;
					this.timeline = anime.timeline({
						autoplay: false
					});

					var timelineProps = {
						targets: this.mergedGroup ? this.$el[0].querySelectorAll('.nectar-split-heading .inner') : this.$el[0].querySelectorAll('.inner'),
						duration: this.duration,
						easing: 'linear',
						opacity: [0.2, 1],
						delay: function(el, i) { return i * self.wordDelay; },
					};

					this.timeline.add(timelineProps, 0);

				};

				NectarSplitHeadingTimeline.prototype.raf = function() {
					if( !this.inView || nectarState.materialOffCanvasOpen == true ) {
						requestAnimationFrame(this.raf.bind(this));
						return;
					}


					var progress;

					if( !this.topLevel ) {
						progress = 1 + (nectarDOMInfo.scrollTop - (this.offsetTop + this.topCushion )) / nectarDOMInfo.winH;
					} else {
						progress = (nectarDOMInfo.scrollTop / nectarDOMInfo.winH) * 1.5;
					}

					this.timeline.seek(progress * this.timeline.duration * this.speed);
					requestAnimationFrame(this.raf.bind(this));

				};



				/**
				* Progress bar element initialization.
				*
				* @since 3.0
				* @see waypoints
				*/

				function progressBars() {

					var $progressBarsOffsetPos = ($fullscreenMarkupBool == true) ? '500%' : 'bottom-in-view';
					var $progressSelector = ($('#nectar_fullscreen_rows[data-mobile-disable="on"]').length > 0 && nectarDOMInfo.usingMobileBrowser) ? '.nectar-progress-bar' : $fullscreenSelector + '.nectar-progress-bar';

					if( nectarDOMInfo.usingMobileBrowser && $progressBarsOffsetPos == 'bottom-in-view') {
						$progressBarsOffsetPos = '70%';
					}

					$($progressSelector).each(function () {

						var $that = $(this);

						var waypoint = new Waypoint({
							element: $that[0],
							handler: function () {

								if ($that.parents('.wpb_tab').length > 0 && $that.parents('.wpb_tab').css('visibility') == 'hidden' || $that.hasClass('completed')) {
									waypoint.destroy();
									return;
								}

								if ($progressBarsOffsetPos == '100%') {
									$that.find('.bar-wrap').css('opacity', '1');
								}


								var percent = $that.find('span').attr('data-width'),
								$endNum 		= parseInt($that.find('span strong i').text());

								$that.find('span').transition({
									'width': parseInt(percent) + '%'
								}, 800, 'easeInOutCubic');

								var countOptions = {
									useEasing: false
								};
								var $countEle = $that.find('span strong i')[0];
								var numAnim = new CountUp($countEle, 0, $endNum, 0, 1, countOptions);
								numAnim.start();

								$that.find('span strong').transition({
									'opacity': 1
								}, 550, 'easeInCirc');

								////100% progress bar
								if (percent == '100') {
									$that.find('span strong').addClass('full');
								}

								$that.addClass('completed');

								waypoint.destroy();

							},
							offset: $progressBarsOffsetPos
						});

					});

				}



				/**
				* Page builder column border animations.
				*
				* @since 8.0
				* @see waypoints
				*/
				function animatedColBorders() {

					var $progressBarsOffsetPos = ($fullscreenMarkupBool == true) ? '500%' : '75%';
					$($fullscreenSelector + '.wpb_column[data-border-animation="true"]').each(function () {

						var $that = $(this),
						waypoint  = new Waypoint({
							element: $that[0],
							handler: function () {

								if ($that.parents('.wpb_tab').length > 0 && $that.parents('.wpb_tab').css('visibility') == 'hidden' || $that.hasClass('completed')) {
									waypoint.destroy();
									return;
								}

								var $borderDelay = ($that.attr('data-border-animation-delay').length > 0) ? parseInt($that.attr('data-border-animation-delay')) : 0;
								setTimeout(function () {
									$that.find('.border-wrap').addClass('animation');
									$that.find('.border-wrap').addClass('completed');
								}, $borderDelay);

								waypoint.destroy();

							},
							offset: $progressBarsOffsetPos
						});

					});
				}


				/**
				* General waypoints
				*
				* @since 14.0.2
				* @see waypoints
				*/
				function generalWaypoints() {

					$($fullscreenSelector + '.nectar-waypoint-el').each(function () {

						var staggerEl = $(this).is('[data-nectar-waypoint-el-stagger]') ? $(this).attr('data-nectar-waypoint-el-stagger') : false;
						var delay = $(this).is('[data-nectar-waypoint-el-delay]') ? parseInt($(this).attr('data-nectar-waypoint-el-delay')) : 0;
						var offset = $(this).is('[data-nectar-waypoint-el-offset]') ? parseInt($(this).attr('data-nectar-waypoint-el-offset')) + '%' : '90%';

						if( $fullscreenMarkupBool == true ) {
							offset = '500%';
						}

						var $that = $(this),
						waypoint  = new Waypoint({
							element: $that[0],
							handler: function () {
								if ($that.parents('.wpb_tab').length > 0 && $that.parents('.wpb_tab').css('visibility') == 'hidden' || $that.hasClass('completed')) {
									waypoint.destroy();
									return;
								}

								setTimeout( function() {

									if( staggerEl ) {
										$that.find('.'+staggerEl).each(function (i) {
											var $thatt = $(this);
											setTimeout(function () {
												$thatt.addClass('animated-in');
											}, i * 100);
										});
									}
									else {
										$that.addClass('animated-in');
									}

								}, delay);


								waypoint.destroy();

							},
							offset: offset
						});
					});
				}


				/**
				* Food menu item element.
				*
				* @since 8.0
				* @see waypoints
				*/
				function foodMenuItems() {

					var $foodItemOffsetPos = ($fullscreenMarkupBool == true) ? '500%' : '80%';
					$($fullscreenSelector + '.nectar_food_menu_item').parent().each(function () {

						var $that = $(this),
						waypoint  = new Waypoint({
							element: $that[0],
							handler: function () {

								if ($that.parents('.wpb_tab').length > 0 && $that.parents('.wpb_tab').css('visibility') == 'hidden' || $that.hasClass('completed')) {
									waypoint.destroy();
									return;
								}

								$that.find('.nectar_food_menu_item').each(function (i) {

									var $that = $(this);

									setTimeout(function () {
										$that.addClass('animated-in');
									}, i * 150);

								});

								waypoint.destroy();

							},
							offset: $foodItemOffsetPos
						});

					});
				}



				/**
				* Divider element
				*
				* @since 3.0
				* @see waypoints
				*/
				function dividers() {

					var $dividerOffsetPos = ($fullscreenMarkupBool == true) ? '500%' : 'bottom-in-view';

					$($fullscreenSelector + '.divider-small-border[data-animate="yes"], ' + $fullscreenSelector + '.divider-border[data-animate="yes"]').each(function () {

						var $lineDur  = ($(this).hasClass('divider-small-border')) ? 1300 : 1500,
						$that         = $(this),
						waypoint      = new Waypoint({
							element: $that[0],
							handler: function () {

								if ($that.parents('.wpb_tab').length > 0 && $that.parents('.wpb_tab').css('visibility') == 'hidden' || $that.hasClass('completed')) {
									waypoint.destroy();
									return;
								}

								$that.each(function () {

									$(this).css({
										'transform': 'scale(0,1)',
										'visibility': 'visible'
									});
									var $that = $(this);

									$that.delay($that.attr('data-animation-delay')).transition({
										'transform': 'scale(1, 1)'
									}, $lineDur, 'cubic-bezier(.18,0.75,.25,1)');

								});

								$that.addClass('completed');

								waypoint.destroy();

							},
							offset: $dividerOffsetPos
						});

					});
				}



				/**
				* Image with hotspots element hover event
				*
				* @since 7.0
				*/
				function hotSpotHoverBind() {

					//add pulse animation
					$('.nectar_image_with_hotspots[data-hotspot-icon="numerical"]').each(function () {
						$(this).find('.nectar_hotspot_wrap').each(function (i) {
							var $that = $(this);
							setTimeout(function () {
								$that.find('.nectar_hotspot').addClass('pulse');
							}, i * 300);
						});
					});


					var hotSpotHoverTimeout = [];

					$('.nectar_image_with_hotspots:not([data-tooltip-func="click"]) .nectar_hotspot').each(function (i) {

						hotSpotHoverTimeout[i] = '';

						$(this).on('mouseover', function () {
							clearTimeout(hotSpotHoverTimeout[i]);
							$(this).parent().css({
								'z-index': '400',
								'height': 'auto',
								'width': 'auto'
							});
						});

						$(this).on('mouseleave', function () {

							var $that = $(this);
							$that.parent().css({
								'z-index': 'auto'
							});

							hotSpotHoverTimeout[i] = setTimeout(function () {
								$that.parent().css({
									'height': '30px',
									'width': '30px'
								});
							}, 300);

						});

					});

				}



				/**
				* Image with hotspots element responsive behavior.
				*
				* @since 7.0
				*/
				function responsiveTooltips() {

					$('.nectar_image_with_hotspots').each(function () {

						$(this).find('.nectar_hotspot_wrap').each(function () {

							if (nectarDOMInfo.winW > 690) {

								// Remove click if applicable
								if ($(this).parents('.nectar_image_with_hotspots[data-tooltip-func="hover"]').length > 0) {
									$(this).find('.nectar_hotspot').removeClass('click');
									$(this).find('.nttip').removeClass('open');
								}

								$(this).find('.nttip .inner a.tipclose').remove();
								$('.nttip').css('height', 'auto');

								// Reset for positioning
								$(this).css({
									'width': 'auto',
									'height': 'auto'
								});

								$(this).find('.nttip')
									.removeClass('force-right')
									.removeClass('force-left')
									.removeClass('force-top')
									.css('width', 'auto');

								var $tipOffset = $(this).find('.nttip').offset();

								// Against right side
								if ($tipOffset.left > $(this).parents('.nectar_image_with_hotspots').width() - 200) {
									$(this).find('.nttip').css('width', '250px');
								}
								else {
									$(this).find('.nttip').css('width', 'auto');
								}

								// Responsive
								if ($tipOffset.left < 0) {
									$(this).find('.nttip').addClass('force-right');
								}
								else if ($tipOffset.left + $(this).find('.nttip').outerWidth(true) > nectarDOMInfo.winW) {
									$(this).find('.nttip').addClass('force-left').css('width', '250px');
								}
								else if ($tipOffset.top + $(this).find('.nttip').height() + 35 > $window.height() && $('#nectar_fullscreen_rows').length > 0) {
									$(this).find('.nttip').addClass('force-top');
								}

								if ($(this).find('> .open').length == 0) {

									$(this).css({
										'width': '30px',
										'height': '30px'
									});
								}

							} else {

								//fixed position
								$(this).find('.nttip')
									.removeClass('force-left')
									.removeClass('force-right')
									.removeClass('force-top');

								$(this).find('.nectar_hotspot').addClass('click');

								if ($(this).find('.nttip a.tipclose').length == 0) {
									$(this).find('.nttip .inner').append('<a href="#" class="tipclose"><span><i class="screen-reader-text">'+nectar_front_i18n.close+'</i></span></a>');
								}

								// Change height of fixed
								$('.nttip').css('height', $window.height());
							}
						});
					});

				}


				/**
				* Image with hotspots events
				*
				* @since 10.5
				*/
				function imageWithHotspotEvents() {

					if( $('.nectar_image_with_hotspots').length == 0 ) {
						return;
					}

					// Hover
					hotSpotHoverBind();

					// Click
					$body.on('click', '.nectar_hotspot.click', function () {
						$(this).parents('.nectar_image_with_hotspots').find('.nttip').removeClass('open');
						$(this).parent().find('.nttip').addClass('open');

						$(this).parents('.nectar_image_with_hotspots').find('.nectar_hotspot').removeClass('open');
						$(this).parent().find('.nectar_hotspot').addClass('open');

						if (nectarDOMInfo.winW > 690) {
							$(this).parent().css({
								'z-index': '120',
								'height': 'auto',
								'width': 'auto'
							});

							var $that = $(this);

							setTimeout(function () {
								$that.parents('.nectar_image_with_hotspots').find('.nectar_hotspot_wrap').each(function () {

									if ($(this).find('> .open').length == 0) {
										$(this).css({
											'height': '30px',
											'width': '30px',
											'z-index': 'auto'
										});
									}
								});
							}, 300);
						}

						if (nectarDOMInfo.winW <= 690) {
              if($('body.nectar_box_roll').length > 0) {
                $('.container-wrap').addClass('hotspot-open');
              }
							$('.nectar_hotspot.click').parents('.wpb_row, [class*="vc_col-"]').css('z-index', '');
							$(this).parents('.wpb_row, [class*="vc_col-"]').css('z-index', '200');
						}

						return false;
					});

					$body.on('click', '.nectar_hotspot.open', function () {
						$(this).parent().find('.nttip').removeClass('open');
						$(this).parent().find('.nectar_hotspot').removeClass('open');

						$(this).parents('.wpb_row').css('z-index', 'auto');

						return false;
					});

					$body.on('click', '.nttip.open', function (e) {
						if (nectarDOMInfo.winW < 690) {

							if( e.target && $(e.target).is('a') ) {
								return;
							}
              if($('body.nectar_box_roll').length > 0) {
                $('.container-wrap').removeClass('hotspot-open');
              }

							$(this).parents('.nectar_image_with_hotspots').find('.nttip').removeClass('open');
							$(this).parents('.nectar_image_with_hotspots').find('.nectar_hotspot').removeClass('open');
							$(this).parents('.wpb_row').css('z-index', 'auto');
							return false;
						}
					});


					// Calculate on init.
					responsiveTooltips();

					// Resize event.
					$window.on('resize',responsiveTooltips);

				}



				/**
				* Image with hotspots initialization.
				*
				* @since 7.0
				* @see waypoints
				*/
				function imageWithHotspots() {

					var $imageWithHotspotsOffsetPos = ($fullscreenMarkupBool == true) ? '500%' : '50%';

					$($fullscreenSelector + '.nectar_image_with_hotspots[data-animation="true"]').each(function () {

						var $that = $(this);
						var waypoint = new Waypoint({
							element: $that[0],
							handler: function () {

								if ($that.parents('.wpb_tab').length > 0 && $that.parents('.wpb_tab').css('visibility') == 'hidden' || $that.hasClass('completed')) {
									waypoint.destroy();
									return;
								}

								$that.addClass('completed');
								$that.find('.nectar_hotspot_wrap').each(function (i) {
									var $that2 = $(this);
									var $extrai = ($that2.parents('.col.has-animation').length > 0) ? 1 : 0;
									setTimeout(function () {
										$that2.addClass('animated-in');
									}, 175 * (i + $extrai));
								});

								waypoint.destroy();

							},
							offset: $imageWithHotspotsOffsetPos
						});

					});


				}




				/**
					*  Triggers the loading of all lazy images.
					*
					* @since 15.0
					*/
				function nectarLoadAllImages() {

					var lazyItems = [].slice.call(document.querySelectorAll('[data-nectar-img-src]'));

					lazyItems.forEach(function (lazyItem) {

						var imgSrc = lazyItem.getAttribute('data-nectar-img-src');

						if( imgSrc ) {
							nectarLazyImageLoad(lazyItem, imgSrc, lazyItemObserver);
						}

					});
				}


				/**
					*  Lazy loading callback to load single image src
					*
					* @since 15.0
					*/
				function nectarLazyImageLoad(lazyItem, imgSrc, lazyItemObserver) {

					// img tags.
					if (lazyItem.classList.contains('nectar-lazy')) {
						lazyItem.addEventListener('load', function () {


							if (!lazyItem.classList.contains('keep-calculated-size')) {
								lazyItem.style.height = "";
								lazyItem.style.width = "";
							}

							lazyItem.classList.add('loaded');
							lazyItem.removeAttribute('data-nectar-img-src');

							// Recalculate layout for image gallery portfolio grid as images progress.
							if (typeof SalientPortfolio !== 'undefined' && lazyItem.classList.contains('image-gallery-portfolio-item')) {
								$(window).trigger('salient-portfolio-recalculate');
							}

							// Fix waypoints.
							if( !nectarDOMInfo.usingMobileBrowser ) {
								Waypoint.refreshAll();
							}

							lazyItemObserver.unobserve(lazyItem);
						});
						lazyItem.src = imgSrc;
						var srcset = lazyItem.getAttribute('data-nectar-img-srcset');
						if (srcset) {
							lazyItem.setAttribute('srcset', srcset);
							lazyItem.removeAttribute('data-nectar-img-srcset');
						}

						lazyItem.parentNode.classList.add('img-loaded');

					}
					// BGs.
					else {
						lazyItem.style.backgroundImage = "url('" + imgSrc + "')";
						lazyItem.classList.add('loaded');
						lazyItem.removeAttribute('data-nectar-img-src');
						lazyItemObserver.unobserve(lazyItem);
					}


				}

				$(window).on('salient-lazyloading-image-reinit', nectarLazyImageLoading );
				$(window).on('salient-lazyloading-image-reinit', nectarLazyImageSizing );
				/**
					* Nectar Lazy Loading
					*
					* @since 11.0
					*/

				function nectarLazyVideoCallback(video, lazyVideoObserver) {

					if (video.isIntersecting) {

						// Already triggered
						if( video.target.classList.contains('loaded') ) {
							lazyVideoObserver.unobserve(video.target);
							return;
						}

						for (var source in video.target.children) {
							var videoSource = video.target.children[source];
							if (typeof videoSource.tagName === "string" && videoSource.tagName === "SOURCE") {
								videoSource.src = videoSource.dataset.nectarVideoSrc;
							}
						}

						video.target.load();
						video.target.classList.remove("lazy")
						video.target.classList.add('loaded');
						lazyVideoObserver.unobserve(video.target);
					}
				}

				function nectarLazyImageLoading() {

					var lazyItems = [].slice.call(document.querySelectorAll('[data-nectar-img-src]'));
					var lazyVideoItems = [].slice.call(document.querySelectorAll('.nectar-lazy-video'));
					var lazyMenuVideoItems = [].slice.call(document.querySelectorAll('#header-outer .nectar-lazy-video'));

					if ('IntersectionObserver' in window) {

						var options = {
							rootMargin: '450px',
						}

						$window.off('resize.nectarLazySizing', nectarLazyImageSizing);
						$window.on('resize.nectarLazySizing', nectarLazyImageSizing);

						// Images.
						lazyItemObserver = new IntersectionObserver(function (entries) {

							entries.forEach(function (entry) {
								if (entry.isIntersecting) {
									var lazyItem = entry.target;

									var imgSrc = lazyItem.getAttribute('data-nectar-img-src');

									if (imgSrc) {
										nectarLazyImageLoad(lazyItem, imgSrc, lazyItemObserver)
									}

								}

							});

						}, options);

						lazyItems.forEach(function (lazyItem) {
							lazyItemObserver.observe(lazyItem);
						});

						// Videos.
						var lazyVideoObserver = new IntersectionObserver(function (entries, observer) {
							entries.forEach(function (video) {
								nectarLazyVideoCallback(video, lazyVideoObserver);
							});
						}, {
							root: (isSafari()) ? null : document,
							rootMargin: '125px'
						});

						var lazyVideoObserverNoRoot = new IntersectionObserver(function (entries, observer) {
							entries.forEach(function (video) {
								nectarLazyVideoCallback(video, lazyVideoObserverNoRoot);
							});
						}, {
							rootMargin: '125px'
						});

						lazyMenuVideoItems.forEach(function (lazyVideo) {
							lazyVideoObserverNoRoot.observe(lazyVideo);
						});

						lazyVideoItems.forEach(function (lazyVideo) {
							lazyVideoObserver.observe(lazyVideo);
						});


					}
					else {
						// load all the images when intersection observer is not supported.
						lazyItems.forEach(function (lazyItem) {

							// img tags.
							if (lazyItem.classList.contains('nectar-lazy')) {

								if (!lazyItem.classList.contains('keep-calculated-size')) {
									lazyItem.style.height = "";
									lazyItem.style.width = "";
								}

								lazyItem.src = lazyItem.getAttribute('data-nectar-img-src');
								var srcset = lazyItem.getAttribute('data-nectar-img-srcset');
								if (srcset) {
									lazyItem.setAttribute('srcset', srcset);
									lazyItem.removeAttribute('data-nectar-img-srcset');
								}

								lazyItem.parentNode.classList.add('img-loaded');
								lazyItem.classList.add('loaded');
								lazyItem.removeAttribute('data-nectar-img-src');
							}
							// BGs.
							else {
								lazyItem.style.backgroundImage = "url('" + lazyItem.getAttribute('data-nectar-img-src') + "')";
								lazyItem.classList.add('loaded');
								lazyItem.removeAttribute('data-nectar-img-src');
							}

						});

						// Videos
						lazyVideoItems.forEach(function (video) {
							for (var source in video.children) {
								var videoSource = video.children[source];
								if (typeof videoSource.tagName === "string" && videoSource.tagName === "SOURCE") {
									videoSource.src = videoSource.dataset.nectarVideoSrc;
								}
							}

							video.load();
							video.classList.remove("lazy")
							video.classList.add('loaded');

						});

					}


				}


				/**
				* Nectar lazy img size helper.
				*
				* @since 11.0
				*/

				function nectarLazyImageSizing() {

					$('img.nectar-lazy:not(.loaded):not(.image-gallery-portfolio-item)').each(function() {

						// items to skip.
						if( $(this).hasClass('attachment-shop_thumbnail') ||
						  $(this).hasClass('attachment-woocommerce_thumbnail') ||
							$(this).parents('.nectar-post-grid-item').length > 0 ) {
							return true;
						}

						$(this).css({
							'height': '',
							'width' : ''
						});


						var heightAttr = parseInt($(this).attr('height'));
						var widthAttr = parseInt($(this).attr('width'));

						var width = ($(this).parents('.nectar_cascading_images').length > 0) ? $(this).parents('.bg-layer').width() : $(this).width();

						if( $(this).parents('.img-with-aniamtion-wrap.custom-size').length > 0 ) {
							if( width > widthAttr ) {
								width = widthAttr;
							}
						}

						// Shadow img.
						if( $(this).parents('.img-with-aniamtion-wrap[data-shadow*="depth"]').length > 0 ) {
							width = $(this).parents('.img-with-aniamtion-wrap').width();
						}

						// Post grid.
						if( $(this).parents('.nectar-post-grid-item-bg-wrap-inner').length > 0 && !$(this).hasClass('nectar-post-grid-item__overlaid-img') ) {
							width = $(this).parents('.nectar-post-grid-item-bg-wrap-inner').width();
						}

						var dimensions = calculateAspectRatio( widthAttr, heightAttr, width, 2000 );

						$(this).css({
							'height':  dimensions.height + 'px',
							'width' :  dimensions.width + 'px'
						});

					});

				}


			/**
			* Nectar Post Grid Mouse Follow Init
			*
			* @since 11.0
			*/
			function nectarPostGridMouse() {

				viewIndicatorArr = [];
				postGridImgMouseFollowArr = [];

				if( !nectarDOMInfo.usingMobileBrowser ) {

					$('.nectar-post-grid[data-indicator="yes"]').each(function(i) {
						viewIndicatorArr[i] = new NectarIconMouseFollow($(this),'view-indicator');
					});

					$('.nectar-post-grid-wrap[data-style="mouse_follow_image"] .nectar-post-grid').each(function(i) {
						postGridImgMouseFollowArr[i] = new NectarIconMouseFollow($(this), 'post-grid-images');
					});

					$('.nectar-category-grid[data-style="mouse_follow_image"]').each(function(i) {
						postGridImgMouseFollowArr[i] = new NectarIconMouseFollow($(this), 'post-grid-images');
					});

				}

			}





			/**
			* Nectar Post Grid
			*
			* @since 11.0
			*/
			function nectarPostGridInit() {

					$nectarPostGridArr = [];

					// Mouse follow.
					nectarPostGridMouse();

					// Create grid instances.
					$('.nectar-post-grid-wrap').each(function(i) {
						$nectarPostGridArr[i] = new NectarPostGrid($(this));
					});


				}



				function NectarPostGrid(el) {

					this.el             = el;
					this.currentPage    = 0;
					this.activeFilter   = 1;
					this.activeCatTotal = 0;
					this.settingsData   = JSON.parse(this.el.attr('data-el-settings'));
					this.queryData      = JSON.parse(this.el.attr('data-query'));
					this.sortable       = this.el.find('.nectar-post-grid-filters').attr('data-sortable');
					this.gridStyle      = this.el.attr('data-style');

					this.initialMarkup();
					this.clickEvents();
					this.deepLinking();
					this.lightboxGroups();
					this.externalProjectLinks();
				}

				NectarPostGrid.prototype.initialMarkup = function() {

					// Start Filter Active.
					if( this.el.find('.nectar-post-grid-filters a.active').length == 0 ) {
						this.el.find('.nectar-post-grid-filters a:first-child').addClass('active');
					}

					// Load More Markup.
					if( this.settingsData.pagination === 'load-more' && this.el.find('.load-more-wrap').length == 0 ) {

						if( this.el.find('.nectar-post-grid-filters .active').length > 0 ) {
							this.activeFilter = this.el.find('.nectar-post-grid-filters .active').index() + 1;
						}

						var isUsingSortable = (this.sortable === 'yes') ? true : false;
						// add up total counts for all selected taxonomies when all and sortable are not in use.
						if ( !isUsingSortable && this.el.find('.active.all-filter').length === 0 ) {
							var total = 0;
							this.el.find('.nectar-post-grid-filters a').each(function() {
								total += parseInt($(this).attr('data-total-count'));
							});
							this.activeCatTotal = total;
						} else {
							// total count must be from all items or start with the active category.
							this.activeCatTotal = parseInt(this.el.find('.nectar-post-grid-filters a:nth-child(' + this.activeFilter + ')').attr('data-total-count'));
						}

						// Start hidden?
						if( this.el.find('.nectar-post-grid-item').length >= this.activeCatTotal ) {
							this.el.addClass('all-loaded');
							this.el.append('<div class="load-more-wrap inactive"><a href="#" role="button" class="load-more">'+ this.el.attr('data-load-more-text') + '</a></div>');
						} else {
							this.el.removeClass('all-loaded');
							this.el.append('<div class="load-more-wrap"><a href="#" role="button" class="load-more">'+ this.el.attr('data-load-more-text') + '</a></div>');
						}

					}

				};

				NectarPostGrid.prototype.lightboxGroups = function() {

					var unique_id = uniqueIdGenerate();
					var usingLightbox = (this.el.find('.nectar-post-grid-link.pretty_photo').length > 0) ? true : false;

					if ($('body[data-ls="magnific"]').length > 0) {
						this.el.find('.nectar-post-grid-link.pretty_photo')
							.addClass('magnific')
							.addClass('gallery')
							.removeClass('pretty_photo');
					}
					else if ($('body[data-ls="fancybox"]').length > 0) {
						// New.
						this.el.find('.nectar-post-grid-link.pretty_photo')
							.attr('data-fancybox', 'group_' + unique_id)
							.removeClass('pretty_photo');
						// Existing.
						this.el.find('.nectar-post-grid-link[data-fancybox]')
							.attr('data-fancybox','group_' + unique_id);
					}

					if(usingLightbox) {
						lightBoxInit();
					}

				}

				NectarPostGrid.prototype.externalProjectLinks = function() {
					if( this.el.hasClass('target-blank-external-urls') ) {
						this.el.find(".nectar-post-grid-item a[href*='http://']:not([href*='" + window.location.hostname + "'])").attr("target", "_blank").attr('rel','nofollow');
						this.el.find(".nectar-post-grid-item a[href*='https://']:not([href*='" + window.location.hostname + "'])").attr("target", "_blank").attr('rel','nofollow');
					}
					if( this.el.hasClass('target-blank-all-urls') ) {
						this.el.find(".nectar-post-grid-item a[href*='http://']").attr("target", "_blank");
						this.el.find(".nectar-post-grid-item a[href*='https://']").attr("target", "_blank");
					}
				}

				NectarPostGrid.prototype.clickEvents = function() {

					// Sortable Mobile Toggle.
					this.el.find('.nectar-post-grid-filters h4').on('click', function(){
						$(this).parent().find('div').toggleClass('visible');
						$(this).toggleClass('visible');
					});

					// Content under featured image linkbox.
					if( this.gridStyle == 'content_under_image' && this.el.find('.nectar-post-grid-link.pretty_photo').length > 0 ) {
						this.el.on('click','.bg-wrap-link', function(){

							if( $(this).parents('.nectar-post-grid-item').find('.nectar-post-grid-link').length > 0 ) {
								$(this).parents('.nectar-post-grid-item').find('.nectar-post-grid-link')[0].click();
								return false;
							}

						});
					}

					// Sortable/Pagination.
					var settingsData = this.settingsData;
					var queryData    = this.queryData;
					var instance     = this;

					this.el.find('.nectar-post-grid-filters a, .load-more-wrap .load-more').on('click', function(e) {

						var $that = $(this);

						// Filter active.
						if($that.parents('.nectar-post-grid-wrap.loading').length > 0 || $(this).hasClass('active') || $(this).hasClass('inactive') ) {
							return false;
						}

						if( $(this).parents('.nectar-post-grid-filters').length > 0 ) {
							// Filter specific.
							$that.parent().find('a').removeClass('active');
							$that.addClass('active');
							instance.currentPage = 0;
							instance.activeFilter = $that.index() + 1;
						} else {
							// Load More specific.
							instance.currentPage++;
						}

						var $gridEl       = $that.parents('.nectar-post-grid-wrap').find('.nectar-post-grid')
						var $pagination   = settingsData.pagination;
						var $action       = ($that.hasClass('load-more') && $pagination === 'load-more') ? 'load-more' : 'filter';
						var $category     = '';
						var $custom_query = '';

						// Determine what category to load from.
						if( instance.sortable === 'yes' ) {
							$category = $that.parents('.nectar-post-grid-wrap').find('.nectar-post-grid-filters a.active').attr('data-filter');
							$custom_query = $that.parents('.nectar-post-grid-wrap').find('.nectar-post-grid-filters a.active').attr('data-filter');
						} else {

							var skipAll = ( $that.parents('.nectar-post-grid-wrap').find('.nectar-post-grid-filters a').length > 1 ) ? ':not(.all-filter)' : '';

							$that.parents('.nectar-post-grid-wrap').find('.nectar-post-grid-filters a' + skipAll).each(function(){
								$category += $(this).attr('data-filter') + ', ';
								$custom_query += $(this).attr('data-filter') + ', ';
							});

							$category = $category.substring(0, $category.length - 2);
							$custom_query = $custom_query.substring(0, $custom_query.length - 2);

						}

						var $dataToPass = {
							action: 'nectar_get_post_grid_segment',
							post_type: queryData.post_type,
							cpt_name: queryData.cpt_name,
							custom_query_tax: $custom_query,
							category: $category,
							posts_per_page: queryData.posts_per_page,
							current_page: instance.currentPage,
							offset: queryData.offset,
							order: queryData.order,
							orderby: queryData.orderby,
							load_action: $action,
							ignore_sticky_posts: queryData.ignore_sticky_posts,
							settings: {
								pagination: $pagination,
								animation: settingsData.animation,
								post_type: settingsData.post_type,
								image_size: settingsData.image_size,
								parallax_scrolling: settingsData.parallax_scrolling,
								aspect_ratio_image_size: settingsData.aspect_ratio_image_size,
								card_bg_color: settingsData.card_bg_color,
								category_position: settingsData.category_position,
								category_display: settingsData.category_display,
								display_categories: settingsData.display_categories,
								display_estimated_reading_time: settingsData.display_estimated_reading_time,
								display_excerpt: settingsData.display_excerpt,
								excerpt_length: settingsData.excerpt_length,
								display_date: settingsData.display_date,
								display_author: settingsData.display_author,
								author_functionality: settingsData.author_functionality,
								author_position: settingsData.author_position,
								color_overlay: settingsData.color_overlay,
								color_overlay_opacity: settingsData.color_overlay_opacity,
								color_overlay_hover_opacity: settingsData.color_overlay_hover_opacity,
								grid_style: settingsData.grid_style,
								hover_effect: settingsData.hover_effect,
								heading_tag: settingsData.heading_tag,
								heading_tag_render: settingsData.heading_tag_render,
								post_title_overlay: settingsData.post_title_overlay,
								category_style: settingsData.category_style,
								enable_gallery_lightbox: settingsData.enable_gallery_lightbox,
								overlay_secondary_project_image: settingsData.overlay_secondary_project_image,
								vertical_list_hover_effect: settingsData.vertical_list_hover_effect,
								vertical_list_read_more: settingsData.vertical_list_read_more,
								read_more_button: settingsData.read_more_button,
								custom_fields: settingsData.custom_fields,
								custom_fields_location: settingsData.custom_fields_location,
								display_type: settingsData.display_type,
								text_content_layout: settingsData.text_content_layout
							}
						};


						// for random ordering, pass the posts already displayed to prevent duplicates.
						if( queryData.orderby == 'rand' && $action == 'load-more' ) {
							$dataToPass.posts_shown = '';
							$gridEl.find('.nectar-post-grid-item[data-post-id]').each(function() {
								$dataToPass.posts_shown += $(this).attr('data-post-id') + ', ';
							});
							$dataToPass.posts_shown = $dataToPass.posts_shown.substring(0, $dataToPass.posts_shown.length - 2);
						}

						$that.parents('.nectar-post-grid-wrap').addClass('loading');

						$.post(window.nectarLove.ajaxurl, $dataToPass, function (data) {

							// Update markup.
							if( $action === 'load-more' ) {
								$gridEl.append(data);
							} else {
								$gridEl.html(data);

								// Scroll to top of el when needed.
								if( $gridEl.parent().hasClass('nectar-post-grid-wrap--fl-sidebar_left') ||
								    $gridEl.parent().hasClass('nectar-post-grid-wrap--fl-sidebar_right') ) {

									var postGridTop = $gridEl.parent().offset().top;
									var headerHeight = 0;

									if( $('.page-template-template-no-header-footer').length == 0 &&
										$('.page-template-template-no-header').length == 0 &&
										$('body[data-header-format="left-header"]').length == 0) {
											headerHeight = $('#header-outer').height();
									}

									if( nectarDOMInfo.winW > 999 && nectarDOMInfo.scrollTop > postGridTop + 200) {
										window.scrollTo(0, postGridTop - headerHeight);
									}


								}
							}

							buttonInit();

							// Load in animation.
							if( $gridEl.is('[data-animation]') && !$gridEl.is('[data-animation="none"]') ) {

									$that.parents('.nectar-post-grid-wrap').removeClass('finished-animating');

									$gridEl.find('.nectar-post-grid-item:not(.animated-in)').each(function(i) {

										// handle split line heaidngs.
										if( $(this).find('.nectar-split-heading').length > 0) {
											letterRevealMarkup($(this).find('.nectar-split-heading'));
										}


										var $storedEl = $(this);
										setTimeout(function() {
											$storedEl.addClass('animated-in');

											if( settingsData.animation === 'zoom-out-reveal' ) {
													splitLineHeadingTrigger($storedEl, function(){
														splitLineHeadingRemoveMarkup($storedEl);
													});
											}

										}, i * 90);

									});

									setTimeout(function(){
										$that.parents('.nectar-post-grid-wrap').addClass('finished-animating');
									}, 950);
							}

							if( $pagination === 'load-more' ) {

								instance.activeCatTotal = parseInt(instance.el.find('.nectar-post-grid-filters a:nth-child(' + instance.activeFilter + ')').attr('data-total-count'));

								// Remove load more if all loaded, or if no data was returned (no more posts).
								// The latter will currently happen when doing a custom query and the last page is loaded
								// when not specifying any taxonomy data.
								if( $gridEl.find('.nectar-post-grid-item').length >= instance.activeCatTotal || !data ) {
										instance.el.find('.load-more-wrap').addClass('inactive');
										instance.el.addClass('all-loaded');
								} else {
									instance.el.find('.load-more-wrap').removeClass('inactive');
									instance.el.removeClass('all-loaded');
								}

							}

							// Lightbox items.
							instance.lightboxGroups();

							// Ext. links.
							instance.externalProjectLinks();

							$that.parents('.nectar-post-grid-wrap').removeClass('loading');

							// Resize.
							$window.trigger('resize');

							$(window).trigger('nectar-post-grid-updated');

							// Mouse follow.
							nectarPostGridMouse();

						}); // end POST

						e.preventDefault();

					});

				};

				NectarPostGrid.prototype.deepLinking = function() {

					if (typeof nectarGetQueryParam['grid-filter'] != 'undefined') {

							this.el.find('.nectar-post-grid-filters a').each(function () {

								var $currentText  = $(this).clone(),
								$getText          = nectarGetQueryParam['grid-filter'],
								$that             = $(this);

								$currentText = $currentText.text();
								$currentText = $currentText.replace(/\s+/g, '-').toLowerCase();

								if( $currentText.length > 0 && $currentText.substring(0,1) === '-' ) {
									$currentText = $currentText.substring(1);
								}

								$getText = $getText.replace(/\s+/g, '-').replace(/</g, '&lt;').replace(/"/g, '&quot;').toLowerCase();

								// Switch to filter
								if ($currentText == $getText) {
									$(this).trigger('click');
								}

							});

					}

				};


				function NectarPostGridWaypoint() {

					var postGridOffsetPos = ($fullscreenMarkupBool == true) ? '200%' : '75%';

					$($fullscreenSelector + '.nectar-post-grid-wrap').each(function () {

						if ( delayJS && $(this).hasClass('delay-js-loaded') && $nectarFullPage.$usingFullScreenRows == false) {
							return;
						}

						var $that = $(this),
						waypoint 	= new Waypoint({
							element: $that[0],
							handler: function () {

								if ($that.parents('.wpb_tab').length > 0 && $that.parents('.wpb_tab').css('visibility') == 'hidden' || $that.hasClass('completed')) {
									waypoint.destroy();
									return;
								}

								var animationTiming = $that.find('.nectar-post-grid[data-animation-stagger]') ? parseInt($that.find('.nectar-post-grid').attr('data-animation-stagger')) : 90;
								var animation = $that.find('.nectar-post-grid[data-animation]') ? $that.find('.nectar-post-grid').attr('data-animation') : 'none';
								var gridStyle = $that.attr('data-style');

								// Give each post an animated class.
								if($that.find('.nectar-post-grid__reveal-image__inner').length > 0) {
									$that.find('.nectar-post-grid__reveal-image__inner').css({
										opacity: 0
									});
								}


								$that.find('.nectar-post-grid-filters').addClass('animated-in');
								$that.find('.nectar-post-grid-item').each(function(i) {

										var $item = $(this);

										setTimeout(function() {

											$item.addClass('animated-in');

											if( animation === 'zoom-out-reveal' ) {

												splitLineHeadingTrigger($item, function(){
												  splitLineHeadingRemoveMarkup($item);
												});

											}

										}, i * animationTiming);

								});

								setTimeout(function(){
									$that.addClass('finished-animating');
								}, 950);



								waypoint.destroy();

							},
							offset: postGridOffsetPos
						});

					});

				}



				/**
				* Animated title element initialization.
				*
				* @since 7.0
				* @see waypoints
				*/
				function animatedTitles() {

					var $animatedTitlesOffsetPos = ($fullscreenMarkupBool == true) ? '500%' : 'bottom-in-view';

					$($fullscreenSelector + '.nectar-animated-title').each(function () {

						var $that = $(this),
						waypoint 	= new Waypoint({
							element: $that[0],
							handler: function () {

								if ($that.parents('.wpb_tab').length > 0 && $that.parents('.wpb_tab').css('visibility') == 'hidden' || $that.hasClass('completed')) {
									waypoint.destroy();
									return;
								}

								$that.addClass('completed');

								waypoint.destroy();

							},
							offset: $animatedTitlesOffsetPos
						});

					});
				}




				/**
				* Highlighted Text element initialization.
				*
				* @since 9.0
				* @see waypoints
				*/
				function highlightedText() {

					var $highlightedTextOffsetPos = ($fullscreenMarkupBool == true) ? '500%' : 'bottom-in-view';

					if( nectarDOMInfo.usingMobileBrowser && $highlightedTextOffsetPos == 'bottom-in-view' ) {
						$highlightedTextOffsetPos = '85%';
					}

					$($fullscreenSelector + '.nectar-highlighted-text').each(function (i) {

						var $animationDelay = 0;

						// convert italics to em.
						$(this).find('i').each(function(){
							$(this).replaceWith(function(){
								return $('<em />').append($(this).html());
							});
						});

						// add ids
						if($(this).is('[data-id]')) {
							var $that = $(this);
							$(this).find('em').each(function(i){
								if(i > 0) {
									$(this).attr('id', $that.attr('data-id') + '-' + i);
								} else {
									$(this).attr('id', $that.attr('data-id'));
								}
							});
						}

						if($(this).is('[data-animation-delay]') &&
						$(this).attr('data-animation-delay').length > 0 &&
						$(this).attr('data-animation') != 'false') {
							$animationDelay = $(this).attr('data-animation-delay');
						}

						$(this).find('em:has(a)').addClass('has-link');

						if (bypassAnimations) {
							$(this).find('em').addClass('animated');
						}

						// Waypoint
						if( $(this).is('[data-style="none"]') ) {
							return true;
						}

						var $that = $(this);
						var waypoint = new Waypoint({
							element: $that[0],
							handler: function () {

								if ($that.parents('.wpb_tab').length > 0 && $that.parents('.wpb_tab').css('visibility') == 'hidden' || $that.hasClass('animated')) {
									waypoint.destroy();
									return;
								}

								setTimeout(function() {

									$that.find('em').each(function (i) {
										var $highlighted_em = $(this);
										setTimeout(function () {
											$highlighted_em.addClass('animated');
										}, i * 300);

									});

								}, $animationDelay);

								waypoint.destroy();

							},
							offset: $highlightedTextOffsetPos
						});

					});

				}



				/**
				* WooCommerce product carousel.
				*
				* @since 13.0
				* @see waypoints
				*/
				function wooProductCarouselAnimations() {

					var $wooProductOffsetPos = ($fullscreenMarkupBool == true) ? '500%' : '75%';

					$($fullscreenSelector + '.nectar-woo-flickity[data-animation*="fade-in"]').each(function () {

						var $that = $(this),
						waypoint 	= new Waypoint({
							element: $that[0],
							handler: function () {

								if ($that.parents('.wpb_tab').length > 0 && $that.parents('.wpb_tab').css('visibility') == 'hidden' || $that.hasClass('animated-in')) {
									waypoint.destroy();
									return;
								}

								$that.addClass('animated-in');


								$that.find('.flickity-cell').each(function (i) {
									var $el = $(this);

									setTimeout(function(){
										$el.find('> .product').css({
											'transform': 'translate3d(0,0,0)',
											'opacity': '1'
										});
									}, i * 100);
								});


								waypoint.destroy();

							},
							offset: $wooProductOffsetPos
						});

					});
				}


				/**
				* Pricing table element height calculations.
				*
				* @since 2.0
				*/
				function pricingTableHeight() {

					var $tallestCol;

					$('.pricing-table[data-style="default"]').each(function () {
						$tallestCol = 0;

						$(this).find('> div ul').each(function () {

							if( $(this).height() > $tallestCol ) {
								$tallestCol = $(this).height();
							}

						});

						//safety net incase pricing tables height couldn't be determined
						if ($tallestCol == 0) {
							$tallestCol = 'auto';
						}

						//set even height
						$(this).find('> div ul').css('height', $tallestCol);

					});
				}




				/**
				* Testimonial slider element initialization.
				*
				* @since 10.5
				*/
				function nectarTestimonialSliders() {

					$testimonialSliders = [];

					if (typeof NectarTestimonialSlider !== 'undefined') {

						$('.testimonial_slider').each(function (i) {

							var $that_el  = $(this),
							$type         = ($(this).is('[data-style]')) ? $(this).attr('data-style') : 'none';

							$testimonialSliders[i] = new NectarTestimonialSlider($that_el, $type, resizeVideoToCover, fullWidthContentColumns);


							if ($(this).is('.disable-height-animation:not([data-style*="multiple_visible"])')) {
								$testimonialSliders[i].testimonialSliderHeight();
								setTimeout($testimonialSliders[i].testimonialSliderHeight.bind($testimonialSliders[i]), 700);
							}

							if ($(this).is('.testimonial_slider[data-style="multiple_visible_minimal"]')) {
								$testimonialSliders[i].testimonialSliderHeightMinimalMult();

							}

						});
					}

					else {
						nectarScriptLoadedCallback('#nectar-testimonial-sliders-js', 0, nectarTestimonialSliders);
					}


				}


				/**
				* Testimonial slider element resize binding.
				*
				* @since 10.5
				*/
				function nectarTestimonialSlidersEvents() {

					$window.off('smartresize.nectarTestimonials');
					$window.off('resize.nectarTestimonialsMin');

					if($testimonialSliders.length > 0) {
						$window.on('smartresize.nectarTestimonials',nectarTestimonialMainResize);
					}

					if( $('.testimonial_slider[data-style="multiple_visible_minimal"]').length > 0 ) {
						$window.on('resize.nectarTestimonialsMin',nectarTestimonialMiniamlResize);
					}

				}

				function nectarTestimonialMainResize() {
						for (var i = 0; i < $testimonialSliders.length; i++) {
							$testimonialSliders[i].testimonialSliderHeight();
							$testimonialSliders[i].testimonialHeightResize();
						}
				}
				function nectarTestimonialMiniamlResize() {
						for (var i = 0; i < $testimonialSliders.length; i++) {
							$testimonialSliders[i].testimonialSliderHeightMinimalMult();
						}
				}



				/**
				* Icon list element initialization.
				*
				* @since 6.0
				* @see waypoints
				*/
				function iconList() {

					var $iconListOffsetPos = ($fullscreenMarkupBool == true) ? '250%' : '75%';

					$($fullscreenSelector + '.nectar-icon-list[data-animate="true"]').each(function () {

						var $that = $(this),
						waypoint 	= new Waypoint({
							element: $that[0],
							handler: function () {

								if ($that.parents('.wpb_tab').length > 0 && $that.parents('.wpb_tab').css('visibility') == 'hidden' || $that.hasClass('completed')) {
									waypoint.destroy();
									return;
								}

								$that.each(function () {

									var $listItemAnimationDelay = ($that.is('[data-direction="horizontal"]')) ? 100 : 300;

									$(this).find('.nectar-icon-list-item').each(function (i) {
										var $thatt = $(this);
										setTimeout(function () {
											$thatt.addClass('animated');
										}, i * $listItemAnimationDelay);
									});

								});

								$that.addClass('completed');

								waypoint.destroy();

							},
							offset: $iconListOffsetPos
						});

					});
				}



				/**
				* Get the BG color of parent column/row.
				*
				* @since 6.0
				*/
				function narrowParentBGC(element) {

					var narrowedBGC;

					if (element.parents('.wpb_column[data-bg-color*="#"]').length > 0 && element.parents('.wpb_column[data-bg-opacity="1"]').length > 0) {
						narrowedBGC = element.parents('.wpb_column').attr('data-bg-color');
					}
					else if (element.parents('.wpb_row').length > 0 && element.parents('.wpb_row').find('.row-bg.using-bg-color').length > 0 ||
						element.parents('.wpb_row').length > 0 && element.parents('.wpb_row').find('.row-bg.using-bg-color-excluded').length > 0) {
						narrowedBGC = element.parents('.wpb_row').find('.row-bg').css('background-color');
					}
					else {
						if ($('#nectar_fullscreen_rows').length > 0) {
							narrowedBGC = $('#nectar_fullscreen_rows > .wpb_row .full-page-inner-wrap').css('background-color');
						}
						else {
							narrowedBGC = $('.container-wrap').css('background-color');
						}
					}

					return narrowedBGC;

				}


				/**
				* Icon BG matching row BG
				*
				* @since 6.0
				*/
				function nectarIconMatchColoring() {

					var nectarMatchingBGCss = '';

					// Icon list
					$('.nectar-icon-list[data-icon-style="border"], .nectar_icon_wrap[data-style="border-animation"][data-color*="extra-color-gradient-"]').each(function (i) {

						var $bgColorToSet = narrowParentBGC($(this));

						if( $(this).hasClass('nectar-icon-list') ) {
							$(this).find('.list-icon-holder').css('background-color', $bgColorToSet);
						}
						else {

							$(this).removeClass(function (index, className) {
								return (className.match(/(^|\s)instance-\S+/g) || []).join(' ');
							});

							$(this).addClass('instance-' + i);
							nectarMatchingBGCss += '.nectar_icon_wrap.instance-' + i + ' .nectar_icon:before { background-color: ' + $bgColorToSet + '!important; }';
						}

					});

					// Material gradient btns
					$('body.material .nectar-button.see-through[class*="m-extra-color-gradient"]').each(function (i) {

						var $bgColorToSet = narrowParentBGC($(this));

						$(this).removeClass(function (index, className) {
							return (className.match(/(^|\s)instance-\S+/g) || []).join(' ');
						});

						$(this).addClass('instance-' + i);
						nectarMatchingBGCss += '.nectar-button.see-through.instance-' + i + ':after { background-color: ' + $bgColorToSet + '!important; }';

					});

					// Style
					nectarCreateStyle(nectarMatchingBGCss, 'nectaricon-color-match');

				}





				/**
				* One fourth column classes.
				*
				* @since 2.0
				*/
				function oneFourthClasses() {

					$('.col.span_3, .vc_span3, .vc_col-sm-3').each(function () {
						if (!$(this).is('[data-t-w-inherits="small_desktop"]')) {

							var $currentDiv = $(this);
							var $nextDiv    = $(this).next('div');

							if ($nextDiv.hasClass('span_3') && !$currentDiv.hasClass('one-fourths') ||
							$nextDiv.hasClass('vc_span3') && !$currentDiv.hasClass('one-fourths') ||
							$nextDiv.hasClass('vc_col-sm-3') && !$currentDiv.hasClass('one-fourths')) {
								$currentDiv.addClass('one-fourths clear-both');
								$nextDiv.addClass('one-fourths right-edge');
							}
						}
					});

					// Make empty second 1/2 half columns display right on iPad
					$('.span_12 .col.span_6').each(function () {
						if ($(this).next('div').hasClass('span_6') && $.trim($(this).next('div').html()).length == 0) {
							$(this).addClass('empty-second');
						}
					});

				}




				/**
				* Responsive video iframes initialization.
				*
				* @since 3.0
				*/
				function responsiveVideoIframesInit() {

						$('iframe').each(function () {

							// Make sure the iframe has a src
							if (typeof $(this).attr('src') != 'undefined' &&
							!$(this).hasClass('skip-nectar-video-size') &&
							!$(this).hasClass('iframe-embed') &&
							!$(this).hasClass('elementor-video-iframe') &&
							$(this).parents('.gform_fields').length == 0 &&
							$(this).parents('.ult_modal').length == 0 &&
							$(this).parents('.ls-slide').length == 0 &&
							$(this).parents('.woo-variation-product-gallery').length == 0 &&
							$(this).parents('.esg-entry-media').length == 0 &&
							$(this).parents('.wpb_video_widget.wpb_content_element').length == 0) {

								if( $(this).parents('.woocommerce-product-gallery').length > 0 ) {
									if( !$(this).is('[width="100%"]') || !$(this).is('[height="100%"]') ) {
										return true;
									}
								}

								var embedSrcLower = $(this).attr('src').toLowerCase();

								if (embedSrcLower.indexOf("youtube") >= 0 ||
								embedSrcLower.indexOf("vimeo") >= 0 ||
								embedSrcLower.indexOf("twitch.tv") >= 0 ||
								embedSrcLower.indexOf("kickstarter") >= 0 ||
								embedSrcLower.indexOf("embed-ssl.ted") >= 0 ||
								embedSrcLower.indexOf("dailymotion") >= 0) {

									$(this).addClass('iframe-embed');

									if ($(this).width() < $(this).parent().width()) {
										$(this)
											.attr('data-aspectRatio', $(this).height() / $(this).width())
											.removeAttr('height')
											.removeAttr('width');
									} else {
										$(this)
											.attr('data-aspectRatio', '0.56')
											.removeAttr('height')
											.removeAttr('width');
									}

									if ($(this).parents('.post-area.masonry.classic').length > 0) {
										$(this)
											.attr('data-aspectRatio', '0.56')
											.removeAttr('height')
											.removeAttr('width');
									}

								}

							}

						});

				}


				/**
				* Responsive video iframes.
				*
				* @since 3.0
				*/
				function responsiveVideoIframes() {

					$('iframe[data-aspectRatio]').each(function () {

						var $el   = $(this),
						newWidth  = $el.parent().width();

						// In nectar slider
						if ($(this).parents('.swiper-slide').length > 0) {
							if ($(this).is(':visible')) {
								$el
									.width(newWidth)
									.height(newWidth * $el.attr('data-aspectRatio'));
							}
						}
						// All others
						else {
							$el
								.width(newWidth)
								.height(newWidth * $el.attr('data-aspectRatio'));
						}

					});

				}


				/**
				* Reveal the audio/video elements after the size has been calculated.
				*
				* @since 10.5
				*/
				function audioVideoVis() {

					//unwrap post and portfolio videos
					$('.video-wrap iframe').unwrap();
					$('#sidebar iframe[src]').unwrap();

					$('audio')
						.attr('width', '100%')
						.attr('height', '100%')
						.css('visibility', 'visible');

					$('video').css('visibility', 'visible');

					$('.wp-video').each(function () {
						var video = $(this).find('video').get(0);
						video.addEventListener('loadeddata', function () {
							$window.trigger('resize');
						}, false);
					});

					//webkit video back button fix
					$('.main-content iframe[src]').each(function () {
						$(this).css({
							'opacity': '1',
							'visibility': 'visible'
						});
					});

				}





				/**
				* Nectar video background size calculations
				*
				* @since 5.0
				*/
				function resizeVideoToCover() {


					$('.nectar-video-wrap').each(function () {

						// Add loaded class
						$(this).addClass('position-loaded');
					});

				}



				/**
				* Nectar video background initialization.
				*
				* @since 5.0
				*/
				function videoBGInit() {

					if ($('.nectar-video-wrap').length == 0 && $('.nectar-youtube-bg').length == 0) {
						return;
					}

					setTimeout(function () {

						$('.video-color-overlay').each(function () {
							$(this).css('background-color', $(this).attr('data-color'));
						});

						$('.nectar-video-wrap').each(function () {

							if ($(this).find('video').length == 0 ) {
								return;
							}

							var $headerVideo  = ($(this).parents('#page-header-bg').length > 0) ? true : false;
							var $that         = $(this);

							if( $(this).find('video.nectar-lazy-video').length === 0 ) {
								var videoReady = setInterval(function () {

									if ($that.find('video').get(0).readyState > 3) {

										if (!nectarDOMInfo.usingMobileBrowser) {
											$that.transition({
												'opacity': '1'
											}, 400);
											$that.find('video').transition({
												'opacity': '1'
											}, 400);
											$that.parent().find('.video-color-overlay').transition({
												'opacity': '0.7'
											}, 400);
											if ($headerVideo == true) {
												pageHeaderTextEffect();
											}
										}

										// Remove page loading screen
										$loadingScreenEl.addClass('loaded');
										setTimeout(function () {
											$loadingScreenEl.addClass('hidden');
										}, 1000);


										clearInterval(videoReady);
									}

								}, 60);
							} else {
								if ($headerVideo == true) {
									pageHeaderTextEffect();
								}
							}

							if (nectarDOMInfo.usingMobileBrowser) {

								if ($that.parents('.full-width-section').length > 0 &&
								    $that.parents('#nectar_fullscreen_rows').length == 0 &&
									  !$that.hasClass('column-video') ) {

									$that.css('left', '50%');
								} else {
									$that.css('left', '0px');
								}

								if ($headerVideo == true) {
									pageHeaderTextEffect();
								}

								$that.find('video')[0].onplay = function () {
									$that.transition({
										'opacity': '1'
									}, 400);
									$that.find('video').transition({
										'opacity': '1'
									}, 400);
									$that.parent().find('.video-color-overlay').transition({
										'opacity': '0.7'
									}, 400);
								};

							} // end mobile only

						});
					}, 300);


					if (nectarDOMInfo.usingMobileBrowser) {

						$('.nectar-video-wrap').each(function () {

							if (!$(this).find('video').is('[muted]')) {

								// Autoplay not supported unless muted
								$(this).parent().find('.mobile-video-image').show();
								$(this).remove();
							}

						});

					}


					$('.wpb_row:has(".nectar-video-wrap"):not(.fp-section)').each(function (i) {
						$(this).css('z-index', 100 + i);
					});


					$(".vc_row").each(function () {
						var youtubeUrl, youtubeId, $row = jQuery(this);
						$row.find('.nectar-youtube-bg').length > 0 ? (youtubeUrl = $row.find('.nectar-youtube-bg span').text(), youtubeId = nectarExtractYoutubeId(youtubeUrl), youtubeId && ($row.find(".vc_video-bg").remove(), nectarInsertYoutubeVideoAsBackground($row.find('.nectar-youtube-bg'), youtubeId))) : $row.find(".nectar-youtube-bg").remove();

						// Remove yt url
						$row.find('.nectar-youtube-bg span').remove();

						if (!nectarDOMInfo.usingMobileBrowser) {
							$row.find('.nectar-video-wrap, .nectar-youtube-bg').css({
								'opacity': '1',
								'width': '100%',
								'height': '100%'
							});
						}
						$row.find('.video-color-overlay').transition({
							'opacity': '0.7'
						}, 400);
					});


					function nectarInsertYoutubeVideoAsBackground($element, youtubeId, counter) {
						if ("undefined" == typeof YT || void 0 === YT.Player) return 100 < (counter = void 0 === counter ? 0 : counter) ? void console.warn("Too many attempts to load YouTube api") : void setTimeout(function () {
							nectarInsertYoutubeVideoAsBackground($element, youtubeId, counter++)
						}, 100);
						var $container = $element.prepend('<div class="vc_video-bg"><div class="inner"></div></div>').find(".inner");
            var ytPlayer;
						ytPlayer = new YT.Player($container[0], {
							width: "100%",
							height: "100%",
							videoId: youtubeId,
							playerVars: {
								playlist: youtubeId,
								iv_load_policy: 3,
								enablejsapi: 1,
								disablekb: 1,
								autoplay: 1,
								controls: 0,
								showinfo: 0,
								rel: 0,
								loop: 1
							},
							events: {
                onStateChange: function(e) {
                  if( e.data === -1 ) {
                    ytPlayer.mute();
                    ytPlayer.playVideo();
                  }
                },
								onReady: function (event) {
                  ytPlayer.mute();
                  ytPlayer.playVideo();
									nectarResizeVideoBackground($element);
								}
							}
						}), nectarResizeVideoBackground($element), jQuery(window).on("resize", function () {
							nectarResizeVideoBackground($element);
						});

						setTimeout(function () {
							nectarResizeVideoBackground($element);
						}, 100);
					}

					function nectarResizeVideoBackground($element) {
						var iframeW, iframeH, marginLeft, marginTop, containerW = $element.innerWidth(),
						containerH = $element.innerHeight(),
						ratio1 = 16,
						ratio2 = 9;
						ratio1 / ratio2 > containerW / containerH ? (iframeW = containerH * (ratio1 / ratio2),
						iframeH = containerH, marginLeft = -Math.round((iframeW - containerW) / 2) + "px", marginTop = -Math.round((iframeH - containerH) / 2) + "px", iframeW += "px", iframeH += "px") : (iframeW = containerW, iframeH = containerW * (ratio2 / ratio1), marginTop = -Math.round((iframeH - containerH) / 2) + "px",
						marginLeft = -Math.round((iframeW - containerW) / 2) + "px", iframeW += "px", iframeH += "px"),
						$element.find(".vc_video-bg iframe").css({
							maxWidth: "1000%",
							marginLeft: marginLeft,
							marginTop: marginTop,
							width: iframeW,
							height: iframeH
						});
					}

					function nectarExtractYoutubeId(url) {

						if ("undefined" == typeof url) {
							return !1;
						}

						var id = url.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/);
						return null !== id ? id[1] : !1
					}


				}




				/**
				* Single Blog Posts
				*
				* @since 11.0
				*/
				function blogSingle() {

					// Remove first gallery on post when using the gallery slider option.
					if( $body.hasClass('single-post') && $('.content-inner[data-has-gallery]').length > 0 ) {


						if($('.wp-block-gallery').length > 0) {
							// Gutenberg.
							$('.content-inner').find('.wp-block-gallery').each(function(i) {
								if(i !== 0) {
										$(this).css('display','flex');
								}
							});

						} else {
							// Classic Editor.
							$('.content-inner').find('.gallery').each(function(i) {
								if(i !== 0) {
										$(this).css('display','block');
								}
							});

						}

					} // If using gallery slider on single conditional end.

					// Social sharing waypoint
					if( $body.hasClass('single-post') && $('.nectar-social.vertical').length > 0 ) {

						var $el = $('.nectar-social.vertical');
						var waypoint  = new Waypoint({
							element: $('.post-area')[0],
							handler: function (direction) {

								if ( nectarState.materialOffCanvasOpen ) {
									return;
								}

								if( direction === 'down' ) {
									$el.addClass('visible');
								} else {
									$el.removeClass('visible');
								}


							},
							offset: '70%'

						});
					}

				}





				/*-------------------------------------------------------------------------*/
				/*	Header + Search
				/*-------------------------------------------------------------------------*/

				/**
				* Correct megamenus in mobile navigation.
				*
				* @since 8.0
				*/
				function mobileNavMegamenuCorrect() {

					////mobile megamenus without titles / nested groupings
					var $mobileNavSelector = ( $('#top #mobile-menu').length > 0 ) ? '#top #mobile-menu ' : '.off-canvas-menu-container.mobile-only ';

					$($mobileNavSelector + '.menu-item > ul > li > a').each(function () {

						if ($(this).text() == '-' || $(this).text() == '–' || $(this).parent().hasClass('hide-title') || $(this).find('> .remove-menu-item-title').length > 0 ) {

							var $navLIs = $(this).parent().find('> ul > li:not(.back)').clone();
							// column has widget
							if( $(this).parent().find('> .widget-area-active').length > 0 ) {
								$(this).parent().find('> a').remove();
							} else {

								$(this).parent().find('ul').remove();
								$(this).parent().parent().append($navLIs);
								$(this).parent().remove();
							}

						}
					});

				}



				/**
				* Material theme skin off canvas menu initialization.
				*
				* @since 10.5
				*/
				function materialSkinOCM_Init() {

					if ($('body.material[data-slide-out-widget-area-style="slide-out-from-right"]').length > 0) {
						OCM_materialWidth();

						if( $wpAdminBar.length > 0 ) {
							var $topToolBar = $wpAdminBar.detach();
							$('.ocm-effect-wrap-inner').append($topToolBar);
						}


					}

					OCM_materialIconMarkup();
					materialSkinTransition();

					$window.on('resize', OCM_materialSize);

				}




				/**
				* Material theme skin transition helper
				*
				* @since 10.5
				*/
				function materialSkinTransition() {

					if ($('body.material[data-header-search="true"]').length > 0 ||
					$('body.material .ocm-effect-wrap').length > 0) {

						var materialTransTO,
						allowMaterialResizeCalc = false,
						orientTrack = 0,
						$winDOMWidth  = nectarDOMInfo.winW,
						$winDOMHeight = nectarDOMInfo.winH;

						// For mobile make sure the orientation has changed.
						window.addEventListener("orientationchange", function () {
							orientTrack = 1;
						});

						// Resize.
						$window.on('resize', function () {

							if( nectarDOMInfo.usingMobileBrowser ) {
								// Mobile.
								if (($window.width() != $winDOMWidth && $window.height != $winDOMHeight) || orientTrack === 1) {

									// Store the current window dimensions.
									$winDOMWidth  = nectarDOMInfo.winW;
									$winDOMHeight = nectarDOMInfo.winH;

									// Reset orientation change tracker.
									orientTrack = 0;

									// Set to allow.
									allowMaterialResizeCalc = true;

								}
							} else {
								// Desktop always allows.
								allowMaterialResizeCalc = true;
							}

							if(allowMaterialResizeCalc) {

								clearTimeout(materialTransTO);

								$('body[data-slide-out-widget-area-style="slide-out-from-right"] > a.slide_out_area_close, .material #header-outer, .ocm-effect-wrap, .ocm-effect-wrap-shadow')
									.addClass('no-material-transition');

								materialTransTO = setTimeout(function () {
									$('body[data-slide-out-widget-area-style="slide-out-from-right"] > a.slide_out_area_close, .material #header-outer, .ocm-effect-wrap, .ocm-effect-wrap-shadow')
										.removeClass('no-material-transition');
								}, 250);

								OCM_materialWidth();

								// Reset allow.
								allowMaterialResizeCalc = false;

							} // endif for allow.

						}); // end resize.

					}

				}



				/**
				* Calculate off canvas menu slide out from right on hover
				*
				* @since 8.0
				*/
				function calculateHoverNavMinHeight() {

					var $widgetHeights = 0;
					$('#slide-out-widget-area > .widget').each(function () {
						$widgetHeights += $(this).height();
					});

					var $menuHeight;

					if(($offCanvasEl.height() - 25 - $('.bottom-meta-wrap').outerHeight(true) - $widgetHeights) > $('#slide-out-widget-area .off-canvas-menu-container:last-child').height()) {
						$menuHeight = $offCanvasEl.height() - 25 - $('.bottom-meta-wrap').outerHeight(true) - $widgetHeights;
					} else {
						$menuHeight = $('#slide-out-widget-area .off-canvas-menu-container:last-child').height();
					}

					$('#slide-out-widget-area .inner').first().css({
						'height': 'auto',
						'min-height': $menuHeight
					});


				}


				/**
				* Material theme skin off canvas menu width.
				*
				* @since 8.0
				*/
				function OCM_materialWidth() {

					$('#slide-out-widget-area.slide-out-from-right').css({
						'padding-top': $window.height() * 0.1,
						'padding-bottom': $window.height() * 0.1
					});

					OCM_overflowState();
				}



				/**
				* Material theme skin off canvas menu icon markup
				*
				* @since 8.0
				*/
				function OCM_materialIconMarkup() {

					if ($('body.material').length > 0 && $('body[data-slide-out-widget-area-style="slide-out-from-right-hover"]').length == 0 ||
							$('body.material').length > 0 && bodyBorderVignette === true) {

						if ( $('#mobile-menu').length == 0) {
							var $menuIconClone = $('header#top ul .slide-out-widget-area-toggle:first a > span > i').clone();
							$menuIconClone.addClass('hover-effect');
							$('header#top ul .slide-out-widget-area-toggle a > span').append($menuIconClone);

							var $menuIconClone2 = $('header#top .slide-out-widget-area-toggle.mobile-icon a > span > i').clone();
							$menuIconClone2.addClass('hover-effect');
							$('header#top .slide-out-widget-area-toggle.mobile-icon a > span').append($menuIconClone2);
						}

						$('body:not([data-slide-out-widget-area-style="slide-out-from-right"]) header#top .slide-out-widget-area-toggle a > span')
							.append($('<span class="close-wrap"> <span class="close-line close-line1"></span> <span class="close-line close-line2"></span> </span>'));

							setTimeout(function(){
								$('header#top .slide-out-widget-area-toggle a > span .close-wrap').addClass('loaded');
							},200);

					}

					if ($('body.material #boxed').length > 0 && $('body[data-slide-out-widget-area-style="slide-out-from-right-hover"]').length > 0 && $('.ocm-effect-wrap').length > 0 ) {
						$('#ajax-content-wrap > .slide-out-widget-area-toggle.slide-out-hover-icon-effect').insertAfter('.ocm-effect-wrap');
					}

					//move material skin default ocm
					if ($('body.material').length > 0 &&
					    $('body[data-slide-out-widget-area-style*="fullscreen"]').length == 0 &&
							$('.ocm-effect-wrap').length > 0 ) {
						$('body.material #slide-out-widget-area.slide-out-from-right .slide_out_area_close').insertAfter('.ocm-effect-wrap');
						$('#slide-out-widget-area-bg').insertAfter('.ocm-effect-wrap');
						$offCanvasEl.insertAfter('.ocm-effect-wrap');

					}

				}



				/**
				* Material theme skin off canvas menu height
				*
				* @since 8.0
				*/
				function OCM_materialSize() {
					if ($('.ocm-effect-wrap.material-ocm-open').length > 0) {

						$('.ocm-effect-wrap').css({
							'height': $window.height()
						});

						$('.ocm-effect-wrap-inner').css({
							'padding-top': nectarDOMInfo.adminBarHeight
						});

					}
				}



				/**
				* Off canvas menu dropdown markup
				*
				* @since 8.0
				*/
				function OCM_dropdownMarkup() {
					var $nectar_ocm_dropdown_func = ($('#slide-out-widget-area[data-dropdown-func]').length > 0) ? $offCanvasEl.attr('data-dropdown-func') : 'default';
					if ($nectar_ocm_dropdown_func == 'separate-dropdown-parent-link') {
						$('#slide-out-widget-area .off-canvas-menu-container li.menu-item-has-children').append('<span class="ocm-dropdown-arrow"><i class="fa fa-angle-down"></i></span>');
					}
				}



				/**
				* Off canvas menu dropdown icon position.
				*
				* @since 8.0
				*/
				function OCM_dropdownIconPos() {

					$('#slide-out-widget-area[class*="slide-out-from-right"] .off-canvas-menu-container li.menu-item-has-children').each(function () {
						$(this).find('.ocm-dropdown-arrow').css({
							'top': $(this).find('a').height() / 2
						});
					});
					$('#slide-out-widget-area.fullscreen-split .off-canvas-menu-container li.menu-item-has-children').each(function () {
						$(this).find('.ocm-dropdown-arrow').css({
							'top': $(this).find('a').height() / 2
						});
					});

				}


        function OCM_convertExtItems() {

          // OCM Remove Ext menu items option.
          if( window.nectarOptions &&
              window.nectarOptions.ocm_remove_ext_menu_items &&
              window.nectarOptions.ocm_remove_ext_menu_items == 'remove_images' &&
              nectarState.ocmInit === false ) {

              $('.off-canvas-menu-container .title[class*="inherit-h"], #mobile-menu .title[class*="inherit-h"]').removeClass(function (index, className) {
                return (className.match(/(^|\s)inherit-h\S+/g) || []).join(' ');
              });
              $('.off-canvas-menu-container .nectar-ext-menu-item .image-layer-outer, #mobile-menu .nectar-ext-menu-item .image-layer-outer').remove();
              $('.off-canvas-menu-container .nectar-ext-menu-item .menu-item-desc').removeClass('menu-item-desc').addClass('item_desc');
              $('.off-canvas-menu-container .nectar-ext-menu-item .inner-content > .title').each(function(){
                if( $(this).find('.menu-title-text').length == 0 ) {
                  $(this).removeClass('title').addClass('menu-title-text');
                }
              });

              // Desc class for OCM for added submenu spacing
              $('.off-canvas-menu-container .item_desc').each(function() {

                if( $(this).css('display') !== 'none' ) {
                  var $parent = $(this).parents('.menu-item');
                  $parent.addClass('nectar-extra-menu-item-spacing');
                }

              });

              // Dropdown icon position.
              OCM_dropdownIconPos();

              nectarState.ocmInit = true;

          }

        }




				/**
				* Off canvas menu overflow scrolling.
				*
				* @since 8.0
				*/
				function OCM_overflowState() {

					//switch position of social media/extra info based on screen size
					if (nectarDOMInfo.winW < 1000 ||
					$('body > #boxed').length > 0 ||
					$('.ocm-effect-wrap-inner > #boxed').length > 0) {

						$('#slide-out-widget-area.fullscreen .off-canvas-social-links, #slide-out-widget-area.fullscreen-alt .off-canvas-social-links').appendTo('#slide-out-widget-area .inner-wrap > .inner');
						$('#slide-out-widget-area.fullscreen .bottom-text, #slide-out-widget-area.fullscreen-alt .bottom-text').appendTo('#slide-out-widget-area .inner-wrap > .inner');

					} else {
						$('#slide-out-widget-area.fullscreen .off-canvas-social-links,#slide-out-widget-area.fullscreen-alt .off-canvas-social-links').appendTo('#slide-out-widget-area .inner-wrap');
						$('#slide-out-widget-area.fullscreen .bottom-text, #slide-out-widget-area.fullscreen-alt .bottom-text').appendTo('#slide-out-widget-area .inner-wrap');
					}


					//close mobile only slide out widget area if switching back to desktop
					if ($('.slide-out-from-right.open .off-canvas-menu-container.mobile-only').length > 0 && $('body.mobile').length == 0) {
						$('#slide-out-widget-area .slide_out_area_close').trigger('click');
					}

					//sizing for dropdown
					OCM_dropdownIconPos();

				}



				/**
				* Off canvas menu: slide out from right hover open.
				*
				* @since 10.5
				*/
				function OCM_slideOutRightHoverOpen() {

					calculateHoverNavMinHeight();

					if ( ( nectarDOMInfo.usingMobileBrowser || nectarDOMInfo.usingIOS || nectarDOMInfo.usingTouchDevice ) && $('#slide-out-widget-area.open').length > 0 ||
							$('.slide-out-from-right-hover.ios-ocm-style').length > 0 && $('#slide-out-widget-area.open').length > 0) {
						OCM_mobileSlideOutRightHoverCloseCheck();
						return false;
					}

					if( ( nectarDOMInfo.usingMobileBrowser || nectarDOMInfo.usingIOS || nectarDOMInfo.usingTouchDevice ) || $('.slide-out-from-right-hover.ios-ocm-style').length > 0 ) {
						$('.slide-out-widget-area-toggle a').attr('aria-expanded','true');
						$offCanvasBG.css({
							'height': '100%',
							'width': '100%'
						});
					}

					$offCanvasEl.css({
						'transform': 'translate3d(0,0,0)'
					}).addClass('open');

          OCM_convertExtItems();

					if( $('.slide-out-from-right-hover.ios-ocm-style').length > 0 ) {
						$('#ajax-content-wrap').addClass('ios-ocm-style-open');
						setTimeout(function () {
							$('#slide-out-widget-area .slide_out_area_close').addClass('material-ocm-open');
							$('#slide-out-widget-area .slide_out_area_close').removeClass('hide_until_rendered');
						}, 350);
					}

					var withinCustomBreakpoint = mobileBreakPointCheck();
					if( nectarDOMInfo.winW < 1000 ) {
						withinCustomBreakpoint = true;
					}
					var alignmentPosition = (window.nectarOptions && window.nectarOptions.mobile_header_format && window.nectarOptions.mobile_header_format === 'centered-menu' && withinCustomBreakpoint) ? 'left' : 'right';

					// Icon effect
					// Set position
					if ($('header#top .container .span_9 > .slide-out-widget-area-toggle').length > 0) {

						var $hIconEl       = $('.slide-out-hover-icon-effect'),
						secondaryBarHeight = nectarDOMInfo.secondaryHeaderHeight;

						var $nectarHamMenuPos;
						var $withinCustomBreakpoint = mobileBreakPointCheck();
						if( $('#header-outer[data-format="centered-menu-bottom-bar"]').length > 0 ) {
							$withinCustomBreakpoint = false;
						}

						if ($('body.mobile').length > 0 || $withinCustomBreakpoint || headerOCMButtonPos === 'left') {

							if ( $('.left-aligned-ocm').length > 0 && $('.left-aligned-ocm').css('display') != 'none' ) {

								$hIconEl.css({
									'top': $('header#top .left-aligned-ocm .slide-out-widget-area-toggle a').offset().top - nectarDOMInfo.scrollTop
								});
							} else {
								$hIconEl.css({
									'top': $('header#top .span_9 > .slide-out-widget-area-toggle a').offset().top - nectarDOMInfo.scrollTop
								});
							}

							if( alignmentPosition === 'left' || headerOCMButtonPos === 'left') {
								$hIconEl.css({
									'left' : parseInt($('#header-outer header > .container').css('padding-right')) + 1,
									'right' : ''
								});
							} else {
								$hIconEl.css({
									'right' : parseInt($('#header-outer header > .container').css('padding-right')) + 1,
									'left' : ''
								});
							}

						}

						else {

							if ($bodyBorderHeaderColorMatch) {

								var $extraCushion = ($('#header-outer[data-has-menu="false"]').length > 0) ? 2 : 1;
								$hIconEl.css({
									'top': nectarDOMInfo.adminBarHeight + secondaryBarHeight + parseInt($('header#top nav >ul .slide-out-widget-area-toggle a').css('padding-top')),
									'right': 29 + $extraCushion
								});

							} else {

								if ($('#header-outer[data-format="centered-menu-bottom-bar"]').length > 0) {
									$nectarHamMenuPos = ($('header#top .span_9 > .slide-out-widget-area-toggle').css('display') == 'flex') ? $('header#top .span_9 > .slide-out-widget-area-toggle.mobile-icon a').offset() : $('header#top .span_3 .right-side .slide-out-widget-area-toggle > div').offset();

									if( $('#top .span_3 .slide-out-widget-area-toggle.mobile-icon').css('display') == 'flex' ) {
										$nectarHamMenuPos = $('#top .span_3 .slide-out-widget-area-toggle.mobile-icon a').offset();
									}

									$hIconEl.css({
										'top': parseInt($nectarHamMenuPos.top) - nectarDOMInfo.scrollTop,
										'right': parseInt($('#header-outer header >.container').css('padding-right')) + 2,
										'left': ''
									});
								} else {

									if( $body.hasClass('ascend') ) {
										$nectarHamMenuPos = ($('header#top .span_9 > .slide-out-widget-area-toggle').css('display') == 'block') ? $('header#top .span_9 > .slide-out-widget-area-toggle.mobile-icon').position() : $('header#top nav .buttons .slide-out-widget-area-toggle > div a > span:not(.screen-reader-text)').position();
									} else {
										$nectarHamMenuPos = ($('header#top .span_9 > .slide-out-widget-area-toggle').css('display') == 'block') ? $('header#top .span_9 > .slide-out-widget-area-toggle.mobile-icon').position() : $('header#top nav .buttons .slide-out-widget-area-toggle > div').position();
									}


									if ($('#header-secondary-outer.hide-up').length > 0) {
										secondaryBarHeight = 0;
									}

									$hIconEl.css({
										'top': nectarDOMInfo.adminBarHeight + secondaryBarHeight + parseInt($nectarHamMenuPos.top),
										'right': parseInt($('#header-outer header >.container').css('padding-right')) + 2,
										'left': ''
									});
								}

							} // No body border color match.

						} //Not on mobile.

					}

					////Open
					$('.slide-out-hover-icon-effect .lines-button')
						.removeClass('no-delay')
						.addClass('unhidden-line');

					if ($('#header-outer[data-permanent-transparent="1"]').length == 0 &&
						$('#nectar_fullscreen_rows').length == 0 &&
						!nectarDOMInfo.usingFrontEndEditor &&
						nectarDOMInfo.winW > 1000) {

						if (!(nectarDOMInfo.scrollTop == 0 && $('#header-outer.transparent').length > 0)) {

							if ($('body.mobile').length == 0 && $bodyBorderHeaderColorMatch) {

								$headerOuterEl.attr('data-transparent', 'true').addClass('no-bg-color').addClass('slide-out-hover');
								$('#header-outer header, #header-outer > .cart-outer').addClass('all-hidden');
							}

						}

						if ($('#header-outer[data-remove-fixed="1"]').length == 0 && $('body.mobile').length == 0 && $bodyBorderHeaderColorMatch) {

							if (headerResize == true) {

								$window.off('scroll', bigNav);
								$window.off('scroll', smallNav);

							} else {
								$window.off('scroll', opaqueCheck);
								$window.off('scroll', transparentCheck);
							}
						}

					}

					if (!nectarDOMInfo.usingMobileBrowser) {
						$window.on('mousemove.rightOffsetCheck', OCM_slideOutRightHoverCloseCheck);
					} else {
						return false;
					}

				}


				/**
				* Off canvas menu: slide out from right hover close
				*
				* @since 10.5
				*/
				function OCM_slideOutRightHoverCloseCheck(e) {

					var $windowWidth   = $window.width();
					var $ocmHoverWidth = $offCanvasEl.outerWidth();
					var withinCustomBreakpoint = mobileBreakPointCheck();
					if( nectarDOMInfo.winW < 1000 ) {
						withinCustomBreakpoint = true;
					}
					var alignmentPosition = (window.nectarOptions && window.nectarOptions.mobile_header_format && window.nectarOptions.mobile_header_format === 'centered-menu' && withinCustomBreakpoint) ? 'left' : 'right';

					var conditionalShow = false;
					if( alignmentPosition !== 'left' && headerOCMButtonPos !== 'left' ) {
						conditionalShow = (e.clientX < $windowWidth - parseInt($ocmHoverWidth) - $bodyBorderWidth);
					} else {
						conditionalShow = (e.clientX > parseInt($ocmHoverWidth) + $bodyBorderWidth);
					}


					if (conditionalShow && $offCanvasEl.hasClass('mouse-accessed')) {

						$offCanvasEl.removeClass('mouse-accessed');
						$window.off('mousemove.rightOffsetCheck', OCM_slideOutRightHoverCloseCheck);

						$offCanvasEl.css({
							'transform': ''
						}).removeClass('open');

						$headerOuterEl.removeClass('style-slide-out-from-right');

						$('.slide-out-hover-icon-effect .lines-button')
							.removeClass('unhidden-line')
							.addClass('no-delay');

						if ($('#header-outer[data-permanent-transparent="1"]').length == 0) {

							if ($('#header-outer[data-remove-fixed="1"]').length == 0 && $('body.mobile').length == 0 && $bodyBorderHeaderColorMatch) {

								if ($('body.mobile').length == 0) {
									$headerOuterEl.removeClass('no-bg-color');
									$('#header-outer header, #header-outer > .cart-outer').removeClass('all-hidden');
								}
							}

							if ($('#header-outer[data-remove-fixed="1"]').length == 0 && $('body.mobile').length == 0 && $bodyBorderHeaderColorMatch) {

								if (headerResize == true) {

									$window.off('scroll.headerResizeEffect');

									if (nectarDOMInfo.scrollTop == 0) {

										$window.on('scroll.headerResizeEffect', smallNav);

										if ($('#header-outer[data-full-width="true"][data-transparent-header="true"]').length > 0 &&
										$bodyBorderTop.length > 0 &&
										$bodyBorderHeaderColorMatch == true &&
										$('#header-outer.pseudo-data-transparent').length > 0) {

											$('#header-outer[data-full-width="true"] header > .container').stop(true, true).animate({
												'padding': '0'
											}, {
												queue: false,
												duration: 250,
												easing: 'easeOutCubic'
											});

										}
									} else {
										$window.on('scroll.headerResizeEffect', bigNav);
									}

								} else {

									$window.off('scroll.headerResizeEffectOpaque');
									$window.on('scroll.headerResizeEffectOpaque', opaqueCheck);
								}
							}
						}
					}

				}


				/**
				* Off canvas menu: mobile slide out from right hover close.
				*
				* @since 10.5
				*/
				function OCM_mobileSlideOutRightHoverCloseCheck() {

					if(nectarDOMInfo.usingMobileBrowser || nectarDOMInfo.usingIOS || nectarDOMInfo.usingTouchDevice || $('.slide-out-from-right-hover.ios-ocm-style').length > 0 ) {
						$('.slide-out-widget-area-toggle a').attr('aria-expanded','false');
						$offCanvasBG.css({
							'height': '1px',
							'width': '1px'
						});
					}

					if( $('.slide-out-from-right-hover.ios-ocm-style').length > 0 ) {
							$('#ajax-content-wrap').removeClass('ios-ocm-style-open');
							$('#slide-out-widget-area .slide_out_area_close').removeClass('material-ocm-open');
					}

					$offCanvasEl.css({
						'transform': ''
					}).removeClass('open');

					$headerOuterEl.removeClass('style-slide-out-from-right');

					$('.slide-out-hover-icon-effect .lines-button')
						.removeClass('unhidden-line')
						.addClass('no-delay');

					if ($('#header-outer[data-permanent-transparent="1"]').length == 0) {

						$headerOuterEl.removeClass('no-bg-color');
						$('#header-outer header').removeClass('all-hidden');

					}


					if ($('#header-outer[data-remove-fixed="1"]').length == 0 && $('body.mobile').length == 0 && $bodyBorderHeaderColorMatch) {

						if (headerResize == true) {

							$window.off('scroll.headerResizeEffect');

							if (nectarDOMInfo.scrollTop == 0) {

								$window.on('scroll.headerResizeEffect', smallNav);

								if ($('#header-outer[data-full-width="true"][data-transparent-header="true"]').length > 0 &&
								$bodyBorderTop.length > 0 &&
								$bodyBorderHeaderColorMatch == true &&
								$('#header-outer.pseudo-data-transparent').length > 0) {

									$('#header-outer[data-full-width="true"] header > .container').stop(true, true).animate({
										'padding': '0'
									}, {
										queue: false,
										duration: 250,
										easing: 'easeOutCubic'
									});

								}
							}

							else {
								$window.on('scroll.headerResizeEffect', bigNav);
							}

						} else {

							$window.off('scroll.headerResizeEffectOpaque');
							$window.on('scroll.headerResizeEffectOpaque', opaqueCheck);

						}

					}

				}



				/**
				* Off canvas menu: slide out from right hover initialization.
				*
				* @since 10.5
				*/
				function OCM_slideOutRightHoverInit() {

					  var clickEventEnabled = true;

						if ($('#ajax-content-wrap > .slide-out-widget-area-toggle').length == 0) {

							//icon effect html creation
							var $iconInsertLocation = ( $('.slide-out-widget-area-toggle[data-custom-color="true"]').length > 0 ) ? '#slide-out-widget-area > div' : '#slide-out-widget-area';

							if( $('.ios-ocm-style').length === 0 ) {
								$('<div class="slide-out-widget-area-toggle slide-out-hover-icon-effect" data-icon-animation="simple-transform"><div> <a href="#slide-out-widget-area" role="button" class="closed"> <span> <span class="screen-reader-text">'+nectar_front_i18n.menu+'</span> <i class="lines-button x2" role="none"> <i class="lines"></i> </i> </span> </a> </div> </div>').insertAfter($iconInsertLocation);
							}

							if ($('#header-outer[data-has-menu="true"]').length > 0 ||
								$('body[data-header-search="true"]').length > 0 ||
								$('.slide-out-widget-area-toggle a.using-label').length > 0 ||
								$('.slide-out-widget-area-toggle[data-custom-color="true"]').length > 0 ) {
									$('.slide-out-widget-area-toggle').addClass('small');
							}
						}


						//hover triggered
						if (!nectarDOMInfo.usingMobileBrowser && !nectarDOMInfo.usingIOS && !nectarDOMInfo.usingTouchDevice && $('.ios-ocm-style').length == 0) {
							$body.on('mouseenter', '#header-outer .slide-out-widget-area-toggle:not(.std-menu) a', OCM_slideOutRightHoverOpen);
							$offCanvasEl.on('mouseenter', function () {
								$(this).addClass('mouse-accessed');
							});

						} else {
							function slideOutFromRightHoverClickTrigger() {

								// Prevent double click event.
								if ( clickEventEnabled ) {
									OCM_slideOutRightHoverOpen();
									clickEventEnabled = false;
									setTimeout(function() {
										clickEventEnabled = true;
									}, 350);
								}

								return false;
							};

							$body.on('click touchend', '.slide-out-widget-area-toggle:not(.std-menu) a', slideOutFromRightHoverClickTrigger);
							if ( window.nectarOcmOpen ) {

								setTimeout(() => {
									slideOutFromRightHoverClickTrigger();
								}, 40);

							}

							$body.on('click', '#slide-out-widget-area-bg', OCM_slideOutRightMobileClose);
							$body.on('click', '.ios-ocm-style .slide_out_area_close', function(e){
								OCM_slideOutRightMobileClose();
								e.preventDefault();
							});

						}

						$window.on('smartresize', calculateHoverNavMinHeight);


				}


				/**
				* Off canvas menu: slide out from right close from body click on mobile.
				*
				* @since 12.2
				*/
				function OCM_slideOutRightMobileClose() {

					if( $('.slide-out-from-right-hover.open').length > 0 ) {
						$('.slide-out-widget-area-toggle:not(.std-menu) a').first().addClass('non-human-allowed').trigger('click');
						setTimeout(function () {
								$('.slide-out-widget-area-toggle:not(.std-menu) a').removeClass('non-human-allowed');
						}, 100);
					}

				}


				/**
				* Off canvas menu: slide out from right open.
				*
				* @since 10.5
				*/
				function OCM_slideOutRightOpen() {

						var $slideOutAmount = ($bodyBorderTop.length > 0 && $('body.mobile').length == 0) ? $bodyBorderTop.height() : 0;

						var withinCustomBreakpoint = mobileBreakPointCheck();
						if( nectarDOMInfo.winW < 1000 ) {
							withinCustomBreakpoint = true;
						}
						var alignmentPosition = (window.nectarOptions && window.nectarOptions.mobile_header_format && window.nectarOptions.mobile_header_format === 'centered-menu' && withinCustomBreakpoint) ? 'left' : 'right';

						if ($('body.material').length == 0) {

							// Calc height if used bottom meta.
							$('#slide-out-widget-area .inner').css({
								'height': 'auto',
								'min-height': $offCanvasEl.height() - 25 - $('.bottom-meta-wrap').height()
							});

							// First item dropdown?
							if($('#slide-out-widget-area[data-dropdown-func="separate-dropdown-parent-link"] .inner > div:first-of-type > .menu > li:first-child').length > 0 &&
							$('#slide-out-widget-area .inner > div:first-of-type > .menu > li:first-child').hasClass('menu-item-has-children')) {
								$('#slide-out-widget-area .inner > div:first-of-type').css({'margin-top':'50px'});
							}

							if ($('#boxed').length == 0) {

								$('.container-wrap, .home-wrap, #footer-outer:not(#nectar_fullscreen_rows #footer-outer), .nectar-box-roll, #page-header-wrap .page-header-bg-image, #page-header-wrap .nectar-video-wrap, #page-header-wrap .mobile-video-image, #page-header-wrap #page-header-bg > .container, .page-header-no-bg, div:not(.container) > .project-title').stop(true).transition({
									x: (alignmentPosition === 'left' || headerOCMButtonPos === 'left' ) ? '300px' : '-300px'
								}, 700, 'easeInOutCubic');

								var $withinCustomBreakpoint = mobileBreakPointCheck();

								if ($('#header-outer[data-format="centered-logo-between-menu"]').length == 0 || $withinCustomBreakpoint) {

									if ($('#header-outer[data-transparency-option="1"]').length == 0 ||
									($('#header-outer[data-transparency-option="1"]').length > 0 && $('#header-outer[data-full-width="true"]').length == 0) ||
									$('body.mobile').length > 0) {

										$headerOuterEl.stop(true).css('transform', 'translateY(0)').transition({
											x: (alignmentPosition === 'left' || headerOCMButtonPos === 'left' ) ? (300 + $slideOutAmount) + 'px' : '-' + (300 + $slideOutAmount) + 'px'
										}, 700, 'easeInOutCubic');

									} else {

										$headerOuterEl.stop(true).css('transform', 'translateY(0)').transition({
											x: (alignmentPosition === 'left' || headerOCMButtonPos === 'left' ) ? (300 + $slideOutAmount) + 'px' : '-' + (300 + $slideOutAmount) + 'px',
											'background-color': 'transparent',
											'border-bottom': '1px solid rgba(255,255,255,0.22)'
										}, 700, 'easeInOutCubic');

									}
								} else {
									$('#header-outer header#top nav > ul.buttons, body:not(.material) #header-outer:not([data-format="centered-logo-between-menu"]) .cart-outer .cart-menu-wrap').transition({
										x: (alignmentPosition === 'left' || headerOCMButtonPos === 'left' ) ? '300px' : '-300px'
									}, 700, 'easeInOutCubic');
								}

							}


							$offCanvasEl.stop(true).transition({
								x: (alignmentPosition === 'left' || headerOCMButtonPos === 'left' ) ? $slideOutAmount + 'px' : '-' + $slideOutAmount + 'px'
							}, 700, 'easeInOutCubic').addClass('open');


							if ($('#boxed').length == 0) {

								// Full width menu adjustments
								if ($('#header-outer[data-full-width="true"]').length > 0 && !$body.hasClass('mobile')) {
									$headerOuterEl.addClass('highzI');
									$('#ascrail2000').addClass('z-index-adj');

									if ($('#header-outer[data-format="centered-logo-between-menu"]').length == 0) {

										if ($bodyBorderWidth == 0) {

											if( headerOCMButtonPos === 'left' ) {

											} else {
												$('header#top #logo').stop(true).transition({
													x: (300 + $slideOutAmount) + 'px'
												}, 700, 'easeInOutCubic');
											}

										}

									}

									$('header#top .slide-out-widget-area-toggle .lines-button:not(.legacy-double)').addClass('close');

									$('body #header-outer nav > ul > li > a').css({
										'margin-bottom': '0'
									});

								}

							}

							$headerOuterEl.addClass('style-slide-out-from-right');

							// Fade In BG Overlay
							$offCanvasBG.css({
								'height': '100%',
								'width': '100%'
							}).stop(true).transition({
								'opacity': 1
							}, 700, 'easeInOutCubic', function () {
								$('.slide-out-widget-area-toggle:not(.std-menu) > div > a').removeClass('animating');
							});

							// Hide menu if no space
							if ($('#header-outer[data-format="centered-logo-between-menu"]').length == 0) {

								var $logoWidth = ($('#logo img:visible').length > 0) ? $('#logo img:visible').width() : $('#logo').width();

								if ($('header#top nav > .sf-menu').offset().left - $logoWidth - 300 < 20) {
									$headerOuterEl.addClass('hidden-menu');
								}

							} else {
								$headerOuterEl.addClass('hidden-menu-items');
							}


							if ($('#header-outer[data-remove-fixed="1"]').length == 0 && nectarDOMInfo.winW > 1000) {

								if ($bodyBorderHeaderColorMatch == true && headerResize == true && $headerOuterEl.attr('data-transparent-header') == 'true') {

									$headerOuterEl.stop(true).transition({
										y: '0'
									}, 0).addClass('transparent').css('transition', 'transform');


									$window.off('scroll', bigNav);
									$window.off('scroll', smallNav);

								} else if ($bodyBorderHeaderColorMatch == true && $headerOuterEl.attr('data-transparent-header') == 'true') {

									$headerOuterEl.addClass('transparent');
									$window.off('scroll', opaqueCheck);
									$window.off('scroll', transparentCheck);

								}
							}

						} else if ($('body.material').length > 0) {

							// Material theme skin slide out from right

							//move ajax loading outside
							if ($loadingScreenEl.length > 0 && $('.ocm-effect-wrap #ajax-loading-screen').length > 0) {
								$loadingScreenEl.insertBefore('.ocm-effect-wrap');
							}

							// Hide secondary header when not at top with hhun
							if (nectarDOMInfo.scrollTop > 40) {
								$('body[data-hhun="1"] #header-secondary-outer').addClass('hidden');
							}

							setTimeout(function () {
								$('.slide-out-widget-area-toggle:not(.std-menu) > div > a').removeClass('animating');
							}, 300);

							$('#slide-out-widget-area, #slide-out-widget-area-bg, #header-outer .slide-out-widget-area-toggle').addClass('material-open');


							// Handle bottom bar nav
							if ($('body:not(.mobile) #header-outer[data-format="centered-menu-bottom-bar"][data-condense="true"]').length > 0 &&
							$('#header-outer[data-format="centered-menu-bottom-bar"] .span_9').css('display') != 'none') {

								$('#header-outer:not(.fixed-menu)').css('top', nectarDOMInfo.adminBarHeight - nectarDOMInfo.scrollTop + 'px');

								if ($headerSecondaryEl.length > 0 && $('#header-outer.fixed-menu').length > 0) {
									$headerSecondaryEl.css('visibility', 'hidden');
								}

							}

							$('#ajax-content-wrap').css({
								'position': 'relative',
								'top': '-' + nectarDOMInfo.scrollTop + 'px'
							});

							$('.ocm-effect-wrap-inner').css({
								'padding-top': nectarDOMInfo.adminBarHeight
							});

							$('#fp-nav').addClass('material-ocm-open');

							nectarState.materialOffCanvasOpen = true;
							$body.addClass('material-ocm-open');
							$body.addClass('nectar-no-flex-height');

							$('.ocm-effect-wrap').css({
								'height': nectarDOMInfo.winH
							});

							setTimeout(function () {
								$('.ocm-effect-wrap').addClass('material-ocm-open');
							}, 40);


							$('body > .slide_out_area_close').addClass('follow-body');

							//icon effect
							$('#header-outer:not([data-format="left-header"]) header#top .slide-out-widget-area-toggle a').addClass('effect-shown');

							//handle hhun when at top
							$('body[data-hhun="1"]:not(.no-scroll):not(.mobile) #header-outer[data-permanent-transparent="false"]:not(.detached):not(.parallax-contained):not(.at-top-before-box)').css({
								'transition': 'none',
								'transform': 'translateY(' + nectarDOMInfo.adminBarHeight + 'px)'
							});


							setTimeout(function () {
								$('body > .slide_out_area_close').addClass('material-ocm-open');
								$('body > .slide_out_area_close').removeClass('hide_until_rendered');
							}, 350);


						}

            $(window).trigger('nectar-material-ocm-open');

				}


				/**
				* Off canvas menu: slide out from right close.
				*
				* @since 10.5
				*/
				function OCM_slideOutRightClose() {

					if ($('body.material').length == 0) {

						var withinCustomBreakpoint = mobileBreakPointCheck();
						if( nectarDOMInfo.winW < 1000 ) {
							withinCustomBreakpoint = true;
						}
						var alignmentPosition = (window.nectarOptions && window.nectarOptions.mobile_header_format && window.nectarOptions.mobile_header_format === 'centered-menu' && withinCustomBreakpoint) ? 'left' : 'right';

						$('.container-wrap, .home-wrap, #footer-outer:not(#nectar_fullscreen_rows #footer-outer), .nectar-box-roll, #page-header-wrap .page-header-bg-image,  #page-header-wrap .nectar-video-wrap, #page-header-wrap .mobile-video-image, #page-header-wrap #page-header-bg > .container, .page-header-no-bg, div:not(.container) > .project-title').stop(true).transition({
							x: '0px'
						}, 700, 'easeInOutCubic');

						if ($('#header-outer[data-transparency-option="1"]').length > 0 && $('#boxed').length == 0) {
							var $currentRowBG = ($('#header-outer[data-current-row-bg-color]').length > 0) ? $headerOuterEl.attr('data-current-row-bg-color') : $headerOuterEl.attr('data-user-set-bg');
							$headerOuterEl.stop(true).transition({
								x: '0px',
								'background-color': $currentRowBG
							}, 700, 'easeInOutCubic');
						} else {
							$headerOuterEl.stop(true).transition({
								x: '0px'
							}, 700, 'easeInOutCubic');
						}

						$offCanvasEl.stop(true).transition({
							x: (alignmentPosition === 'left' || headerOCMButtonPos === 'left' ) ? '-301px' : '301px'
						}, 700, 'easeInOutCubic').removeClass('open');


						if ($('#boxed').length == 0) {
							if ($('#header-outer[data-full-width="true"]').length > 0) {
								$headerOuterEl.removeClass('highzI');
								$('header#top #logo').stop(true).transition({
									x: '0px'
								}, 700, 'easeInOutCubic');
								$('.lines-button').removeClass('close');

							}
						}

						if ($('#header-outer[data-format="centered-logo-between-menu"]').length > 0) {
							$('#header-outer header#top nav > ul.buttons, #header-outer .cart-outer .cart-menu-wrap').stop(true).transition({
								x: '0px'
							}, 700, 'easeInOutCubic');
						}

						//fade out overlay
						$offCanvasBG.stop(true).transition({
							'opacity': 0
						}, 700, 'easeInOutCubic', function () {

							$('.slide-out-widget-area-toggle a').removeClass('animating');

							$(this).css({
								'height': '1px',
								'width': '1px'
							});

							if ($('#header-outer[data-remove-fixed="1"]').length == 0) {

								//hide menu if transparent, user has scrolled down and hhun is on
								if ($headerOuterEl.hasClass('parallax-contained') &&
								nectarDOMInfo.scrollTop > 0 &&
								$('#header-outer[data-permanent-transparent="1"]').length == 0) {
									$headerOuterEl.removeClass('parallax-contained').addClass('detached').removeClass('transparent');
								}
								else if (nectarDOMInfo.scrollTop == 0 && $('body[data-hhun="1"]').length > 0 && $('#page-header-bg[data-parallax="1"]').length > 0 ||
								nectarDOMInfo.scrollTop == 0 && $('body[data-hhun="1"]').length > 0 && $('.parallax_slider_outer').length > 0) {

									if ($('#header-outer[data-transparency-option="1"]').length > 0) {
										$headerOuterEl.addClass('transparent');
									}

								}

							}

							//fix for fixed subpage menu
							$('.container-wrap').css('transform', 'none');

						});


						$headerOuterEl.removeClass('style-slide-out-from-right');


						if ($('#header-outer[data-remove-fixed="1"]').length == 0) {

							if ($bodyBorderHeaderColorMatch == true &&
								headerResize == true &&
								nectarDOMInfo.winW > 1000) {

								$window.off('scroll.headerResizeEffect');
								if (nectarDOMInfo.scrollTop == 0) {

									$window.on('scroll.headerResizeEffect', smallNav);

									if ($('#header-outer[data-full-width="true"][data-transparent-header="true"]').length > 0 &&
									$bodyBorderTop.length > 0 &&
									$bodyBorderHeaderColorMatch == true &&
									$('#header-outer.pseudo-data-transparent').length > 0) {

										$('#header-outer[data-full-width="true"] header > .container').stop(true, true).animate({
											'padding': '0'
										}, {
											queue: false,
											duration: 250,
											easing: 'easeOutCubic'
										});

									}
								} else {
									$window.on('scroll.headerResizeEffect', bigNav);
								}

								if ($headerOuterEl.hasClass('pseudo-data-transparent')) {

									$headerOuterEl.attr('data-transparent-header', 'false')
										.removeClass('pseudo-data-transparent')
										.removeClass('transparent');
								}

								$headerOuterEl.css('transition', 'transform');

							} else if ($bodyBorderHeaderColorMatch == true && nectarDOMInfo.winW > 1000) {

								$window.off('scroll.headerResizeEffectOpaque');
								$window.on('scroll.headerResizeEffectOpaque', opaqueCheck);

								$headerOuterEl.css('transition', 'transform');

								if ($headerOuterEl.hasClass('pseudo-data-transparent')) {
									$headerOuterEl.attr('data-transparent-header', 'false')
										.removeClass('pseudo-data-transparent')
										.removeClass('transparent');
								}
							}
						}
					}

					else if ($('body.material').length > 0) {

						//material
						$offCanvasEl.removeClass('open');


						$('#slide-out-widget-area, #slide-out-widget-area-bg, #header-outer .slide-out-widget-area-toggle').removeClass('material-open');
						$('.ocm-effect-wrap, .ocm-effect-wrap-shadow, body > .slide_out_area_close, #fp-nav').removeClass('material-ocm-open');

						$('body > .slide_out_area_close').removeClass('follow-body');

						setTimeout(function () {
							$('.slide-out-widget-area-toggle a').removeClass('animating');

							$body.removeClass('material-ocm-open');
							$body.removeClass('nectar-no-flex-height');

							$('.ocm-effect-wrap').css({
								'height': '100%'
							});

							$('.ocm-effect-wrap-inner').css({
								'padding-top': '0'
							});

							$window.scrollTop(Math.abs(parseInt($('#ajax-content-wrap').css('top'))));

							$('#ajax-content-wrap').css({
								'position': '',
								'top': ''
							});


							//handle bottom bar nav
							if ($('#header-outer[data-format="centered-menu-bottom-bar"]').length > 0 &&
							$('#header-outer[data-format="centered-menu-bottom-bar"] .span_9').css('display') != 'none' &&
							$('body.mobile').length == 0) {

								$('#header-outer:not(.fixed-menu)').css('top', '');
								$headerSecondaryEl.css('visibility', '');

							}

							//handle hhun when at top
							$('body[data-hhun="1"]:not(.no-scroll) #header-outer[data-permanent-transparent="false"]:not(.detached):not(.parallax-contained):not(.at-top-before-box)').css({
								'transform': ''
							});
							setTimeout(function () {
								$('body[data-hhun="1"]:not(.no-scroll) #header-outer[data-permanent-transparent="false"]:not(.detached):not(.parallax-contained):not(.at-top-before-box)').css({
									'transition': ''
								});
							}, 30);


							$('body[data-hhun="1"] #header-secondary-outer.hidden').removeClass('hidden');


							nectarState.materialOffCanvasOpen = false;

              $(window).trigger('nectar-material-ocm-close');

						}, 900);

						setTimeout(function () {

							//icon effect
							$('#header-outer:not([data-format="left-header"]) header#top .slide-out-widget-area-toggle a')
								.addClass('no-trans')
								.removeClass('effect-shown');

						}, 200);

						setTimeout(function () {
							//icon
							$('#header-outer:not([data-format="left-header"]) header#top .slide-out-widget-area-toggle a').removeClass('no-trans');
						}, 500);

					}


				}




				/**
				* Off canvas menu: fullscreen open.
				*
				* @since 10.5
				*/
				function OCM_fullscreenOpen() {

					if ($('body.material').length > 0) {
						$('header#top .slide-out-widget-area-toggle a').addClass('menu-push-out');
					}

					// Scroll away from fixed reveal footer if shown (firefox bug with bluring over it)
					var $scrollDelay = 0;
					var $scrollDelay2 = 0;

					if (nectarDOMInfo.scrollTop + $window.height() > $('.blurred-wrap').height() && $('#nectar_fullscreen_rows').length == 0) {
						$('body,html').stop().animate({
							scrollTop: $('.blurred-wrap').height() - $window.height()
						}, 600, 'easeInOutCubic');
						$scrollDelay = 550;
						$scrollDelay2 = 200;
					}

					$('header#top .slide-out-widget-area-toggle:not(.std-menu) .lines-button:not(.legacy-double)').addClass('close');
					setTimeout(function () {
						$('.blurred-wrap').addClass('blurred');
					}, $scrollDelay);
					$('#slide-out-widget-area.fullscreen').show().addClass('open');

					if ($('.nectar-social.fixed').length == 0) {
						hideToTop();
					}

					// Remove box shadow incase at the top of the page with nectar box roll above
					$('.container-wrap').addClass('no-shadow');
					$headerOuterEl.stop(true).css('transform', 'translateY(0)');

					setTimeout(function () {

						$('.off-canvas-menu-container .menu > li').each(function (i) {
							$(this).delay(i * 50).transition({
								y: 0,
								'opacity': 1
							}, 800, 'easeOutExpo');
						});

						$('#slide-out-widget-area.fullscreen .widget').each(function (i) {
							$(this).delay(i * 100).transition({
								y: 0,
								'opacity': 1
							}, 800, 'easeOutExpo');
						});
					}, 370 + $scrollDelay2);

					setTimeout(function () {
						$('#slide-out-widget-area .off-canvas-social-links').addClass('line-shown');

						$('#slide-out-widget-area .off-canvas-social-links li').each(function (i) {
							$(this).delay(i * 50).transition({
								'scale': 1
							}, 400, 'easeOutCubic');
						});

						$('#slide-out-widget-area .bottom-text').transition({
							'opacity': 0.7
						}, 400, 'easeOutCubic');
					}, 750 + $scrollDelay2);

					// Fade In BG Overlay
					setTimeout(function () {
						var $easing = ($('body.mobile').length > 0) ? 'easeOutCubic' : 'easeInOutQuint';
						$offCanvasBG.css({
							'height': '100%',
							'width': '100%'
						}).show().stop(true).transition({
							'y': '0%'
						}, 920, $easing, function () {
							$('.slide-out-widget-area-toggle > div > a').removeClass('animating');
						});
					}, 50 + $scrollDelay2);

					// Overflow state
					OCM_overflowState();

					if ($('.mobile #header-outer[data-permanent-transparent="false"]').length > 0 && $('.container-wrap').hasClass('no-scroll')) {
						$('#ajax-content-wrap').addClass('at-content');
					}

					var headerOffset = $headerOuterEl.offset().top - nectarDOMInfo.scrollTop + nectarDOMInfo.secondaryHeaderHeight;

					$('#slide-out-widget-area.fullscreen > .inner-wrap').css('padding-top', ($headerOuterEl.outerHeight() + headerOffset));


				}


				/**
				* Off canvas menu: fullscreen close.
				*
				* @since 10.5
				*/
				function OCM_fullscreenClose() {

					if ($('body.material').length > 0) {
						setTimeout(function () {
							$('header#top .slide-out-widget-area-toggle a').removeClass('menu-push-out');
						}, 350);
					}

					$('.slide-out-widget-area-toggle:not(.std-menu) .lines-button:not(.legacy-double)').removeClass('close');
					$('.blurred-wrap').removeClass('blurred');
					$('#slide-out-widget-area.fullscreen').transition({
						'opacity': 0
					}, 700, 'easeOutQuad', function () {
						$('#slide-out-widget-area.fullscreen').hide().css('opacity', '1');
					}).removeClass('open');
					$('#slide-out-widget-area.fullscreen .widget').transition({
						'opacity': 0
					}, 700, 'easeOutQuad', function () {
						$(this).transition({
							y: '110px'
						}, 0);
					});

					setTimeout(function () {
						$('.off-canvas-menu-container .menu > li').transition({
							y: '80px',
							'opacity': 0
						}, 0);
						$('#slide-out-widget-area .off-canvas-social-links li').transition({
							'scale': 0
						}, 0);
						$('#slide-out-widget-area .off-canvas-social-links').removeClass('line-shown');
						$('#slide-out-widget-area .bottom-text').transition({
							'opacity': 0
						}, 0);

						// Close submenu items
						$('#slide-out-widget-area .menuwrapper .menu').removeClass('subview');
						$('#slide-out-widget-area .menuwrapper .menu li').removeClass('subview subviewopen');
						$('#slide-out-widget-area.fullscreen .inner .menu-wrap').css('height', 'auto');
					}, 800);

					setTimeout(function () {
						if ($('.nectar-social.fixed').length == 0) {
							showToTop();
						}
						$('.container-wrap').removeClass('no-shadow');
					}, 500);

					// Fade out overlay
					$offCanvasBG.stop(true).transition({
						'opacity': 0
					}, 900, 'easeOutQuad', function () {

						if ($('.mobile #header-outer[data-permanent-transparent="false"]').length > 0 && $('.container-wrap').hasClass('no-scroll')) {
							$('#ajax-content-wrap').removeClass('at-content');
						}
						if ($('.mobile #header-outer[data-permanent-transparent="false"]').length == 0) {
							$('#slide-out-widget-area.fullscreen > .inner-wrap').css('padding-top', '0');
						}

						$('.slide-out-widget-area-toggle a').removeClass('animating');

						var $opacity = 0.4;

						if ($offCanvasBG.hasClass('solid')) {
							$opacity = 1;
						}
						if ($offCanvasBG.hasClass('dark')) {
							$opacity = 0.93;
						}
						if ($offCanvasBG.hasClass('medium')) {
							$opacity = 0.6;
						}
						if ($offCanvasBG.hasClass('light')) {
							$opacity = 0.4;
						}
						$(this).css({
							'height': '1px',
							'width': '1px',
							'opacity': $opacity
						}).transition({
							y: '-100%'
						}, 0);
					});

				}


        /**
				* Off canvas menu: fullscreen alt open.
				*
				* @since 10.5
				*/
				function OCM_fullscreenInlineImagesOpen() {

          var $ocm_fullscreen_class = '.fullscreen-inline-images';

          var portraitView = (nectarDOMInfo.winW < nectarDOMInfo.winH) ? true : false;

					if ($('body[data-contained-header="true"]').length === 0 ) {
						$headerOuterEl.css({
							'z-index':'9990',
							'transition': 'transform 0.3s ease'
						});
					}


          if ($('.nectar-social.fixed').length == 0) {
						hideToTop();
					}

          if ($('body.material').length > 0) {
						$('header#top .slide-out-widget-area-toggle a').addClass('menu-push-out');
					}

					$('header#top .slide-out-widget-area-toggle:not(.std-menu) .lines-button:not(.legacy-double)').addClass('close');
					$('#slide-out-widget-area'+$ocm_fullscreen_class).addClass('open').removeClass('hidden');
					$offCanvasBG.addClass('open').removeClass('hidden');
					$('body > div[class*="body-border"]').css('z-index', '9995');


          // Handle transparent header
          var transparentTimeout = (portraitView) ? 350 : 425;

          setTimeout(function(){

            $headerOuterEl
            .removeClass('side-widget-closed')
            .addClass('side-widget-open');

            if( !headerTransparent ) {
              $headerOuterEl.attr('data-transparent-header', 'true');
							// If starting logo is not supplied.
							if($('#logo .starting-logo:not(.dark-version)').length === 0) {
              	$headerOuterEl.addClass('lighten-logo');
							}
            }

            if (!nectarDOMInfo.usingFrontEndEditor) {
              $headerOuterEl.stop(true).css('transform', 'translateY(0)').addClass('transparent');
            }

            // Dark slide transparent nav
            if ($('#header-outer.dark-slide.transparent').length > 0 && $('#boxed').length == 0 ) {
              $headerOuterEl
                .removeClass('dark-slide')
                .addClass('temp-removed-dark-slide');
            }

            // Switch header state
						if ($('body[data-contained-header="true"]').length === 0 ) {
							setTimeout(function(){

								anime({
									targets: '#header-outer #top > .container',
									opacity: [0, 1],
									duration: 900,
									easing: 'easeOutQuad'
								});

								$headerOuterEl.css({
									'z-index':'',
									'transition': ''
								});


							},50);
						}

        },transparentTimeout);



					$('.off-canvas-menu-container .clip-wrap').css('transition-duration', '0s');


					$offCanvasBG.removeClass('no-transition');

					setTimeout(function () {
						$('.slide-out-widget-area-toggle > div > a').removeClass('animating');
					}, 600);


					if ($('.mobile #header-outer[data-permanent-transparent="false"]').length > 0 &&
					$('.container-wrap').hasClass('no-scroll')) {
						$('#ajax-content-wrap').addClass('at-content');
					}

					var fullScreenTopPadding = $headerOuterEl.outerHeight();
					if( $('body[data-contained-header="true"]').length > 0 ) {
						fullScreenTopPadding = $headerOuterEl.outerHeight() * 2;
					}
					$('#slide-out-widget-area'+$ocm_fullscreen_class+' > .inner-wrap').css('padding-top', fullScreenTopPadding);

        }


				/**
				* Off canvas menu: fullscreen alt open.
				*
				* @since 10.5
				*/
				function OCM_fullscreenAltOpen() {

					var $ocm_fullscreen_class = '.fullscreen-alt';

					if($offCanvasEl.hasClass('fullscreen-split')) {
						$ocm_fullscreen_class = '.fullscreen-split';
					}

					if ($('body.material').length > 0) {
						$('header#top .slide-out-widget-area-toggle a').addClass('menu-push-out');
					}

					$('header#top .slide-out-widget-area-toggle:not(.std-menu) .lines-button:not(.legacy-double)').addClass('close');

					if( $ocm_fullscreen_class === '.fullscreen-alt' ) {
						$('#slide-out-widget-area'+$ocm_fullscreen_class).show().addClass('open');
					} else {
						$('#slide-out-widget-area'+$ocm_fullscreen_class).addClass('open').removeClass('hidden');
					}

					$offCanvasBG.addClass('open').removeClass('hidden');

					$('body > div[class*="body-border"]').css('z-index', '9995');

					if( $ocm_fullscreen_class === '.fullscreen-alt' ) {
						$('.off-canvas-menu-container .menu').transition({
							y: '0px',
							'opacity': 1
						}, 0);
					}

					if ($('.nectar-social.fixed').length == 0) {
						hideToTop();
					}

					if ($('#header-outer.transparent').length > 0) {

						if ($bodyBorderTop.length > 0) {
							$('.admin-bar #slide-out-widget-area-bg'+$ocm_fullscreen_class).css({
								'padding-top': ($bodyBorderTop.outerHeight(true) + 32) + 'px'
							});
							$('body:not(.admin-bar) #slide-out-widget-area-bg'+$ocm_fullscreen_class).css({
								'padding-top': ($bodyBorderTop.outerHeight(true)) + 'px'
							});
						}
					}

					// Set translateY to 0 in all cases
					$headerOuterEl.stop(true).css('transform', 'translateY(0)');

					if ($window.width() > 1000 &&
					$('#header-outer[data-format="centered-menu-bottom-bar"].fixed-menu').length == 0 &&
					$('body.material #header-outer[data-condense="true"]').length == 0 &&
					$headerOuterEl.attr('data-transparent-header') == 'true' &&
					!nectarDOMInfo.usingFrontEndEditor) {

            if( $('#logo .starting-logo').length > 0 || $('#logo.no-image').length > 0 ) {

              $headerOuterEl.stop(true).css('transform', 'translateY(0)').addClass('transparent');

            }

					}

					$('.off-canvas-menu-container .clip-wrap').css('transition-duration', '0s');

					if( $ocm_fullscreen_class === '.fullscreen-alt' ) {

						setTimeout(function () {

							$('.off-canvas-menu-container .menu > li').each(function (i) {
								$(this).delay(i * 50).transition({
									y: 0,
									'opacity': 1
								}, 750, 'easeOutCubic').addClass('no-pointer-events');
							});

							setTimeout(function () {
								$('.off-canvas-menu-container .menu > li').removeClass('no-pointer-events');
								$('.off-canvas-menu-container .clip-wrap').css('transition-duration', '.45s');
							}, 500);

							$('#slide-out-widget-area.fullscreen-alt .widget').each(function (i) {
								$(this).delay(i * 100).transition({
									y: 0,
									'opacity': 1
								}, 650, 'easeOutCubic');
							});

						}, 200);

						setTimeout(function () {
							$('#slide-out-widget-area .off-canvas-social-links').addClass('line-shown');

							$('#slide-out-widget-area .off-canvas-social-links li').css('opacity', '1').each(function (i) {
								$(this).delay(i * 50).transition({
									'scale': 1
								}, 400, 'easeOutCubic');
							});
							$('#slide-out-widget-area .bottom-text').transition({
								'opacity': 1
							}, 600, 'easeOutCubic');
						}, 200);

					}

					// Fade In BG Overlay
					var $opacity = 0.4;

					if ($offCanvasBG.hasClass('solid')) {
						$opacity = 1;
					}
					if ($offCanvasBG.hasClass('dark')) {
						$opacity = 0.97;
					}
					if ($offCanvasBG.hasClass('medium')) {
						$opacity = 0.6;
					}
					if ($offCanvasBG.hasClass('light')) {
						$opacity = 0.4;
					}
					$offCanvasBG.removeClass('no-transition');


					if( $ocm_fullscreen_class === '.fullscreen-alt' ) {

						$offCanvasBG.addClass('padding-removed').css({
							'height': '100%',
							'width': '100%',
							'left': '0',
							'opacity': $opacity
						});

						// Overflow state
						OCM_overflowState();

					}

					setTimeout(function () {
						$('.slide-out-widget-area-toggle > div > a').removeClass('animating');
					}, 600);


					if ($('.mobile #header-outer[data-permanent-transparent="false"]').length > 0 &&
					$('.container-wrap').hasClass('no-scroll')) {
						$('#ajax-content-wrap').addClass('at-content');
					}

					var fullScreenTopPadding = $headerOuterEl.outerHeight();
					if( $('body[data-contained-header="true"]').length > 0 ) {
						fullScreenTopPadding = $headerOuterEl.outerHeight() * 1.5;
					}

					if( $ocm_fullscreen_class === '.fullscreen-alt' ) {

						var headerOffset = $headerOuterEl.offset().top - nectarDOMInfo.scrollTop + nectarDOMInfo.secondaryHeaderHeight;

						$('#slide-out-widget-area'+$ocm_fullscreen_class+' > .inner-wrap').css('padding-top', ($headerOuterEl.outerHeight() + headerOffset));

					} else {
						$('#slide-out-widget-area'+$ocm_fullscreen_class+' > .inner-wrap').css('padding-top', fullScreenTopPadding);
					}

				}


				/**
				* Off canvas menu: fullscreen alt close.
				*
				* @since 10.5
				*/
				function OCM_fullscreenAltClose() {

					var $ocm_fullscreen_class = '.fullscreen-alt';

					if( $offCanvasEl.hasClass('fullscreen-inline-images') ) {
						$ocm_fullscreen_class = '.fullscreen-inline-images';

						$headerOuterEl.css({
							'z-index':'9990',
							'transition': 'transform 0.3s ease'
						});
						setTimeout(function(){
							$headerOuterEl.css({
								'z-index':'',
								'transition': ''
							});
						},450);


            if( !headerTransparent ) {
              $headerOuterEl.removeClass('lighten-logo');
              $headerOuterEl.attr('data-transparent-header', '').removeClass('transparent');
            }

						setTimeout(function () {

								// Close submenu items
								$('#slide-out-widget-area .menuwrapper .menu').removeClass('subview');
								$('#slide-out-widget-area .menuwrapper .menu li').removeClass('subview subviewopen');
								$('#slide-out-widget-area.fullscreen-alt .inner .menu-wrap').css('height', 'auto');

						}, 550);

					} else if($offCanvasEl.hasClass('fullscreen-split')) {
						$ocm_fullscreen_class = '.fullscreen-split';
					}

					if ($('body.material').length > 0) {
						setTimeout(function () {
							$('header#top .slide-out-widget-area-toggle a').removeClass('menu-push-out');
						}, 350);
					}

					$('.slide-out-widget-area-toggle:not(.std-menu) .lines-button:not(.legacy-double)').removeClass('close');


					$offCanvasBG.removeClass('open');

					if( $ocm_fullscreen_class === '.fullscreen-split' ||
					    $ocm_fullscreen_class === '.fullscreen-inline-images' ) {
						setTimeout(function () {
							$offCanvasBG.addClass('hidden');
							$('#slide-out-widget-area'+$ocm_fullscreen_class).addClass('hidden');
						},550);
					}

					if( $ocm_fullscreen_class === '.fullscreen-alt' ) {

						$('.blurred-wrap').removeClass('blurred');

						$('#slide-out-widget-area.fullscreen-alt .widget').transition({
							'opacity': 0
						}, 500, 'easeOutQuad', function () {
							$(this).transition({
								y: '40px'
							}, 0);
						});
						$('#slide-out-widget-area .bottom-text, #slide-out-widget-area .off-canvas-social-links li').transition({
							'opacity': 0
						}, 250, 'easeOutQuad');
						$('#slide-out-widget-area .off-canvas-social-links').removeClass('line-shown');

						$('.off-canvas-menu-container .menu').transition({
							y: '-13px',
							'opacity': 0
						}, 400);

					}


					setTimeout(function () {

						if( $ocm_fullscreen_class === '.fullscreen-alt' ) {

							$('.off-canvas-menu-container .menu > li').stop(true, true).transition({
								y: '40px',
								'opacity': 0
							}, 0);
							$('#slide-out-widget-area .off-canvas-social-links li').transition({
								'scale': 0
							}, 0);
							$('#slide-out-widget-area .off-canvas-social-links').removeClass('line-shown');

							// Close submenu items
							$('#slide-out-widget-area .menuwrapper .menu').removeClass('subview');
							$('#slide-out-widget-area .menuwrapper .menu li').removeClass('subview subviewopen');
							$('#slide-out-widget-area.fullscreen-alt .inner .menu-wrap').css('height', 'auto');

							$offCanvasBG.css({
								'height': '1px',
								'width': '1px',
								'left': '-100%'
							});

						}

						if ($('.mobile #header-outer[data-permanent-transparent="false"]').length > 0 && $('.container-wrap').hasClass('no-scroll')) {
							$('#ajax-content-wrap').removeClass('at-content');
						}

						if ($('.mobile #header-outer[data-permanent-transparent="false"]').length == 0) {
							$('#slide-out-widget-area'+$ocm_fullscreen_class+' .inner-wrap').css('padding-top', '0');
						}

						$('.slide-out-widget-area-toggle a').removeClass('animating');

						if( $ocm_fullscreen_class === '.fullscreen-alt' ) {
							$('#slide-out-widget-area'+$ocm_fullscreen_class).hide().removeClass('open');
						}

					}, 550);

					if( $ocm_fullscreen_class === '.fullscreen-split' ||
					    $ocm_fullscreen_class === '.fullscreen-inline-images' ) {
						$('#slide-out-widget-area'+$ocm_fullscreen_class).removeClass('open');
					}

					setTimeout(function () {
						if ($('.nectar-social.fixed').length == 0) {
							showToTop();
						}
					}, 600);

					// Fade out overlay
					setTimeout(function () {
						$offCanvasBG.removeClass('padding-removed');
					}, 50);


					var borderDelay = ($bodyBorderHeaderColorMatch == true) ? 150 : 50;

					setTimeout(function () {

						if( $ocm_fullscreen_class === '.fullscreen-alt' ) {
							$offCanvasBG.stop(true).css({
								'opacity': 0
							});
						}
						if ($('#header-outer[data-transparent-header="true"]').length > 0) {
							$('body > div[class*="body-border"]').css('z-index', '10000');
						}
					}, borderDelay);

          var rmTransparentTimeout = ( $ocm_fullscreen_class == '.fullscreen-inline-images' ) ? 0 : 100;
					setTimeout(function () {
						$('#header-outer:not([data-permanent-transparent="1"]).transparent.small-nav, body[data-hhun="1"] #header-outer:not([data-permanent-transparent="1"]).transparent.scrolling, #header-outer:not([data-permanent-transparent="1"]).transparent.scrolled-down').removeClass('transparent');

						if ($headerOuterEl.hasClass('pseudo-data-transparent')) {

							$headerOuterEl.attr('data-transparent-header', 'false')
								.removeClass('pseudo-data-transparent')
								.removeClass('transparent');
						}

					}, rmTransparentTimeout);

				}


				/**
				* Off canvas menu: simple dropdown open.
				*
				* @since 10.5
				*/
				function OCM_simpleDropdownOpen(classname) {

					$('#mobile-menu').show();

					$('header#top').find('.'+classname+':not(.std-menu) .lines-button').addClass('close');

					$('#header-outer').addClass('simple-ocm-open');

					if ($('body.material').length > 0) {
						$('header#top').find('.'+classname+' a').addClass('menu-push-out');
					}

					setTimeout(function () {
						$('header#top').find('.'+classname+' > div > a').removeClass('animating');
					}, 100);

				}

				/**
				* Off canvas menu: simple dropdown close.
				*
				* @since 10.5
				*/
				function OCM_simpleDropdownClose(classname) {

					$('#mobile-menu').hide();

					$('body').find('.'+classname+':not(.std-menu) .lines-button').removeClass('close');

					$('#header-outer').removeClass('simple-ocm-open');

					setTimeout(function () {
						if ($('body.material').length > 0) {
							$('header#top .'+classname+' a').removeClass('menu-push-out');
						}
						$('body').find('.'+classname+' a').removeClass('animating');
					}, 350);
				}


				/**
				* Off canvas menu: simple dropdown click events.
				*
				* @since 10.5
				*/
				function OCM_simpleStyleInit() {

					if( $('#header-outer #mobile-menu').length == 0 ) {
						return;
					}

					$('#header-outer #mobile-menu li.megamenu').removeClass('megamenu');

					// Add icons/markup.
					$('#header-outer #mobile-menu ul li a').each(function() {
						if( !$(this).hasClass('nectar-widget-link') && $(this).find('.nectar-ext-menu-item').length == 0 ) {
							$(this).wrapInner('<span></span>');
						}
					});

					$('#header-outer #mobile-menu ul li').each(function(){

						if($(this).find('> ul').length > 0 || $(this).find('> .nectar-global-section-megamenu').length > 0) {
							$(this).find('> a').append('<span class="sf-sub-indicator"><i class="fa fa-angle-down"></i></span>');
						}

					});

					// Click event.
					$('#header-outer #mobile-menu').on('click', '.sf-sub-indicator', function(){

						var $parentLI = $(this).parent().parent();

						$parentLI.toggleClass('current-open-item');

						// Open.
						if( $parentLI.hasClass('current-open-item') ) {
							$parentLI.find('> ul, > .nectar-global-section-megamenu').show();
							setTimeout(function(){
								$parentLI.addClass('visible');
							},30);
						} else {
							// Close.
							$parentLI.find('ul, .nectar-global-section-megamenu').hide();
							// Ensure open children also close.
							$parentLI.find('li').removeClass('visible').removeClass('current-open-item');
							$parentLI.removeClass('visible');
						}

						return false;

					});

					// Resize event.
					$window.on('smartresize', function(){

						if( nectarDOMInfo.winW > 1000 && $('.slide-out-widget-area-toggle.mobile-icon a.open').length > 0 ||
					      nectarDOMInfo.winW > 1000 && $('.nectar-ocm-trigger-open.simple-mobile-menu a.open').length > 0) {

						$('.slide-out-widget-area-toggle.mobile-icon a, .nectar-ocm-trigger-open.simple-mobile-menu a').addClass('non-human-allowed');


						$('.slide-out-widget-area-toggle.mobile-icon a.open, .nectar-ocm-trigger-open.simple-mobile-menu a.open').trigger('click');

							setTimeout(function () {
									$('.slide-out-widget-area-toggle.mobile-icon a, .nectar-ocm-trigger-open.simple-mobile-menu a').removeClass('non-human-allowed');
							}, 100);

						}

					});

				}


				/**
				* Off canvas menu click triggered styles initialization
				*
				* @since 10.5
				*/
				function OCM_clickTriggeredStylesInit() {

					// trigger OCM open when clicked from delay JS
					if ( window.nectarOcmOpen ) {
						nectarOcmOpenCallback();
					}

					// Click triggered open bind.
          $body.on('click', '.slide-out-widget-area-toggle:not(.std-menu) a.closed.animating', function(){
            return false;
          });

					$body.on('click touchend', '.slide-out-widget-area-toggle:not(.std-menu) a.closed:not(.animating), .nectar-ocm-trigger-open',nectarOcmOpenCallback);

					function nectarOcmOpenCallback() {

						if ( nectarState.ocmAnimating ||
                 nectarBoxRoll.animating == 'true' ||
                 $('.slide-out-from-right-hover').length > 0) {
							return false;
						}


            var ocmAnimationTimeout = 700;

            nectarState.ocmOpen = true;

            OCM_convertExtItems();

						$headerOuterEl.removeClass('no-transition');

						// Classic Mobile Direct Custom Link.
						if( $(this).hasClass('simple-mobile-menu')) {
							OCM_simpleDropdownOpen('simple-mobile-menu');
							$(this).find('a').addClass('open');
							return false;
						}

						// Slide out from right.
						if ($offCanvasEl.hasClass('slide-out-from-right')) {
							OCM_slideOutRightOpen();
						}
						// Fullscreen.
						else if ($offCanvasEl.hasClass('fullscreen')) {
							OCM_fullscreenOpen();
						}
						// Fullscreen Alt.
						else if ($offCanvasEl.hasClass('fullscreen-alt') ||
								$offCanvasEl.hasClass('fullscreen-split') ) {
							OCM_fullscreenAltOpen();
						}
            else if( $offCanvasEl.hasClass('fullscreen-inline-images') ) {
              OCM_fullscreenInlineImagesOpen();
              ocmAnimationTimeout = 1100;
            }
						// Simple dropdown.
						else if( $('#header-outer #mobile-menu').length > 0 ) {
							ocmAnimationTimeout = 150;
							OCM_simpleDropdownOpen('slide-out-widget-area-toggle');
						}

            nectarState.ocmAnimating = true;
            setTimeout(function(){
              nectarState.ocmAnimating = false;
            }, ocmAnimationTimeout );

						// Add open class
						if( $('#header-outer #mobile-menu').length == 0 && !$offCanvasEl.hasClass('fullscreen-inline-images') ) {

							$headerOuterEl
								.removeClass('side-widget-closed')
								.addClass('side-widget-open');


							// Give header transparent state
              if ($('#header-outer[data-transparency-option="1"]').length > 0 &&
              $('#boxed').length == 0 &&
              $('#header-outer[data-full-width="true"]').length > 0 &&
              !nectarDOMInfo.usingFrontEndEditor) {

                if ($('body.material[data-slide-out-widget-area-style="slide-out-from-right"]').length == 0 &&
                $('body.material #header-outer[data-condense="true"]').length == 0) {

                  $headerOuterEl.addClass('transparent');

                }

              }

              // Dark slide transparent nav
              if ($('#header-outer.dark-slide.transparent').length > 0 &&
              $('#boxed').length == 0 &&
              $('body.material-ocm-open').length == 0) {
                $headerOuterEl
                  .removeClass('dark-slide')
                  .addClass('temp-removed-dark-slide');
              }


						} // Not using incompatible OCM.


						$('.slide-out-widget-area-toggle:not(.simple-mobile-menu) > div > a')
							.removeClass('closed')
							.addClass('open')
							.attr('aria-expanded','true');

						$('.slide-out-widget-area-toggle:not(.simple-mobile-menu) > div > a').addClass('animating');

						$(window).trigger('nectar-ocm-open');

						return false;

					}


					// Close event bind.
          $body.on('click', '.slide-out-widget-area-toggle:not(.std-menu) a.open.animating', function () {
            return false;
          });

					$body.on('click', '.slide-out-widget-area-toggle:not(.std-menu) a.open:not(.animating), .nectar-ocm-trigger-open a.open, #slide-out-widget-area .slide_out_area_close, > .slide_out_area_close, #slide-out-widget-area-bg.slide-out-from-right, .material-ocm-open #ajax-content-wrap, #ajax-content-wrap.ios-ocm-style-open', function (e) {


						if (e.originalEvent == undefined &&
							$('.slide_out_area_close.non-human-allowed').length == 0 &&
							$('.slide-out-widget-area-toggle.mobile-icon a.non-human-allowed').length == 0) {
							return;
						}

						if ( nectarState.ocmAnimating || $('.slide-out-widget-area-toggle:not(.std-menu) a.animating').length > 0) {
							return false;
						}

            nectarState.ocmOpen = false;

						$headerOuterEl.removeClass('no-transition');

						// Classic Mobile Direct Custom Link.
						if( $(this).parents('.simple-mobile-menu').length > 0 ) {
							OCM_simpleDropdownClose('simple-mobile-menu');
							$(this).removeClass('open');
							return false;
						}

						$('.slide-out-widget-area-toggle:not(.std-menu):not(.simple-mobile-menu) a')
							.removeClass('open')
							.addClass('closed')
							.attr('aria-expanded','false');

						$('.slide-out-widget-area-toggle:not(.simple-mobile-menu):not(.std-menu) a')
							.addClass('animating');

						// Slide out from right.
						if ($offCanvasEl.hasClass('slide-out-from-right')) {
							OCM_slideOutRightClose();
						}

						// Fullscreen.
						else if ($offCanvasEl.hasClass('fullscreen')) {
							OCM_fullscreenClose();
						}
						// Fullscreen alt.
						else if ($offCanvasEl.hasClass('fullscreen-alt') ||
								 $offCanvasEl.hasClass('fullscreen-split') ||
								 $offCanvasEl.hasClass('fullscreen-inline-images')) {
							OCM_fullscreenAltClose();
						}
						// Simple dropdown.
						else if( $('#header-outer #mobile-menu').length > 0 ) {
							OCM_simpleDropdownClose('slide-out-widget-area-toggle');
						}

						if( $('#header-outer #mobile-menu').length == 0 ) {

							// Dark slide transparent nav
							if ($('#header-outer.temp-removed-dark-slide.transparent').length > 0 && $('#boxed').length == 0) {
								$headerOuterEl
									.removeClass('temp-removed-dark-slide')
									.addClass('dark-slide');
							}

							// Remove header transparent state
							if ($('#header-outer[data-permanent-transparent="1"]').length == 0 && $('#slide-out-widget-area.fullscreen-alt').length == 0) {

								if ($('.nectar-box-roll').length == 0) {
									if ($('#header-outer.small-nav').length > 0 ||
									$('#header-outer.scrolled-down').length > 0) {
										$headerOuterEl.removeClass('transparent');
									}
								}
								else {
									if ($('#header-outer.small-nav').length > 0 ||
									$('#header-outer.scrolled-down').length > 0 ||
									$('.container-wrap.auto-height').length > 0) {
										$headerOuterEl.removeClass('transparent');
									}
								}

							}

							// Remove hidden menu
							$headerOuterEl.removeClass('hidden-menu');

							$headerOuterEl
								.removeClass('side-widget-open')
								.addClass('side-widget-closed');

						} // Not using simple OCM.

						$(window).trigger('nectar-ocm-close');

						return false;

					});

          /** ocm inline images */
          if( $offCanvasEl.hasClass('fullscreen-inline-images') ) {

            // Current page item.
            var currentItemClasses = '';
						if( $('#slide-out-widget-area .off-canvas-menu-container .menu > li[class*="current"]').length > 0 ) {
							currentItemClasses = $('#slide-out-widget-area .off-canvas-menu-container .menu > li[class*="current"]').attr('class');
						}

						var currentID = extractMenuIdClassname(currentItemClasses);

            if( $('.nectar-ocm-image.'+currentID).length > 0 ) {
              $('.nectar-ocm-image.default').remove();
              $('.nectar-ocm-image.'+currentID).addClass('current');
            }

            // Mouse event.
						$('.off-canvas-menu-container .menu > .menu-item-has-children > a').on('click',function(e) {
							var classes = $(this).parent().attr('class');
							var id = extractMenuIdClassname(classes);
              if( $('.nectar-ocm-image.'+id).length > 0 ) {
								$('.nectar-ocm-image.'+id).addClass('active-hold');
                $('.nectar-ocm-image.current:not(.active-hold)').addClass('hidden');
              }
						});
						$('body').on('mousedown', '.off-canvas-menu-container .menu > .menu-item-has-children > ul > .back', function(e) {
							setTimeout(function(){
								$('.nectar-ocm-image').removeClass('active-hold');
							},400);
						});

            $('#slide-out-widget-area .off-canvas-menu-container li[class]').on('mouseenter',function(){
              var classes = $(this).attr('class');
							var id = extractMenuIdClassname(classes);

							if($('.nectar-ocm-image.active-hold').length === 0) {
								$('.nectar-ocm-image.'+id).addClass('active');
								if( $('.nectar-ocm-image.'+id).length > 0 ) {
									$('.nectar-ocm-image.current:not(.active)').addClass('hidden');
								}
							}
            });
            $('#slide-out-widget-area .off-canvas-menu-container li').on('mouseleave',function() {
							// don't remove when a sub menu is opened.
							if($('.nectar-ocm-image.active-hold').length === 0) {
									$('.nectar-ocm-image.active').removeClass('active');
              		$('.nectar-ocm-image.current').removeClass('hidden');
							}
            });
          }

				}

				function extractMenuIdClassname(classAttr) {

					var currentItemClassesArr = classAttr.split(' ');
					var currentID = currentItemClassesArr.filter(function(classname) {

						if(/[0-9]+$/.test(classname) && classname.indexOf('menu-item') !== -1 ) {
							return true;
						}

						return false;
					});

					if(currentID.length !== 1 ) {
						return 'not-found';
					}

					return currentID.join('');
				}


				/**
				* Off canvas menu main initialization.
				*
				* @since 10.5
				*/
				function OCM_init() {

					// simplify ocm on mobile.
					if ( bodyBorderVignette && $body.hasClass('material') && $offCanvasEl.hasClass('slide-out-from-right') ||
							window.nectarOptions &&
							window.nectarOptions.simplify_ocm_mobile === '1' &&
							nectarDOMInfo.usingMobileBrowser &&
							$offCanvasEl.hasClass('slide-out-from-right') && $('body.material').length > 0 ) {

							$('body').attr('data-slide-out-widget-area-style', 'slide-out-from-right-hover');

							$offCanvasEl.removeClass('slide-out-from-right');
							$offCanvasEl.addClass('slide-out-from-right-hover').addClass('ios-ocm-style');

							if ( bodyBorderVignette ) {
								$('body').on('click', '#ajax-content-wrap.ios-ocm-style-open', function () {
									$('.slide-out-widget-area-toggle a').trigger('click');
								});
							}

							$('#slide-out-widget-area .inner > .widget').wrapAll('<div class="bottom-meta-wrap"></div>');

					}


					if ($('#slide-out-widget-area.slide-out-from-right-hover').length > 0) {
						OCM_slideOutRightHoverInit();
					} else {
						OCM_clickTriggeredStylesInit();
						OCM_simpleStyleInit();
					}

					if( $('#slide-out-widget-area').hasClass('fullscreen-inline-images') ) {
						if( $('.off-canvas-menu-container .menu > li > a span.wrap').length == 0 ) {
							$('.off-canvas-menu-container .menu > li a').wrapInner('<span class="wrap"></span>');
						}
					}

					if ($('#slide-out-widget-area.fullscreen-split').length == 0 &&
					$('body.material[data-slide-out-widget-area-style*="slide-out-from-right"]').length == 0 &&
					$('#slide-out-widget-area[data-dropdown-func="separate-dropdown-parent-link"]').length == 0) {

						fullscreenMenuInit();

					} else if ($('body.using-mobile-browser[data-slide-out-widget-area-style="slide-out-from-right-hover"]').length > 0) {

						// Close OCM on mobile when clicking anchor on same page
						$('body #slide-out-widget-area .inner .off-canvas-menu-container li a[href*="#"]').on('click', function () {
							if ($(this).attr('href') != '#') {
								OCM_close($(this).parent());
							}
						});

					}

					// Page fullscreen row close OCM fullscreen/classic slide out from right
					if ($('#nectar_fullscreen_rows').length > 0 && ($('body[data-slide-out-widget-area-style*="fullscreen"]').length > 0 || $('body[data-slide-out-widget-area-style="slide-out-from-right"]:not(.material)').length > 0) ) {

						$('body #slide-out-widget-area .inner .off-canvas-menu-container li a[href]').on('click', function () {

							var $link_href = ($(this).is('[href*="#"]')) ? $(this).attr('href') : '';
							if ($link_href != '#' && $('div[data-fullscreen-anchor-id="' + $link_href.substr($link_href.indexOf("#") + 1) + '"]').length > 0) {

								setTimeout(function () {

									$('#slide-out-widget-area .slide_out_area_close')
										.addClass('non-human-allowed')
										.trigger('click');

								}, 100);

								setTimeout(function () {
									$('#slide-out-widget-area .slide_out_area_close').removeClass('non-human-allowed');
								}, 150);

							}

						});
					}


					// Submenu link hover fix
					$body.on('mouseover', '#slide-out-widget-area .off-canvas-menu-container .menuwrapper > .sub-menu li > a', function () {
						var $currentTxt = $(this).text();
						$('.off-canvas-menu-container .menuwrapper .menu li > a').removeClass('hovered');
						$('.off-canvas-menu-container .menuwrapper .menu li > a:contains(' + $currentTxt + ')').addClass('hovered');
					});

					$body.on('mouseover', '.off-canvas-menu-container .menuwrapper .menu li > a', function () {
						$('.off-canvas-menu-container .menuwrapper .menu li > a').removeClass('hovered');
					});


				}




				/**
				* Off canvas menu close.
				*
				* @since 10.5
				*/
				function OCM_close(item) {

					if ($('#slide-out-widget-area.open').length > 0) {

						var $windowCurrentLocation = window.location.href.split("#")[0];
						var $windowClickedLocation = item.find('> a').attr('href').split("#")[0];

						if ($windowCurrentLocation == $windowClickedLocation || item.find('a[href^="#"]').length > 0) {
							if (item.parents('.slide-out-from-right-hover').length > 0) {
								$('.slide-out-widget-area-toggle.slide-out-hover-icon-effect a').trigger('click');
							} else {
								$('.slide-out-widget-area-toggle a').addClass('non-human-allowed').trigger('click');
								setTimeout(function () {
									$('.slide-out-widget-area-toggle a').removeClass('non-human-allowed');
								}, 100);
							}

						}
					}

				}




				/**
				* Click based submenus.
				*
				* Used by left header layout and off canvas menu.
				*
				* @since 10.5
				*/
				function clickToggleSubmenus() {

					if (!$('#header-outer[data-format="left-header"]').length > 0 &&
					!$('body.material[data-slide-out-widget-area-style*="slide-out-from-right"]').length > 0 &&
					!$('#slide-out-widget-area.fullscreen-split').length > 0 &&
					!$('#slide-out-widget-area[data-dropdown-func="separate-dropdown-parent-link"]').length > 0) {
						return;
					}

					// Remove megamenu class.
					$('#header-outer[data-format="left-header"] nav li.megamenu').removeClass('nectar-megamenu-menu-item').removeClass('megamenu');

					var $ocm_link_selector;

					if ($('#slide-out-widget-area[data-dropdown-func="separate-dropdown-parent-link"]').length > 0) {
						$ocm_link_selector = '#slide-out-widget-area .off-canvas-menu-container li.menu-item-has-children > .ocm-dropdown-arrow';
					} else {
						$ocm_link_selector = 'body.material #slide-out-widget-area[class*="slide-out-from-right"] .off-canvas-menu-container li.menu-item-has-children > a, #slide-out-widget-area.fullscreen-split .off-canvas-menu-container li.menu-item-has-children > a';
					}

					var left_header_selector = '#header-outer[data-format="left-header"] nav li.menu-item-has-children > a';
					var lh_dropdown_func = ( window.nectarOptions && window.nectarOptions.left_header_dropdown_func ) ? window.nectarOptions.left_header_dropdown_func : 'default';
					if( lh_dropdown_func === 'separate-dropdown-parent-link' ) {
						left_header_selector = '#header-outer[data-format="left-header"] nav li.menu-item-has-children > a .sf-sub-indicator';
					}

					// Click event.
					$(left_header_selector + ', ' + $ocm_link_selector).on('click', function () {

						var $parentSelector = $(this).parent();
						if( lh_dropdown_func === 'separate-dropdown-parent-link' ) {
							$parentSelector = $(this).closest('.menu-item');
						}

						if ($parentSelector.hasClass('open-submenu')) {
							$parentSelector.find('.sub-menu').css({
								'max-height': '0'
							});
							$parentSelector.removeClass('open-submenu');
						} else {

							// Get max height.
							var $that = $(this);
							var $maxSubMenuHeight;

							$parentSelector
								.find('> .sub-menu')
								.addClass('no-trans');

							setTimeout(function () {

								$parentSelector.find('> .sub-menu').css({
									'max-height': 'none',
									'position': 'absolute',
									'visibility': 'hidden'
								});

								$maxSubMenuHeight = $parentSelector.find('> .sub-menu').height();

								$parentSelector
									.find('> .sub-menu')
									.removeClass('no-trans');

								$parentSelector.find('> .sub-menu').css({
									'max-height': '0',
									'position': 'relative',
									'visibility': 'visible'
								});

							}, 25);

							setTimeout(function () {

								// Reset Max Height.
								$that.closest('ul')
									.find('li.menu-item-has-children')
									.removeClass('open-submenu');

								$that.closest('ul').find('li.menu-item-has-children > .sub-menu').css({
									'max-height': '0'
								});

								$parentSelector.addClass('open-submenu');

								$parentSelector
									.find('> .sub-menu')
									.css('max-height', $maxSubMenuHeight);

								// Add height to open parents.
								if ($that.parents('ul').length > 0) {

									$that.parents('ul:not(.sf-menu)').each(function () {
										$(this).css('max-height');
										$(this).css('max-height', parseInt($(this).height() + parseInt($(this).css('padding-top')) * 2 + $maxSubMenuHeight) + 'px');
									});
								}


							}, 50);
						}

						return false;

					});

					// Start open for current page items.
					var $topLevelAncestor = $('#header-outer[data-format="left-header"] nav .sf-menu > .current-menu-ancestor.menu-item-has-children');

					if( $topLevelAncestor.length > 0 && $topLevelAncestor.find('.current-menu-item').length > 0 ) {

						$topLevelAncestor.find('ul').css('transition','none');

						var $activeAncestors = $topLevelAncestor.find('.current-menu-item').parents('.current-menu-ancestor.menu-item-has-children');
						$activeAncestors = Array.from($activeAncestors);


						if( lh_dropdown_func === 'separate-dropdown-parent-link' ) {
							$activeAncestors.reverse().forEach(function(el){
								$(el).find('> a .sf-sub-indicator').trigger('click');
							});
						} else {
							$activeAncestors.reverse().forEach(function(el){
								$(el).find('> a').trigger('click');
							});
						}

						setTimeout(function(){
							$topLevelAncestor.find('ul').css('transition','');
						},100);

					}



				}




				/**
				* DLMenu - plugin used for submenus in off canvas menu.
				*
				* @since 6.0
				*/
				$.DLMenu = function (options, element) {
					this.$el = $(element);
					this._init(options);
				};

				// the options
				$.DLMenu.defaults = {
					// classes for the animation effects
					animationClasses: {
						classin: 'dl-animate-in-1',
						classout: 'dl-animate-out-1'
					},
					onLevelClick: function () {
						return false;
					},
					onLinkClick: function () {
						return false;
					}
				};

				$.DLMenu.prototype = {
					_init: function (options) {

						// options
						this.options = $.extend(true, {}, $.DLMenu.defaults, options);
						this._config();

						var animEndEventNames = {
							'WebkitAnimation': 'webkitAnimationEnd',
							'OAnimation': 'oAnimationEnd',
							'msAnimation': 'MSAnimationEnd',
							'animation': 'animationend'
						},
						transEndEventNames = {
							'WebkitTransition': 'webkitTransitionEnd',
							'MozTransition': 'transitionend',
							'OTransition': 'oTransitionEnd',
							'msTransition': 'MSTransitionEnd',
							'transition': 'transitionend'
						};
						// animation end event name
						this.animEndEventName = animEndEventNames['animation'] + '.menu';
						// transition end event name
						this.transEndEventName = transEndEventNames['transition'] + '.menu',
						// support for css animations and css transitions
						this.supportAnimations = true,
						this.supportTransitions = true;
						this._initEvents();

					},
					_config: function () {
						this.open 			= false;
						this.$trigger 	= this.$el.children('.trigger');
						this.$menu 			= this.$el.children('ul.menu');
						this.$menuitems = this.$menu.find('li:not(.back) > a');

						this.$el.find('.sub-menu')
							.prepend('<li class="back"><a href="#"> ' + $offCanvasEl.attr('data-back-txt') + ' </a></li>');

						this.$back = this.$menu.find('li.back');
					},
					_initEvents: function () {

						var self = this;

						this.$trigger.on('click.menu', function () {

							if (self.open) {
								self._closeMenu();
							} else {
								self._openMenu();
							}
							return false;

						});

						this.$menuitems.on('click.menu', function (event) {


							var $item = $(this).parent('li'),
							$submenu = $item.children('.sub-menu');

							$('.fullscreen-alt .off-canvas-menu-container .clip-wrap, .fullscreen-alt .off-canvas-menu-container .clip-wrap span').css('transition-duration', '0s');

							if ($submenu.length > 0) {

								var $flyin = $submenu.clone().css('opacity', 0).insertAfter(self.$menu),
								onAnimationEndFn = function () {
									self.$menu.off(self.animEndEventName).removeClass(self.options.animationClasses.classout).addClass('subview');
									$item.addClass('subviewopen').parents('.subviewopen:first').removeClass('subviewopen').addClass('subview');
									$flyin.remove();
									setTimeout(function () {
										$('.off-canvas-menu-container .menu > li').removeClass('no-pointer-events');
										$('.off-canvas-menu-container .clip-wrap, .off-canvas-menu-container .clip-wrap span').css('transition-duration', '.45s');
									}, 300);

								};

								setTimeout(function () {
									$flyin.addClass(self.options.animationClasses.classin);
									self.$menu.addClass(self.options.animationClasses.classout);
									if (self.supportAnimations) {
										self.$menu.on(self.animEndEventName, onAnimationEndFn);
									} else {
										onAnimationEndFn.call();
									}

									self.options.onLevelClick($item, $item.children('a:first').text());
								});


								$item.parents('.menu-wrap').css('height', $item.parents('.off-canvas-menu-container').find('.menuwrapper .menu').height()).transition({
									'height': $flyin.height()
								}, 500, 'easeInOutQuad');

								setTimeout(OCM_overflowState,600);

								return false;

							} else {

								self.options.onLinkClick($item.find('> a'), event);
							}

							OCM_close($item);

						});



						this.$back.on('click.menu', function () {

							var $this = $(this),
							$submenu 	= $this.parents('.sub-menu:first'),
							$item 		= $submenu.parent(),
							$flyin 		= $submenu.clone().insertAfter(self.$menu);

							var onAnimationEndFn = function () {
								self.$menu.off(self.animEndEventName).removeClass(self.options.animationClasses.classin);
								$flyin.remove();
							};

							setTimeout(function () {
								$flyin.addClass(self.options.animationClasses.classout);
								self.$menu.addClass(self.options.animationClasses.classin);
								if (self.supportAnimations) {
									self.$menu.on(self.animEndEventName, onAnimationEndFn);
								} else {
									onAnimationEndFn.call();
								}

								$item.removeClass('subviewopen');

								var $subview = $this.parents('.subview:first');
								if ($subview.is('li')) {
									$subview.addClass('subviewopen');
								}
								$subview.removeClass('subview');
							});



							setTimeout(function () {
								$item.parents('.menu-wrap').transition({
									'height': $item.parent().height()
								}, 500, 'easeInOutQuad');
								setTimeout(OCM_overflowState,600);
							}, 50);


							return false;

						});

					},
					closeMenu: function () {
						if (this.open) {
							this._closeMenu();
						}
					},
					_closeMenu: function () {
						var self = this,
						onTransitionEndFn = function () {
							self.$menu.off(self.transEndEventName);
							self._resetMenu();
						};

						this.$menu.removeClass('menuopen');
						this.$menu.addClass('menu-toggle');
						this.$trigger.removeClass('active');

						if (this.supportTransitions) {
							this.$menu.on(this.transEndEventName, onTransitionEndFn);
						} else {
							onTransitionEndFn.call();
						}

						this.open = false;
					},
					openMenu: function () {
						if (!this.open) {
							this._openMenu();
						}
					},
					_openMenu: function () {
						var self = this;
						$body.off('click').on('click.menu', function () {
							self._closeMenu();
						});
						this.$menu.addClass('menuopen menu-toggle').on(this.transEndEventName, function () {
							$(this).removeClass('menu-toggle');
						});
						this.$trigger.addClass('active');
						this.open = true;
					},
					_resetMenu: function () {

						this.$menu.removeClass('subview');
						this.$menuitems.removeClass('subview subviewopen');

					}
				};

				var logError = function (message) {
					if (window.console) {
						window.console.error(message);
					}
				};

				$.fn.dlmenu = function (options) {
					if (typeof options === 'string') {
						var args = Array.prototype.slice.call(arguments, 1);
						this.each(function () {
							var instance = $.data(this, 'menu');
							if (!instance) {
								logError("cannot call methods on menu prior to initialization; " +
								"attempted to call method '" + options + "'");
								return;
							}
							// TODO: isFunction is dep - also in hoverIntent
							if (!$.isFunction(instance[options]) || options.charAt(0) === "_") {
								logError("no such method '" + options + "' for menu instance");
								return;
							}
							instance[options].apply(instance, args);
						});
					} else {
						this.each(function () {
							var instance = $.data(this, 'menu');
							if (instance) {
								instance._init();
							} else {
								instance = $.data(this, 'menu', new $.DLMenu(options, this));
							}
						});
					}
					return this;
				};


				/**
				* Initialize DL menu.
				*
				* @since 6.0
				*/
				function fullscreenMenuInit() {

					$('#slide-out-widget-area .off-canvas-menu-container .menu').wrap('<div class="menu-wrap menuwrapper" />');
					$('#slide-out-widget-area .off-canvas-menu-container .menu').addClass('menuopen');

					var $ocmAnimationClassNum = ($('#slide-out-widget-area.fullscreen-alt').length > 0 || $('#slide-out-widget-area.fullscreen-inline-images').length > 0) ? '4' : '5';
					$('#slide-out-widget-area .off-canvas-menu-container .menu-wrap').dlmenu({
						animationClasses: {
							classin: 'dl-animate-in-' + $ocmAnimationClassNum,
							classout: 'dl-animate-out-' + $ocmAnimationClassNum
						}
					});

				}









				/**
				* Set the page header height when using "slide down" theme option effect.
				*
				* @since 2.0
				*/
				function pageHeaderSlideInHeight() {

					var pageHeaderHeight = parseInt($pageHeaderBG.outerHeight());
					$('body[data-aie="slide-down"] #page-header-wrap:not(.fullscreen-header):not([data-responsive="true"])').css('height', pageHeaderHeight + 'px');

				}


				/**
				* Fired after page header image has loaded.
				*
				* @since 2.0
				*/
				function pageHeaderAfterLoad() {

					//fade in header
					if ($('#ajax-content-wrap').length == 0 || !$body.hasClass('ajax-loaded')) {
						$('#page-header-bg[data-parallax="1"]').animate({
							'opacity': 1
						}, 350, 'easeInCubic');
					} else if ($('#ajax-content-wrap').length == 1) {
						$('#page-header-bg[data-parallax="1"]').css({
							'opacity': 1
						});
					}

					$('#page-header-bg[data-parallax="1"] .nectar-particles').append('<div class="fade-out" />');

				}



				/**
				* Page header unload event.
				*
				* @since 2.0
				*/
				function pageHeaderUnload() {

					if (navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1 || navigator.userAgent.match(/(iPod|iPhone|iPad)/)) {
						window.onunload = function () {

							pageHeaderInit();

							$('#page-header-bg[data-parallax="1"] .span_6').css({
								'opacity': 1
							});

						};
					}

				}


				/**
				* Page header initialization.
				*
				* @since 2.0
				*/
				function pageHeaderInit() {

					var pageHeaderState = {
						inView: true
					}

					var $pageHeaderInnerEl  = $('#page-header-bg .span_6 .inner-wrap');
					var $pageHeaderCanvasEl = $('#page-header-bg #canvas');

					if ($('#page-header-bg[data-parallax="1"]').length > 0) {

						// Fade in
						var img                = new Image(),
						pageHeaderHeight       = parseInt($pageHeaderBG.height()),
						headerSpaceHeight      = $('#header-space').height(),
						globalTopSectionHeight = ($('.nectar-global-section.after-nav').length > 0) ? $('.nectar-global-section.after-nav').height() : 0,
						$initialImgCheck       = extractUrl($('#page-header-bg[data-parallax="1"]').css('background-image'));

						if ($initialImgCheck && $initialImgCheck.indexOf('.') !== -1) {
							img.onload = function () {
								pageHeaderAfterLoad();
							};

							img.src = extractUrl($('#page-header-bg[data-parallax="1"]').css('background-image'));

						} else {
							pageHeaderAfterLoad();
						}


						// Calculate on scroll.
						if( nectarDOMInfo.winW > 1000 ) {
							parallaxPageHeaderCalc();
						}
						window.addEventListener('scroll', function () {
							if( nectarDOMInfo.winW > 1000 ) {
								window.requestAnimationFrame(parallaxPageHeaderCalc);
							}
						}, false);

					}

					var $pt_timeout = ($('body[data-ajax-transitions="true"]').length > 0 && $('#page-header-bg[data-animate-in-effect="slide-down"]').length > 0) ? 350 : 0;

					if ($pageHeaderBG.length > 0) {

						// Slide in height effect.
						setTimeout(function () {
							pageHeaderSlideInHeight();
						}, $pt_timeout);

						$('#page-header-bg[data-animate-in-effect="fade-in"]').addClass('loaded');

						// Using bg classname.
						var $initialImgCheckAscend = extractUrl($pageHeaderBG.css('background-image'));
						if ($initialImgCheckAscend && $initialImgCheckAscend.indexOf('.') !== -1) {
							$pageHeaderBG.addClass('has-bg');
						}

						// Resize slide in height.
						$window.on('smartresize',pageHeaderSlideInHeight);

					}


					function parallaxPageHeaderCalc() {

						var $multiplier = 0.15;

						if (nectarDOMInfo.winW >= 1000 &&
						navigator.userAgent.match(/iPad/i) == null &&
						nectarState.materialOffCanvasOpen != true ) {

							// Calc parallax.
							if (pageHeaderState.inView == true) {

								$pageHeaderInnerEl.css({
									'transform': 'translateY(' + nectarDOMInfo.scrollTop * $multiplier + 'px)',
									'opacity': 1 - (nectarDOMInfo.scrollTop / ((globalTopSectionHeight + pageHeaderHeight)*.7))
								});

								if( $pageHeaderCanvasEl ) {
									$pageHeaderCanvasEl.css({
										'transform': 'translateY(' + nectarDOMInfo.scrollTop * $multiplier*2 + 'px)'
									});
								}

							}

							// Hide elements to allow other parallax sections to work in webkit browsers.
							if ((nectarDOMInfo.scrollTop / (pageHeaderHeight + headerSpaceHeight + nectarDOMInfo.adminBarHeight)) > 1) {
								pageHeaderState.inView = false;
								$('.nectar-particles, #page-header-bg .fade-out').css('visibility', 'hidden').addClass('out-of-sight');
								$('#page-header-bg').addClass('out-of-sight');
							}
							else {
								pageHeaderState.inView = true;
								$('#page-header-bg, .nectar-particles, #page-header-bg .fade-out').css('visibility', 'visible').removeClass('out-of-sight');
							}

						}

					}

					if ($pageHeaderBG.length > 0) {

						// Bind unload event
						pageHeaderUnload();

						// Initialize text effects.
						if( $('.nectar-box-roll').length == 0 ) {
							pageHeaderTextEffectInit();
						}

					}

				}







				/**
				* Page header text effect markup creation.
				*
				* @since 6.0
				*/
				function pageHeaderTextEffectMarkup() {

					$pageHeaderBG.each(function () {

						if ($(this).attr('data-text-effect') == 'rotate_in') {

							var $topHeading = 'none';

							if ($(this).find('.span_6 h1').length > 0) {
								$topHeading = 'h1';
							}

							if ($topHeading != 'none') {

								var $selector = ($(this).find('.nectar-particles').length > 0) ? '.inner-wrap.shape-1' : '.span_6';

								$(this).find($selector).find($topHeading).addClass('top-heading').contents().filter(function () {
									return this.nodeType === 3 && typeof this.data != 'undefined' && this.data.replace(/\s+/, "");
								}).wrap('<span class="wraped"></span>');

								$(this).find($selector).find('.wraped').each(function () {

									var textNode  = $(this),
									text          = textNode.text().split(' '),
									replace       = '';

									$.each(text, function (index, value) {
										if (value.replace(/\s+/, "")) {
											replace += '<span class="wraped"><span>' + value + '</span></span> ';
										}
									});

									textNode.replaceWith($(replace));

								});

							}

						}

					});

				}


				/**
				* Page header text effect animation.
				*
				* @since 6.0
				*/
				function pageHeaderTextEffect() {

					if ($('#page-header-bg .nectar-particles').length == 0 && $('#page-header-bg[data-text-effect="none"]').length == 0 ||
					$('.nectar-box-roll').length > 0 && $('#page-header-bg .nectar-particles').length == 0) {

						var $selector = ($('.nectar-box-roll').length == 0) ? '#page-header-bg .span_6' : '.nectar-box-roll .overlaid-content .span_6';

						$($selector).find('.wraped').each(function (i) {
							$(this).find('span').delay(i * 370).transition({
								rotateX: '0',
								'opacity': 1,
								y: 0
							}, 400, 'easeOutQuad');
						});

						setTimeout(function () {

							$($selector).find('.inner-wrap > *:not(.top-heading)').each(function (i) {
								$(this).delay(i * 370).transition({
									rotateX: '0',
									'opacity': 1,
									y: 0
								}, 650, 'easeOutQuad');
							});

							$('.scroll-down-wrap, .scroll-down-wrap .section-down-arrow').removeClass('hidden');

						}, $($selector).find('.wraped').length * 370);
					}

				}


				/**
				* Page header text effect initialization.
				*
				* @since 6.0
				*/
				function pageHeaderTextEffectInit() {

					pageHeaderTextEffectMarkup();

					var $effectTimeout = ($loadingScreenEl.length > 0) ? 800 : 0;

					if ($('#page-header-bg .nectar-video-wrap video').length == 0) {
						setTimeout(pageHeaderTextEffect, $effectTimeout);
					}

				}







				/**
				* Permanent transparent header effect.
				*
				* @since 6.0
				*/
				function midnightInit() {

					if ($('#header-outer[data-permanent-transparent="1"]').length > 0 &&
					$('body[data-bg-header="true"]').length > 0) {


						// Pages that set no midnight coloring.
						if ($('.container-wrap div[data-midnight]').length == 0) {
							$('.container-wrap').attr('data-midnight', 'dark');
						}

						//// Cache midnight compat divs.
						var $midnightCompatArr = [];
						$('div[data-midnight]:not(.has-global-section)').each(function () {

							if ($(this).attr('data-midnight') == 'light' && $(this).parents('.pum-content').length == 0 ||
							$(this).attr('data-midnight') == 'dark' && $(this).parents('.pum-content').length == 0) {

								if( ($(this).is('#page-header-bg') && $(this).parents('#page-header-wrap[data-midnight]').length > 0) ||
										$(this).parents('#slide-out-widget-area').length > 0 ) {
									// skip.
								} else {
									$midnightCompatArr.push($(this));
								}

							}

						});


						if ($midnightCompatArr.length > 0) {

							$.each($midnightCompatArr, function (k, v) {

								if (v.attr('data-midnight') == 'light' || v.attr('data-midnight') == 'dark') {

									var $that     = v;
									var waypoint  = new Waypoint({
										element: $that[0],
										handler: function (direction) {


											if ($('body.material-ocm-open').length > 0 ||
											    $('#slide-out-widget-area.open').length > 0 ||
											    $that.css('display') == 'none' ) {
												return;
											}


											var $textColor;

											if (direction == 'down') {
												$textColor = ($that.attr('data-midnight') == 'light') ? '' : 'dark-slide';
												$headerOuterEl.removeClass('dark-slide').addClass($textColor);

											} else {

												var $prevMidItem;

												if (k - 1 >= 0) {
													$prevMidItem = k - 1;
												} else {
													$prevMidItem = k;
												}

												$textColor = ($midnightCompatArr[$prevMidItem].attr('data-midnight') == 'light') ? '' : 'dark-slide';
												$headerOuterEl.removeClass('dark-slide').addClass($textColor);

											}

										},
										offset: $headerOuterEl.height()

									});

								}

							});

						}

					}


				}




				/**
				* Box roll header effect initialization.
				*
				* @since 6.0
				*/
				function nectarBoxRollInit() {

					if ( window.nectarOptions &&
						 window.nectarOptions.disable_box_roll_mobile &&
						 window.nectarOptions.disable_box_roll_mobile == 'on' &&
						 nectarDOMInfo.usingMobileBrowser
					) {
						$('.nectar-box-roll').contents().unwrap();
						$('.overlaid-content > .container').contents().unwrap();
						$('.overlaid-content').contents().unwrap();
						$('#page-header-bg').wrap('<div id="page-header-wrap" class="fullscreen-header" />');
						return;
					}

					if ($('.nectar-box-roll').length > 0 && typeof NectarBoxRoll !== 'undefined') {

						pageHeaderTextEffectInit();

						// listen for emits.
						$(window).on('nectar-box-roll-scroll-disabled', function() {
							nectarState.preventScroll = true;
						});
						$(window).on('nectar-box-roll-scroll-enabled', function() {
							nectarState.preventScroll = false;
						});

						nectarBoxRoll = new NectarBoxRoll(nectarDOMInfo, waypoints, midnightInit, pageLoadHash, resizeVideoToCover);
            			nectarBoxRoll.inUse = true;
					}
				}




				/**
				* Create all waypoints.
				*
				* @since 6.0
				*/
				function waypoints() {

					rowBGAnimations();
					columnBGAnimations();
					colAndImgAnimations();
					progressBars();
					dividers();
					iconList();
					animatedTitles();
					highlightedText();
					imageWithHotspots();
					clientsFadeIn();
					splitLineHeadings();
					svgAnimations();
					milestoneInit();
					nectarFancyUlInit();
					owl_carousel_animate();
					headerRowColorInheritInit();
					morphingOutlines();
					animatedColBorders();
					foodMenuItems();
					vcWaypoints();
					NectarPostGridWaypoint();
					nectarRotatingWordsInit();
					generalWaypoints();
				}



				/**
				* Salient page builder elements initialization.
				*
				* @since 10.5
				*/
				function salientPageBuilderElInit() {
					flexsliderInit();
					flickityLazyInit();
					setTimeout(flickityInit, 100);
					twentytwentyInit();
					standardCarouselInit();
					productCarouselInit();
					clientsCarouselInit();
					carouselfGrabbingClass();
					accordionInit();
					accordionClickEvents();
					largeIconHover();
					nectarIconMatchColoring();
					buttonInit();
					ctaLinkBG();
					teamMemberFullscreen();
					flipBoxInit();
					owlCarouselInit();
					mouseParallaxInit();
					ulCheckmarks();
					nectarFancyUlIcons();
					nectarFancyBoxHover();
					nectarVideoLightbox();
					nectarKeyframeAssist();
					morphingOutlinesInit();
					nectarLinkIndicators();
					nectarPostGridInit();
					cascadingImageInit();
					imageWithHotspotEvents();
					pricingTableHeight();
					pageSubmenuInit();
					nectarLiquidBGs();
					nectarTestimonialSliders();
					recentPostsTitleOnlyEqualHeight();
					recentPostsInit();
					parallaxItemHoverEffect();
					fsProjectSliderInit();
					postMouseEvents();
					masonryPortfolioInit();
					masonryBlogInit();
					portfolioCustomColoring();
					searchResultMasonryInit();
					portfolioSidebarFollow();
					splitLineHeadingInit();
					scrollingText();
					tabbedInit();
				}




				/***************** WooCommerce *****************/

				/**
				* Woo filter toggle
				*
				* @since 13.0
				*/
				function NectarWooCommerceFilters() {

					this.$toggleBtn = $('.nectar-shop-filters .nectar-shop-filter-trigger');
					this.$sidebar = $('#sidebar');
					this.sidebarPos = (this.$sidebar.hasClass('col_last')) ? 'right' : 'left';

					this.state = {
						open: (this.getLS()) ? this.getLS() : 'true'
					};

					this.setup();
					this.events();
				}

				NectarWooCommerceFilters.prototype.events = function() {

					this.$toggleBtn.on('click', this.toggle.bind(this));
					this.$sidebar.find('.nectar-close-btn-wrap').on('click', this.mobileToggle.bind(this));
					$(window).on('smartresize', this.mobileToggleResize.bind(this));

				};

				NectarWooCommerceFilters.prototype.mobileToggleResize = function() {

					if( this.$sidebar.hasClass('open') && nectarDOMInfo.winW > 999 ) {
						this.$sidebar.removeClass('open');
						this.$sidebar.find('.nectar-close-btn-wrap').removeClass('open');
						$('.container-wrap').css('z-index','11');
					}

				};

				NectarWooCommerceFilters.prototype.mobileToggle = function() {

					if( this.$sidebar.hasClass('open') ) {
						this.$sidebar.removeClass('open');
						this.$sidebar.find('.nectar-close-btn-wrap').removeClass('open');
						$('.container-wrap').css('z-index','11');
					} else {
						$('.container-wrap').css('z-index','10000');
						this.$sidebar.addClass('open');
						this.$sidebar.find('.nectar-close-btn-wrap').addClass('open');
					}

					return false;

				};

				NectarWooCommerceFilters.prototype.toggle = function() {

					// Mobile.
					if( nectarDOMInfo.winW < 1000 ) {
						this.mobileToggle();
						return false;
					}

					var visibility = '';

					// Close.
					if( this.state.open == 'true' ) {

						// Handle state.
						this.state.open = 'false';
						visibility = 'false';

						// Layout change.
						this.$toggleBtn.find('.hide').hide();
						this.$toggleBtn.find('.show').show();

						this.$toggleBtn.find('.top-line, .bottom-line').css({
							'transform': 'translateX(0)'
						});

						if( this.sidebarPos == 'left' ) {
							this.$sidebar.css({
								'margin-right' : '-25%',
								'opacity': '0'
							});
						} else {
							this.$sidebar.css({
								'margin-left': '-25%',
								'opacity': '0'
							});
						}

						this.$sidebar.find('> .inner').css({
							'transform': (this.sidebarPos == 'left') ? 'translateX(-100%)' : 'translateX(100%)',
						});

					}
					// Open.
					else {

						// Handle state.
						this.state.open = 'true';
						visibility = 'true';

						// Layout change.
						this.$toggleBtn.find('.show').hide();
						this.$toggleBtn.find('.hide').show();

						this.$toggleBtn.find('.top-line').css({
							'transform': 'translateX(10px)'
						});
						this.$toggleBtn.find('.bottom-line').css({
							'transform': 'translateX(-10px)'
						});

						if( this.sidebarPos == 'left' ) {
							this.$sidebar.css({
								'margin-right' : '0',
								'opacity': '1'
							});
						} else {
							this.$sidebar.css({
								'margin-left' : '0',
								'opacity': '1'
							});
						}

						this.$sidebar.find('> .inner').css({
							'transform': 'translateX(0)'
						});

					}

					// Trigger event.
					setTimeout(function(){
						$(window).trigger('nectar-product-filters-layout');
					},425);


					// Store in LS.
					if( typeof(Storage) !== "undefined" ) {
						localStorage.setItem("nectar_product_filters_vis", visibility);
					}

					return false;

				};

				NectarWooCommerceFilters.prototype.setup = function() {

					// Start filters expanded on mobile.
					this.$sidebar.find('.widget.woocommerce')
					.addClass('open-filter')
					.find('ul')
					.css({
						'display':'block'
					});

					// tag cloud
					this.$sidebar.find('.widget.woocommerce.widget_product_tag_cloud')
					.find('div.tagcloud').css({
						'display':'block'
					});

					// layered nav
					if( this.$sidebar.find('.widget.woocommerce.widget_layered_nav > .woocommerce-widget-layered-nav-dropdown').length > 0) {
						this.$sidebar.find('.widget.woocommerce.widget_layered_nav > .woocommerce-widget-layered-nav-dropdown').css({
							'display':'block'
						});
					}

					// Mobile active filters.
					if( $('.nectar-active-product-filters').length > 0 ) {
						var $filtersHTML = $('.nectar-active-product-filters').clone();
						this.$sidebar.find('> .inner').prepend($filtersHTML);
					}

				};

				NectarWooCommerceFilters.prototype.getLS = function() {

					if( typeof(Storage) !== "undefined" ) {
						return localStorage.getItem("nectar_product_filters_vis");
					}

					return null;

				};




				/**
				* Handle Woo quantity button functionality
				*
				* @since 13.0
				*/
				function wooQauntityBtns() {
					var quantityButtons = new NectarWooCommerceQuantity();
				}

				function NectarWooCommerceQuantity() {

					this.$qty = '';
					this.step = 1;
					this.ajaxTimeout = '';
					this.ajaxTimeoutDur = 500;

					this.state = {
						max: 100000,
						min: 0,
						currentVal: 1,
						key: 0,
						removeFlag: false
					};

					this.events();

				}



				NectarWooCommerceQuantity.prototype.updateState = function(el) {

					// Get key.
					var key = 0;

					if( true === this.checkMiniCart(this.$qty) ) {
						var matches = this.$qty.attr('name').match(/cart\[(\w+)\]/);
						key = matches[1];
					}

					// Store current.
					var currentVal = parseFloat(this.$qty.val());

					if (!currentVal || currentVal === '' || currentVal === 'NaN') {
						currentVal = 0;
					}

					// Max/Min vals.
					var max = parseFloat(this.$qty.attr('max'));
					var min = parseFloat(this.$qty.attr('min'));

					if (max === '' || max === 'NaN' || isNaN(max) ) {
						max = '';
					}

					if (min === '' || min === 'NaN' || isNaN(min) ) {
						min = 0;
					}

					// Push to state.
					this.state = {
						currentVal: currentVal,
						max: max,
						min: min,
						key: key
					};

				};

				NectarWooCommerceQuantity.prototype.events = function() {

					var that = this;

					$('body').on('click', '.quantity .plus', function() {
						if( $(this).parents('.auction_form').length == 0 ) {

							that.$qty = $(this).closest('.quantity').find('.qty');
							that.setStep();
							that.updateState();
							that.increment($(this));
						}
					});

					$('body').on('click', '.quantity .minus', function() {

						if( $(this).parents('.auction_form').length == 0 ) {
							that.$qty = $(this).closest('.quantity').find('.qty');
							that.setStep();
							that.updateState();
							that.decrement($(this));
						}
					});

					$('body').on('keyup', '.woocommerce-mini-cart .quantity .qty', function(e) {
						that.$qty = $(this);

						that.updateState();

						// Max value.
						if( that.state.max && that.$qty.val() > that.state.max ) {
							that.$qty.val(that.state.max);
						}

						// Check if item should be removed.
						if (that.state.min && (that.state.min == that.state.currentVal || that.state.currentVal < that.state.min)) {
							that.state.removeFlag = true;
						}

						$(this).trigger('change');

					});

					$('body').on('change', '.woocommerce-mini-cart .quantity .qty', function(e) {

						if( !e.originalEvent && true === that.checkMiniCart(that.$qty) ) {
							that.updateCart(that.$qty.val());
						}

					});

				};

				NectarWooCommerceQuantity.prototype.setStep = function() {
					if( this.$qty.is('[step]') ) {
						var step = parseInt(this.$qty.attr('step'));

						if( !isNaN(step) && step != '' && step != 0) {
							this.step = step;
						}

					}
				}

				NectarWooCommerceQuantity.prototype.increment = function() {

					if (this.state.max && (this.state.max == this.state.currentVal || this.state.currentVal > this.state.max)) {
						this.$qty.val(this.state.max);
					} else {
						this.$qty.val(this.state.currentVal + parseFloat(this.step));
					}

					this.$qty.trigger('change');

				};

				NectarWooCommerceQuantity.prototype.decrement = function() {

					if (this.state.min && (this.state.min == this.state.currentVal || this.state.currentVal < this.state.min)) {
						this.$qty.val(this.state.min);
						this.state.removeFlag = true;

					} else if (this.state.currentVal > 0) {
						this.$qty.val(this.state.currentVal - parseFloat(this.step));
					}

					this.$qty.trigger('change');

				};

				NectarWooCommerceQuantity.prototype.checkMiniCart = function(el) {
					return ( el.parents('.woocommerce-mini-cart').length > 0 ) ? true : false;
				};

				NectarWooCommerceQuantity.prototype.updateQuantityCallback = function(response, that) {
					$(window).trigger( 'nectar_woo_mini_cart_updated' );


					that.$qty.closest( '.widget_shopping_cart_content' ).removeClass('loading');
					that.$qty.closest( '.woocommerce-mini-cart-item' ).removeClass('blockUI').removeClass('blockOverlay');


					// Update subtotal.
					var $subtotal = that.$qty.closest( '.widget_shopping_cart_content' ).find('.woocommerce-mini-cart__total');
					$subtotal.find('.woocommerce-Price-amount, .tax_label').remove();
					$subtotal.append(response.subtotal);

					// Update price for compatibility with Woo plugins which change price based on quantity.
					if ( window.nectarOptions && window.nectarOptions.woo_using_cart_addons && window.nectarOptions.woo_using_cart_addons === 'true' ) {
						if ( response.item_price && response.item_price.length > 0 ) {

							var $responsePrice = $(response.item_price);
							var $price = that.$qty.closest( '.woocommerce-mini-cart-item' ).find('.product-price');

							if ( $responsePrice.text() !== $price.find('.woocommerce-Price-amossunt').text() ) {
								$price.find('.woocommerce-Price-amount, > del, > ins').remove();
								$price.prepend(response.item_price);
							}
						}
					}

					// Does the item need to be removed?
					if( that.state.removeFlag === true ) {
						that.$qty.closest( '.woocommerce-mini-cart-item' ).remove();
						that.state.removeFlag = false;
						$( document.body ).trigger( 'updated_wc_div' );
					}

					// Update cart count.
					if( $('#header-outer a.cart-contents .cart-wrap span').length > 0 ) {
						$('#header-outer a.cart-contents .cart-wrap span').text(response.item_count);
					}
					if( $('#header-outer #mobile-cart-link .cart-wrap span').length > 0 ) {
						$('#header-outer #mobile-cart-link .cart-wrap span').text(response.item_count);
					}

				}

				NectarWooCommerceQuantity.prototype.updateCart = function(val) {

					var that = this;

					// Debounce a little to prevent too many requests when clicking a lot
					clearTimeout(this.ajaxTimeout);

					this.ajaxTimeout = setTimeout(function() {

					  that.$qty.closest( '.widget_shopping_cart_content' ).addClass('loading');
						that.$qty.closest( '.woocommerce-mini-cart-item' ).addClass('blockUI').addClass('blockOverlay');

						var ajaxData = {
							type: 'POST',
							url: window.nectarLove.ajaxurl,
							data: {
								action: "nectar_minicart_update_quantity",
								quantity: val,
								item_key: that.state.key
							},
							cache: false,
							success: function (response) {
								if( response ) {
									that.updateQuantityCallback(response, that);
								}
							}
						};

						$.ajax(ajaxData);
						if ( window.nectarOptions && window.nectarOptions.woo_using_cart_addons && window.nectarOptions.woo_using_cart_addons === 'true' ) {
							// Workaround for quantity / subtotal not updating until after the next ajax request.
							setTimeout(function(){
								$.ajax(ajaxData);
							}, 1000);
						}

					}, this.ajaxTimeoutDur);

				};




				/**
				* WooCommerce Single Product AJAX Add to Cart.
				*
				* @since 13.0
				*/
				function NectarWooCommerceCartAJAX() {

					this.state = {
						processing: false,
						productID: false,
						type: 'regular'
					};

					this.events();
				}

				NectarWooCommerceCartAJAX.prototype.events = function() {
					//$('body:not(.woocommerce-account)').on('submit', 'form.cart', this.addToCartAJAX.bind(this));
					$('body').on('click', 'form.cart .single_add_to_cart_button', this.addToCartAJAX.bind(this));
				};

				NectarWooCommerceCartAJAX.prototype.addNotices = function(notices) {

					var that = this;

					var $noticeParent = $('.nectar-slide-in-cart.style_slide_in_click .widget_shopping_cart_content')

					$.each(notices, function(k,item) {
						$noticeParent.prepend('<div class="nectar-notice">'+item.notice+'</div>');
					});

					// Remove.
					setTimeout(function(){
					  $noticeParent.find('.nectar-notice').slideUp(function(){
							$(this).remove();
						});
					},6000);

				};

				NectarWooCommerceCartAJAX.prototype.addToCartAJAX = function(e) {

					var that = this;

					var $wooForm = $(e.currentTarget).parents('form.cart');

					// External or redirect active.
					if( $wooForm.closest('.product').hasClass('product-type-external') || (wc_add_to_cart_params && wc_add_to_cart_params.cart_redirect_after_add === 'yes') ) {
						return;
					}

					e.preventDefault();

					// If already submitted
					if( that.state.processing == true ) {
						return;
					}

					that.state.processing = true;
					that.state.productID = false;

					// Store type
					that.state.type = 'regular';
					if( $wooForm.parents('.nectar-quick-view-box').length > 0 ) {
						that.state.type = 'quickview';
					}

					// Gather info to pass.
					var $parentProduct = $wooForm.closest('.product');
					var $addToCartBtn  = $wooForm.find('button.single_add_to_cart_button');
					var $formData      = $wooForm.serializeArray();
					var regID          = 0;

					// Try and get ID from parent.
					if( $parentProduct.is('[id*="product-"]') ) {
						regID = $parentProduct.attr('id').match(/\d+/);

						if(regID && regID[0]) {
							that.state.productID = regID[0];
						}
					}
					// Fallback to ID from submit.
					if( that.state.productID === false && $addToCartBtn.length > 0 ) {
						regID = $addToCartBtn.val().match(/\d+/);

						if(regID && regID[0]) {
							that.state.productID = regID[0];
						}
					}

					// No ID found, bail out.
					if( that.state.productID === false ) {
						console.log('Error: no product ID found.');
						return;
					}

					// Add Loading.
					if( that.state.type === 'quickview' ) {
						$addToCartBtn = $('.single_add_to_cart_button_wrap .single_add_to_cart_button');
					}

					$addToCartBtn.prepend('<div class="loading-wrap"><div class="loading" /></div></div>');
					setTimeout(function(){
						$addToCartBtn.addClass('processing');
					},50);

					// Must be formatted like this to use add-to-cart key for WooCommerce to trigger AJAX.
					$formData.push({
						name: 'action',
						value: 'nectar_ajax_add_to_cart'
					}, {
						name: 'add-to-cart',
						value: that.state.productID
					});

					$.ajax({
							type: 'POST',
							url: window.nectarLove.ajaxurl,
							data: $formData,
							cache: false,
							success: function (response) {

								setTimeout(function(){
									that.state.processing = false;
									$addToCartBtn.removeClass('processing');
									$addToCartBtn.find('.loading-wrap').remove();
								}, 300);

								if( response && response.fragments ) {

									// Update content.
									$('body').trigger( 'added_to_cart', [response.fragments, response.cart_hash] );

									// Check for/Output errors.
									if( response.notices && response.notices.length > 0 ) {
										setTimeout(function(){
											that.addNotices(response.notices);
										},100);
									}

									// Close quickview.
									if( that.state.type === 'quickview' ) {
										$('.nectar-quick-view-box .close').trigger('click');
									}

								}

							} // end success.

					}); // end ajax.

				};


				/**
				* WooCommerce events.
				*
				* @since 10.5
				*/
				function wooCommerceEvents() {

					var wooCartTimeout;

					// Notification.
					$body.on('click', '.product .add_to_cart_button', function () {

						var $productHeading = ($(this).parents('li').find('h2').length > 0) ? 'h2' : 'h3',
						productToAdd        = $(this).parents('li').find($productHeading).text();

						$('#header-outer .cart-notification span.item-name').html(productToAdd);

					});

					// Notification hover.
					$body.on('mouseenter', '#header-outer .cart-notification', function () {

						$(this).hide();

						$('#header-outer .widget_shopping_cart')
							.addClass('open')
							.stop(true, true)
							.show();

						$('#header-outer .cart_list')
							.stop(true, true)
							.show();

						clearTimeout(wooCartTimeout);

					});


					// Cart dropdown.
					var $headerCartSelector = '#header-outer .nectar-woo-cart';

					if ($($headerCartSelector).length > 0) {

						$($headerCartSelector).hoverIntent(function () {

							$('#header-outer .widget_shopping_cart')
								.addClass('open')
								.stop(true, true)
								.show();

							$('#header-outer .cart_list')
								.stop(true, true)
								.show();

							clearTimeout(wooCartTimeout);

							$('#header-outer .cart-notification').hide();

						});
					}


					$body.on('mouseleave', $headerCartSelector, function () {
						var $that = $(this);
						setTimeout(function () {
							if (!$that.is(':hover')) {
								$('#header-outer .widget_shopping_cart')
									.removeClass('open')
									.stop(true, true)
									.fadeOut(300);

								$('#header-outer .cart_list')
									.stop(true, true)
									.fadeOut(300);
							}
						}, 200);
					});

					if ($('#header-outer[data-cart="false"]').length == 0) {

						$body.on('added_to_cart', function(e){
							setTimeout(function(){
								shopping_cart_dropdown_show(e);
								shopping_cart_dropdown();
							}, 150);
						});
					}

					function shopping_cart_dropdown() {

						if (!$('.widget_shopping_cart .widget_shopping_cart_content .cart_list .empty').length &&
						    $('.widget_shopping_cart .widget_shopping_cart_content .cart_list').length > 0) {

							$('.cart-menu-wrap').addClass('has_products');
							$('header#top nav > ul, #search-outer #search #close a, header#top .span_9 >.slide-out-widget-area-toggle').addClass('product_added');

							if (!$('.cart-menu-wrap').hasClass('static')) {
								$('.cart-menu-wrap, #mobile-cart-link').addClass('first-load');
							}


						}

					}


					function shopping_cart_dropdown_show(e) {

						clearTimeout(wooCartTimeout);

						if (!$('.widget_shopping_cart .widget_shopping_cart_content .cart_list .empty').length &&
						 	 $('.widget_shopping_cart .widget_shopping_cart_content .cart_list').length > 0 &&
							 typeof e.type != 'undefined') {

							// Standalone woocommerce add to cart buttons.
							if ($('#header-outer .cart-notification .item-name').length > 0 &&
							$('#header-outer .cart-notification .item-name').text().length == 0) {
								return;
							}

							// Before cart has slide in.
							if (!$('#header-outer .cart-menu-wrap').hasClass('has_products')) {

								setTimeout(function () {
									$('#header-outer .cart-notification').fadeIn(400);
								}, 400);

							} else if (!$('#header-outer .cart-notification').is(':visible')) {
								$('#header-outer .cart-notification').fadeIn(400);
							} else {
								$('#header-outer .cart-notification').show();
							}

							$('body #header-outer [data-cart-style="slide_in_click"] .cart-menu-wrap').trigger('click');


							wooCartTimeout = setTimeout(hideCart, 2700);

						}
					}

					function hideCart() {
						$('#header-outer .cart-notification').stop(true, true).fadeOut();
					}

					function checkForWooItems() {

						var checkForCartItems = setInterval(shopping_cart_dropdown, 250);
						setTimeout(function () {
							clearInterval(checkForCartItems);
						}, 4500);

					}


					if ($('#header-outer[data-cart="false"]').length == 0) {
						checkForWooItems();
					}

					function nectarAccountPageTabs() {

						// Not on account page.
						if ($('body.woocommerce-account #customer_login').length == 0) {
							return;
						}

						// Create HTML.
						if( $('#customer_login .nectar-form-controls').length === 0 ) {
							$('.woocommerce-account .woocommerce > #customer_login').prepend('<div class="nectar-form-controls" />');

							$('.woocommerce-account .woocommerce > #customer_login > div:not(.nectar-form-controls)').each(function () {
								var $title = $(this).find('> h2').text();
								$('#customer_login .nectar-form-controls').append('<div class="control">' + $title + '</div>');
							});
						}

						// Click event.
						$('.woocommerce-account .woocommerce > #customer_login .nectar-form-controls .control').on('click', function () {

							$('.woocommerce-account .woocommerce > #customer_login .nectar-form-controls .control').removeClass('active');
							$(this).addClass('active');

							var formIndex = $(this).index() + 1;
							$('#customer_login div[class*="u-column"]').hide();
							$('#customer_login div[class*="u-column"].col-' + formIndex).show();

							setTimeout(function () {
								$('#customer_login div[class*="u-column"]').removeClass('visible');
								$('#customer_login div[class*="u-column"].col-' + formIndex).addClass('visible');
							}, 30);

						});

						//Starting.
						var tabChild = '1';
						if (typeof nectarGetQueryParam['tab'] != 'undefined' && nectarGetQueryParam['tab'] === '2' ) {
							tabChild = '2';
							if(window.history && window.history.replaceState && typeof URL === "function") {
								var url = new URL(location);
								url.searchParams.delete('tab');
								history.replaceState(null, null, url);
							}
						}

						$('.woocommerce-account .woocommerce > #customer_login .nectar-form-controls .control:nth-child('+tabChild+')').trigger('click');



					}

					nectarAccountPageTabs();

					var bindTextOnHoverMobile = ( $('.products[data-rm-m-hover="1"]').length > 0 && nectarDOMInfo.usingMobileBrowser ) ? false : true;

					// Text on hover effect.
					if(bindTextOnHoverMobile) {
						$body.on('mouseover', '.text_on_hover .product-wrap, .text_on_hover > a:first-child', function () {
							$(this).parent().addClass('hovered');
						});

						$body.on('mouseout', '.text_on_hover .product-wrap, .text_on_hover > a:first-child', function () {
							$(this).parent().removeClass('hovered');
						});
					}


					// Material/fancy parallax hover effect zindex.
					if ($('.material.product').length > 0 ||
					$('.minimal.product').length > 0 ||
					$('.nectar-fancy-box[data-style="parallax_hover"]').length > 0 ||
					$('.nectar-category-grid[data-shadow-hover="yes"]').length > 0 ||
					$('.nectar-post-grid[data-shadow-hover="yes"]').length > 0) {

						var $productZindex = 101;

						$body.on('mouseenter', '.material.product, .nectar-fancy-box[data-style="parallax_hover"], .nectar-post-grid[data-shadow-hover="yes"] .nectar-post-grid-item, .nectar-category-grid[data-shadow-hover="yes"] .nectar-category-grid-item', function () {
							$productZindex++;
							$(this).css('z-index', $productZindex + 1);
						});

						$body.on('mouseleave', '.material.product, .nectar-fancy-box[data-style="parallax_hover"], .nectar-post-grid[data-shadow-hover="yes"] .nectar-post-grid-item, .nectar-category-grid[data-shadow-hover="yes"] .nectar-category-grid-item', function () {

							var $that = $(this);
							setTimeout(function () {
								if (!$that.is(':hover')) {
									$that.css('z-index', 100);
								}
							}, 350);
						});

						if( window.nectarOptions && window.nectarOptions.woo_minimal_product_effect && window.nectarOptions.woo_minimal_product_effect === 'default' ) {
							$body.on('mouseenter', '.minimal.product', function () {
								$productZindex++;
								$(this).css('z-index', $productZindex + 1);
							});

							$body.on('mouseleave', '.minimal.product', function () {

								var $that = $(this);
								setTimeout(function () {
									if (!$that.is(':hover')) {
										$that.css('z-index', 100);
									}
								}, 350);
							});
						}

						// Reset to stop zindex from getting too high.
						setInterval(function () {
							if ($('.nectar-fancy-box[data-style="parallax_hover"]:hover').length > 0 ||
							$('.minimal.product:hover').length > 0) {
								return;
							}

							$('.material.product:not(:hover), .minimal.product:not(:hover), .nectar-fancy-box[data-style="parallax_hover"]:not(:hover), .nectar-post-grid[data-shadow-hover="yes"] .nectar-post-grid-item:not(:hover), .nectar-category-grid[data-shadow-hover="yes"] .nectar-category-grid-item:not(:hover)').css('z-index', 100);
							$productZindex = 101;
						}, 10000);

					}

					function minimalProductHover() {

						// Add icons.
						$('.products .classic .product-wrap .add_to_cart_button').wrapInner('<span />');
						$('.products .classic .product-wrap .add_to_cart_button').prepend('<i class="normal icon-salient-cart"></i>');

						// Bind hover.
						var bindMobileHover = ( $('.products[data-rm-m-hover="1"]').length > 0 && nectarDOMInfo.usingMobileBrowser ) ? false : true;

						if( bindMobileHover && window.nectarOptions && window.nectarOptions.woo_minimal_product_effect && window.nectarOptions.woo_minimal_product_effect === 'default' ) {

								$body.on('mouseover', '.products .minimal.product', function () {
									minimalProductCalc($(this));
								});

								$body.on('mouseleave', '.products .minimal.product', function () {
									$(this).find('.background-color-expand').css({
										'transform': 'scale(1, 1) translateY(0) translateZ(0px)'
									});
								});

						}

						// Starting trigger mouse over.
						$('.products .minimal.product').each(function () {
							if ($(this).is(':hover')) {
								$(this).trigger('mouseover');
							}
						});

					}



					function minimalProductCalc(el) {

						var expansionAmtX = 40,
						expansionAmtY     = expansionAmtX,
						translateYAmt     = 0;

						var $item   = el,
						$itemWidth  = $item.width(),
						$itemHeight = $item.height(),
						$wChange    = (parseInt($itemWidth) + expansionAmtX) / parseInt($itemWidth),
						$hChange    = (parseInt($itemHeight) + expansionAmtY) / parseInt($itemHeight);

						$item.addClass('hover-bound');

						$item.find('.background-color-expand').css({
							'transform': 'scale(' + $wChange + ',' + $hChange + ') translateY('+translateYAmt+'px) translateZ(0px)'
						});

					}

					minimalProductHover();



					// Mobile widget filters.
					$('.woocommerce #sidebar .widget.woocommerce').each(function () {

						// Skip widgets without any titles.
						if ($(this).find('> h4').length == 0) {
							$(this).addClass('no-widget-title');
						}

					});

					$body.on('click', '#sidebar .widget.woocommerce:not(.widget_price_filter) h4', function () {

						if(window.nectarOptions && window.nectarOptions.woo_sidebar_toggles !== 'false') {

							if ($window.width() < 1000 ) {

								if ($(this).parent().is('.widget_product_tag_cloud')) {
									$(this).parent().find('> div').slideToggle();
								}
								if ($(this).parent().is('.woocommerce-widget-layered-nav') && $(this).parent().find('> .woocommerce-widget-layered-nav-dropdown').length > 0) {
									$(this).parent().find('> .woocommerce-widget-layered-nav-dropdown').slideToggle();
								}

								$(this).parent().find('> ul').slideToggle();

								$(this).parent().toggleClass('open-filter');
							}

						}

					});


					// Slide in cart event.
					$body.on('mouseenter', '#header-outer [data-cart-style="slide_in"] .cart-menu-wrap', openRightCartHover);

					$body.on('mouseenter', '.nectar-slide-in-cart', function () {
						$(this).addClass('mouse-accessed');
					});


					function openRightCartHover() {

						if ($('.nectar-slide-in-cart ul.cart_list li:not(.empty)').length > 0) {

							$('.nectar-slide-in-cart').addClass('open');
							$window.on('mousemove.rightCartOffsetCheck', closeCartCheck);

						}
					}

					function closeCartCheck(e) {

						var $windowWidth = $window.width();
						if (e.clientX < $windowWidth - 370 - $bodyBorderWidth && $('.nectar-slide-in-cart').hasClass('mouse-accessed')) {

							$window.off('mousemove.rightCartOffsetCheck', closeCartCheck);

							$('.nectar-slide-in-cart').removeClass('open').removeClass('mouse-accessed');

						}

					}

					// Slide in click cart.
					$body.on('click', '#header-outer [data-cart-style="slide_in_click"] .cart-menu-wrap, #mobile-cart-link[data-cart-style="slide_in_click"]', openRightCart);

					function openRightCart() {
						if( $body.is('.woocommerce-checkout') || $body.is('.woocommerce-cart') ) {
							return true;
						}

						$('.nectar-slide-in-cart, .nectar-slide-in-cart-bg').addClass('open');
						$('.nectar-slide-in-cart-bg').addClass('revealed');
						clearTimeout(wooBgOverlayTimeout);

						// YITH ajax filters compat.
						$('.style_slide_in_click div.quantity').each(function(){
							if( $(this).find('.minus').length > 1 ) {
								$(this).find('.minus').first().remove();
							}
							if( $(this).find('.plus').length > 1 ) {
								$(this).find('.plus').first().remove();
							}
						});

						return false;
					}

					$body.on('click', '.nectar-slide-in-cart.style_slide_in_click .close-cart, .nectar-slide-in-cart-bg', closeRightCart);


					// Add quantity functionality.
					wooQauntityBtns();

					// AJAX add to cart.
					if( window.nectarOptions && window.nectarOptions.ajax_add_to_cart === '1' ) {
						var ajaxAddToCart = new NectarWooCommerceCartAJAX();
					}

					if( window.nectarOptions && window.nectarOptions.woo_product_filter_toggle === '1' && $body.is('.archive.woocommerce') ) {
						var nectarProductFilters = new NectarWooCommerceFilters();
					}

					// Third party.
					// YITH Ajax filters.
					$(document).on( 'yith-wcan-ajax-filtered', nectarLazyImageLoading );


				}

				var wooBgOverlayTimeout;
				function closeRightCart() {

					$('.nectar-slide-in-cart, .nectar-slide-in-cart-bg').removeClass('open');

					wooBgOverlayTimeout = setTimeout(function() {
						$('.nectar-slide-in-cart-bg').removeClass('revealed');
					},400);

					return false;
				}



				/**
				 * Modern quick search.
				 *
				 * @since 13.0
				 */
				function NectarQuickSearch() {

					this.$el        = $('#search-outer #search .container #s');
					this.$container = '';
					this.$parent    = '';
					this.$searchEl  = $('#search-outer');
					this.request    = '';
					this.timeout    = '';
					this.setup();
					this.events();

					this.state = {
						requesting: false,
						open: false,
						prevResults: ''
					}

					this.minChars = 2;

				}


				NectarQuickSearch.prototype.setup = function() {

					this.$container = $('<div class="inner"></div>');
					$('#search-outer').append($('<div class="nectar-ajax-search-results"><div class="container"></div></div>'));
					this.$parent = $('#search-outer .nectar-ajax-search-results');
					$('#search-outer .nectar-ajax-search-results .container').append(this.$container);

				};

				NectarQuickSearch.prototype.events = function() {

					var that = this;

					this.throttled = throttle(this.getResults.bind(this),350);
					this.$el.on('keyup', this.keyHandle.bind(this) );

					$(window).on('resize', this.resize.bind(this));
					$(window).on('nectar-search-close', function() {
						that.resetHeight();
						that.requestCheck();
					});

				};

				NectarQuickSearch.prototype.keyHandle = function(e) {

					// Verify Key.
					var keysToSkip = [16,91,32,37,39,17];

					if( keysToSkip.indexOf(e.keyCode) != -1 ) {
						return;
					}

				  this.throttled();
					this.debouncedSearch();

				};

				NectarQuickSearch.prototype.debouncedSearch = function() {

					var that = this;

					clearTimeout(this.timeout);
					this.timeout = setTimeout(function(){
						if(that.state.requesting) {
							return;
						}
						that.getResults();
					},400);

				};


				NectarQuickSearch.prototype.resize = function() {

					this.$parent.css({
						'max-height': ''
					});

					if( this.state.open === true ) {
						this.$parent.css({
							'max-height': parseInt(this.$container.outerHeight()) + 'px'
						});
					}

				};

				NectarQuickSearch.prototype.resetHeight = function() {

					var that = this;

					this.$parent.css({
						'max-height': ''
					});

					setTimeout(function(){
						$headerOuterEl.removeClass('results-shown');
					},400);

					this.state.prevResults = '';
					this.state.open = false;
				};


				NectarQuickSearch.prototype.requestCheck = function() {

					if( this.state.requesting === true ) {
						this.request.abort();
						this.state.requesting = false;
					}

				};

				NectarQuickSearch.prototype.getResults = function() {

					var that = this;
					var val = this.$el.val();

					// Deleted all chars / too few chars.
					if( val.length == 0 || val.length < this.minChars ) {
						$headerOuterEl.removeClass('results-shown');
						this.requestCheck();
						this.resetHeight();
						return;
					}

					this.request = $.ajax({
							type: 'POST',
							url: window.nectarLove.ajaxurl,
							data: {
								action: "nectar_ajax_ext_search_results",
								search: val
							},
							cache: false,
							success: function (response) {

								that.state.requesting = false;

								// No results.
								if( !response ) {
									that.resetHeight();
								}

								if( response && response.content && response.content !== that.state.prevResults && that.$searchEl.hasClass('material-open') ) {

									that.$container.html(response.content);

								  that.$parent.css({
										'max-height': parseInt(that.$container.outerHeight()) + 'px'
									});

									setTimeout(function(){
										$headerOuterEl.addClass('results-shown');
									},200);

									// Desktop animation
									if( nectarDOMInfo.winW >= 1000 && !$headerOuterEl.hasClass('results-shown') ) {

										that.$container.find('.product, .search-post-item').css({
											'opacity': '0',
											'transform': 'translateY(25px)',
											'transition': 'none'
										});

										setTimeout(function(){
											that.$container.find('.product, .search-post-item').css({
												'transition': 'box-shadow 0.25s ease, opacity 0.55s cubic-bezier(0.2, 0.6, 0.4, 1), transform 0.55s cubic-bezier(0.2, 0.6, 0.4, 1)'
											});
										},50);


										that.$container.find('.product, .search-post-item').each(function(i) {
											var $that = $(this);
											setTimeout(function(){
												$that.css({
													'opacity': '1',
													'transform': 'translateY(0)'
												})
											}, 50 + (i*60));
										});

									}

									that.state.open = true;
									that.state.prevResults = response.content;

								}

							}

					});

					this.state.requesting = true;

				};


				/**
				 * Search in navigation functionality.
				 *
				 * @since 10.5
				 */

				function navigationSearchInit() {

					// Init quick search.
					var quickSearch = false;
					if( window.nectarOptions && window.nectarOptions.quick_search && window.nectarOptions.quick_search === 'true' ) {
						quickSearch = new NectarQuickSearch();
					}

					var $placeholder = ($('#search-outer #search input[type=text][data-placeholder]').length > 0) ? $('#search-outer #search input[type=text]').attr('data-placeholder') : '';

					// Material skin add search BG markup.
					if ($body.hasClass('material') && $('#header-outer .bg-color-stripe').length == 0) {
						$headerOuterEl.append('<div class="bg-color-stripe" />');
					}

					// Prevent jumping on click.
					$body.on('click', '#search-btn a', function () {
						return false;
					});

					// Open search on mouseup.
					$body.on('click', '#search-btn a:not(.inactive), #header-outer .mobile-search, .nectar-search-open-trigger', function () {

						if ($(this).hasClass('open-search')) {
							return false;
						}

						// Close menu on original skin.
						if( $body.hasClass('original') &&	$('.slide-out-widget-area-toggle.mobile-icon a.open').length > 0 ) {
							$('.slide-out-widget-area-toggle.mobile-icon a')
								.addClass('non-human-allowed')
								.trigger('click');

								setTimeout(function () {
										$('.slide-out-widget-area-toggle.mobile-icon a').removeClass('non-human-allowed');
								}, 100);
						}

						if ($body.hasClass('ascend') ||
						$('body[data-header-format="left-header"]').length > 0 && $('body.material').length == 0) {

							// Ascend theme skin.
							$('#search-outer > #search form, #search-outer #search .span_12 span, #search-outer #search #close').css('opacity', 0);

							$('#search-outer > #search form').css('transform', 'translateY(-30px)');
							$('#search-outer #search .span_12 span').css('transform', 'translateY(20px)');

							$('#search-outer').show();
							$('#search-outer').stop().transition({
								scale: '1,0',
								'opacity': 1
							}, 0).transition({
								scale: '1,1'
							}, 700, 'cubic-bezier(0.2, 1, 0.3, 1)');

							$('#search-outer > #search form').delay(350).transition({
								'opacity': 1,
								'transform': 'translateY(0)'
							}, 700, 'cubic-bezier(0.2, 1, 0.3, 1)');

							$('#search-outer #search #close').delay(500).transition({
								'opacity': 1
							}, 700, 'cubic-bezier(0.2, 1, 0.3, 1)');


							$('#search-outer #search .span_12 span').delay(450).transition({
								'opacity': 1,
								'transform': 'translateY(0)'
							}, 700, 'cubic-bezier(0.2, 1, 0.3, 1)');

						}

						else if (!$body.hasClass('material')) {
							// Original theme skin.
							$('#search-outer').stop(true).fadeIn(600, 'easeOutExpo');
						}
						else {

							// Material theme skin.
							$('#header-outer[data-transparent-header="true"] .bg-color-stripe').css('transition', '');
							$('#search-outer, #ajax-content-wrap').addClass('material-open');
							nectarState.materialSearchOpen = true;
							$headerOuterEl.addClass('material-search-open');
							$('#fp-nav').addClass('material-ocm-open');

							$(window).trigger('nectar-search-open');

						}


						setTimeout(function () {

							$('#search input[type=text]').trigger('focus');

							if ($('#search input[type=text]').val() == $placeholder) {
								$('#search input[type=text]').setCursorPosition(0);
							}

						}, 300);


						if ( !$(this).hasClass('nectar-search-open-trigger')) {
							$(this).toggleClass('open-search');
						}


						// Close slide out widget area.
						$('.slide-out-widget-area-toggle a:not(#toggle-nav).open:not(.animating)').trigger('click');

						return false;

					});

					// Handle the placeholder value.
					$('body:not(.material)').on('keydown', '#search input[type=text]', function () {
						if ($(this).val() == $placeholder) {
							$(this).val('');
						}
					});

					$('body:not(.material)').on('keyup', '#search input[type=text]', function () {
						if ($(this).val().length == 0 ) {
							$(this).val($placeholder);
							$(this).setCursorPosition(0);
						}
					});


					// Close search btn event.
					$body.on('click', '#close', function () {
						closeSearch();
						$searchButtonEl.removeClass('open-search');
						$('#header-outer .mobile-search').removeClass('open-search');
						return false;
					});

					// Original and Ascend skin close search when clicking off.
					$('body:not(.material)').on('blur', '#search-box input[type=text]', function () {
						closeSearch();
						$searchButtonEl.removeClass('open-search');
						$('#header-outer .mobile-search').removeClass('open-search');
					});


					// Material skin close when clicking off the search.
					$('body.material').on('click', '#ajax-content-wrap', function (e) {
						if (e.originalEvent !== undefined) {
							closeSearch();
							$searchButtonEl.removeClass('open-search');
							$('#header-outer .mobile-search').removeClass('open-search');

						}
					});

					// Material skin close on esc button event.
					if ($('body.material').length > 0) {
						$(document).on('keyup', function (e) {

							if (e.keyCode == 27) {
								closeSearch();
								$searchButtonEl.removeClass('open-search');

								// Close ocm material
								if ($('.ocm-effect-wrap.material-ocm-open').length > 0) {
									$('.slide-out-widget-area-toggle.material-open a').trigger('click');
								}
							}

						});
					}



					// Called to hide the search bar.
				function closeSearch() {

					if ($body.hasClass('ascend') || $('body[data-header-format="left-header"]').length > 0 && $('body.material').length == 0) {
						$('#search-outer').stop().transition({
							'opacity': 0
						}, 300, 'cubic-bezier(0.2, 1, 0.3, 1)');
						$searchButtonEl.addClass('inactive');
						setTimeout(function () {
							$('#search-outer').hide();
							$searchButtonEl.removeClass('inactive');
						}, 300);
					} else if ($('body.material').length == 0) {
						$('#search-outer').stop(true).fadeOut(450, 'easeOutExpo');
					}

					if ($body.hasClass('material')) {

						$(window).trigger('nectar-search-close');

						var closeTimeoutDur = ($headerOuterEl.hasClass('results-shown')) ? 800 : 400;
						setTimeout(function(){
							$('#search-outer #s').val('');
						},closeTimeoutDur);

						$('#ajax-content-wrap').removeClass('material-open');
						nectarState.materialSearchOpen = false;
						$headerOuterEl.removeClass('material-search-open');
						$('#search-outer').removeClass('material-open');
						$('#fp-nav').removeClass('material-ocm-open');

						}
					}

				}






				/**
				 * Header layout "Centered header bottom bar" functionality.
				 *
				 * @since 9.0
				 */
				function centeredNavBottomBarReposition() {

					var $headerOuter      = $headerOuterEl,
					$headerSpan9          = $('#header-outer[data-format="centered-menu-bottom-bar"] header#top .span_9'),
					$headerSpan3          = $('#header-outer[data-format="centered-menu-bottom-bar"] header#top .span_3'),
					$secondaryHeader      = $headerSecondaryEl,
					$headerBtns           = $headerSpan3.find('nav >ul.buttons'),
					$navLogoMargin        = parseInt($('body.material #header-outer').attr('data-padding')),
					$navLogoHeight        = parseInt($('body.material #header-outer').attr('data-logo-height')),
					$separatorExtra       = parseInt($headerSpan3.css('margin-bottom')),
					$triggerCondition     = $navLogoMargin + $separatorExtra + $navLogoHeight + parseInt(nectarDOMInfo.secondaryHeaderHeight);

					if ($secondaryHeader.length > 0) {

						if ($('#header-outer[data-remove-fixed="1"]').length == 0 && $('#header-outer[data-condense="true"]').length > 0) {

							setTimeout(function () {
								if( $headerSecondaryEl.css('display') != 'none' ) {
									nectarDOMInfo.secondaryHeaderHeight = $headerSecondaryEl.outerHeight();
								}

							}, 50);
						}

					}

					// Helper to determine if custom mobile breakpoint is active.
					function condenseCustomBreakPointHelper() {

						var $withinCustomBreakpoint = mobileBreakPointCheck();

						// Adding class to prevent logo from hiding when opening OCM
						if ( $withinCustomBreakpoint ) {
							$headerOuterEl.addClass('within-custom-breakpoint');
						} else {
							$headerOuterEl.removeClass('within-custom-breakpoint');
						}
					}


					// Bind events if "Condense Header On Scroll" effect is enabled.
					if ($('#header-outer[data-condense="true"]').length > 0) {

						$window.on('scroll.centeredNavCondense', centeredNavBottomFixed_Scroll);
						$window.trigger('scroll');

						$window.on('resize', function(){
							if(nectarDOMInfo.winW < 1000 || mobileBreakPointCheck() ) {
								$headerOuter.addClass('force-condense-remove');
								$window.off('scroll.centeredNavCondense');
							}
						});

						$window.on('smartresize', function() {

							condenseCustomBreakPointHelper();

							if(nectarDOMInfo.winW >= 1000 && false == mobileBreakPointCheck() ) {

								// Coming from mobile.
								if($headerOuter.hasClass('force-condense-remove')) {

									// Remove condense effect.
									centeredNavBottomFixed_Scroll();
									$headerOuter.removeClass('force-condense-remove');

									// See if the condense effect needs to be reapplied.
									setTimeout(function() {

										if(nectarDOMInfo.scrollTop >= $triggerCondition) {
											$headerOuter.addClass('force-condense');
											centeredNavBottomFixed_Scroll();
											$headerOuter.removeClass('force-condense');
										}
										// Bind scroll event.
										$window.on('scroll.centeredNavCondense', centeredNavBottomFixed_Scroll);
									},200);

								}
							}

						});

						condenseCustomBreakPointHelper();

					}



					function centeredNavBottomFixed_Scroll() {

						// Bypass calculating.
						if (nectarDOMInfo.winW < 1000 ||
							$('body.page-template-template-no-header').length > 0 ||
							$('body.page-template-template-no-header-footer').length > 0 ||
							$('body.material-ocm-open').length > 0 ||
							$('#header-outer[data-has-menu="true"][data-format="centered-menu-bottom-bar"] .span_9').css('display') == 'none' ||
						  $('#header-outer[data-has-menu="true"][data-format="centered-menu-bottom-bar"] .span_9 > nav').css('display') == 'none') {
							return;
						}

						$bodyBorderTop = ($bodyBorderTop.length > 0 && nectarDOMInfo.secondaryHeaderHeight > 0) ? $bodyBorderTop.height() : 0;


						// Add condense effect.
						if ($headerOuter.hasClass('force-condense') || !$headerOuter.hasClass('fixed-menu') && nectarDOMInfo.scrollTop >= $triggerCondition) {

							var amountToMove = (parseInt($headerSpan9.position().top) - $navLogoMargin - parseInt(nectarDOMInfo.adminBarHeight)) + parseInt(nectarDOMInfo.secondaryHeaderHeight) - $bodyBorderTop;

							// Megamenu removes transparency option
							if ($('#header-outer[data-megamenu-rt="1"]').length > 0 && $('#header-outer .megamenu').length > 0 && $('#header-outer[data-transparent-header="true"]').length > 0) {
								$headerOuterEl.removeClass('no-transition');
							}

							$headerOuter.addClass('fixed-menu').removeClass('transparent').css({
								'top': '-' + amountToMove + 'px',
								'position': 'fixed'
							});

							if( !$headerOuter.is('[data-menu-bottom-bar-align="left"]') ) {

								var $headerNavBarOffset  = ($('header#top .span_9 nav > ul .menu-title-text').length > 0) ? $('header#top .span_9 nav > ul .menu-title-text').offset().top : 0;
								var $headerButtonsOffset = ($headerBtns.find('li:first-child > *').length > 0) ? $headerBtns.find('li:first-child > *').offset().top : 0;
								var $headerButtonsHeight = ($headerSpan9.find('nav .sf-menu > li > a .menu-title-text').length > 0) ? (20 - parseInt($headerSpan9.find('nav .sf-menu > li > a .menu-title-text').height())) / 2 : 2;

								$headerBtns.css('transform', 'translateY(' + Math.ceil(parseInt($headerNavBarOffset) - parseInt($headerButtonsOffset) - $headerButtonsHeight) + 'px)');
								$headerBtns.find('.nectar-woo-cart').css({
									'height': 'auto'
								});

							}

						}

						// Remove condense effect.
						else if ($headerOuter.hasClass('force-condense-remove') || $headerOuter.hasClass('fixed-menu') && nectarDOMInfo.scrollTop < $triggerCondition ) {

							$headerOuter.removeClass('fixed-menu').css({
								'top': '0',
								'position': 'absolute'
							});

							$headerBtns.css('transform', 'translateY(0px)');
							$headerBtns.find('.nectar-woo-cart').css({
								'height': '',
								'position': 'relative'
							});

							if ($('#header-outer.transparent').length == 0) {

								if ($('#header-outer[data-megamenu-rt="1"]').length > 0 &&
								$('#header-outer .megamenu').length > 0) {
									$headerOuterEl.removeClass('no-transition');
								}

								if ($('#header-outer[data-megamenu-rt="1"]').length > 0 &&
								$('#header-outer[data-transparent-header="true"]').length > 0 &&
								$('#header-outer .megamenu').length > 0) {

									if ($headerOuterEl.attr('data-transparent-header') == 'true' &&
									$('.nectar-box-roll').length == 0 &&
									$('.megamenu.sfHover:not(.width-75):not(.width-50)').length == 0) {

										$headerOuterEl.addClass('transparent');
										$headerOuterEl.removeClass('no-transition');

									}
									else if ($headerOuterEl.attr('data-transparent-header') == 'true' &&
									$('.nectar-box-roll').length == 0 &&
									$('.megamenu.sfHover').length > 0) {

										$headerOuterEl.addClass('no-transition');
									}

								}

								else {
									if ($headerOuterEl.attr('data-transparent-header') == 'true' && $('.nectar-box-roll').length == 0) {
										$headerOuterEl.addClass('transparent');
									}
								}

							} // endif transparent header conditional.


						} // End Remove condense effect.

					} // End centeredNavBottomFixed_Scroll.



				}




				/**
				 * Header layout "Centered header bottom bar" initialization.
				 *
				 * @since 10.5
				 */
				function centeredNavBottomBarInit() {

					if ($('#header-outer[data-format="centered-menu-bottom-bar"]').length > 0) {
						centeredNavBottomBarReposition();
					}

				}





				/**
				* Header layout "Centered logo between menu".
				*
				* Splits the main navigation menu into two sections placed on each side of logo.
				*
				* @since 8.0
				*/
				function centeredLogoMargins() {

					if (nectarDOMInfo.winW > 1000) {

						var $navItemLength = $('#header-outer[data-format="centered-logo-between-menu"] #top nav > .sf-menu:not(.buttons) > li').length;

						if ($('#header-outer #social-in-menu').length > 0) {
							$navItemLength--;
						}

						var $centerLogoWidth,
						$extraMenuSpace;

						if ($('#header-outer #top .row .col.span_3 #logo img:visible').length == 0) {
							$centerLogoWidth = parseInt($('#header-outer #top .row .col.span_3').width());
						} else {
							$centerLogoWidth = parseInt($('#header-outer #top .row .col.span_3 img:visible').width());
						}

						if ($('#header-outer[data-lhe="animated_underline"]').length > 0) {
							$extraMenuSpace = parseInt($('header#top nav > ul > li:first-child > a').css('margin-right'));
						} else {
							$extraMenuSpace = parseInt($('header#top nav > ul > li:first-child > a').css('padding-right'));
						}

						if ($extraMenuSpace > 30) {
							$extraMenuSpace += 45;
						} else if ($extraMenuSpace > 20) {
							$extraMenuSpace += 40;
						} else {
							$extraMenuSpace += 30;
						}

						if (!$body.hasClass('rtl')) {
							$('#header-outer[data-format="centered-logo-between-menu"] #top nav > .sf-menu:not(.buttons) > li:nth-child(' + Math.floor($navItemLength / 2) + ')').css({
								'margin-right': ($centerLogoWidth + $extraMenuSpace) + 'px'
							}).addClass('menu-item-with-margin');
						} else {
							$('#header-outer[data-format="centered-logo-between-menu"] #top nav > .sf-menu:not(.buttons) > li:nth-child(' + Math.floor($navItemLength / 2) + ')').css({
								'margin-left': ($centerLogoWidth + $extraMenuSpace) + 'px'
							}).addClass('menu-item-with-margin');
						}

						var $leftMenuWidth 	= 0;
						var $rightMenuWidth = 0;

						$('#header-outer[data-format="centered-logo-between-menu"] #top nav > .sf-menu:not(.buttons) > li:not(#social-in-menu)').each(function (i) {
							if (i + 1 <= Math.floor($navItemLength / 2)) {
								$leftMenuWidth += $(this).width();
							} else {
								$rightMenuWidth += $(this).width();
							}

						});

						var $menuDiff = Math.abs($rightMenuWidth - $leftMenuWidth);

						if ($leftMenuWidth > $rightMenuWidth || ($body.hasClass('rtl') && $leftMenuWidth < $rightMenuWidth) ) {
							$('#header-outer #top .row > .col.span_9').css('padding-right', $menuDiff);
						} else {
							$('#header-outer #top .row > .col.span_9').css('padding-left', $menuDiff);
						}

						$('#header-outer[data-format="centered-logo-between-menu"] nav').css('visibility', 'visible');

					}

					else if ($('#header-outer[data-format="centered-logo-between-menu"]').length > 0 && nectarDOMInfo.winW < 1000) {
						$('#header-outer .row > .col.span_9').css({
							'padding-right': '0',
							'padding-left': '0'
						});
					}

				}


				/**
				* Header layout "Centered logo between menu" initialization.
				*
				* @since 10.5
				*/
				function centeredLogoHeaderInit() {

					if($('#header-outer[data-format="centered-logo-between-menu"]').length > 0) {

						if(!usingLogoImage) {
							centeredLogoMargins();
						}
						else if(usingLogoImage && $('#header-outer[data-format="centered-logo-between-menu"]').length > 0 && $('header#top #logo img:first[src]').length > 0) {

							//fadein img on load
							var tempLogoImg = new Image();
							tempLogoImg.src = $('header#top #logo img:first').attr('src');

							tempLogoImg.onload = function() {
								centeredLogoMargins();
							};

						}

						// Resize event.
						$window.on('smartresize', centeredLogoMargins);

					}

				}





				/**
				* Handle basic items before initializing effects.
				*
				* @since 10.5
				*/
				function headerNavPreInit() {

					// Page fullscreen rows does not need permanent transparent.
					if ($('#nectar_fullscreen_rows').length > 0 && $fullscreenMarkupBool == true) {
						($headerOuterEl.attr('data-permanent-transparent', 'false'));
					}

					// Set mobile header height.
					if (nectarDOMInfo.usingMobileBrowser && $('#header-outer[data-mobile-fixed="1"]').length > 0 &&
					$('#header-outer[data-transparent-header="true"]').length == 0) {
						$('#header-space').css('height', $headerOuterEl.outerHeight()).addClass('calculated');
					}

					// Header nav entrance animation.
					if( window.nectarOptions && window.nectarOptions.header_entrance && window.nectarOptions.header_entrance == 'true' ) {
						if( nectarDOMInfo.scrollTop == 0 ) {
						$('#header-outer').addClass('entrance-animation');
						} else {
						$('#header-outer').css('opacity','1');
						}
					}



					// Permanent transparent header.
					if ($('#nectar_fullscreen_rows').length == 0 && $('.nectar-box-roll').length == 0) {
						midnightInit();
					} else if( $('#nectar_fullscreen_rows').length > 0 && $fullscreenMarkupBool == false ) {
						midnightInit();
					}

				}




				/**
				* Hide header until needed.
				*
				* Used when "Header Hide Until Needed" is active.
				*
				* @since 10.5
				*/
				var hhunState = {
					timeoutQueued: false,
					visible: true,
					init: false,
					raf: '',
					bodyOffsetHeight: 10000
				}

				function hhunHeaderEffect() {

					var previousScroll = 0, // previous scroll position
						menuOffset = (headerTransparent == false && $('#page-header-bg[data-parallax="1"]').length > 0) ? 200 : 60, // height of menu (once scroll passed it, menu is hidden)
						hideShowOffset = 2, // scrolling value after which triggers hide/show menu
						stickyPageSubmenu = ($('.page-submenu[data-sticky="true"]').length > 0) ? true : false;

						hhunState.bodyOffsetHeight = document.body.offsetHeight;

					function getBodyHeight() {
						if (nectarState.materialOffCanvasOpen != true) {
							hhunState.bodyOffsetHeight = document.body.offsetHeight;
						}
					}
					// Periodically update the body height.
					if (hhunState.init == false) {
						setInterval(getBodyHeight, 1500);
					}

					// Called in RAF loop to calculate the header visibility.
					function hhunCalcs() {

						$headerOuterEl[0].classList.add('detached');


						var currentScroll = nectarDOMInfo.scrollTop, // Gets current scroll position
							scrollDifference = Math.abs(currentScroll - previousScroll); // Calculates how fast user is scrolling

						// Stop scrolling while animated anchors / box roll
						if (nectarState.animatedScrolling == true ||
							nectarState.preventScroll == true ||
							nectarState.ocmOpen == true) {


							if (currentScroll > menuOffset) {

								// Remove transparent when clicking anchor from the top
								if (nectarState.animatedScrolling == true && headerTransparent == true && nectarState.permanentTransHeader == false) {
									$headerOuterEl.removeClass('transparent').addClass('scrolling');
								}

								// Still keep scroll tracking to continue hiding menu.
								previousScroll = nectarDOMInfo.scrollTop;
								currentScroll = nectarDOMInfo.scrollTop;

							}

							hhunState.raf = requestAnimationFrame(hhunCalcs);
							return;

						}

						// Stop when material ocm or material search is open
						if (nectarState.materialOffCanvasOpen == true || nectarState.materialSearchOpen == true) {

							// Still handle transparency when scrolling with material search open.
							if (nectarState.materialSearchOpen == true && headerTransparent == true) {

								if (nectarState.permanentTransHeader == false && currentScroll > menuOffset) {
									$headerOuterEl.removeClass('transparent').addClass('scrolling');
								} else {
									$headerOuterEl.addClass('transparent').removeClass('scrolling');
								}

							}

							hhunState.raf = requestAnimationFrame(hhunCalcs);
							return;

						}


						if (!$headerOuterEl.hasClass('side-widget-open') && !$('#header-outer .slide-out-widget-area-toggle a').hasClass('animating')) {

							var heightToAdjust;


							// Handle secondary header
							if ($headerSecondaryEl.length > 0) {
								if (currentScroll > menuOffset) {
									$headerSecondaryEl.addClass('hide-up');
									$headerOuterEl.css('transform', 'translateY(-' + nectarDOMInfo.secondaryHeaderHeight + 'px)');
								} else {
									$headerSecondaryEl.removeClass('hide-up');
									$headerOuterEl.css('transform', '0px)');
								}
							}


							// Scrolled past menu
							if (currentScroll > menuOffset) {

								// Handle transparency
								if (nectarState.permanentTransHeader == false) {

									if (hhunState.timeoutQueued == false) {
										setTimeout(function () {

											if (false == nectarState.ocmOpen) {
												$headerOuterEl.removeClass('transparent');
												$headerOuterEl.addClass('scrolling');
											}
											hhunState.timeoutQueued = false;

										}, 400);
									}
									hhunState.timeoutQueued = true;

								}

								$headerOuterEl.removeClass('no-transition');


								// Scrolling faster than hideShowOffset hide/show menu
								if (scrollDifference >= hideShowOffset) {



									if (currentScroll > previousScroll) {

										// Hide menu
										if (!$headerOuterEl.hasClass('invisible')) {

											$headerOuterEl
												.addClass('invisible')
												.removeClass('at-top');

											// Close submenus
											if (nectarDOMInfo.winW > 1000 && $(".sf-menu").length > 0 && $().superfish) {
												$(".sf-menu").superfish('hide');
												$('header#top nav > ul.sf-menu > li.menu-item-over').removeClass('menu-item-over');
											}

										}

										if (stickyPageSubmenu == true) {
											$('.page-submenu.stuck')
												.css('transform', 'translateY(0px)')
												.addClass('header-not-visible');
										}


									} else {

										// Show menu
										if ($headerOuterEl.hasClass('invisible')) {
											$headerOuterEl.removeClass('invisible');
										}

										// Page submenu adjust
										if (stickyPageSubmenu == true) {

											heightToAdjust = $headerOuterEl.outerHeight();

											if ($headerSecondaryEl.length > 0) {
												heightToAdjust -= nectarDOMInfo.secondaryHeaderHeight;
											}

											if ($bodyBorderTop.length > 0 && nectarDOMInfo.winW > 999) {

												$bodyBorderSizeToRemove = ($bodyBorderHeaderColorMatch) ? $bodyBorderTop.height() : 0;

												$('.page-submenu.stuck')
													.css('transform', 'translateY(' + (heightToAdjust - $bodyBorderSizeToRemove) + 'px)')
													.removeClass('header-not-visible');

											} else {
												$('.page-submenu.stuck')
													.css('transform', 'translateY(' + heightToAdjust + 'px)')
													.removeClass('header-not-visible');
											}

										} // End sticky page sub conditional.

									}

								}

							}
							else {
								// At top of document.
								var $topDetachNum = ($headerSecondaryEl.length > 0) ? 32 : 0;
								if ( usingSmoothScroll ) {
									$topDetachNum += 10;
								}
								if ($bodyBorderTop.length > 0) {
									$topDetachNum = ($headerSecondaryEl.length > 0) ? 32 + $bodyBorderTop.height() : $bodyBorderTop.height();
								}

								if (currentScroll <= $topDetachNum) {

									$headerOuterEl
										.addClass('at-top')
										.removeClass('invisible')
										.removeClass('scrolling');

									// Megamenu removes transparent.
									if (nectarDOMInfo.winW > 999 &&
										$('#header-outer[data-megamenu-rt="1"]').length > 0 &&
										headerTransparent == true &&
										$('#header-outer .megamenu').length > 0) {

										if ($('.nectar-box-roll').length == 0 &&
											$('.megamenu.sfHover:not(.width-75):not(.width-50)').length == 0) {

											$headerOuterEl
												.addClass('transparent')
												.css('transform', 'translateY(0)')
												.removeClass('no-transition');

										} else if ($('.nectar-box-roll').length > 0) {

											$headerOuterEl
												.css('transform', 'translateY(0)')
												.addClass('at-top-before-box');
										}

									} else {

										if (headerTransparent == true && nectarBoxRoll.inUse == false) {

											$headerOuterEl
												.addClass('transparent')
												.css('transform', 'translateY(0)');

										}
										else if (nectarBoxRoll.inUse == true) {

											$headerOuterEl
												.css('transform', 'translateY(0)')
												.addClass('at-top-before-box');
										}
									}


								}

							}


							// At the bottom of document - show menu
							if ((nectarDOMInfo.winH + nectarDOMInfo.scrollTop + 30) >= hhunState.bodyOffsetHeight) {

								$headerOuterEl.removeClass('invisible');

								// Page submenu adjust
								if (stickyPageSubmenu == true) {

									heightToAdjust = $headerOuterEl.outerHeight();
									if ($headerSecondaryEl.length > 0) {
										heightToAdjust -= nectarDOMInfo.secondaryHeaderHeight;
									}

									if ($bodyBorderTop.length > 0 && nectarDOMInfo.winW > 999) {

										$bodyBorderSizeToRemove = ($bodyBorderHeaderColorMatch) ? $bodyBorderTop.height() : 0;
										$('.page-submenu.stuck')
											.css('transform', 'translateY(' + (heightToAdjust - $bodyBorderSizeToRemove) + 'px)')
											.removeClass('header-not-visible');
									} else {

										$('.page-submenu.stuck')
											.css('transform', 'translateY(' + heightToAdjust + 'px)')
											.removeClass('header-not-visible');
									}

								} // End sticky page submenu conditional.

							}

						}

						// Keep track of current scroll position
						previousScroll = currentScroll;

						hhunState.raf = requestAnimationFrame(hhunCalcs);


					}

					// Start the animation loop.
					hhunState.raf = requestAnimationFrame(hhunCalcs);

					if (hhunState.init == false) {
						hhunState.init = true;
					}

				}



				/**
				* Shrink the header navigation size.
				*
				* Used when "Header Resize On Scroll" is active.
				*
				* @since 1.0
				*/
				function smallNav() {

					var $offset          = nectarDOMInfo.scrollTop,
					$windowWidth         = nectarDOMInfo.winW,
					$scrollTriggerOffset = 30;

					if( headerTransparent == true && !nectarDOMInfo.usingMobileBrowser ) {
						$scrollTriggerOffset = usingSmoothScroll ? 30 : 0;
					}

					if ($offset > $scrollTriggerOffset && $windowWidth >= 1000 && $('body.material-ocm-open').length == 0) {


						// Going to small when material search is closing, it must be closed immediately
						if ($body.is('.material')) {

							if ($('#search-outer.material-open').length == 0) {
								$('#header-outer[data-transparent-header="true"] .bg-color-stripe').css('transition', 'none');
							}

							// Secondary header
							if ($headerSecondaryEl.length > 0) {
								$headerSecondaryEl.addClass('hide-up');
								$headerOuterEl.css('transform', 'translateY(-' + nectarDOMInfo.secondaryHeaderHeight + 'px)');
							}

						}

						if ($('#header-outer[data-megamenu-rt="1"]').length > 0 &&
						$('#header-outer[data-transparent-header="true"]').length > 0 &&
						$('#header-outer .megamenu').length > 0) {

							if ($headerOuterEl.attr('data-transparent-header') == 'true' &&
							$('#header-outer.side-widget-open').length == 0 &&
							$('#header-outer[data-permanent-transparent="1"]').length == 0 &&
							$('.megamenu.sfHover:not(.width-75):not(.width-50)').length == 0) {
								$headerOuterEl.removeClass('transparent');
								$headerOuterEl.removeClass('no-transition');
							}

						} else {

							if ($headerOuterEl.attr('data-transparent-header') == 'true' &&
							$('#header-outer.side-widget-open').length == 0 &&
							$('#header-outer[data-permanent-transparent="1"]').length == 0) {
								$headerOuterEl.removeClass('transparent');
							}

						}

						// Centered logo between menu.
						$('#header-outer:not(.small-nav) header#top nav > ul > li.menu-item-with-margin').stop(true, true).animate({
							'margin-right': (parseInt($('header#top nav > ul > li.menu-item-with-margin').css('margin-right')) - parseInt(logoShrinkNum) * 3) + 'px'
						}, {
							queue: false,
							duration: 250,
							easing: 'easeOutCubic'
						});

						// Add small nav class.
						$('#header-outer, #search-outer').addClass('small-nav');

						// Body border full width side padding
						if ($('#header-outer[data-full-width="true"][data-transparent-header="true"]').length > 0 &&
						$bodyBorderTop.length > 0 &&
						$bodyBorderHeaderColorMatch == true) {

							$('#header-outer[data-full-width="true"] header > .container').stop(true, true).animate({
								'padding': '0'
							}, {
								queue: false,
								duration: 250,
								easing: 'easeOutCubic'
							});

						}


						// Box roll effect
						if ($('.nectar-box-roll').length > 0 && $('#header-outer[data-permanent-transparent="1"]').length == 0) {
							$('#ajax-content-wrap').animate({
								'margin-top': (Math.floor(($logoHeight - logoShrinkNum) + (headerPadding * 2) / 1.8 + nectarDOMInfo.adminBarHeight + nectarDOMInfo.secondaryHeaderHeight))
							}, {
								queue: false,
								duration: 250,
								easing: 'easeOutCubic'
							});
						}

						$window.off('scroll.headerResizeEffect', smallNav);
						$window.on('scroll.headerResizeEffect', bigNav);

						// Dark slider coloring border
						$('#header-outer[data-transparent-header="true"]').css('transition', 'transform 0.3s ease, background-color 0.30s ease, opacity 0.3s ease, box-shadow 0.30s ease, margin 0.25s ease-out, backdrop-filter 0.25s ease');
						$('#header-outer[data-transparent-header="true"] .cart-menu').css('transition', 'none');
						setTimeout(function () {
							$('#header-outer[data-transparent-header="true"]').css('transition', 'transform 0.3s ease, background-color 0.30s ease, opacity 0.3s ease, box-shadow 0.30s ease, border-color 0.30s ease, margin 0.25s ease-out, backdrop-filter 0.25s ease');
							$('#header-outer[data-transparent-header="true"] .cart-menu').css('transition', 'border-color 0.30s ease');
						}, 300);

					}

				}


				/**
				* Return header navigation size to full.
				*
				* Used when "Header Resize On Scroll" is active.
				*
				* @since 1.0
				*/
				function bigNav() {

					var $offset          = nectarDOMInfo.scrollTop,
					$windowWidth         = nectarDOMInfo.winW,
					$scrollTriggerOffset = 30;

					if ($body.is('.material-ocm-open')) {
						return false;
					}

					if( headerTransparent == true && !nectarDOMInfo.usingMobileBrowser ) {
						$scrollTriggerOffset = usingSmoothScroll ? 30 : 0;
					}

					if ($offset <= $scrollTriggerOffset && $windowWidth >= 1000 || $('.small-nav').length > 0 && $('#ajax-content-wrap.no-scroll').length > 0) {

						$('#header-outer, #search-outer').removeClass('small-nav');

						if ($('#header-outer[data-megamenu-rt="1"]').length > 0 &&
						$('#header-outer[data-transparent-header="true"]').length > 0 &&
						$('#header-outer .megamenu').length > 0) {

							if ($headerOuterEl.attr('data-transparent-header') == 'true' &&
							$('.nectar-box-roll').length == 0 &&
							$('.megamenu.sfHover:not(.width-75):not(.width-50)').length == 0) {

								$headerOuterEl.addClass('transparent');
								$headerOuterEl.removeClass('no-transition');
							}

						} else {

							if ($headerOuterEl.attr('data-transparent-header') == 'true' && $('.nectar-box-roll').length == 0) {
								$headerOuterEl.addClass('transparent');
							}

						}

						// Body border full width side padding
						if ($('#header-outer[data-full-width="true"][data-transparent-header="true"]').length > 0 &&
						$bodyBorderTop.length > 0 &&
						$bodyBorderHeaderColorMatch == true) {

							$('#header-outer[data-full-width="true"] header > .container').stop(true, true).animate({
								'padding': '0 28px'
							}, {
								queue: false,
								duration: 250,
								easing: 'easeOutCubic'
							});

						}

						// centered logo between menu.
						$('header#top nav > ul > li.menu-item-with-margin').stop(true, true).animate({
							'margin-right': (parseInt($('header#top nav > ul > li.menu-item-with-margin').css('margin-right')) + parseInt(logoShrinkNum) * 3) + 'px'
						}, {
							queue: false,
							duration: 150,
							easing: 'easeOutCubic'
						});


						// Secondary header
						if ($headerSecondaryEl.length > 0) {

							$headerSecondaryEl.removeClass('hide-up');
							$headerOuterEl
								.removeClass('hide-up')
								.css('transform', 'translateY(0%)');

						}

						// Box roll
						if ($('.nectar-box-roll').length > 0 && $('#header-outer[data-permanent-transparent="1"]').length == 0) {
							$('#ajax-content-wrap').animate({
								'margin-top': (Math.floor(($logoHeight) + (headerPadding * 2) + nectarDOMInfo.adminBarHeight + nectarDOMInfo.secondaryHeaderHeight))
							}, {
								queue: false,
								duration: 250,
								easing: 'easeOutCubic'
							});
						}

						$window.off('scroll.headerResizeEffect', bigNav);
						$window.on('scroll.headerResizeEffect', smallNav);

						// Dark slider coloring border
						$('#header-outer[data-transparent-header="true"]').css('transition', 'transform 0.3s ease, background-color 0.30s ease, opacity 0.3s ease, box-shadow 0.30s ease, margin 0.25s ease-out, backdrop-filter 0.25s ease');
						$('#header-outer[data-transparent-header="true"] .cart-menu').css('transition', 'none');
						setTimeout(function () {
							$('#header-outer[data-transparent-header="true"]').css('transition', 'transform 0.3s ease, background-color 0.30s ease, opacity 0.3s ease, box-shadow 0.30s ease, border-color 0.30s ease, margin 0.25s ease-out, backdrop-filter 0.25s ease');
							$('#header-outer[data-transparent-header="true"] .cart-menu').css('transition', 'border-color 0.30s ease');
						}, 300);
					}

				}



				/**
				* Default scroll event to handle transparency/secondary header when no header effects are enabled.
				*
				* @since 4.0
				*/
				function opaqueCheck() {

					// The condense header effect will bypass this unless in the custom mobile breakpoint (which is defined in theme options).
					if ($('#header-outer[data-format="centered-menu-bottom-bar"][data-condense="true"]').length > 0 && !$headerOuterEl.hasClass('within-custom-breakpoint') ) {
						return;
					}

					if (nectarDOMInfo.scrollTop >= 1) {

						if ($('body.material').length > 0) {
							$headerOuterEl.addClass('scrolled-down');

							// Secondary header
							if ($headerSecondaryEl.length > 0 && nectarDOMInfo.winW > 1000) {
								$headerSecondaryEl.addClass('hide-up');
								$headerOuterEl.css('transform', 'translateY(-' + nectarDOMInfo.secondaryHeaderHeight + 'px)');
							}
						}

						if ($headerOuterEl.attr('data-transparent-header') == 'true' && $('#header-outer[data-permanent-transparent="1"]').length == 0) {
							$headerOuterEl.removeClass('transparent').addClass('scrolled-down');
						}

						// Switch event to watch.
						$window.off('scroll.headerResizeEffectOpaque', opaqueCheck);
						$window.on('scroll.headerResizeEffectOpaque', transparentCheck);
					}
				}


				/**
				* Default scroll event to handle transparency/secondary header when no header effects are enabled.
				*
				* @since 4.0
				*/
				function transparentCheck() {

					// The condense header effect will bypass this unless in the custom mobile breakpoint (which is defined in theme options).
					if ($('#header-outer[data-format="centered-menu-bottom-bar"][data-condense="true"]').length > 0 && !$headerOuterEl.hasClass('within-custom-breakpoint') ) {
						return;
					}

					if (nectarDOMInfo.scrollTop < 1 && $('body.material-ocm-open').length == 0) {

						if ($('#header-outer[data-megamenu-rt="1"]').length > 0 &&
						$('#header-outer[data-transparent-header="true"]').length > 0 &&
						$('#header-outer .megamenu').length > 0) {

							if ($headerOuterEl.attr('data-transparent-header') == 'true' && $('.megamenu.sfHover:not(.width-75):not(.width-50)').length == 0) {

								$headerOuterEl
									.addClass('transparent')
									.removeClass('scrolled-down');

								$headerOuterEl.removeClass('no-transition');

							} else if ($headerOuterEl.attr('data-transparent-header') == 'true') {

								$headerOuterEl.removeClass('scrolled-down');
							}

						} else {

							if ($headerOuterEl.attr('data-transparent-header') == 'true') {
								$headerOuterEl
									.addClass('transparent')
									.removeClass('scrolled-down');
							}

						}

						if ($('body.material').length > 0) {
							$headerOuterEl.removeClass('scrolled-down');

							// Secondary header
							if ($headerSecondaryEl.length > 0 && nectarDOMInfo.winW > 1000) {

								$headerSecondaryEl.removeClass('hide-up');
								$headerOuterEl
									.removeClass('hide-up')
									.css('transform', 'translateY(0%)');
							}
						}

						// Switch event to watch.
						$window.off('scroll.headerResizeEffectOpaque', transparentCheck);
						$window.on('scroll.headerResizeEffectOpaque', opaqueCheck);
					}

				}




				/**
				* Mobile header event for handling transparency/secondary header.
				*
				* @since 10.5
				* @see bindScrollEffectsMobile
				*/
				function mobileHeaderRAF() {

					if ( nectarState.materialOffCanvasOpen == true ) {
						requestAnimationFrame(mobileHeaderRAF);
						return;
					}
					// Scrolled down.
					if (nectarDOMInfo.scrollTop > 5 ) {

						if( nectarState.mobileHeader != 'scrolled' ) {

							if ( nectarState.permanentTransHeader == false ) {
								$headerOuterEl.removeClass('transparent');
							}

							if (nectarDOMInfo.secondaryHeaderHeight > 0) {
								$headerSecondaryEl.addClass('hide-up');
								$headerOuterEl.css('transform', 'translateY(-' + nectarDOMInfo.secondaryHeaderHeight + 'px)').addClass('hidden-secondary');
							} else {
								$headerOuterEl.removeClass('hidden-secondary');
							}

							$headerOuterEl.addClass('scrolled-down');

							// Update state.
							nectarState.mobileHeader = 'scrolled';
						}

					}
					// At top.
					else {

						if( nectarState.mobileHeader != 'at-top' ) {

							if ($headerOuterEl.attr('data-transparent-header') == 'true') {
								$headerOuterEl.addClass('transparent');
							}

							if (nectarDOMInfo.secondaryHeaderHeight > 0) {
								$headerSecondaryEl.removeClass('hide-up');
								$headerOuterEl.css('transform', 'translateY(0px)');
							}
							$headerOuterEl.removeClass('hidden-secondary').removeClass('scrolled-down');

							// Update state.
							nectarState.mobileHeader = 'at-top';
						}

					}

					if (nectarDOMInfo.winW < 1000) {
						requestAnimationFrame(mobileHeaderRAF);
					}
				}



				/**
				* Bind mobile header scroll effects.
				*
				* @since 10.5
				* @see headerNavScrollInit
				*/
				function bindScrollEffectsMobile() {

					if (nectarDOMInfo.winW > 999) {
						return;
					}

					// Reset state.
					nectarState.mobileHeader = '';

					// Unbind desktop effects.
					$window.off('scroll.headerResizeEffect');
					$window.off('scroll.headerResizeEffectOpaque');


					// Handle mobile transparent class.
					if (headerHideUntilNeeded == '1' && $('#header-outer[data-mobile-fixed="1"]').length > 0) {

						if ($('.nectar-box-roll').length > 0) {
							$headerOuterEl.addClass('at-top-before-box');
						}

						cancelAnimationFrame( hhunState.raf );
						hhunState.timeoutQueued = false;
						hhunHeaderEffect();

					}
					else if ($('#header-outer[data-mobile-fixed="1"]').length > 0) {
						requestAnimationFrame(mobileHeaderRAF);

						// Remove HHUN classes.
						cancelAnimationFrame( hhunState.raf );

						$headerOuterEl
						.removeClass('scrolled-down')
						.removeClass('detached')
						.removeClass('invisible')
						.removeClass('at-top')
						.css('transform', 'none');
					}
					else if ($headerOuterEl.attr('data-transparent-header') == 'true') {
						$headerOuterEl.addClass('transparent');
					}

					$window.off('smartresize.nectarNavScrollEffects');
					$window.on('smartresize.nectarNavScrollEffects', bindScrollEffectsDesktop);

				}

				/**
				* Bind deaktop header scroll effects.
				*
				* @since 10.5
				* @see headerNavScrollInit
				*/
				function bindScrollEffectsDesktop() {

					if (nectarDOMInfo.winW < 1000) {
						return;
					}

					if (headerResize == true && headerHideUntilNeeded != '1') {

						$window.off('scroll.headerResizeEffect');

						if ($('#nectar_fullscreen_rows').length == 0) {
							$window.on('scroll.headerResizeEffect', smallNav);
						} else if ($('#nectar_fullscreen_rows[data-mobile-disable="on"]').length > 0 && nectarDOMInfo.usingMobileBrowser) {
							$window.on('scroll.headerResizeEffect', smallNav);
						}

					} else if (headerHideUntilNeeded != '1') {

						$window.off('scroll.headerResizeEffectOpaque');
						$window.on('scroll.headerResizeEffectOpaque', opaqueCheck);

					} else if (headerHideUntilNeeded == '1') {


						if ($('.nectar-box-roll').length > 0) {
							$headerOuterEl.addClass('at-top-before-box');
						}

						// Don't trigger for header remove stickiness.
						if ($('#header-outer[data-remove-fixed="1"]').length == 0) {
							cancelAnimationFrame( hhunState.raf );
							hhunHeaderEffect();
						} else {
								// Remove HHUN classes.
								cancelAnimationFrame( hhunState.raf );
								hhunState.timeoutQueued = true;

								// maybe transparent.
								if ($headerOuterEl.attr('data-transparent-header') == 'true' &&
									$('body.material #header-outer[data-condense="true"]').length == 0 &&
									$headerOuterEl.hasClass('detached') ) {
										// only if coming from hhun active.
									$headerOuterEl.addClass('transparent');
								}

								$headerOuterEl
								.removeClass('scrolled-down')
								.removeClass('detached')
								.removeClass('invisible')
								.removeClass('at-top')
								.css('transform', 'none');

						}


					} //end if hhun

					// Condense header effect coming from mobile.
					if ($('#header-outer[data-format="centered-menu-bottom-bar"][data-condense="true"]').length > 0 ) {

						if( $headerSecondaryEl.length > 0 ) {
							// Remove transform.
							$headerOuterEl.css('transform','');
						}

						if ( nectarDOMInfo.scrollTop > 200 && !$headerOuterEl.hasClass('fixed-menu') ) {
							$headerOuterEl.addClass('fixed-menu');
						}

					}

					// Only bind mobile if applicable.

					$window.off('smartresize.nectarNavScrollEffects');
					$window.on('smartresize.nectarNavScrollEffects', bindScrollEffectsMobile);

				}



				/**
				* Header Navigation scroll events initialization.
				*
				* @since 10.5
				*/

				function headerNavScrollInit() {

					// Remove transparent class if page loaded further down.
					if ($('#header-outer[data-remove-fixed="1"]').length == 0 && nectarDOMInfo.winW > 1000) {
						if ( $(window).scrollTop() != 0 && $('#header-outer.transparent[data-permanent-transparent="false"]').length == 1) {
							$headerOuterEl.removeClass('transparent');
						}
					}


					// Determine which events to bind at start.
					if (nectarDOMInfo.winW < 1000 ) {

						if ( $('.nectar-box-roll').length == 0 ||
									headerHideUntilNeeded == '1' &&
									$('#header-outer[data-remove-fixed="1"]').length == 0 ) {

										bindScrollEffectsMobile();
										$window.on('smartresize.nectarNavScrollEffects', bindScrollEffectsMobile);
						}

					} else {
						bindScrollEffectsDesktop();
						$window.on('smartresize.nectarNavScrollEffects', bindScrollEffectsDesktop);
					}

				}






				/**
				* Set the header space div height.
				*
				* @since 10.5
				*/
				function headerSpace() {

					if ($('.mobile').length > 0) {

						if (nectarDOMInfo.winH < nectarDOMInfo.winW && nectarDOMInfo.winW > 1000) {
							if ($('#header-outer.small-nav').length == 0) {
								$('#header-space').css('height', $headerOuterEl.outerHeight()).addClass('calculated');
							}
						} else {
							$('#header-space').css('height', $headerOuterEl.outerHeight()).addClass('calculated');
						}

					} else {

						if ($('.nectar-parallax-scene.first-section').length == 0) {

							var headerPadding2 = headerPadding - headerPadding / 1.8;
							var $headerHeight = ($('#header-outer[data-header-resize="1"]').length > 0 && $('.small-nav').length > 0) ? $headerOuterEl.outerHeight() + (parseInt(logoShrinkNum) + headerPadding2 * 2) : $headerOuterEl.outerHeight();

							// Is the calculation greater than the margin of error?
							if( Math.abs($headerHeight - $('#header-space').height()) > 7) {
								$('#header-space').css('height', $headerHeight).addClass('calculated');
							}


						}

					}

				}



				/**
				* Handle header nav distance away from top to account for admin bar.
				*
				* @since 10.5
				*/

				function headerNavOffsetInit() {

					var lastPosition     = -1;
					var lastPosition2    = -1;
					var $headerScrollTop = nectarDOMInfo.scrollTop;

					// Verify scroll pos has changed before calculating.
					function headerOffsetAdjust() {

						if ( $body.hasClass('compose-mode') ) {
							return;
						}

						$headerScrollTop = nectarDOMInfo.scrollTop;

						if (lastPosition == $headerScrollTop) {
							requestAnimationFrame(headerOffsetAdjust);
							return false;
						} else {
							lastPosition = $headerScrollTop;
						}

						headerOffsetAdjustCalc();
						requestAnimationFrame(headerOffsetAdjust);

					}

					// Called when scrolling occurs.
					function headerOffsetAdjustCalc() {

						var $eleHeight = 0;

						// Mobile.
						if (nectarDOMInfo.winW < 1000 ||
						   (condenseHeaderLayout == true && $('#header-outer .span_9').css('display') == 'none') ||
							 (condenseHeaderLayout == true && $('#header-outer .span_9 > nav').css('display') == 'none')) {

							$eleHeight = 0;
							var $endOffset = ($wpAdminBar.css('position') == 'fixed') ? $wpAdminBar.height() : 0;

							$eleHeight += nectarDOMInfo.adminBarHeight;

							if ($eleHeight - $headerScrollTop > $endOffset) {
								$headerOuterEl.css('top', $eleHeight - $headerScrollTop + 'px');
							} else {
								$headerOuterEl.css('top', $endOffset);
							}

						}
						// Desktop
						else {
							if ( condenseHeaderLayout == false ) {

								$eleHeight = 0;

								if( !$headerOuterEl.is('[data-remove-fixed="1"]') ) {
									$eleHeight += nectarDOMInfo.adminBarHeight;
								}
								$headerOuterEl.css('top', $eleHeight + 'px');
							}
						}

					}

					// Bind event and begin if needed.
					if ($('#header-outer[data-mobile-fixed="1"]').length > 0 && $wpAdminBar.length > 0 ) {

						if ($('#nectar_fullscreen_rows').length == 0) {
							requestAnimationFrame(headerOffsetAdjust);
						} else if ($('#nectar_fullscreen_rows').length > 0 && nectarDOMInfo.usingMobileBrowser) {
							requestAnimationFrame(headerOffsetAdjust);
						}

						$window.on('smartresize', headerOffsetAdjustCalc);

					}


					// Vigentte body border
					if ( bodyBorderVignette ) {
						if ($('#nectar_fullscreen_rows').length == 0) {
							requestAnimationFrame(headerBorderAdjust);
						}

						$window.on('smartresize', headerBorderAdjustCalc);

					}

					// Verify scroll pos has changed before calculating.
					function headerBorderAdjust() {

						if ( $body.hasClass('compose-mode') ) {
							return;
						}
						if (bodyBorderMobile == false && nectarDOMInfo.winW < 1000) {
							requestAnimationFrame(headerBorderAdjust);
							$headerOuterEl.css('margin-top', '0');
							return false;
						}

						$headerScrollTop = nectarDOMInfo.scrollTop;

						if (lastPosition2 == $headerScrollTop) {
							requestAnimationFrame(headerBorderAdjust);
							return false;
						} else {
							lastPosition2 = $headerScrollTop;
						}

						headerBorderAdjustCalc();
						requestAnimationFrame(headerBorderAdjust);

					}

					function headerBorderAdjustCalc() {

						var $eleHeight = 0;
						var $endOffset = 0;

						//bodyBorderMobile
						$eleHeight += bodyBorderHeight;

						if ($eleHeight - $headerScrollTop > $endOffset) {
							$headerOuterEl[0].style.marginTop = $eleHeight - $headerScrollTop + 'px';
						} else {
							$headerOuterEl[0].style.marginTop = $endOffset + 'px';
						}

					}


				}







				/**
				* Calculate the minimum body height when using the footer reveal effect or material OCM
				*
				* @since 7.0
				*/
				function footerRevealCalcs() {

					var $headerNavSpace = 0;
					var pageHeaderHeight = 0;

					if( $headerOuterEl.is('[data-logo-height]') && $headerOuterEl.is('[data-padding]') ) {

						if( !$headerOuterEl.hasClass('transparent') ) {

							if( $headerOuterEl.attr('data-format') == 'centered-menu-bottom-bar' && nectarDOMInfo.winW > 1000 ) {
								$headerNavSpace = $headerOuterEl.outerHeight();
							} else {
								if( $headerOuterEl.find('#logo.no-image').length > 0 ) {
									$headerNavSpace = ( headerLayoutFormat == 'left-header' && nectarDOMInfo.winW > 1000) ? 0 : parseInt($headerOuterEl.find('#logo.no-image').height()) + (parseInt($headerOuterEl.attr('data-padding')*2));
								} else {
									$headerNavSpace = ( headerLayoutFormat == 'left-header' && nectarDOMInfo.winW > 1000) ? 0 : parseInt($headerOuterEl.attr('data-logo-height')) + (parseInt($headerOuterEl.attr('data-padding')*2));
								}
							}

						}

					} else {
						$headerNavSpace = ( headerLayoutFormat == 'left-header' && nectarDOMInfo.winW > 1000) ? 0 : $headerOuterEl.outerHeight();
					}

					if( $pageHeaderBG.length > 0 ) {
						pageHeaderHeight += $pageHeaderBG.height();
					}
					if( $('.page-header-no-bg').length > 0 ) {
						pageHeaderHeight += $('.page-header-no-bg').height();
					}

					if (nectarDOMInfo.winH - nectarDOMInfo.adminBarHeight - $headerNavSpace - nectarDOMInfo.footerOuterHeight - 1 - pageHeaderHeight > 0) {

						var $resizeExtra = ($('body:not(.material) #header-outer[data-header-resize="1"]').length > 0) ? 55 : 0;

						$('body[data-footer-reveal="1"]:not(.nectar_using_pfsr) .container-wrap').css({
							'margin-bottom': nectarDOMInfo.footerOuterHeight
						});

						$('.container-wrap').css({
							'min-height': nectarDOMInfo.winH - nectarDOMInfo.adminBarHeight - $headerNavSpace - nectarDOMInfo.footerOuterHeight - pageHeaderHeight + $resizeExtra
						});

					} else {
						$('body[data-footer-reveal="1"]:not(.nectar_using_pfsr) .container-wrap').css({
							'margin-bottom': nectarDOMInfo.footerOuterHeight
						});
					}

					if (nectarDOMInfo.winW < 1000) {
						$footerOuterEl.attr('data-midnight', 'light');
					}
					else {
						$footerOuterEl.removeAttr('data-midnight');
					}
				}


				/**
				* Initialize footer reveal and bind event
				*
				* @since 10.5
				*/
				function footerRevealInit() {

					if ($('body[data-footer-reveal="1"]').length > 0 || $('body.material[data-slide-out-widget-area-style="slide-out-from-right"]').length > 0) {

						setTimeout(footerRevealCalcs, 60);
						footerRevealCalcs();

						$window.on('resize', footerRevealCalcs);

						if ($('body[data-footer-reveal="1"][data-footer-reveal-shadow="large_2"]').length > 0)  {
							$('.container-wrap').css({
								boxShadow: '0 70px 110px -30px ' + $footerOuterEl.css('backgroundColor')
							});
						}

					}

				}





				/**
				* Switch header navigation BG color to match row BG color that is passes.
				*
				* Only called when using "Header Inherit Row Color" option.
				*
				* @since 5.0
				*/
				function headerRowColorInheritInit() {

					if ($('body[data-header-inherit-rc="true"]').length > 0 && $('.mobile').length == 0 && $('#header-outer[data-transparent-header="true"]').length > 0 ) {

						var headerOffset = $logoHeight / 2 + headerPadding + nectarDOMInfo.adminBarHeight;

						if( $('#header-outer[data-permanent-transparent="1"]').length == 0 ) {
							headerOffset = ($logoHeight - logoShrinkNum) + Math.ceil((headerPadding * 2) / 1.8) + nectarDOMInfo.adminBarHeight;
						}

						$('.main-content > .row > .wpb_row, #full_width_portfolio #portfolio-extra > .wpb_row').each(function () {

							var $that = $(this);
							var $textColor;

							var waypoint = new Waypoint({
								element: $that[0],
								handler: function (direction) {

									//User is scrolling down.
									if (direction == 'down') {

										if ($that.find('.row-bg.using-bg-color').length > 0) {

											$textColor = ($that.find('> .col.span_12.light').length > 0) ? 'light-text' : 'dark-text';

											$headerOuterEl
												.css('background-color', $that.find('.row-bg').css('background-color'))
												.removeClass('light-text')
												.removeClass('dark-text')
												.addClass($textColor);

											$headerOuterEl.attr('data-current-row-bg-color', $that.find('.row-bg').css('background-color'));
											$('body.material #header-outer .bg-color-stripe').css('background-color', $that.find('.row-bg').css('background-color'));

										} else {

											$headerOuterEl
												.css('background-color', $headerOuterEl.attr('data-user-set-bg'))
												.removeClass('light-text')
												.removeClass('dark-text');

											$headerOuterEl.attr('data-current-row-bg-color', $headerOuterEl.attr('data-user-set-bg'));
											$('body.material #header-outer .bg-color-stripe').css('background-color', '');

										}

									}

									//User is scrolling up.
									else {

										if ($that.prev('div.wpb_row').find('.row-bg.using-bg-color').length > 0) {

											$textColor = ($that.prev('div.wpb_row').find('> .col.span_12.light').length > 0) ? 'light-text' : 'dark-text';

											$headerOuterEl
												.css('background-color', $that.prev('div.wpb_row').find('.row-bg').css('background-color'))
												.removeClass('light-text')
												.removeClass('dark-text')
												.addClass($textColor);

											$headerOuterEl.attr('data-current-row-bg-color', $that.prev('div.wpb_row').find('.row-bg').css('background-color'));
											$('body.material #header-outer .bg-color-stripe').css('background-color', $that.prev('div.wpb_row').find('.row-bg').css('background-color'));

										} else {

											$headerOuterEl
												.css('background-color', $headerOuterEl.attr('data-user-set-bg'))
												.removeClass('light-text')
												.removeClass('dark-text');

											$headerOuterEl.attr('data-current-row-bg-color', $headerOuterEl.attr('data-user-set-bg'));
											$('body.material #header-outer .bg-color-stripe').css('background-color', '');

										}

									}

								},
								offset: headerOffset

							}); // End of waypoint bind.

						}); // End of loop through rows.

					}

				}



				/**
				* Page submenu sticky functionality
				*
				* @since 10.5.2
				*/

				function stickyPageSubmenuInit() {

					var $ = window.jQuery,
					Waypoint = window.Waypoint,
					$offsetHeight = calcHeaderNavHeight(),
					$headerHeight = calcHeaderNavHeight();

					$window.on('smartresize', function () {

						$offsetHeight = calcHeaderNavHeight();

						if ($wpAdminBar.length > 0 &&
							$wpAdminBar.css('position') == 'fixed') {
							$offsetHeight += $wpAdminBar.height();
						}

						if ($bodyBorderTop.length > 0 &&
							$window.width() > 1000 &&
							$('body[data-hhun="1"]').length > 0 ||

							$bodyBorderTop.length > 0 &&
							$('body[data-hhun="1"]').length > 0 &&
							bodyBorderMobile ) {
								if ( !bodyBorderVignette ) {
										$offsetHeight += $bodyBorderTop.height();
								}
						}

						// Recalc for resizing (same as stuck/unstuck logic below)
						if ($('.page-submenu.stuck').length > 0) {

							$('.page-submenu.stuck')
								.addClass('no-trans')
								.css('top', $offsetHeight)
								.css('transform', 'translateY(0)').addClass('stuck');

							setTimeout(function () {
								$('.page-submenu.stuck').removeClass('no-trans');
							}, 50);

							$('.page-submenu.stuck')
								.parents('.wpb_row')
								.css('z-index', 10000);

							// Boxed layout
							if ($('#boxed').length > 0) {

								var $negMargin = ($window.width() > 1000) ? $('.container-wrap').width() * 0.04 : 39;

								$('.page-submenu.stuck').css({
									'margin-left': '-' + $negMargin + 'px',
									'width': $('.container-wrap').width()
								});

							}

						} else {

							$('.page-submenu.stuck')
								.css('top', '0')
								.removeClass('stuck');

							$('.page-submenu.stuck')
								.parents('.wpb_row')
								.css('z-index', 'auto');

							if ($('#boxed').length > 0) {
								$('.page-submenu.stuck').css({
									'margin-left': '0px',
									'width': '100%'
								});
							}

						}

					});

					/* http://imakewebthings.com/waypoints/shortcuts/sticky-elements */
					function Sticky(options) {
						this.options = $.extend({}, Waypoint.defaults, Sticky.defaults, options);
						this.element = this.options.element;
						this.$element = $(this.element);
						this.createWrapper();
						this.topLevel = ($(this.element).parents('.top-level').length > 0) ? true : false;
						this.createWaypoint();
					}

					/* Private */
					Sticky.prototype.createWaypoint = function () {

						var originalHandler = this.options.handler;

						$offsetHeight = calcHeaderNavHeight();

						// top level hhun
						if( this.topLevel && $('body[data-hhun="1"] #header-outer.detached:not(.invisible)').length > 0) {
							$offsetHeight += 1;
							this.$element.css({
								'margin-top': '-1px',
							});
						}

						if ($wpAdminBar.length > 0 && $wpAdminBar.css('position') == 'fixed') {
							$offsetHeight += $wpAdminBar.height();
						}

						if ($bodyBorderTop.length > 0 && $window.width() > 1000 && $('body[data-hhun="1"]').length > 0 ||
								$bodyBorderTop.length > 0 && bodyBorderMobile && $('body[data-hhun="1"]').length > 0 ) {

								if ( !bodyBorderVignette ) {
									$offsetHeight += $bodyBorderTop.height();
								}
						}

						this.waypoint = new Waypoint($.extend({}, this.options, {
							element: this.wrapper,
							handler: $.proxy(function (direction) {
								var shouldBeStuck = this.options.direction.indexOf(direction) > -1;
								var wrapperHeight = shouldBeStuck ? this.$element.outerHeight(true) : '';

								this.$wrapper.height(wrapperHeight);
								if (shouldBeStuck) {

									// top level hhun
									var transformAmt = 0;
									if( this.topLevel && $('body[data-hhun="1"] #header-outer.detached:not(.invisible)').length > 0) {

										// Page submenu adjust
										var heightToAdjust = $headerOuterEl.outerHeight();
										var $bodyBorderSizeToRemove = 0;

										if( $headerSecondaryEl.length > 0) {
											heightToAdjust -=	nectarDOMInfo.secondaryHeaderHeight;
										}

										if ($bodyBorderTop.length > 0 && $('body.mobile').length == 0) {
											$bodyBorderSizeToRemove = ($bodyBorderHeaderColorMatch) ? $bodyBorderTop.height() : 0;
										}

										transformAmt = heightToAdjust - $bodyBorderSizeToRemove;

									}

									this.$element
										.addClass('no-trans')
										.css('top', $offsetHeight)
										.css('transform', 'translateY('+transformAmt+'px)')
										.addClass('stuck');

									var $that = this;

									setTimeout(function () {
										$that.$element.removeClass('no-trans');
									}, 50);

									this.$element.parents('.wpb_row').css('z-index', 10000);

									//boxed
									if ($('#boxed').length > 0) {
										var $negMargin = ($window.width() > 1000) ? $('.container-wrap').width() * 0.04 : 39;
										this.$element.css({
											'margin-left': '-' + $negMargin + 'px',
											'width': $('.container-wrap').width()
										});
									}

								} else {
									this.$element.css('top', '0').removeClass('stuck');

									if ($('#boxed').length > 0) this.$element.css({
										'margin-left': '0px',
										'width': '100%'
									});
								}

								if (originalHandler) {
									originalHandler.call(this, direction);
								}
							}, this),
							offset: $offsetHeight
						}));

						var $that = this;


						setInterval(function () {

							if ($('body[data-hhun="1"] #header-outer.detached:not(.invisible)').length > 0) {

								var heightToAdjust = $headerOuterEl.outerHeight();

								if( $headerSecondaryEl.length > 0) {
									heightToAdjust -=	nectarDOMInfo.secondaryHeaderHeight;
								}

								$that.waypoint.options.offset = $offsetHeight + heightToAdjust;
							}
							else {
								$that.waypoint.options.offset = $offsetHeight;
							}

							Waypoint.refreshAll();

						}, 100);


					};

					/* Private */
					Sticky.prototype.createWrapper = function () {
						if (this.options.wrapper) {
							this.$element.wrap(this.options.wrapper);
						}
						this.$wrapper = this.$element.parent();
						this.wrapper  = this.$wrapper[0];
					};

					/* Public */
					Sticky.prototype.destroy = function () {

						if (this.$element.parent()[0] === this.wrapper) {
							this.waypoint.destroy();
							this.$element.removeClass(this.options.stuckClass);
							if (this.options.wrapper) {
								this.$element.unwrap();
							}
						}

					};

					Sticky.defaults = {
						wrapper: '<div class="sticky-wrapper" />',
						stuckClass: 'stuck',
						direction: 'down right'
					};

					Waypoint.Sticky = Sticky;

				}



				/**
				* Page submenu page builder element.
				*
				* @since 10.5
				*/

				function pageSubmenuInit() {

					if ($('.page-submenu[data-sticky="true"]').length > 0 && $('#nectar_fullscreen_rows').length == 0) {

						stickyPageSubmenuInit();

						// Remove outside of column setups
						$('.page-submenu[data-sticky="true"]').each(function() {

              var waypointEl = $(this)[0];

							if ($(this).parents('.span_12').find('> .wpb_column').length > 1) {

								var pageMenu      = $(this).clone(),
								pageMenuParentRow = $(this).parents('.wpb_row');

								if( $(this).parents('.wpb_row.has-global-section').length > 0 ) {
									pageMenuParentRow = $(this).parents('.wpb_row.has-global-section');
								}

								$(this).remove();
								pageMenuParentRow.before(pageMenu);

                waypointEl = pageMenu[0];

							}

							var sticky = new Waypoint.Sticky({
								element: waypointEl
							});

						});

					}

					// Adjust to be higher.
					if ($('#nectar_fullscreen_rows').length == 0) {

						$('.page-submenu')
							.parents('.wpb_row')
							.css('z-index', 10000);
					}

					// Bind events.
					$('.page-submenu .mobile-menu-link').on('click', function () {

						$(this).parents('.page-submenu')
							.find('ul')
							.stop(true)
							.slideToggle(350);

						return false;

					});

					$('.page-submenu ul li a').on('click', function () {

						if ($('body.mobile').length > 0) {
							$(this).parents('.page-submenu')
								.find('ul')
								.stop(true)
								.slideToggle(350);
						}

					});

				}




				/**
				* Page builder full height row option.
				*
				* @since 14.0
				*/

				function nectarFullHeightRow(el) {

					this.$el = el;

					this.offsetTop = 0;
					this.fullHeight = 100;
					this.storedWinH = nectarDOMInfo.winH;

					this.events();
					this.calculate();

				}

				nectarFullHeightRow.prototype.events = function() {

					var that = this;

					$(window).on('smartresize', this.resize.bind(this));

					window.addEventListener("orientationchange", function() {
						this.setTimeout(function(){
						that.orientationChange();
						}, 100);
					});

				};

				nectarFullHeightRow.prototype.resize = function() {

					if( !nectarDOMInfo.usingMobileBrowser ) {
							this.storedWinH = nectarDOMInfo.winH;
							this.calculate();
					}

				};

				nectarFullHeightRow.prototype.calculate = function() {

					if( nectarState.materialOffCanvasOpen == true ) {
						return true;
					}

					this.offsetTop = this.$el.offset().top;

					if (this.offsetTop < this.storedWinH &&
						this.$el.hasClass('top-level') &&
						!nectarDOMInfo.usingFrontEndEditor) {

						// Removed to allow CSS to take full control over top level sizing.

					} else {

						this.$el.css("min-height", this.storedWinH);
						this.$el.find('> .col.span_12').css("min-height", this.storedWinH);

					}

				};

				nectarFullHeightRow.prototype.orientationChange = function() {

					if( nectarDOMInfo.usingMobileBrowser ) {
						this.storedWinH = nectarDOMInfo.winH;
						this.calculate();
					}

				};





				/**
				* Page builder full height row init.
				*
				* @since 10.5
				*/

				function nectarFullHeightRowInit() {

					fullHeightRows = [];

					$('.vc_row-o-full-height').each(function(i){
						fullHeightRows[i] = new nectarFullHeightRow($(this));
					});

				}


				/**
				* Page builder equal height row IE helper.
				*
				* @since 8.0
				*/
				function fixIeFlexbox() {
					var ua = window.navigator.userAgent,
					msie = ua.indexOf("MSIE ");
					(msie > 0 || navigator.userAgent.match(/Trident.*rv\:11\./)) && $(".vc_row-o-full-height").each(function () {
						"flex" === $(this).find('> .span_12').css("display") && $(this).wrap('<div class="vc_ie-flexbox-fixer"></div>')
					});

					if( msie > 0 || navigator.userAgent.match(/Trident.*rv\:11\./)) {
						fixIE11Images();
						$(window).on('resize',fixIE11Images);
					}

				}

				/**
				* Fix the IE11 bug with max-width 100% on imgs
				*
				* @since 11.0
				*/
				function fixIE11Images() {

					$('.img-with-aniamtion-wrap img.img-with-animation').each(function() {

						if( $(this).parents('.tabbed').length == 0 && $(this).parents('.toggle').length == 0 ) {

							var $parentWrap = $(this).parents('.img-with-aniamtion-wrap');
							$parentWrap.css({
								'height' : ''
							});
							var height = $(this).height();

							$parentWrap.css({
								'height' : height
							});

						}

					});

				}









				/**
				* Recent post height
				*
				* @since 10.5
				*/
				function recentPostsTitleOnlyEqualHeight() {

					function recentPostHeight() {

						$('.blog-recent[data-style="title_only"]').each(function () {

							if ($(this).find('> .col').length > 1) {
								return false;
							}
							var $parentsSeletor = $(this).parent().parent().parent();

							if ($parentsSeletor.hasClass('vc_col-sm-3') ||
							$parentsSeletor.hasClass('vc_col-sm-4') ||
							$parentsSeletor.hasClass('vc_col-sm-6') ||
							$parentsSeletor.hasClass('vc_col-sm-8') ||
							$parentsSeletor.hasClass('vc_col-sm-9')) {

								if ($('body.mobile').length == 0 && $(this).next('div').length == 0) {
									var tallestColumn = 0;

									$(this).find('> .col').css('padding', '50px 20px');

									$(this).parents('.span_12').find(' > .wpb_column').each(function () {

										if( Math.floor($(this).height()) > tallestColumn ) {
											tallestColumn = Math.floor($(this).height());
										}

									});

									if (Math.floor($(this).find('> .col').outerHeight(true)) < Math.floor($(this).parents('.wpb_row').height()) - 1) {
										$(this).find('> .col').css('padding-top', (tallestColumn - $(this).find('> .col').height()) / 2 + 'px');
										$(this).find('> .col').css('padding-bottom', (tallestColumn - $(this).find('> .col').height()) / 2 + 'px');
									}

								} else {
									$(this).find('> .col').css('padding', '50px 20px');
								}
							}
						});

					}

					// Set heights.
					if( $('.blog-recent[data-style="title_only"]').length > 0 ) {
						recentPostHeight();
						$window.on('smartresize',recentPostHeight);
					}

				}





				/**
				* Helper to calculate recent post slider height
				*
				* @since 7.0
				*/
				function recentPostSliderHeight() {

					$('.nectar-recent-posts-slider').each(function () {

						var $minHeight   = 250,
						$definedHeight   = parseInt($(this).attr('data-height')),
						dif              = ($('body[data-ext-responsive="true"]').length > 0) ? $window.width() / 1400 : $window.width() / 1100,
						$sliderSelectors = $(this).find('.nectar-recent-post-slide, .flickity-viewport');

						if (nectarDOMInfo.winW > 1000 && $('#boxed').length == 0) {

							if ($(this).parents('.full-width-content').length == 0) {

								if ($('body[data-ext-responsive="true"]').length > 0 && nectarDOMInfo.winW >= 1400) {
									$sliderSelectors.css('height', Math.ceil($definedHeight));
								} else if ($('body[data-ext-responsive="true"]').length == 0 && nectarDOMInfo.winW >= 1100) {
									$sliderSelectors.css('height', Math.ceil($definedHeight));
								} else {
									$sliderSelectors.css('height', Math.ceil($definedHeight * dif));
								}

							} else {
								$sliderSelectors.css('height', Math.ceil($definedHeight * dif));
							}

						} else {

							// Column sliders
							var $parentCol = ($(this).parents('.wpb_column').length > 0) ? $(this).parents('.wpb_column') : $(this).parents('.col');

							if ($parentCol.length == 0) {
								$parentCol = $('.main-content');
							}

							if (!$parentCol.hasClass('vc_span12') &&
							!$parentCol.hasClass('main-content') &&
							!$parentCol.hasClass('span_12') &&
							!$parentCol.hasClass('vc_col-sm-12')) {

								var $parentColWidth = sliderColumnDesktopWidth($parentCol),
								$aspectRatio 				= $definedHeight / $parentColWidth;

								// Min height
								if ($aspectRatio * $parentCol.width() <= $minHeight) {
									$sliderSelectors.css('height', $minHeight);
								} else {
									$sliderSelectors.css('height', $aspectRatio * $parentCol.width());
								}

							}

							// Regular
							else {

								// Min height
								if ($definedHeight * dif <= $minHeight) {
									$sliderSelectors.css('height', $minHeight);
								} else {
									$sliderSelectors.css('height', Math.ceil($definedHeight * dif));
								}

							}

						}

					});

				}


				function sliderColumnDesktopWidth(parentCol) {

					var $parentColWidth = 1100,
					$columnNumberParsed = $(parentCol).attr('class').match(/\d+/);

					if ($columnNumberParsed == '2') {
						$parentColWidth = 170
					} else if ($columnNumberParsed == '3') {
						$parentColWidth = 260
					} else if ($columnNumberParsed == '4') {
						$parentColWidth = 340
					} else if ($columnNumberParsed == '6') {
						$parentColWidth = 530
					} else if ($columnNumberParsed == '8') {
						$parentColWidth = 700
					} else if ($columnNumberParsed == '9') {
						$parentColWidth = 805
					} else if ($columnNumberParsed == '10') {
						$parentColWidth = 916.3
					} else if ($columnNumberParsed == '12') {
						$parentColWidth = 1100
					}

					return $parentColWidth;
				}


				function scrollingText() {

					// browser rendering issue workaround
						$('.nectar-scrolling-text').each(function(){
							if( $(this).offset().top > nectarDOMInfo.winH ) {
								$(this).addClass('prevent-animation');

								var that = $(this);

								setTimeout(function(){
									that.removeClass('prevent-animation');
								}, 100);
							}
						});

				}

				/**
				* Spit text into separate lines to animate in
				*
				* @since 7.0
				*/

				function splitLineText() {
					$('.nectar-recent-posts-single_featured.multiple_featured').each(function () {

						var $slideClass = ($(this).find('.project-slides').length > 0) ? '.project-slide' : '.nectar-recent-post-slide',
						$slideInfoClass = ($(this).find('.project-slides').length > 0) ? '.project-info h1' : '.inner-wrap .large-featured-post-title a';

						$(this).find($slideClass).each(function () {

							$(this).find($slideInfoClass).each(function () {

								var textArr = $(this).text();
								textArr = textArr.trim();
								textArr = textArr.split(' ');

								$(this)[0].innerHTML = '';

								for (var i = 0; i < textArr.length; i++) {
									$(this)[0].innerHTML += '<span>' + textArr[i] + '</span> ';
								}

							});

							$(this).find($slideInfoClass + ' > span').wrapInner('<span class="inner" />');

						});

					});

				}

				function splitLineHeadingTrigger($item, callback) {
					$item.find('.nectar-split-heading > * > span').each(function (i) {
						var spanEl = $(this);
						var $innerEl = spanEl.find('> .inner');
						setTimeout(function(){
							$innerEl[0].style.transform = 'translateY(0em)';
							$innerEl[0].style.opacity = '1';
						}, i * 40);
					});

					var totalTime = $item.find('.nectar-split-heading > * > span').length * 40;
					setTimeout(function() {
						callback();
					}, totalTime + 1400);
				}

				function splitLineHeadingRemoveMarkup($item) {
					$item.find('.nectar-split-heading').each(function (i) {
						var text = $(this).text();
						$(this).addClass('effect-removed');
						$(this)[0].innerHTML = text;
					});
				}


				/**
				* Spit text into separate lines to animate in
				*
				* @since 7.0
				*/

				function letterRevealMarkup($el) {

					var animatedClass = ( $el.hasClass('animated-in') ) ? ' animated' : '';

						$el.find('> *').each(function () {

							var textArr = $(this).text();
							textArr = textArr.trim();
							textArr = textArr.split(' ');


							$(this)[0].innerHTML = '';

							for (var i = 0; i < textArr.length; i++) {
								$(this)[0].innerHTML += '<span><span class="inner'+animatedClass+'">' + textArr[i] + '</span></span> ';
							}

							$(this).attr('aria-label', $(this).text());

						});

						$el.addClass('markup-generated');

				}

				function splitLineHeadingMarkup() {

					$('.nectar-split-heading[data-animation-type="line-reveal-by-space"]:not([data-text-effect="none"])').each(function () {
						letterRevealMarkup($(this));
					});

					$('.nectar-split-heading[data-animation-type="line-reveal-by-space"][data-text-effect*="letter-reveal"]').each(function () {

						/* Skip markup generation when effect is removed on mobile */
						if( $(this).is('[data-m-rm-animation="true"]') && nectarDOMInfo.winW < 1000 ) {
							return true;
						}

						var animatedStyle = ( $(this).hasClass('animated-in') ) ? ' style="transform: none;"' : '';

						$(this).find('> *').each(function () {

							var textArr = $(this).text();
							textArr = textArr.trim();
							textArr = textArr.split(' ');

							$(this)[0].innerHTML = '';

							for (var i = 0; i < textArr.length; i++) {
								$(this)[0].innerHTML += '<span>' + textArr[i] + '</span> ';
							}

							$(this).attr('aria-label', $(this).text());

						});


						$(this).find('span').each(function () {

							var $this = $(this);
							var textArr = $(this).text().split('');

							$this.empty();

							$.each(textArr, function (i, el) {
								$this.append('<span class="inner"'+animatedStyle+'>' + el + '</span>');
							});

						});

						$(this).addClass('markup-generated');


					});

				}

				function splitLineHeadingInit() {

					if( $('.nectar-split-heading[data-animation-type="line-reveal-by-space"]').length > 0 ||
						$('.nectar-split-heading[data-animation-type="letter-fade-reveal"]').length > 0 ) {
						// Generate markup.
						splitLineHeadingMarkup();
					}

				}


				/**
				* Create recent post sliders
				*
				* @since 7.0
				*/
				function recentPostsFlickityInit() {


					if ($('.nectar-recent-posts-slider-inner').length > 0) {

						var $rpFGroupCells = ($('.nectar-recent-posts-slider_multiple_visible').length > 0) ? '90%' : false;

						var $rpF = $('.nectar-recent-posts-slider-inner').flickity({
							contain: true,
							groupCells: $rpFGroupCells,
							draggable: true,
							lazyLoad: false,
							imagesLoaded: true,
							percentPosition: true,
							prevNextButtons: false,
							pageDots: true,
							resize: true,
							setGallerySize: true,
							wrapAround: true,
							dragThreshold: nectarDOMInfo.usingMobileBrowser ? 25 : 3,
							accessibility: false
						});

						setTimeout(function () {
							$('.nectar-recent-posts-slider-inner').addClass('loaded');
						}, 1150);
						var flkty = $rpF.data('flickity');

						$rpF.on('dragStart.flickity', function () {
							$('.flickity-viewport').addClass('is-moving');
						});

						$rpF.on('dragEnd.flickity', function () {
							$('.flickity-viewport').removeClass('is-moving');
						});

						var $dragTimeout;

						$rpF.on('select.flickity', function () {

							$('.flickity-viewport').addClass('no-hover');
							clearTimeout($dragTimeout);
							$dragTimeout = setTimeout(function () {
								$('.flickity-viewport').removeClass('no-hover');
							}, 400);

						});

						recentPostSliderHeight();
						$window.on('resize', recentPostSliderHeight);

						if (!nectarDOMInfo.usingMobileBrowser && !nectarDOMInfo.usingFrontEndEditor) {
							$window.on('resize', recentPostSliderParallaxMargins);
						}


					}



					// Multiple featured controls
					function multipleLargeFeaturedInit() {
						$('.nectar-recent-posts-single_featured.multiple_featured').each(function (sliderIndex) {

							if ($(this).find('> .normal-container').length > 0) {
								$(this).find('> .normal-container').remove();
							}

							$(this).append('<div class="normal-container container"> <ul class="controls" data-color="' + $(this).attr('data-button-color') + '" data-num="' + $(this).find('.nectar-recent-post-slide').length + '"></ul> </div>');
							var $that = $(this);
							var tallestFeaturedSlide = 0;
							var $slideClickTimeout;

							// Store instance
							$nectarCustomSliderRotate[sliderIndex] = {
								autorotate: ''
							};

							$(this).find('.nectar-recent-post-slide').each(function (i) {

								if ($(this).find('.recent-post-container').height() > tallestFeaturedSlide) {
									$(this).siblings().removeClass('tallest');
									$(this).addClass('tallest');
									tallestFeaturedSlide = $(this).find('.recent-post-container').height();
								}

								var $activeClass = (i == 0 && $(this).parents('.nectar-recent-posts-single_featured.multiple_featured[data-autorotate="none"]').length > 0) ? 'class="active"' : '';
								$that.find('.controls').append('<li ' + $activeClass + '><span class="title">' + $(this).find('.large-featured-post-title').text() + '</span></li>');
							});

							$(this).addClass('js-loaded');


							// Click event
							$(this).find('.controls li').on('click', function (e) {

								if ($(this).hasClass('active')) {
									return;
								}

								if (e.originalEvent !== undefined) {
									$(this).parent().find('.active').addClass('trans-out');
								}

								var $index = $(this).index(),
								$oldIndex  = $(this).parent().find('.active').index(),
								$that      = $(this);

								clearTimeout($slideClickTimeout);

								$(this).siblings().removeClass('active');
								$(this).addClass('active');

								$slideClickTimeout = setTimeout(function () {

									$that.parents('.multiple_featured')
										.find('.nectar-recent-post-slide:not(:eq(' + $index + '))')
										.css('opacity', '0')
										.removeClass('active');

									$that.parent()
										.find('.trans-out')
										.removeClass('trans-out');

								}, 300);

								$that.parents('.multiple_featured')
									.find('.nectar-recent-post-slide:not(:eq(' + $index + '))')
									.css('z-index', '10');

								$that.parents('.multiple_featured')
									.find('.nectar-recent-post-slide:eq(' + $oldIndex + ')')
									.css('z-index', '15');

								$(this).parents('.multiple_featured').find('.nectar-recent-post-slide').eq($index).css({
									'opacity': '1',
									'z-index': '20'
								}).addClass('active');

								if ($(this).parents('.multiple_featured').attr('data-autorotate') != 'none') {
									nectarCustomSliderResetRotate($that.parents('.nectar-recent-posts-single_featured.multiple_featured'), sliderIndex);
								}
							});


							// Autorotate
							$that = $(this);

							if ($(this).attr('data-autorotate').length > 0 &&
							$(this).attr('data-autorotate') != 'none' &&
							$('body.vc_editor').length == 0) {

								setTimeout(function () {
									var slide_interval = (parseInt($that.attr('data-autorotate')) < 100) ? 4000 : parseInt($that.attr('data-autorotate'));

									$nectarCustomSliderRotate[sliderIndex].autorotate = setInterval(function () {
										nectarCustomSliderRotate($that)
									}, slide_interval);

									// Set first active class
									$that
										.find('.controls > li:first-child')
										.addClass('active');

								}, 30);

							}

						});

						splitLineText();
						$window.on('resize', splitLineText);

					}

					multipleLargeFeaturedInit();

				}



				/**
				* Default recent post slider parallax RAF loop.
				*
				* @since 7.0
				*/
				function recentPostSliderParallax() {

					$('.nectar-recent-posts-slider').each(function () {

						var $offset        = parseInt($(this).find('.flickity-slider').position().left),
						$slides            = $(this).find('.nectar-recent-post-slide'),
						$slideLength       = $slides.length,
						$slideWidth        = $slides.width(),
						$lastChildIndex    = $(this).find('.nectar-recent-post-slide:last-child').index(),
						$slideFirstChildBG =	$(this).find('.nectar-recent-post-slide:first-child .nectar-recent-post-bg'),
						$slideLastChildBG  = $(this).find('.nectar-recent-post-slide:last-child .nectar-recent-post-bg');

						// First going to last
						if ($offset >= -3) {
							$slideLastChildBG.css('margin-left', parseInt(Math.ceil($slideWidth / 3.5)) + 'px');
						} else {
							$slideLastChildBG.css('margin-left', '-' + parseInt(Math.ceil($slideWidth / 3.5 * $lastChildIndex)) + 'px');
						}

						// Last going to first
						if (Math.abs($offset) >= ($slideLength - 1) * $slideWidth) {
							$slideFirstChildBG.css('margin-left', '-' + parseInt(Math.ceil(($slideWidth / 3.5) * $slideLength)) + 'px');
						} else {
							$slideFirstChildBG.css('margin-left', '0px');
						}

						$(this)
							.find('.nectar-recent-post-bg')
							.css('transform', 'translateX(' + Math.ceil($(this).find('.flickity-slider').position().left / -3.5) + 'px)');

					});

					requestAnimationFrame(recentPostSliderParallax);

				}

				/**
				* Default recent post slider margin calculations.
				*
				* @since 7.0
				*/
				function recentPostSliderParallaxMargins() {

					$('.nectar-recent-posts-slider').each(function () {

						var $slideWidth = $(this).find('.nectar-recent-post-slide').width();

						$(this).find('.nectar-recent-post-slide').each(function (i) {
							$(this).find('.nectar-recent-post-bg').css('margin-left', '-' + parseInt(Math.ceil($slideWidth / 3.5) * i) + 'px');
						});

					});

				}



				/**
				* Initialize all recent post elements.
				*
				* @since 7.0
				*/
				function recentPostsInit() {

					// Start flickity based sliders.
					if( $().flickity ) {
						recentPostsFlickityInit();
					} else {
						setTimeout(function(){
							recentPostsFlickityInit();
						}, 200 );
					}


					// Classic enhanced specific
					$('.blog-recent[data-style="classic_enhanced_alt"] .inner-wrap').each(function () {
						$(this).find('.post-featured-img').each(function () {
							var $src = $(this).find('img').attr('src');
							$(this).css('background-image', 'url(' + $src + ')');
						});
					});

					$('.blog-recent[data-style="classic_enhanced"]').each(function () {
						if ($(this).find('.inner-wrap.has-post-thumbnail').length == 0) {
							$(this).addClass('no-thumbs');
						}
					});

					// Regular recent posts slider.
					if (!nectarDOMInfo.usingMobileBrowser) {
						if ($('.nectar-recent-posts-slider').length > 0 && !nectarDOMInfo.usingFrontEndEditor) {
							window.requestAnimationFrame(recentPostSliderParallax);
						}
					}

					if (!nectarDOMInfo.usingMobileBrowser && !nectarDOMInfo.usingFrontEndEditor) {
						recentPostSliderParallaxMargins();
					}

				}




				/**
				* Parallax on mousemove effect
				*
				* @since 10.5
				*/
				function parallaxItemHoverEffect() {

					//change sizer pos
					$('.style-5').each(function () {
						$(this)
							.find('.sizer')
							.insertBefore($(this).find('.parallaxImg'));
					});

					// Set parent zindex
					$('.style-5')
						.parents('.wpb_row')
						.css('z-index', '100');

					var d           = document,
					bd              = d.getElementsByTagName('body')[0],
					win             = window,
					imgs            = d.querySelectorAll('.parallaxImg'),
					totalImgs       = imgs.length,
					supportsTouch   = 'ontouchstart' in win || navigator.msMaxTouchPoints,
					lazyLoadedItems = false;

					if (totalImgs <= 0) {
						return;
					}

					// Build HTML
					for (var l = 0; l < totalImgs; l++) {

						var thisImg = imgs[l],
						layerElems = thisImg.querySelectorAll('.parallaxImg-layer'),
						totalLayerElems = layerElems.length;

						if (totalLayerElems <= 0) {
							continue;
						}

						while (thisImg.firstChild) {
							thisImg.removeChild(thisImg.firstChild);
						}

						var lastMove = 0;

						//throttle performance old browsers
						var eventThrottle = 80;
						if ( navigator.userAgent.indexOf("Chrome") > -1 && navigator.userAgent.indexOf("Edge/") < 1 ) {
							eventThrottle = 1;
							$('html').addClass('cssreflections');
						} else {
							$body.addClass('cssreflections');
						}

						var containerHTML = d.createElement('div'),
						shineHTML = d.createElement('div'),
						shadowHTML = d.createElement('div'),
						layersHTML = d.createElement('div'),
						layers = [];

						thisImg.id = 'parallaxImg__' + l;
						containerHTML.className = 'parallaxImg-container';
						shadowHTML.className = 'parallaxImg-shadow';
						layersHTML.className = 'parallaxImg-layers';

						for (var i = 0; i < totalLayerElems; i++) {

							var layer = d.createElement('div'),
							layerInner = d.createElement('div'),
							imgSrc = layerElems[i].getAttribute('data-img');

							$(layer).html($(layerElems[i]).html());
							layer.className = 'parallaxImg-rendered-layer';
							layer.setAttribute('data-layer', i);

							if (i == 0 && $(thisImg).parents('.wpb_gallery').length == 0) {
								layerInner.className = 'bg-img';

								if( $(thisImg).parents('.nectar-fancy-box').length > 0 ) {
									layerInner.setAttribute('data-nectar-img-src', imgSrc);
									lazyLoadedItems = true;
								} else {
									layerInner.style.backgroundImage = 'url(' + imgSrc + ')';
								}
								layer.appendChild(layerInner);
							}
							layersHTML.appendChild(layer);

							layers.push(layer);
						}


						containerHTML.appendChild(layersHTML);
						thisImg.appendChild(containerHTML);
						$(thisImg).wrap('<div class="parallaxImg-wrap" />');
						if (!(navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1)) {
							$(thisImg).parent().append(shadowHTML);
						}

						if (supportsTouch && $('body.using-mobile-browser').length > 0) {
							// Stop processing.
						} else {
							(function (_thisImg, _layers, _totalLayers, _shine) {
								$(thisImg).parents('.style-5').on('mousemove', function (e) {

									var parentEl = $(this);
									var parallaxContainer = parentEl.find('.parallaxImg-container');
									var parallaxShad = parentEl.find('.parallaxImg-shadow');

									var now = Date.now();

									var usingGallery = ($(_thisImg).parents('.wpb_gallery').length > 0) ? true : false;

									if (now > lastMove + eventThrottle) {
										lastMove = now;
										window.requestAnimationFrame(function () {
											processMovement(e, false, _thisImg, _layers, _totalLayers, _shine, parentEl, parallaxContainer, parallaxShad, usingGallery);
										});
									}


								});
								$(thisImg).parents('.style-5').on('mouseenter', function (e) {
									processEnter(e, _thisImg, _layers, _totalLayers, _shine);
								});
								$(thisImg).parents('.style-5').on('mouseleave', function (e) {
									processExit(e, _thisImg, _layers, _totalLayers, _shine);
								});
							})(thisImg, layers, totalLayerElems, shineHTML);
						}

						// Set the depths
						(function (_thisImg, _layers, _totalLayers, _shine) {
							depths(false, _thisImg, _layers, _totalLayers, _shine);
							window.addEventListener('resize', function () {
								depths(false, _thisImg, _layers, _totalLayers, _shine);
							});
						})(thisImg, layers, totalLayerElems, shineHTML);
					}

					if( lazyLoadedItems ) {
						nectarLazyImageLoading();
					}

					function processMovement(e, touchEnabled, elem, layers, totalLayers, shine, parentEl, parallaxContainer, parallaxShad, usingGal) {

						// Stop raf if exit already called
						if (!$(elem.firstChild).hasClass('over')) {
							processExit(e, elem, layers, totalLayers, shine);
							return false
						}

						// Set up multipliers
						var yMult = 0.03;
						var xMult = 0.063;

						var scaleAmount = '1.03';
						var offsetAmount = '-10';
						var usingMasonrySize = false;

						if ($(elem).parents('.col.wide').length > 0) {
							yMult = 0.03;
							xMult = 0.063;
							usingMasonrySize = true;
						} else if ($(elem).parents('.col.regular').length > 0 || $(elem).parents('.wpb_gallery').length > 0) {
							yMult = 0.045;
							xMult = 0.045;
						} else if ($(elem).parents('.col.tall').length > 0) {
							yMult = 0.05;
							xMult = 0.015;
							usingMasonrySize = true;
						} else if ($(elem).parents('.col.wide_tall').length > 0) {
							yMult = 0.04;
							xMult = 0.04;
							usingMasonrySize = true;
						} else if (parentEl.hasClass('nectar-fancy-box')) {
							yMult = 0.045;
							xMult = 0.022;
							scaleAmount = '1.06';
							offsetAmount = '-2';
						} else {
							yMult = 0.045;
							xMult = 0.075;
						}

						var bdst = nectarDOMInfo.scrollTop,
						bdsl = 0,
						pageX = (touchEnabled) ? e.touches[0].pageX : e.pageX,
						pageY = (touchEnabled) ? e.touches[0].pageY : e.pageY,
						offsets = elem.getBoundingClientRect(),
						w = elem.clientWidth || elem.offsetWidth || elem.scrollWidth,
						h = elem.clientHeight || elem.offsetHeight || elem.scrollHeight,
						wMultiple = 320 / w,
						offsetX = 0.52 - (pageX - offsets.left - bdsl) / w,
						offsetY = 0.52 - (pageY - offsets.top - bdst) / h,
						dy = (pageY - offsets.top - bdst) - h / 2,
						dx = (pageX - offsets.left - bdsl) - w / 2,
						yRotate = (offsetX - dx) * (yMult * wMultiple),
						xRotate = (dy - offsetY) * (xMult * wMultiple);

						var imgCSS;

						if (usingGal == true) {
							imgCSS = ' perspective(' + w * 3 + 'px) rotateX(' + -xRotate * 1.9 + 'deg) rotateY(' + -yRotate * 1.3 + 'deg)';
						} else {

							if (usingMasonrySize == false) {
								imgCSS = ' perspective(' + w * 3 + 'px) rotateX(' + xRotate + 'deg) rotateY(' + yRotate + 'deg)  translateY(' + offsetY * offsetAmount + 'px) translateX(' + offsetX * offsetAmount + 'px) scale(' + scaleAmount + ')';
							} else {
								imgCSS = ' perspective(' + w * 3 + 'px) rotateX(' + xRotate + 'deg) rotateY(' + yRotate + 'deg)  translateY(' + offsetY * -10 + 'px) translateX(' + offsetX * -10 + 'px) scale(1.013)';
							}

						}


						// Container transform
						parallaxContainer.css('transform', imgCSS);

						if (!(navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1)) {
							parallaxShad.css('transform', imgCSS);
						}


					}


					function processEnter(e, elem) {

						elem.firstChild.className += ' over';
						elem.className += ' over';

						$(elem).addClass('transition');

						if ($(elem).parents('.wpb_gallery').length > 0) {
							setTimeout(function () {
								$(elem).removeClass('transition');
							}, 450);
						} else {
							setTimeout(function () {
								$(elem).removeClass('transition');
							}, 200);
						}

					}


					function processExit(e, elem) {

						var w = elem.clientWidth || elem.offsetWidth || elem.scrollWidth;
						var container = elem.firstChild;

						container.className = container.className.replace(' over', '');
						elem.className = elem.className.replace(' over', '');
						$(container).css('transform', 'perspective(' + w * 3 + 'px) rotateX(0deg) rotateY(0deg) translateZ(0)');
						$(elem).parents('.parallaxImg-wrap').find('.parallaxImg-shadow').css('transform', 'perspective(' + w * 3 + 'px) rotateX(0deg) rotateY(0deg) translateZ(0)');

						$(elem).addClass('transition');
						setTimeout(function () {
							$(elem).removeClass('transition');
						}, 200);

					}


					function depths(touchEnabled, elem, layers, totalLayers) {

						var w = elem.clientWidth || elem.offsetWidth || elem.scrollWidth;
						var container = elem.firstChild;

						// Set z
						for (var ly = 0; ly < totalLayers; ly++) {
							if (ly == 0) {
								$(layers[ly]).css('transform', 'translateZ(0px)');
							}
							else {
								$(layers[ly]).css('transform', 'translateZ(' + (w * 3) / 27 * (ly * 1.1) + 'px) ');
							}

						}

						totalLayers = totalLayers + 3;

						// Set perspective from beginning
						$(container).css('transform', 'perspective(' + w * 3 + 'px)');

					}

				}


				/**
				* Fancy Box
				*
				* @since 11.0
				*/
				function nectarFancyBoxHover() {

					if( $('.nectar-fancy-box[data-style="hover_desc"]').length == 0 ) {
						return false;
					}

					var $hoverContentHeight = 0;

					$('body').on('mouseenter touchstart','.nectar-fancy-box[data-style="hover_desc"]', function() {
						$hoverContentHeight = parseInt($(this).find('.hover-content').outerHeight(true));
						$(this).addClass('hovered');
						$(this).find('.heading-wrap').css('transform','translateY(-'+ $hoverContentHeight +'px)');
					});

					$('body').on('mouseleave touchend','.nectar-fancy-box[data-style="hover_desc"]', function() {
						$(this).removeClass('hovered');
						$(this).find('.heading-wrap').css('transform','translateY(0)');
					});

				}


        /**
				* Nectar Link Indicators
				*
				* @since 14.0
				*/
        function nectarLinkIndicators() {

          linkIndicatorArr = [];
          if( !nectarDOMInfo.usingMobileBrowser ) {
            $('[data-nectar-link-indicator]').each(function(i) {
							if ($(this).is('[data-indicator-text]')) {
								linkIndicatorArr[i] = new NectarIconMouseFollow($(this),'view-indicator');
							} else {
								linkIndicatorArr[i] = new NectarIconMouseFollow($(this),'link-indicator');
							}

            });
          }
        }

				/**
				* Mouse Follow Icon
				*
				* @since 11.0
				*/
				function NectarMouseFollowIcon(el,iconSelector) {

					this.$el = el;
					this.$iconEl = this.$el.find(iconSelector);
					this.$innerIconEl = this.$el.find('.inner');

					this.initialX = this.$el.width() / 2;
					this.initialY = this.$el.height() / 2;

					this.elX = 0;
					this.elY = 0;

					this.lastScroll = 0;
					this.scrollAdjust = 0;

					this.lastX = this.initialX;
					this.lastY = this.initialY;
					this.lastY2 = this.initialY;

					this.innerLastX = 0;
					this.innerLastY = 0;
					this.activeFollow = false;
					this.hoverOnly = false;

					this.percentage = 0.03;
					this.percentageInterval;
					this.exitTimeout;

					this.$iconEl.css({
						'top': '0',
						'left': '0'
					});

					$window.on('resize', this.resizeEvent.bind(this));
					this.mouseEvents();
					this.rafLoop();

				}


				NectarMouseFollowIcon.prototype.resizeEvent = function() {
					this.initialX = this.$el.width() / 2;
					this.initialY = this.$el.height() / 2;
				};

				NectarMouseFollowIcon.prototype.mouseEvents = function() {

					var that = this;

					// hover only style
					if(that.$el.hasClass('play_button_hover')) {
						that.hoverOnly = true;
					}

					that.$el.on('mouseenter', function(e) {

						that.activeFollow = true;

						that.elX = e.offsetX;
						that.elY = e.offsetY;

						that.lastScroll = 0;

						if(that.hoverOnly) {
							that.percentage = 1;
							clearTimeout(that.exitTimeout);
							setTimeout(function(){
								that.percentage = 0.16;
							},60);
						}
						else {
							clearInterval(that.percentageInterval);

							that.percentageInterval = setInterval(function(){
							if( that.percentage < 0.16 ) {
								that.percentage += 0.008;
							} else {
								clearInterval(that.percentageInterval);
							}

							},30);
						}


					});

					that.$el.on('mouseleave', function() {

						if(that.hoverOnly) {
							that.exitTimeout = setTimeout(function(){
								that.activeFollow = false;
								that.lastScroll = 0;
								clearInterval(that.percentageInterval);
								that.percentage = 0.03;
							}, 400);
						}
						else {
							that.activeFollow = false;
							that.lastScroll = 0;
							clearInterval(that.percentageInterval);
							that.percentage = 0.03;
						}

					});

					that.$el.on('mousemove', function(e){
						that.elX = e.offsetX;
						that.elY = e.offsetY;
						that.lastScroll = 0;
					});

					$(window).on('scroll',function() {
						if( that.activeFollow == true && that.lastScroll == 0) {
							that.lastScroll = nectarDOMInfo.scrollTop;
						}
					});

				};


				NectarMouseFollowIcon.prototype.rafLoop = function() {

					if( this.activeFollow == true ) {

						this.scrollAdjust = 0;
						this.alteredY = this.elY;
						if( this.lastScroll > 0 ) {
							this.scrollAdjust = nectarDOMInfo.scrollTop - this.lastScroll;
							this.alteredY += this.scrollAdjust;
						}

						this.lastY = linearInterpolate(this.lastY, this.alteredY, this.percentage);
						this.lastX = linearInterpolate(this.lastX, this.elX, this.percentage);

						// Need to track y without scroll adjust for inner parallax
						this.lastY2 = linearInterpolate(this.lastY2, this.alteredY, this.percentage);

						this.innerLastX = linearInterpolate(this.innerLastX, parseInt(this.elX) - parseInt(this.lastX), this.percentage)/1.7;
						this.innerLastY = linearInterpolate(this.innerLastY, parseInt(this.alteredY) - parseInt(this.lastY2), this.percentage)/1.7;

					} else {
						this.lastY = linearInterpolate(this.lastY, this.initialY, 0.055);
						this.lastX = linearInterpolate(this.lastX, this.initialX, 0.055);

						this.innerLastX = 0;
						this.innerLastY = 0;
					}

					this.$iconEl[0].style.transform = 'translateX(' + this.lastX + 'px) translateY(' + this.lastY + 'px)';

					if( this.$innerIconEl.length > 0 ) {
						this.$innerIconEl[0].style.transform = 'translateX(' + clamp(this.innerLastX,14,-14) + 'px) translateY(' + clamp(this.innerLastY,14,-14) + 'px)';
					}

					requestAnimationFrame(this.rafLoop.bind(this));

				};




			/**
				* Video Lightbox
				*
				* @since 11.0
				*/
				function nectarVideoLightbox() {

					iconMouseFollowArr = [];

					// Parent hover relationship.
					$body.on('mouseenter','.nectar_video_lightbox[data-parent-hover="1"]', function() {
						var $parentRow = $(this).parents('.wpb_row');
						$parentRow.find('> .row-bg-wrap .row-bg, > .nectar-video-wrap .nectar-video-inner').addClass('transition');
						$parentRow.find('> .row-bg-wrap .row-bg, > .nectar-video-wrap .nectar-video-inner').css({
							'transform' : 'scale(1.08)'
						});
					});

					$body.on('mouseleave','.nectar_video_lightbox[data-parent-hover="1"]', function() {
						var $parentRow = $(this).parents('.wpb_row');
						$parentRow.find('> .row-bg-wrap .row-bg, > .nectar-video-wrap .nectar-video-inner').css({
							'transform' : 'scale(1)'
						});
					});

					// Mouse Indicator.
          $('.nectar_video_player_self_hosted').each(function(i){
            if( !nectarDOMInfo.usingMobileBrowser && $(this).find('.play_button.follow_mouse').length > 0 ) {
              iconMouseFollowArr[i] = new NectarMouseFollowIcon($(this), '.play_button.follow_mouse .play');
            }
          });

          // Scrolled triggered play.
          if ('IntersectionObserver' in window) {

            var selfHostedVideoObserver = new IntersectionObserver(function (entries) {
              entries.forEach(function(entry) {
                if (entry.isIntersecting) {

				  var video = entry.target;

				  var timeout = 200;
				  if( video.readyState > 1 ) {
					timeout = 20;
				  }
				  setTimeout(function(){
					video.pause();
					video.currentTime = 0;
					video.play();
				  }, timeout);

                  selfHostedVideoObserver.unobserve(entry.target);
                }
              });
            }, {
							root: (isSafari()) ? null : document,
              rootMargin: '-10% 0% -10% 0%',
              threshold: 0
            });

            $('video.scroll-triggered-play').each(function () {
              selfHostedVideoObserver.observe($(this)[0]);
            });

          }

					$('.nectar-video-box').each(function(i){

						if( $(this).find('.play_button_mouse_follow').length > 0 ) {

							var $that = $(this);

							$(this).imagesLoaded(function () {

								// Follow mouse.
								if( !nectarDOMInfo.usingMobileBrowser ) {
									iconMouseFollowArr[i] = new NectarMouseFollowIcon($that, '.play_button_mouse_follow');
								}

								// Initial setup.
								var $playColor = ( $that.is('[data-mouse-icon-color]') && $that.attr('data-mouse-icon-color').length > 0 ) ? $that.attr('data-mouse-icon-color') : '#000';

								if( $that.is('[data-mouse-style="solid_color"]') ) {

									$that.find('.play_button_mouse_follow').css({
											'background-color': $playColor
									});
								}

								$that.find('.play_button_mouse_follow').addClass('visible');

							});

						}

					});

				}



				/**
				* Salient slider rotation
				*
				* @since 10.5
				*/
				function nectarCustomSliderRotate(slider) {

					if ($('body.vc_editor').length > 0) {
						return;
					}

					var $controlSelector = (slider.find('.project-slides').length > 0) ? '.dot-nav > span' : '.controls > li',
					$controlSelectorInd  = (slider.find('.project-slides').length > 0) ? 'span' : ' li',
					$slideLength         = slider.find($controlSelector).length,
					$currentSlide        = slider.find($controlSelector + '.active').index();

					if ($currentSlide + 1 == $slideLength) {
						slider.find($controlSelector + ':first-child').trigger('click');
					} else {
						slider.find($controlSelector + '.active').next($controlSelectorInd).trigger('click');
					}
				}


				/**
				* Salient slider rotation reset
				*
				* @since 10.5
				*/
				function nectarCustomSliderResetRotate(slider, index) {
					clearInterval($nectarCustomSliderRotate[index].autorotate);

					// Reinit autorotate
					if (slider.attr('data-autorotate').length > 0) {
						var slide_interval = (parseInt(slider.attr('data-autorotate')) < 100) ? 4000 : parseInt(slider.attr('data-autorotate'));
						$nectarCustomSliderRotate[index].autorotate = setInterval(function () {
							nectarCustomSliderRotate(slider)
						}, slide_interval);
					}
				}



				/**
				* Fullscreen recent project slider
				*
				* @since 10.5
				*/
				function fsProjectSliderInit() {

					$fsProjectSliderArr = [];

					if (typeof SalientRecentProjectsFullScreen === 'undefined') {
						return;
					}

					$('.nectar_fullscreen_zoom_recent_projects').each(function (i) {
						$fsProjectSliderArr[i] = new SalientRecentProjectsFullScreen($(this));
					});

				}





				/**
				* Portfolio single template sticky sidebar
				*
				* @since 6.0
				*/
				function portfolioSidebarFollow() {

					var sidebarFollow = $('.single-portfolio #sidebar').attr('data-follow-on-scroll');

					if ($('body.single-portfolio').length == 0 || $('#sidebar[data-follow-on-scroll]').length == 0) {
						return;
					}

					sidebarFollow = $('.single-portfolio #sidebar').attr('data-follow-on-scroll');

					if (sidebarFollow == 1 &&
						!$body.hasClass('mobile') &&
						parseInt($('#sidebar').height()) + 50 <= parseInt($('.post-area').height())) {

						//padding from top of screen
						var $ssExtraTopSpace = stickyElPositionOffset();

						$('.single-portfolio #sidebar').theiaStickySidebar({
							additionalMarginTop: $ssExtraTopSpace,
							updateSidebarHeight: false
						});


					}

				}





				/**
				* Infinite scroll pagination
				*
				* @since 6.0
				*/
				function infiniteScrollInit() {

					if ($('.infinite_scroll').length > 0) {

						// Portfolio
						$('.portfolio-items.infinite_scroll').infinitescroll({
							navSelector: "#pagination",
							nextSelector: "#pagination a:first",
							itemSelector: ".portfolio-items.infinite_scroll .element",
							finishedMsg: "<em>Congratulations, you've reached the end of the internet.</em>",
							msgText: " ",
						}, function (newElements) {


							var $container 	= $('.portfolio-items.infinite_scroll:not(.carousel)'),
							$newElems 			= $(newElements).css('opacity', 0);

							// Ensure that images load before adding to masonry layout
							$newElems.imagesLoaded(function () {

								$(newElements).css('opacity', 1);

								$container.isotope('appended', $(newElements));

								$(newElements).find('.work-item').addClass('ajax-loaded');
								$(newElements).addClass('ajax-loaded');

								// Show elems now they're ready
								$(newElements).find('.work-meta, .nectar-love-wrap').css({
									'opacity': 1
								});

								// Keep current filtering
								if ($('.portfolio-filters-inline').length > 0 || $('.portfolio-filters').length > 0) {

									var selector;

									if ($('.portfolio-filters-inline').length > 0) {
										selector = $('.portfolio-filters-inline a.active').attr('data-filter');
									} else {
										selector = $('.portfolio-filters a.active').attr('data-filter');
									}

									$('.portfolio-filters-inline a.active').attr('data-filter');
									$container.isotope({
										filter: selector
									});
								}

								// Set width
								for (var i = 0; i < $portfolio_containers.length; i++) {
									$portfolio_containers[i].reLayout();
								}

								if ($(newElements).find('.work-item.style-5').length > 0) {
									parallaxItemHoverEffect();
								}

								if ($(newElements).find('.inner-wrap').attr('data-animation') == 'none') {
									$('.portfolio-items .col .inner-wrap').removeClass('animated');
								} else {

									for (var i = 0; i < $portfolio_containers.length; i++) {
										$portfolio_containers[i].masonryZindex();
										$portfolio_containers[i].portfolioAccentColor();
									}

									$(newElements).each(function () {

										var $portfolioOffsetPos = ($('#nectar_fullscreen_rows').length > 0) ? '200%' : '90%';

										// Not already visible
										var $that = $(this);
										var waypoint = new Waypoint({
											element: $that[0],
											handler: function () {

												var $portfolioAnimationDelay = ($that.is('[data-masonry-type="photography"].masonry-items')) ? 85 : 115;

												setTimeout(function () {
													$that.addClass("animated-in");
												}, $portfolioAnimationDelay * $that.attr('data-delay-amount'));


												waypoint.destroy();
											},
											offset: $portfolioOffsetPos

										});


									});
								}


								// Lightbox reinit.
								$('.portfolio-items').each(function () {
									var $unique_id = uniqueIdGenerate();
									$(this).find('a[rel^="prettyPhoto"], a.pretty_photo').attr('rel', 'prettyPhoto[' + $unique_id + '_gal]').removeClass('pretty_photo');
								});


								$('.portfolio-items').each(function () {
									var $unique_id = uniqueIdGenerate();
									$(this).find('a[data-fancybox^="group_"]').attr('data-fancybox', 'group_' + $unique_id);
								});

								lightBoxInit();

								setTimeout(function () {

									for (var i = 0; i < $portfolio_containers.length; i++) {
										$portfolio_containers[i].masonryZindex();
										$portfolio_containers[i].reLayout();
										$portfolio_containers[i].isotopeCatSelection();
									}
									$(newElements).removeClass('ajax-loaded');
								}, 700);

								parallaxRowsBGCals();

							});


						});

						// Blog
						var blogPostItemSelector = '.post-area.infinite_scroll .posts-container .post';
						if ($('body').find(blogPostItemSelector).length == 0) {
							// switch to generic selector for CTPs
							blogPostItemSelector = '.post-area.infinite_scroll .posts-container > article';
						}
						$('.post-area.infinite_scroll .posts-container').infinitescroll({
							navSelector: "#pagination",
							nextSelector: "#pagination a:first",
							itemSelector: blogPostItemSelector,
							finishedMsg: "<em>Congratulations, you've reached the end of the internet.</em>",
							msgText: " "
						}, function (newElements) {

							if($(newElements).find('[data-nectar-img-src]').length > 0) {
								nectarLazyImageLoading();
							}

							// Only trigger recalc of waypoints and elements if needed.
							if ($('.masonry.classic').length > 0 ||
							    $('.post-area:not(.masonry):not(.featured_img_left)').length > 0 ||
									$('.post-area.standard-minimal').length > 0) {

								// Gallery.
								flexsliderInit();

								// Media players.
								if ($().mediaelementplayer) {
									$(newElements).find('.wp-audio-shortcode, .wp-video-shortcode').mediaelementplayer();
								}

								// Lightbox.
								lightBoxInit();

								// Carousels.
								if ($('.carousel').length > 0) {
									standardCarouselInit();
									clientsCarouselInit();
								}

								// Waypoints.
								waypoints();

								// Testimonial slider.
								$('.testimonial_slider').animate({
									'opacity': '1'
								}, 800);
								nectarTestimonialSliders();
								nectarTestimonialSlidersEvents();

								setTimeout(function () {
									responsiveVideoIframesInit();
									responsiveVideoIframes();
									$window.trigger('resize');
								}, 500);


								parallaxRowsBGCals();

								$window.trigger('resize');

							} // Non meta overlaid style.
							else {
								parallaxRowsBGCals();

								$window.trigger('resize');
							}

							// Trigger Masonry as a callback.
							var $container = $('.infinite_scroll .posts-container');
							if ($container.parent().hasClass('masonry')) {

								$(newElements).addClass('masonry-blog-item');


							} //if masonry.


							// Loading effect.

							//// hide new items while they are loading.
							var $newElems = $(newElements);
							//// ensure that images load before adding to masonry layout.

							if ($newElems.find('img').length == 0) {
								$newElems = $('body');
							} else if(isSafari()) {

								// Safari specific bug that causes object-fit to fail on AJAX loaded items.
								// Forcing a reload of the image src corrects issue.
								var newImages = Array.from($newElems.find('img[srcset]'));

								newImages.forEach(function(img) {
									 var srcset = img.getAttribute('srcset');
									 img.setAttribute('srcset', '');
									 img.setAttribute('srcset', srcset);
								});
							}



							$newElems.imagesLoaded(function () {

								if ($container.parent().hasClass('masonry') &&
									!$container.parent().hasClass('auto_meta_overlaid_spaced')) {
									$container.isotope('appended', $(newElements));
								}

								for (var i = 0; i < $nectarMasonryBlogs.length; i++) {
									$nectarMasonryBlogs[i].flickityBlogInit();
								}

								$(newElements).addClass('ajax-loaded');
								// Show elems now they're ready.

								// Classic enhanced specific
								if ($container.parent().hasClass('classic_enhanced')) {
									$container.find('.large_featured.has-post-thumbnail.ajax-loaded .post-featured-img, .wide_tall.has-post-thumbnail.ajax-loaded .post-featured-img').each(function () {
										var $src = $(this).find('img').attr('src');
										$(this).css('background-image', 'url(' + $src + ')');
									});

									$container.find('.large_featured.ajax-loaded .nectar-flickity, .wide_tall.ajax-loaded .nectar-flickity').each(function () {

										$(this).find('.cell').each(function () {
											var $src = $(this).find('img').attr('src');
											$(this).css('background-image', 'url(' + $src + ')');
										});

									});
								}


								if ($(newElements).parents('.posts-container').attr('data-animation') == 'none') {
									$(newElements).find('.inner-wrap').removeClass('animated');
								} else {

									for (var i = 0; i < $nectarMasonryBlogs.length; i++) {
										$nectarMasonryBlogs[i].blogMasonryZindex();
									}

									$(newElements).each(function () {

										var $that = $(this);
										var waypoint = new Waypoint({

											element: $that[0],
											handler: function () {

												setTimeout(function () {
													$that.addClass("animated-in");
												}, 80 * $that.attr('data-delay-amount'));

												waypoint.destroy();
											},
											offset: '90%'

										});


									});
								}

								setTimeout(function () {
									$(newElements).removeClass('ajax-loaded');
								}, 700);


							});


						});

					}

				}






				/**
				* Scroll to top scroll bind.
				*
				* @since 2.0
				*/
				function toTopBind() {

					if ($('#to-top').length > 0 && nectarDOMInfo.winW > 1020 ||
							$('#to-top').length > 0 && $('#to-top.mobile-enabled').length > 0) {

						if (nectarDOMInfo.scrollTop > 350) {
							$window.on('scroll', hideToTop);
						} else {
							$window.on('scroll', showToTop);
						}
					}

				}

				/**
				* Scroll to top show.
				*
				* @since 2.0
				*/
				function showToTop() {

					if (nectarDOMInfo.scrollTop > 350 && !$offCanvasEl.is('.fullscreen.open') ) {

						$('#to-top').stop().transition({
							'transform': 'translateY(-50%)'
						}, 350, 'easeInOutCubic');

						$window.off('scroll', showToTop);
						$window.on('scroll', hideToTop);
					}

				}


				/**
				* Scroll to top hide.
				*
				* @since 2.0
				*/
				function hideToTop() {

					if (nectarDOMInfo.scrollTop < 350 || $offCanvasEl.is('.fullscreen.open') ) {

						var $animationTiming = ($('#slide-out-widget-area.fullscreen.open').length > 0) ? 1150 : 350;

						$('#to-top').stop().transition({
							'transform': 'translateY(105%)'
						}, $animationTiming, 'easeInOutQuint');

						$window.off('scroll', hideToTop);
						$window.on('scroll', showToTop);

					}
				}


				/**
				* Scroll to top initialization.
				*
				* @since 10.5
				*/
				function scrollToTopInit() {

					// Show/hide based on scroll pos
					if ($('.nectar-social.fixed').length == 0) {
						toTopBind();
					}


					// Rounded style
					if ($('body[data-button-style*="rounded"]').length > 0) {
						var $clone = $('#to-top .fa-angle-up').clone();
						$clone.addClass('top-icon');
						$('#to-top').prepend($clone);
					}

					// Scroll up click event
					$body.on('click', '#to-top, a[href="#top"]', function () {
						$('body,html').stop().animate({
							scrollTop: 0
						}, 800, 'easeOutQuad', function () {
							if ($('.nectar-box-roll').length > 0) {
								$body.trigger('mousewheel', [1, 0, 0]);
							}
						});
						return false;
					});

				}









				/**
				* Scrollspy plugin initialization.
				*
				* @since 5.0
				*/
				function scrollSpyInit() {

					var $headerNavSpace = ($('body[data-header-format="left-header"]').length > 0 && $window.width() > 1000) ? 0 : $headerOuterEl.outerHeight();

					if ($('.page-template-template-no-header-footer').length > 0 || $('.page-template-template-no-header').length > 0) {
						$headerNavSpace = 0;
					}

					// Track whether scrollspy is really needed.
					var hashLinksFound = false;

					//prevent jump to top on empty items
					$('header#top .sf-menu li a[href="#"]').on('click', function (e) {
						e.preventDefault();
					});

					if ($('#nectar_fullscreen_rows').length == 0 || $nectarFullPage.$usingFullScreenRows == false) {

						$('a.nectar-next-section').each(function () {

							if ($(this).parents('.wpb_row:not(.inner_row)').length > 0) {

								var $parentRow = $(this).parents('.wpb_row:not(.inner_row)');

								if ($parentRow.next('.wpb_row[id]:not(.inner_row)').length > 0) {

									var $nextRowID = $parentRow.next('.wpb_row[id]:not(.inner_row)').attr('id');
									$(this).attr('href', '#' + $nextRowID);
									hashLinksFound = true;
								}

							}

						});
					}

					else if ($().fullpage) {
						$('a.nectar-next-section').on('click', function () {
							$.fn.fullpage.moveSectionDown();
							return false;
						});
					}


						// Links in off canvas menu.
						if ($('#slide-out-widget-area .off-canvas-menu-container').length > 0) {
							$('#slide-out-widget-area .off-canvas-menu-container').find("a[href*='" + location.pathname + "']").each(function () {

								var $href = $(this).attr('href');
								var hashSegment = $href.substr($href.indexOf("#"));

								// Regular animated anchors.
								if ($href != '#' &&
								$href.indexOf("#") != -1 &&
								$href.substr($href.indexOf("#")) !== '#' &&
								hashSegment.indexOf('#/') == -1 &&
								$('div' + $href.substr($href.indexOf("#"))).length > 0) {

									$(this).attr('href', $href.substr($href.indexOf("#")));

									$(this).parent()
										.removeClass('current_page_item')
										.removeClass('current-menu-item');

								}

								// Fullpage is a little different.
								if ($('div[data-fullscreen-anchor-id="' + $href.substr($href.indexOf("#") + 1) + '"]').length > 0) {

									$(this).parent()
										.removeClass('current_page_item')
										.removeClass('current-menu-item');

								}

							});
						}

						// Links in header navigation.
						$("#header-outer").find("a[href*='" + location.pathname + "']").each(function () {

							var $href = $(this).attr('href');
							var hashSegment = $href.substr($href.indexOf("#"));

							// Regular animated anchors
							if ($href.indexOf("#") != -1 &&
							$href.substr($href.indexOf("#")) !== '#' &&
							hashSegment.indexOf('#/') == -1 &&
							$('div' + $href.substr($href.indexOf("#"))).length > 0) {

								$(this).attr('href', $href.substr($href.indexOf("#")));
								$(this).parent()
									.removeClass('current_page_item')
									.removeClass('current-menu-item');

							}

							// Fullpage is a little different
							if ($('div[data-fullscreen-anchor-id="' + $href.substr($href.indexOf("#") + 1) + '"]').length > 0) {

								$(this).parent()
									.removeClass('current_page_item')
									.removeClass('current-menu-item');

							}

						});



					// Hash links in menu?
					if( $("#header-outer").length > 0 ) {
						$("#header-outer").find("a[href*='#']:not([href='#'])").each(function() {
							if( $(this).attr('href') !== '#' &&
							    $(this).attr('href') !== '#searchbox' &&
									$(this).attr('href') !== '#slide-out-widget-area') {
								hashLinksFound = true;
							}
						});
					}

					if( $("#slide-out-widget-area .off-canvas-menu-container").length > 0 ) {
						$("#slide-out-widget-area .off-canvas-menu-container").find("a[href*='#']:not([href='#'])").each(function() {
							if( $(this).attr('href') !== '#' ) {
								hashLinksFound = true;
							}
						});
					}

					// Init scrollspy.
					var targetList = [];
					if( hashLinksFound == true ) {
						targetList.push('#header-outer nav');
					}
					if( $('.page-submenu[data-sticky="true"] a[href*="#"]').length > 0 ) {
						targetList.push('.page-submenu[data-sticky="true"]');
					}

					if( targetList.length > 0 ) {
						targetList.forEach(function(tar, i) {
							var $el = (i == 0) ? $body : $(window);
							$el.scrollspy({
								target: tar,
								offset: $headerNavSpace + nectarDOMInfo.adminBarHeight + 40
							});
						});
					}

				}




				/**
				* Called to scroll to hash link on page load
				*
				* @since 5.0
				*/
				function pageLoadHash() {

					var $hash = window.location.hash;

					if( $hash && $hash.length > 0 ) {
						$hash = $hash.replace(/<|>/g,'');
					}

					var $hashSubstrng   = ($hash && $hash.length > 0) ? $hash.substring(1, $hash.length) : 0,
					headerPadding2      = headerPadding - headerPadding / 1.8,
					$hasSlashLength     = 0;


					// If the hash has slashes
					if ($hashSubstrng) {
						$hasSlashLength = $hashSubstrng.split("/");
						$hasSlashLength = $hasSlashLength.length;
					}

					if ($hashSubstrng && $hasSlashLength > 1) {
						$hashSubstrng = $hashSubstrng.replace(/\//g, "");
						$hash         = $hash.replace(/\//g, "");
					}

					if ($hash && $('.main-content').find($hash).length > 0 ||
					$hash && $('.main-content').find('[data-fullscreen-anchor-id="' + $hashSubstrng + '"]').length > 0) {

						var $hashObj    = ($('.main-content').find($hash).length > 0) ? $('.main-content').find($hash) : $('.main-content').find('[data-fullscreen-anchor-id="' + $hashSubstrng + '"]'),
						$headerNavSpace = ($('body[data-header-format="left-header"]').length > 0 && $window.width() > 1000) ? 0 : $('#header-space').outerHeight();

						if ($('.page-template-template-no-header-footer').length > 0 || $('.page-template-template-no-header').length > 0) {
							$headerNavSpace = 0;
						}

						var $timeoutVar = 100;

						// Box roll.
						if ($('.nectar-box-roll').length > 0 && $('.container-wrap.bottomBoxOut').length > 0) {
							nectarBoxRoll.boxRoll(null, -1);
							$timeoutVar = 2050;
						}

						// Lazy images.
						if($('img[data-nectar-img-src]').length > 0) {
							nectarLoadAllImages();
							$timeoutVar = 200;
						}

						setTimeout(function () {

							var $scrollTopDistance;

							if( headerIsContained === true ) {
								var containedHeaderHeight = $('#header-outer').outerHeight() + (parseInt($('#header-outer').css('margin-top')) * 2);
								$scrollTopDistance = $($hash).offset().top - containedHeaderHeight - nectarDOMInfo.adminBarHeight;
							}
							else if ($('body[data-permanent-transparent="1"]').length == 0) {

								if (!$body.hasClass('mobile')) {
									var $resize = ($('#header-outer[data-header-resize="0"]').length > 0) ? 0 : parseInt(logoShrinkNum) + headerPadding2 * 2;
									if ($('#header-outer[data-remove-fixed="1"]').length > 0) {
										$headerNavSpace = 0;
									}
									$scrollTopDistance = $hashObj.offset().top - parseInt($headerNavSpace) + $resize + 3 - nectarDOMInfo.adminBarHeight;


									// Condense
									if ($('body.mobile').length == 0 &&
									    $('#header-outer[data-condense="true"]').length > 0 &&
											$('body.page-template-template-no-header').length === 0 &&
										  $('body.page-template-template-no-header-footer').length === 0) {

											var $headerSpan9       = $('#header-outer[data-format="centered-menu-bottom-bar"] header#top .span_9'),
											$headerHeightStored    = $headerOuterEl.height(),
											$headerHeightCondensed = $headerHeightStored - (parseInt($headerSpan9.height()) + parseInt($('#header-outer #logo').css('margin-top')));

											$scrollTopDistance = $hashObj.offset().top - parseInt($headerNavSpace) + $headerHeightCondensed - nectarDOMInfo.adminBarHeight;
									}

								} else {
									$scrollTopDistance = ($('#header-outer[data-mobile-fixed="1"]').length > 0) ? $hashObj.offset().top + 2 - $headerNavSpace + nectarDOMInfo.adminBarHeight : $hashObj.offset().top - nectarDOMInfo.adminBarHeight + 1;
								}

							} else {
								$scrollTopDistance = $hashObj.offset().top - nectarDOMInfo.adminBarHeight + 1;
							}

							if ($('body[data-hhun="1"]').length > 0 && $('#header-outer[data-remove-fixed="1"]').length == 0) {

								// Alter offset
								if ($('#header-outer.detached').length == 0) {
									$scrollTopDistance = $scrollTopDistance + $headerNavSpace;
								}
							}

							var $pageSubMenu = ($('.page-submenu[data-sticky="true"]').length > 0) ? $('.page-submenu').height() : 0;
							var $headerSecondary;

							if ($('body.material').length > 0 &&
								$headerSecondaryEl.length > 0 &&
								$('body[data-hhun="1"]').length == 0 &&
								$('#header-outer[data-remove-fixed="1"]').length == 0 &&
								!$body.hasClass('mobile')) {

								$headerSecondary = $headerSecondaryEl.height();

							} else {
								$headerSecondary = 0;
							}

							nectar_scrollToY($scrollTopDistance - $pageSubMenu + $headerSecondary, 700, 'easeInOutQuint');

							nectarState.animatedScrolling = true;
							setTimeout(function () {
								nectarState.animatedScrolling = false;
							}, 1100);

						}, $timeoutVar);
					}
				}


				/**
				* Initialize page load hash functionality
				*
				* @since 10.5
				*/
				function pageLoadHashInit() {

					if ($('body[data-animated-anchors="true"]').length > 0) {
						if ($('.nectar-box-roll').length == 0 && $('#nectar_fullscreen_rows').length == 0) {

							// Inside tabs
							if (typeof nectarGetQueryParam['tab'] != 'undefined') {
								setTimeout(function () {
									pageLoadHash();
								}, 800);
							}
							// Regular
							else {
								pageLoadHash();
							}

						}

						if ($('#nectar_fullscreen_rows[data-mobile-disable="on"]').length > 0 && $('.nectar-box-roll').length == 0 &&
						nectarDOMInfo.usingMobileBrowser) {
							pageLoadHash();
						}

					}

				}


				/**
				* Animated anchor link theme option.
				*
				* @since 10.5
				*/
				function animatedAnchorLinks() {


					if( $animatedAnchorLinks ) {

						$body.on('click', '#header-outer nav .sf-menu li:not(.slide-out-widget-area-toggle) a[href*="#"]', function() {
							if ( nectarState.ocmOpen && $(this).attr('href') != '#') {
								OCM_close($(this).parent());
							}
						});
					}

					if ($('body[data-animated-anchors="true"]').length > 0 ||
					$('.single-product [data-gallery-style="left_thumb_sticky"]').length > 0) {

						var headerPadding2 = headerPadding - headerPadding / 1.8;

						setTimeout(scrollSpyInit, 100);

						var $animatedScrollingTimeout;

						$body.on('click', '#header-outer nav .sf-menu a:not([href="#slide-out-widget-area"]), #header-outer .mobile-header .sf-menu a, #footer-outer .nectar-button, #footer-outer .widget_nav_menu a, #footer-widgets .textwidget a, #mobile-menu li a, .nectar-scrolling-tabs:not(.navigation_func_active_link_only) .scrolling-tab-nav a, .container-wrap a:not(.wpb_tabs_nav a):not(.navigation_func_active_link_only .scrolling-tab-nav a):not(.comment-wrap .navigation a):not(.woocommerce-checkout a):not(.um-woo-view-order):not(.magnific):not([data-fancybox]):not(.woocommerce-tabs .tabs a):not(.slider-prev):not(.slider-next):not(.testimonial-next-prev a):not(.page-numbers), .swiper-slide .button a, #slide-out-widget-area a, #slide-out-widget-area .inner div a', function (e) {

							var triggerAnimatedScroll = true;
							var $hash = $(this).prop("hash");

							if( $hash &&
								!$(this).hasClass('nectar-next-section') &&
							    $(this).parents('.slide-out-widget-area-toggle').length == 0 ) {
								$body.addClass('animated-scrolling');
								nectarState.animatedScrolling = true;
							}

							clearTimeout($animatedScrollingTimeout);

							$animatedScrollingTimeout = setTimeout(function () {
								$body.removeClass('animated-scrolling');
								nectarState.animatedScrolling = false;
							}, 1100);

							var $headerNavSpace = ($('body[data-header-format="left-header"]').length > 0 && $window.width() > 1000) ? 0 : $('#header-space').outerHeight();

							if ($('.page-template-template-no-header-footer').length > 0 ||
							    $('.page-template-template-no-header').length > 0 ||
									$('#header-space').length == 0 ) {
								$headerNavSpace = 0;
							}

							// Delay full page anchors until material right OCM closes
							if (  $nectarFullPage.$usingFullScreenRows != false &&
								    $('#nectar_fullscreen_rows[data-anchors="on"]').length > 0 &&
										$hash && $hash != '' && $hash != '#top' &&
								    $('body.material[data-slide-out-widget-area-style="slide-out-from-right"].material-ocm-open').length > 0) {

										e.preventDefault();

										if (!$(this).hasClass('skip-hash')) {
											if (history.pushState) {
												history.pushState(null, null, $hash);
											} else {
												location.hash = $hash;
											}

										}

										setTimeout(function() {
											$(window).trigger('hashchange');
										},800);

							}


							if ($hash && $body.find($hash).length > 0 && $hash != '#top' && $hash != '' && $(this).attr('href').indexOf(window.location.href.split("#")[0]) !== -1 ||
							$(this).is('[href^="#"]') && $hash != '' && $body.find($hash).length > 0 && $hash != '#top') {


								//update hash
								if (!$(this).hasClass('skip-hash')) {
									if (history.pushState) {
										history.pushState(null, null, $hash);
									} else {
										location.hash = $hash;
									}
								}

								if ($(this).parents('ul').length > 0) {

									$(this)
										.parents('ul')
										.find('li')
										.removeClass('current-menu-item');
								}

								// Side widget area click
								if ($(this).parents('#slide-out-widget-area').length > 0) {

									if ($('body.material[data-slide-out-widget-area-style="slide-out-from-right"].material-ocm-open').length > 0) {

										$('body > .slide_out_area_close')
											.addClass('non-human-allowed')
											.trigger('click');

										// Scroll
										var $clickedLinkStore = $(this);

										triggerAnimatedScroll = false;

										setTimeout(function () {
											$clickedLinkStore.trigger('click');
										}, 1000);

									} else {
										$('#slide-out-widget-area .slide_out_area_close')
											.addClass('non-human-allowed')
											.trigger('click');
									}

									setTimeout(function () {
										if ($('body.material[data-slide-out-widget-area-style="slide-out-from-right"]').length > 0) {
											$('body > .slide_out_area_close').removeClass('non-human-allowed');

										} else {
											$('#slide-out-widget-area .slide_out_area_close').removeClass('non-human-allowed');
										}
									}, 100);
								}

								// Mobile menu click
								if ( $(this).parents('#mobile-menu').length > 0 ) {
									$('.slide-out-widget-area-toggle.mobile-icon a')
										.addClass('non-human-allowed')
										.trigger('click');

										setTimeout(function () {
												$('.slide-out-widget-area-toggle.mobile-icon a').removeClass('non-human-allowed');
										}, 100);
								}

								var $timeoutVar       = 1;
								var $that             = $(this);

								// Box roll.
								if ($('.nectar-box-roll').length > 0 && $('.container-wrap.bottomBoxOut').length > 0) {
									nectarBoxRoll.boxRoll(null, -1);
									$timeoutVar = 2050;
								}

								// Load all images to calc offset correctly.
								if($('img[data-nectar-img-src]').length > 0) {
									nectarLoadAllImages();
									$timeoutVar = 200;
								}


								setTimeout(function () {

									var $scrollTopDistance;

									// Scrolling
									if( headerIsContained === true ) {
										var containedHeaderHeight = $('#header-outer').outerHeight() + (parseInt($('#header-outer').css('margin-top')) * 2);
										$scrollTopDistance = $($hash).offset().top - containedHeaderHeight - nectarDOMInfo.adminBarHeight;
									}
									else if ($('body[data-permanent-transparent="1"]').length == 0) {

										if (!$body.hasClass('mobile')) {
											var $resize = ($('#header-outer[data-header-resize="0"]').length > 0) ? 0 : parseInt(logoShrinkNum) + headerPadding2 * 2;
											if ($('#header-outer[data-remove-fixed="1"]').length > 0) {
												$headerNavSpace = 0;
											}

											$scrollTopDistance = $($hash).offset().top - parseInt($headerNavSpace) + $resize + 3 - nectarDOMInfo.adminBarHeight;

											// Condense
											if ($('body.mobile').length == 0 &&
											$('body.page-template-template-no-header').length === 0 &&
											$('body.page-template-template-no-header-footer').length === 0 &&
											$('#header-outer[data-condense="true"]').length > 0) {

												var $headerSpan9       = $('#header-outer[data-format="centered-menu-bottom-bar"] header#top .span_9'),
												$headerHeightStored    = $headerOuterEl.height(),
												$headerHeightCondensed = $headerHeightStored - (parseInt($headerSpan9.height()) + parseInt($('#header-outer #logo').css('margin-top')));
												$scrollTopDistance     = $($hash).offset().top - parseInt($headerNavSpace) + $headerHeightCondensed - nectarDOMInfo.adminBarHeight;


											}


										} else {
											$scrollTopDistance = ($('#header-outer[data-mobile-fixed="1"]').length > 0) ? $($hash).offset().top + 2 - $headerNavSpace + nectarDOMInfo.adminBarHeight : $($hash).offset().top - nectarDOMInfo.adminBarHeight + 1;
										}

									} else {
										$scrollTopDistance = $($hash).offset().top - nectarDOMInfo.adminBarHeight + 1;
									}

									if ($('body[data-hhun="1"]').length > 0 && $('#header-outer[data-remove-fixed="1"]').length == 0) {

										// Alter offset
										if ($('#header-outer.detached').length == 0 || $that.parents('.page-submenu[data-sticky="true"]').length > 0) {
											$scrollTopDistance = $scrollTopDistance + $headerNavSpace;
										}

										// Hide top header
										if ($that.parents('.page-submenu[data-sticky="true"]').length > 0) {

											$('#header-outer.detached').addClass('invisible');
											$('.page-submenu')
												.addClass('header-not-visible')
												.css('transform', 'translateY(0px)');

										}
									}

									var $pageSubMenu = ($that.parents('.page-submenu[data-sticky="true"]').length > 0) ? $that.parents('.page-submenu').height() : 0;
									var $headerSecondary;

									if ($('body.material').length > 0 &&
										$headerSecondaryEl.length > 0 &&
										$('body[data-hhun="1"]').length == 0 &&
										$('#header-outer[data-remove-fixed="1"]').length == 0 &&
										!$body.hasClass('mobile')) {

										$headerSecondary = $headerSecondaryEl.height();

									} else {

										if($('body[data-hhun="1"]').length > 0 &&
											$headerSecondaryEl.length > 0 &&
											!$body.hasClass('mobile') &&
											$('#header-outer[data-remove-fixed="1"]').length == 0) {
											$headerSecondary = $headerSecondaryEl.height();
										} else {
											$headerSecondary = 0;
										}

									}


									if( triggerAnimatedScroll ) {
										nectar_scrollToY($scrollTopDistance - $pageSubMenu + $headerSecondary, 700, 'easeInOutQuint');
									}


								}, $timeoutVar);

								e.preventDefault();

							}

							if ($hash == '#top') {
								// Side widget area click
								if ($(this).parents('#slide-out-widget-area').length > 0) {
									$('#slide-out-widget-area .slide_out_area_close').trigger('click');
								}
							}

						});


					}

				}






				/**
				* Search results masonry layout.
				*
				* @since 10.0
				*/
				function searchResultMasonry() {

					var $searchContainer = $('#search-results'),
					$dividerNum          = ($searchContainer.is('[data-layout="masonry-no-sidebar"]')) ? 4 : 3;

					$searchContainer.imagesLoaded(function () {

						$searchContainer.isotope({
							itemSelector: '.result',
							layoutMode: 'packery',
							packery: {
								gutter: 0
							}
						});

						$searchContainer
							.find('article')
							.css('opacity', '1');

					});

					$window.on('resize', function () {

						$searchContainer.isotope({
							layoutMode: 'packery',
							packery: {
								gutter: 0
							}
						});
					});

				}


				/**
				* Search results masonry layout initialization.
				*
				* @since 10.5
				*/
				function searchResultMasonryInit() {
					if ($('body.search-results').length > 0 &&
					$('#search-results article').length > 0 &&
					$('#search-results[data-layout="list-no-sidebar"]').length == 0 &&
				  $('#search-results[data-layout="list-with-sidebar"]').length == 0) {
						searchResultMasonry();
					}
				}




				/**
				* Custom colors for portfolio grid elements.
				*
				* @since 10.5
				*/
				function portfolioCustomColoring() {

					if( $('.portfolio-items .col').length == 0 ) {
						return;
					}

					//portfolio colors
					if ($('.portfolio-items .col .style-3-alt').length > 0 ||
					$('.portfolio-items .col .style-3').length > 0 ||
					$('.portfolio-items .col .style-2').length > 0 ||
					$('.portfolio-items .col .style-5').length > 0) {

						var portfolioColorCss = '';

						$('.portfolio-items .col').each(function () {

							var $titleColor = $(this).attr('data-title-color'),
							$subTitleColor  = $(this).attr('data-subtitle-color');

							if ($titleColor.length > 0) {
								portfolioColorCss += '.col[data-title-color="' + $titleColor + '"] .vert-center h3, .portfolio-items[data-ps="6"] .col[data-title-color="' + $titleColor + '"] .work-meta h4 { color: ' + $titleColor + '!important; } ';
								portfolioColorCss += ' .portfolio-items[data-ps="8"] .col[data-title-color="' + $titleColor + '"] .line { background-color: ' + $titleColor + '; }';
								portfolioColorCss += '.portfolio-items[data-ps="8"] .col[data-title-color="' + $titleColor + '"] .next-arrow line { stroke: ' + $titleColor + '; } ';
							}
							if ($subTitleColor.length > 0) {
								portfolioColorCss += '.col[data-subtitle-color="' + $subTitleColor + '"] .vert-center p, .portfolio-items[data-ps="6"] .col[data-title-color="' + $titleColor + '"] .work-meta p { color: ' + $subTitleColor + '!important; } ';
							}

						});

						//style
						nectarCreateStyle(portfolioColorCss, 'nectar-portfolio-colors');

					}

				}




				/**
				* Single post pagination/recent post mouse events
				*
				* @since 10.5
				*/
				function postMouseEvents() {


					$body.on('mouseover', '.post-area.featured_img_left .grav-wrap .text a, .masonry.material .masonry-blog-item .grav-wrap .text a, .blog-recent[data-style="material"] .grav-wrap .text a', function () {
						$(this).parents('.grav-wrap')
							.find('img')
							.addClass('hovered');
					});

					$body.on('mouseleave', '.post-area.featured_img_left .grav-wrap .text a, .masonry.material .masonry-blog-item .grav-wrap .text a, .blog-recent[data-style="material"] .grav-wrap .text a', function () {
						$(this).parents('.grav-wrap')
							.find('img')
							.removeClass('hovered');
					});

					$body.on('mouseleave', '.container-wrap[data-nav-pos="after_project_2"] #portfolio-nav ul li, .blog_next_prev_buttons[data-style="fullwidth_next_prev"] ul li', function () {
						$(this).addClass('mouse-leaving');
					});

				}




				/**
				* Masonry portfolio initialization.
				*
				* @since 10.5
				*/
				function masonryPortfolioInit() {

					$portfolio_containers = [];

					var portfolioElCount = 0;

					$('.portfolio-items:not(.carousel)').each(function(i) {

						$(this).attr('instance', i);
						$(this).parent().parent().find('div[class^=portfolio-filters]').attr('instance', i);

						if (typeof SalientPortfolio !== 'undefined') {
							$portfolio_containers[portfolioElCount] = new SalientPortfolio($(this), fullWidthContentColumns, $fullscreenSelector, fullWidthSections);
							portfolioElCount++;
						} else {
							var $that = $(this);
							nectarScriptLoadedCallback('#salient-portfolio-js-js', 100, function(){
								$portfolio_containers[portfolioElCount] = new SalientPortfolio($that, fullWidthContentColumns, $fullscreenSelector, fullWidthSections);
								portfolioElCount++;
							});
						}

					});

				}




				/**
				* Perspective load in styling.
				*
				* @since 8.0
				*/
				function updatePerspectiveOrigin() {

						if( nectarDOMInfo.winW > 690 ) {
							$('.posts-container[data-load-animation="perspective"]').css('perspective-origin', '50% ' + (nectarDOMInfo.scrollTop + nectarDOMInfo.winH) + 'px');
						}
						requestAnimationFrame(updatePerspectiveOrigin);

				}


				/**
				* Perspective load in styling.
				*
				* @since 8.0
				*/
				function updatePerspectiveOriginInit() {

					if ($('.posts-container[data-load-animation="perspective"]').length > 0) {
						requestAnimationFrame(updatePerspectiveOrigin);
					}

				}



				/**
				* Blog load in animation.
				*
				* @since 3.0
				*/
				function blogLoadIn(post_container) {

					if (post_container.attr('data-load-animation') == 'none') {

						post_container
							.find('.inner-wrap')
							.removeClass('animated');

					} else {

						post_container.find('article').each(function (i) {

							// Loaded visible
							if ($(this).visible(true)) {

								$(this).delay(110 * i).queue(function (next) {
									$(this).addClass("animated-in");
									next();
								});


							} else {

								// Not already visible
								var $that    = $(this);
								var waypoint = new Waypoint({

									element: $that[0],
									handler: function () {

										setTimeout(function () {
											$that.addClass("animated-in");
										}, 80 * $that.attr('data-delay-amount'));

										waypoint.destroy();
									},
									offset: '90%'

								});
							}

						});

					}

				}


				/**
				* Masonry blog initialization.
				*
				* @since 10.5
				*/
				function masonryBlogInit() {

					$nectarMasonryBlogs = [];

					$('.posts-container').each(function (i) {

						if ($(this).parent().hasClass('masonry') && !$(this).parent().hasClass('auto_meta_overlaid_spaced')) {

							if (typeof NectarMasonryBlog == 'undefined') {

								var $that = $(this);
								nectarScriptLoadedCallback('#nectar-masonry-blog-js', 0, function(){
									$nectarMasonryBlogs[i] = new NectarMasonryBlog($that, fullWidthSections, blogLoadIn);
								});

								return;
							}

							$nectarMasonryBlogs[i] = new NectarMasonryBlog($(this), fullWidthSections, blogLoadIn);

						} else {

							blogLoadIn($(this));

						}

					});
				}


				/**
				* Sticky element offset calc.
				*
				* @since 14.0
				*/
				function stickyElPositionOffset() {

						var $ssExtraTopSpace = 50;

						if ($('#header-outer[data-remove-fixed="0"]').length > 0 &&
						$('#header-outer[data-format="left-header"]').length == 0) {

							$ssExtraTopSpace += $headerOuterEl.outerHeight();

							// Contained
							if ($('body[data-contained-header="true"]').length > 0) {
								$ssExtraTopSpace += parseInt($headerOuterEl.css('margin-top'));
							}

							// Resize effect
							if ($('#header-outer[data-shrink-num][data-header-resize="1"]').length > 0) {
								var headerPadding2 = parseInt($headerOuterEl.attr('data-padding')) - parseInt($headerOuterEl.attr('data-padding')) / 1.8;
								$ssExtraTopSpace -= logoShrinkNum;
								$ssExtraTopSpace -= headerPadding2 * 2;
							}

							// Condense
							if ($('body.mobile').length == 0 && $('#header-outer[data-condense="true"]').length > 0) {

								var $headerSpan9 = $('#header-outer[data-format="centered-menu-bottom-bar"] header#top .span_9');
								$ssExtraTopSpace = 50;
								$ssExtraTopSpace += $headerOuterEl.height() - (parseInt($headerSpan9.position().top) - parseInt($('#header-outer #logo').css('margin-top'))) - parseInt(nectarDOMInfo.secondaryHeaderHeight);
							}

						}

						if ($wpAdminBar.length > 0) {
							$ssExtraTopSpace += $wpAdminBar.outerHeight();
						}

						return $ssExtraTopSpace;

				}

				/**
				* Sticky Sidebar initialization.
				*
				* @since 10.5
				*/
				function stickySidebarInit() {

					// CSS powered.
					var stickyOffset = stickyElPositionOffset();

					if( !(nectarDOMInfo.winW < 690 && nectarDOMInfo.usingMobileBrowser) ) {
						const mainContent = document.querySelector('.container.main-content');
						if ( mainContent ) {
							mainContent.style.setProperty('--nectar-sticky-top-distance', stickyOffset + "px");
						}

					}

					$('.nectar-sticky-column-css').each(function() {

						// Handle markup / vert center
						if( !$(this).hasClass('n-sticky-initialized') ) {

							// legacy users who have not updated salient core need this created by js.
							if($(this).find('.n-sticky').length == 0 ) {
								$(this).wrapInner('<div class="n-sticky" />');
							}

							$(this).addClass('n-sticky-initialized');

							if( $(this).hasClass('nectar-sticky-column-css--middle') ) {
								new NectarStickyEl($(this));
							}

						}

					});

					// Javascript powered.
					if (!$().theiaStickySidebar || nectarDOMInfo.usingMobileBrowser && nectarDOMInfo.winW < 1000 ) {
						return;
					}

					if( $nectarFullPage.$usingFullScreenRows != false && nectarDOMInfo.winW > 1000 ) {
						return;
					}

					var stickySelectors = '#sidebar[data-nectar-ss="true"], #sidebar[data-nectar-ss="1"], .nectar-scrolling-tabs:not(.navigation_func_active_link_only) .scrolling-tab-nav, .nectar-sticky-column';
					if( window.nectarOptions && window.nectarOptions.woo_sticky_sidebar && window.nectarOptions.woo_sticky_sidebar === '1' ) {
						stickySelectors += ', .woocommerce.archive #sidebar';
					}

					$(stickySelectors).each(function () {

						if ($(this).parents('#slide-out-widget-area').length > 0) {
							return true;
						}

						// Padding from top of screen
						var $ssExtraTopSpace = stickyOffset;

						if ($(this).parents('.wpb_widgetised_column').length > 0) {

							if ($('body.vc_editor').length > 0) {
								// Skip processing.
							} else {
								$(this).parents('.wpb_column').theiaStickySidebar({
									additionalMarginTop: $ssExtraTopSpace,
									updateSidebarHeight: false
								});
							}

						} else {
							$(this).theiaStickySidebar({
								additionalMarginTop: $ssExtraTopSpace,
								updateSidebarHeight: false
							});
						}

					});


				}





				/**
				* Section down arrow animated link
				*
				* @since 10.5
				*/
				function sectionDownArrowEvent() {

					var headerPadding2 = headerPadding - headerPadding / 1.8;

					$body.on('click', '.section-down-arrow, .scroll-down-wrap > .minimal-arrow', function () {

						if ($(this).parents('.nectar-box-roll').length > 0) {
							return false;
						}

						var $currentSection = $(this).parents('#page-header-bg'),
						$topDistance        = $currentSection.height(),
						$offset             = ($currentSection.parents('.first-section').length == 0 || $('body[data-transparent-header="false"]').length > 0) ? $currentSection.offset().top : 0,
						$bodyBorderSize     = ($bodyBorderTop.length > 0 && $window.width() > 1000) ? $bodyBorderTop.height() : 0,
						$headerNavSpace     = ($('body[data-header-format="left-header"]').length > 0) ? 0 : $('#header-space').height(),
						$materialSecondary  = 0;

						if ($('body.material').length > 0 && $headerSecondaryEl.length > 0) {
							$materialSecondary = $headerSecondaryEl.height();
						}

						if ($('body[data-permanent-transparent="1"]').length == 0) {

							// Regular
							if (!$body.hasClass('mobile')) {

								if ($('body[data-hhun="1"]').length > 0 && $('#header-outer[data-remove-fixed="1"]').length == 0) {

									nectar_scrollToY(parseInt($topDistance) + $offset + 2 - $bodyBorderSize * 2, 700, 'easeInOutQuint');

								} else {

									var $resize = ($('#header-outer[data-header-resize="0"]').length > 0) ? 0 : parseInt(logoShrinkNum) + headerPadding2 * 2;
									if ($('#header-outer[data-remove-fixed="1"]').length > 0) {
										$headerNavSpace = 0;
										$offset = 0;
									}

									// Condense
									if ($('body.mobile').length == 0 && $('#header-outer[data-condense="true"]').length > 0) {
										var $headerSpan9 = $('#header-outer[data-format="centered-menu-bottom-bar"] header#top .span_9');
										$headerNavSpace = $headerOuterEl.height() - (parseInt($headerSpan9.position().top) - parseInt($('#header-outer #logo').css('margin-top'))) - parseInt(nectarDOMInfo.secondaryHeaderHeight);
									}

									nectar_scrollToY(parseInt($topDistance - $headerNavSpace) + $resize + 3 + $offset + $materialSecondary, 700, 'easeInOutQuint');

								}

							} else {

								var $scrollPos;

								if($('#header-outer[data-mobile-fixed="1"]').length > 0) {
									$scrollPos = parseInt($topDistance) - $headerNavSpace + parseInt($currentSection.offset().top) + 2;
								} else {
									$scrollPos = parseInt($topDistance) + parseInt($currentSection.offset().top) + 2;
								}

								nectar_scrollToY($scrollPos - $bodyBorderSize * 2, 700, 'easeInOutQuint');

							}

						} else {
							// Permanent transparent
							nectar_scrollToY(parseInt($topDistance) + parseInt($currentSection.offset().top) + 2 - $bodyBorderSize * 2, 700, 'easeInOutQuint');

						}
						return false;
					});

				}





				/**
				* Displace filter column/row BG effect - fullpage
				*
				* @since 10.5
				*/
				function nectarLiquidBGFP() {

					$('.nectar-liquid-bg').removeClass('animated-in');

					for (var k = 0; k < $liquidBG_EL.length; k++) {

						if ($liquidBG_EL[k].animationType == 'displace-filter-fade' && $($liquidBG_EL[k].canvasContainer).parents('.fp-section.active').length > 0) {

							//add bg to container
							if ($($liquidBG_EL[k].canvasContainer).find('.image-added-to-stage').length == 0) {
								$liquidBG_EL[k].imgContainer.addChild($liquidBG_EL[k].bg);
							}

							$($liquidBG_EL[k].canvasContainer)
								.find('.nectar-liquid-bg')
								.addClass('image-added-to-stage');

							$liquidBG_EL[k].animateProps($liquidBG_EL[k]);

						}
					}
				}


				/**
				* Page Full Screen Rows
				*
				* @since 10.5
				*/
				function nectarFullPageInit() {

					if ($('#nectar_fullscreen_rows').length > 0 && $().fullpage) {

						$fullscreenSelector = (window.vc_iframe) ? '.vc_element.vc_vc_row.active ' : '.wpb_row.active ';

						var $disableFPonMobile = ($('#nectar_fullscreen_rows[data-mobile-disable]').length > 0) ? $('#nectar_fullscreen_rows').attr('data-mobile-disable') : 'off';
						if( !nectarDOMInfo.usingMobileBrowser ) {
							$disableFPonMobile = 'off';
						}
						// Support for mobile animation theme option.
						if( $disableFPonMobile != 'on' ) {
							$fullscreenMarkupBool = true;
						} else {
							$fullscreenSelector = '';
						}

						if( typeof NectarFullScreenRows !== 'undefined' ) {
							$nectarFullPage = new NectarFullScreenRows(waypoints, $mouseParallaxScenes, nectarLiquidBGFP, nectarDOMInfo, responsiveTooltips, $standAnimatedColTimeout, $svgIcons, animeAnimations);
						}

					}

					else {
						nectarScriptLoadedCallback('#nectar-fullpage-js', 100, nectarFullPageInit);
					}

				}




				/**
				* Cross browser adjustments.
				*
				* @since 1.0
				*/
				function crossBrowserAdjust() {

					// backdrop filter needs alternative flexbox arrangement to allow for animations to work
					$('.wpb_column').each(function () {
						if( $(this).hasClass('backdrop_filter_blur') ) {
							var $parentRow = $(this).closest('.wpb_row');
							$parentRow.addClass('row-col-gap');
							var customColumnGap = ($(this).closest('.wpb_row[data-column-margin]').length > 0 ) ? $(this).closest('.wpb_row[data-column-margin]').attr('data-column-margin') : 'default';
							if( customColumnGap != 'default' ) {
								$parentRow.find('.span_12').first().css({
									'column-gap' : customColumnGap
								});
							}
						}
					});

					// Add specific class if on device for better tablet tracking.
					if (nectarDOMInfo.usingMobileBrowser) {
						$body.addClass('using-mobile-browser');
					}

					if (nectarDOMInfo.usingTouchDevice) {
						$body.addClass('using-touch-device');
					}
					// Add class for old IE.
					var ua = window.navigator.userAgent;
					var msie = ua.indexOf("Edge/");
					if (msie > 0) {
						$body.addClass('msie');
					}

					// For users updating to 8 with a custom, old header template file
					if ($('html.js').length == 0) {
						$('html').removeClass('no-js').addClass('js');
					}

					//remove br's from code tag
					$('code').find('br').remove();

					// Contact form 7.
					$('.wpcf7-form p:has(input[type=submit])').css('padding-bottom', '0px');

					$('.full-width-content .wpcf7-submit').on('click', function () {
						setTimeout(function () {
							fullWidthContentColumns();
						}, 1000);
						setTimeout(function () {
							fullWidthContentColumns();
						}, 2000);
					});

					// Gravity form inside fw content row
					$('.gform_body').on('click', function () {
						setTimeout(function () {
							fullWidthContentColumns();
						}, 200);
					});

					// Popup Maker.
					$('.pum.pum-theme-salient-page-builder-optimized button.pum-close').wrapInner('<span />');
					$(window).on('pumBeforeOpen', function(){
						window.dispatchEvent(new Event('resize'));
					});

					// pum inside fspr
					if ($('#nectar_fullscreen_rows').length > 0 &&
					$('.pum-container .pum-content > .wpb_row .full-page-inner > .container > .span_12').length > 0) {
						$('.pum-container .pum-content > .wpb_row .full-page-inner > .container > .span_12').unwrap();
					}

					// Blog bottom padding
					if ($('.single .blog_next_prev_buttons').length > 0) {
						$('.container-wrap').css('padding-bottom', 0);
					}

					// Remove margin on last cols inside of full width sections
					$('.full-width-section').each(function () {
						$(this).find('> .span_12 > div.col_last').last().css('margin-bottom', '0');
					});

					// Remove boxed style from full width content
					$('.full-width-content .col.boxed').removeClass('boxed');

					// Neg marg z-index adjust
					$('.wpb_column.neg-marg').parents('.wpb_row:not(.inner_row):not(.zindex-set)').css('z-index', '110');

					// Using full width section shortcode with WPBakery columns.
					$('.wpb_row.legacy').each(function(){
						if( $(this).find('.wpb_column').length > 0 ) {
							$(this).removeClass('legacy');
						}
					});

				}




				//vc col mobile fixes
				function vcMobileColumns() {

						$('.wpb_row').each(function () {
							if (typeof $(this).find('.span_12').offset() != 'undefined') {

								$(this).find('[class*="vc_col-"]').each(function () {

									var $firstChildOffset = $(this).parents('.span_12').offset().left;

									$(this).removeClass('no-left-margin');

									if ($(this).offset().left < $firstChildOffset + 27) {
										$(this).addClass('no-left-margin');
									} else {
										$(this).removeClass('no-left-margin');
									}
								});
							}
						});
				}

				function vcMobileColumnsInit() {

					var $winDOMWidth   = nectarDOMInfo.winW,
					$winDOMHeight      = nectarDOMInfo.winH,
					$orientChangeTrack = 0;

					// Only needed in legacy column setups.
					if( $body.is('[data-flex-cols="true"]') ) {
						return;
					}

					if ($('[class*="vc_col-xs-"], [class*="vc_col-md-"], [class*="vc_col-lg-"]').length > 0) {

						// Trigger immediately.
						vcMobileColumns();

						// Resize.
						if( !nectarDOMInfo.usingMobileBrowser ) {
							// Bind normally for desktop.
							$window.on('resize',vcMobileColumns);
						}
						else {

							// For mobile make sure the orientation has changed.
							window.addEventListener("orientationchange", function () {
								$orientChangeTrack = 1;
							});

							$window.on('resize', function () {

								if (($window.width() != $winDOMWidth && $window.height != $winDOMHeight) || $orientChangeTrack === 1) {

									vcMobileColumns();

									// Store the current window dimensions.
									$winDOMWidth  = nectarDOMInfo.winW;
									$winDOMHeight = nectarDOMInfo.winH;

									// Reset orientation change tracker.
									$orientChangeTrack = 0;
								}

							});


						} // end mobile only.

					} // endif vc offset cols found.


				}




				/**
				* Select2 plugin initialization.
				*
				* @since 5.0
				*/
				function select2Init() {

					$('select:not(.state_select):not(.country_select):not(.comment-form-rating #rating):not(#tribe-bar-form select):not(.woocommerce-currency-switcher):not(.wc-blocks-components-select__container select):not(.nectar-custom-product-attr select):not(.flatpickr-calendar select)').each(function () {

						// Prevent search from triggering on small devices.
						var $minimumToSearch = ( nectarDOMInfo.winW > 690 ) ? 7 : 200;

						// Skip search class
						if( $(this).hasClass('skip-select2-search') || $(this).parents('.skip-select2-search').length > 0 ) {
							$minimumToSearch = 1000;
						}

						if ($(this).parents('#buddypress').length == 0) {

							var woo_product_dropdown_style = (window.nectarOptions && window.nectarOptions.woo_product_variable_select ) ? window.nectarOptions.woo_product_variable_select : 'default';

							// Default.
							var select2OptionsObj = {
								minimumResultsForSearch: $minimumToSearch,
								width: '100%'
							};

							// Inline scenario els
							if( woo_product_dropdown_style == 'underline' ||
							   $(this).parents('.woocommerce-ordering').length > 0 ) {

									 select2OptionsObj = {
										 minimumResultsForSearch: $minimumToSearch,
 										 dropdownParent: $(this).parent(),
 										 dropdownAutoWidth: true
	 								};

							}

							if (typeof $().select2 != 'undefined') {
								$(this).select2(select2OptionsObj);
							}


						}

					});
				}


				/**
				* Fancy select styling theme option.
				*
				* @since 10.5
				*/
				function fancySelectStyling() {

					if ( $('body[data-fancy-form-rcs="1"]').length > 0 &&
               $('#wcfm-main-content').length == 0 ) {

						$('select:not(.comment-form-rating #rating)').each(function () {

							var $selector;

							//cf7
							if ($(this).parents('.wpcf7-form-control-wrap').length > 0) {

								//select 2 already initialized
								if ($(this).parents('.wpcf7-form-control-wrap').find('.select2-container').length > 0) {
									$selector = $($(this).prev('.select2-container'));
								} else {
									$selector = $(this);
								}

								//if label is found
								if ($selector.parents('.wpcf7-form-control-wrap').parent().find('label').length == 1) {
									$selector.parents('.wpcf7-form-control-wrap').parent().wrapInner('<div class="fancy-select-wrap" />');
								} else {
									//default wrap
									$selector.wrap('<div class="fancy-select-wrap" />');
								}
							}
							//default
							else {

								//select 2 already initialized
								if ($(this).prev('.select2-container').length > 0) {
									$selector = $(this).prev('.select2-container');
								} else {
									$selector = $(this);
								}

								if ($(this).parents('#buddypress').length == 0 &&
										$(this).parents('.widget_categories').length == 0 &&
										$(this).parents('.wc-blocks-components-select__container').length == 0) {
									//if label is found

									if ($selector.prev('label').length == 1) {
										$selector.prev('label').addBack().wrapAll('<div class="fancy-select-wrap" />');
									} else if ($selector.next('label').length == 1) {
										$selector.next('label').addBack().wrapAll('<div class="fancy-select-wrap" />');
									} else {
										//default wrap
										$selector.wrap('<div class="fancy-select-wrap" />');
									}
								}

							}
						});

						select2Init();

					}

				}





				/**
				* Back/Forward Safari cache assist.
				*
				* @since 10.5
				*/
				function bfCacheAssist() {

					//Back/forward cache OCM close
					if (navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1 ||
					    navigator.userAgent.match(/(iPod|iPhone|iPad)/)) {

						window.onpageshow = function (event) {

							if (event.persisted) {

								// Play video BGs
								$('.nectar-video-wrap, .nectar-slider-wrap .swiper-slide .video-wrap').each(function () {

									if ($(this).find('video').length > 0) {
										$(this).find('video')[0].play();
									}

								});


								// Close mobile nav

								//// Material Skin.
								if ($('body.material-ocm-open').length > 0) {
									$('body > .slide_out_area_close').addClass('non-human-allowed').trigger('click');

									setTimeout(function () {
										$('body > .slide_out_area_close').removeClass('non-human-allowed');
									}, 100);

								} else if ($('#slide-out-widget-area.slide-out-from-right-hover.open').length > 0 && navigator.userAgent.match(/(iPod|iPhone|iPad)/)) {
									OCM_mobileSlideOutRightHoverCloseCheck();
								}
								// Others
								else if ($('#slide-out-widget-area.fullscreen.open').length > 0 ||
								$('#slide-out-widget-area.fullscreen-alt.open').length > 0 ||
								$('#slide-out-widget-area.slide-out-from-right.open').length > 0) {

									$('#slide-out-widget-area .slide_out_area_close').addClass('non-human-allowed');
									$('.slide-out-widget-area-toggle:not(.std-menu) a.open')
										.addClass('non-human-allowed')
										.trigger('click');

									setTimeout(function () {
										$('#slide-out-widget-area .slide_out_area_close').removeClass('non-human-allowed');
									}, 100);

								}

							} // Loaded from bf cache

						}; // onpage show

					}

				}






				/*-------------------------------------------------------------------------*/
				/*	WPBakery Frontend Editor
				/*-------------------------------------------------------------------------*/

				/**
				* Control adjustments
				*
				* @since 10.0
				*/
				function addRowCtrls() {

					//remove padding for rows with only fullwidth ns
					$('.wpb_row').removeClass('only-ns');

					$('.nectar-slider-wrap[data-full-width="true"], .page-submenu, .portfolio-items[data-col-num="elastic"]:not(.fullwidth-constrained), .blog-fullwidth-wrap')
						.parents('.wpb_row')
						.addClass('only-ns');

					//padding when column contains item that could get lost under column controls
					$('body.vc_editor.compose-mode .wpb_row .vc_vc_column > .wpb_column > .vc_column-inner').each(function() {

						if ($(this).find('> .vc_element-container > div').length > 0) {

							var firstColumn = $(this).find('> .vc_element-container');
							var firstColumnElement = firstColumn.find('> div:first-child');

							if (firstColumnElement.is('.vc_vc_row_inner') ) {
								firstColumnElement.addClass('first-inner-row-el');
							} else {
								firstColumn.find('> div').removeClass('first-inner-row-el');
							}

						}

					});


					// Absolute positioning.
					$('body.vc_editor.compose-mode .vc_row.inner_row').each(function(){
						if($(this).hasClass('row_position_absolute')) {
							$(this).parent().css({
								'position':'static',
								'min-height':'0'
							});
						} else {
							$(this).parent().css({
								'position':'',
								'min-height':''
							});
						}

					});

					$('.img-with-aniamtion-wrap, .nectar_icon_wrap, .nectar-lottie-wrap, .nectar-cta').each(function(){
						if($(this).hasClass('position_desktop_absolute') ||
						   $(this).hasClass('position_tablet_absolute') ||
						   $(this).hasClass('position_phone_absolute')) {
							$(this).parent().addClass('absolute-parent');
						}
					});

				} //addRowCtrl end


				/**
				* Convert front end padding
				*
				* Needed when the flexbox grid is not active due to
				* different markup in front end page builder view.
				*
				* @since 10.0
				*/
				function convertFrontEndPadding() {

					$('.vc_element > .wpb_column[class*="padding-"][class*="-percent"]').each(function() {

						var $elPaddingPercent = 4;

						var elclassName = this.className.match(/padding-\d+/);
						if (elclassName) {
							$elPaddingPercent = elclassName[0].match(/\d+/);
							if ($elPaddingPercent) {
								$elPaddingPercent = $elPaddingPercent[0] / 100;
							} else {
								$elPaddingPercent = 0;
							}
						}

						if ($elPaddingPercent) {
							var $parentRowWidth = $(this).parents('.span_12').width();

							if ($(this).is('[data-padding-pos="all"]')) {
								$(this).css('padding', $parentRowWidth * $elPaddingPercent);
							} else if ($(this).is('[data-padding-pos="top"]')) {
								$(this).css('padding-top', $parentRowWidth * $elPaddingPercent);
							} else if ($(this).is('[data-padding-pos="bottom"]')) {
								$(this).css('padding-bottom', $parentRowWidth * $elPaddingPercent);
							} else if ($(this).is('[data-padding-pos="left"]')) {
								$(this).css('padding-left', $parentRowWidth * $elPaddingPercent);
							} else if ($(this).is('[data-padding-pos="right"]')) {
								$(this).css('padding-right', $parentRowWidth * $elPaddingPercent);
							} else if ($(this).is('[data-padding-pos="top-bottom"]')) {
								$(this).css({
									'padding-top': $parentRowWidth * $elPaddingPercent,
									'padding-bottom': $parentRowWidth * $elPaddingPercent,
								});
							} else if ($(this).is('[data-padding-pos="top-right"]')) {
								$(this).css({
									'padding-top': $parentRowWidth * $elPaddingPercent,
									'padding-right': $parentRowWidth * $elPaddingPercent,
								});
							} else if ($(this).is('[data-padding-pos="bottom-right"]')) {
								$(this).css({
									'padding-right': $parentRowWidth * $elPaddingPercent,
									'padding-bottom': $parentRowWidth * $elPaddingPercent,
								});
							} else if ($(this).is('[data-padding-pos="bottom-left"]')) {
								$(this).css({
									'padding-left': $parentRowWidth * $elPaddingPercent,
									'padding-bottom': $parentRowWidth * $elPaddingPercent,
								});
							} else if ($(this).is('[data-padding-pos="left-right"]')) {
								$(this).css({
									'padding-left': $parentRowWidth * $elPaddingPercent,
									'padding-right': $parentRowWidth * $elPaddingPercent,
								});
							}
						}

					});


					$('.wpb_row[class*="vc_custom_"]').each(function() {
						$(this).parent().addClass('no-bottom-margin');
					});

				}


				/**
				* WPBakery Front end editor integration
				*
				* @since 10.0
				*/
				function wpBakeryFrontendInit() {

					// Set up controls/column padding.
					setTimeout(function() {

						if ($('body.compose-mode').length > 0) {
							$('.container-wrap').addClass('visible-editor-controls');
						}

						if (nectarDOMInfo.usingFrontEndEditor) {

							addRowCtrls();

							if( !$body.is('[data-flex-cols="true"]') ) {
								convertFrontEndPadding();
								$window.on('smartresize',convertFrontEndPadding);
							}

						}

					}, 200);

					// Bind reload event
					$window.on('vc_reload', function() {

						addRowCtrls();
						columnBGColors();
						buttonInit();
						twentytwentyInit();
						parallaxRowsBGCals();
						flexsliderInit();
						accordionInit();
						ulCheckmarks();
						nectarFancyUlIcons();
						nectarFancyBoxHover();
						oneFourthClasses();
						carouselfGrabbingClass();
						nectarPostGridInit();
						splitLineHeadingInit();
						nectarVideoLightbox();
						nectarKeyframeAssist();
						nectarLazyImageLoading();

						if ($('.carousel').length > 0) {
							standardCarouselInit();
							clientsCarouselInit();
							carouselHeightCalcs();
						}

						if ($('.owl-carousel').length > 0) {
							$('.owl-carousel').each(function() {
								$(this).trigger('destroy.owl.carousel').removeClass('owl-loaded');
								$(this).find('.owl-stage-outer .owl-stage > *').unwrap();
								$(this).find('.owl-stage-outer > *').unwrap();
								$(this).find('.owl-item > *').unwrap();
								$(this).find('.owl-dots').remove();
								$(this).find('.owl-nav').remove();
							});
							owlCarouselInit();
						}

						if ($('.nectar_cascading_images').length > 0) {
							imagesLoaded($('.nectar_cascading_images'), function() {
								cascadingImageBGSizing();
							});
						}

						fullWidthSections();
						fwsClasses();
						recentPostsInit();


						// reset split line heading timeline animations.
						if ( $('.wpb_row.nectar-split-heading-merged').length > 0 ) {
							$('.wpb_row.nectar-split-heading-merged').removeClass('nectar-split-heading-merged');
						}

						/*flickity carousels*/
						if ($flickitySliders.length > 0) {
							for (var i = 0; i < $flickitySliders.length; i++) {

								$flickitySliders[i].instance.reloadCells();
								$flickitySliders[i].instance.off('scroll.flickity');
								$flickitySliders[i].instance.off('dragStart.flickity');
								$flickitySliders[i].instance.off('dragEnd.flickity');

							}
						}

						flickityLazyInit();

						setTimeout(function() {

							flickityInit();
							if ($flickitySliders.length > 0) {
								for (var i = 0; i < $flickitySliders.length; i++) {
									$flickitySliders[i].instance.reloadCells();
									$flickitySliders[i].instance.resize();
								}
							}

						}, 100);

						/*flickity product carousels*/
						if ($wooFlickityCarousels.length > 0) {
							for (var i = 0; i < $wooFlickityCarousels.length; i++) {

								$wooFlickityCarousels[i].instance.flickity('reloadCells');
								$wooFlickityCarousels[i].instance.off('scroll.flickity');
								$wooFlickityCarousels[i].instance.off('dragStart.flickity');
								$wooFlickityCarousels[i].instance.off('dragEnd.flickity');

							}
						}

						setTimeout(function() {

							if ($('.nectar-woo-flickity').length > 0) {
								productCarouselInit();
							}
							if ($wooFlickityCarousels.length > 0) {
								for (var i = 0; i < $wooFlickityCarousels.length; i++) {
									$wooFlickityCarousels[i].instance.flickity('reloadCells');
									$wooFlickityCarousels[i].instance.flickity('resize');
								}
							}

						}, 100);

						nectarTestimonialSliders();

						for (var i = 0; i < $testimonialSliders.length; i++) {

							if ($testimonialSliders[i].type == 'multiple_visible' ||
							$testimonialSliders[i].type == 'multiple_visible_minimal') {

								$testimonialSliders[i].flickityEl.flickity('reloadCells');
								$testimonialSliders[i].flickityEl.off('select.flickity');
								nectarTestimonialSliders();
								$testimonialSliders[i].flickityEl.resize();
							}

							$testimonialSliders[i].testimonialSliderHeight();
						}
						nectarTestimonialSlidersEvents();

						pricingTableHeight();
						nectarIconMatchColoring();
						lightBoxInit();
						imageWithHotspotEvents();
						largeIconHover();
						midnightInit();
						responsiveVideoIframesInit();
						responsiveVideoIframes();
						fullWidthContentColumns();
						setTimeout(fullWidthContentColumns, 1000);
						videoBGInit();
						nectarFullHeightRowInit();
						$window.off('scroll.parallaxSections').off('resize.parallaxSections');
						parallaxScrollInit();
						nectarAnimateInit();
						masonryBlogInit();
						masonryPortfolioInit();

						if ($portfolio_containers.length > 0) {
							for (var i = 0; i < $portfolio_containers.length; i++) {
								$portfolio_containers[i].portfolioAccentColor();
							}
						}

						parallaxItemHoverEffect();
						fsProjectSliderInit();

						setTimeout(function() {
							if ($('.nectar_fullscreen_zoom_recent_projects').length > 0) {

								if ($fsProjectSliderArr.length > 0) {
									for (var i = 0; i < $fsProjectSliderArr.length; i++) {
										$fsProjectSliderArr[i].sliderCalcs();
									}
								}

							}
						}, 300);

						$window.unbind('.infscr');
						infiniteScrollInit();
						mouseParallaxInit();

						//play video BGs
						$('.nectar-video-wrap').each(function() {
							if ($(this).find('video').length > 0) {
								$(this).find('video').css('visibility', 'visible');
							}
						});

						//tablet inherits small desktop
						$('.wpb_column[data-t-w-inherits]').each(function() {
							if ($(this).is('[data-t-w-inherits="small_desktop"]')) {
								$(this).parent().addClass('inherits-s-desktop-col');
							} else {
								$(this).parent().removeClass('inherits-s-desktop-col');
							}
						});

						//full screen page rows
						if ($('#nectar_fullscreen_rows').length > 0) {

							if ($('#nectar_fullscreen_rows > .vc_element').length == 0) {
								$('#nectar_fullscreen_rows').prepend('<div class="vc_element empty_placeholder" />');
							}


							if ($('#nectar_fullscreen_rows > .vc_element:not(.empty_placeholder)').length > 0) {
								$('#nectar_fullscreen_rows >.vc_element.empty_placeholder').remove();
							}


							var prevActiveIndex = $('#nectar_fullscreen_rows > div.vc_element.active').index();

							$.fn.fullpage.destroy('all');
							nectarFullPageInit();

							//keep tooltip active status
							var nectarFPOffsets = [{
								el: '',
								offset: 0
							}];


							////create list of offsets
							$('#nectar_fullscreen_rows > div.vc_element').each(function(i) {
								nectarFPOffsets[i] = {
									el: $(this),
									offset: $(this).offset().top
								};
							});



							////start active on that index
							if( prevActiveIndex > -1) {
								$.fn.fullpage.silentMoveTo((prevActiveIndex + 1),0);
							}




							//move back to first section when all have been deleted but one
							if ($('#nectar_fullscreen_rows > div.vc_element').length === 1) {
								$('#nectar_fullscreen_rows').css({
									'transform': 'translate3d(0,0,0)'
								});
							}

							$body.scrollTo(0, 0);


						} else {

							//remove container wrap padding/margin when needded
							if ($('body .main-content > .row > .vc_element:first > .wpb_row[class*="full-width-"]').length > 0 ||
									$('body .main-content > .row > .vc_element:first .nectar-slider-wrap[data-full-width="true"]').length > 0) {

										$('.container-wrap').css({
											'padding-top': '0',
											'margin-top': '0'
										});
							} else {
								$('.container-wrap').css({
									'padding-top': '40px'
								});
							}

						}

						//reset svg icon arr
						$svgIcons = [];
						$('.svg-icon-holder')
							.removeClass('animated-in')
							.removeClass('bound');


						//gmap
						if ($('.vc_nectar_gmap').length > 0) {

							setTimeout(function() {

								if (typeof google === 'object' && typeof google.maps === 'object') {
									window.mapAPI_Loaded();
								} else {

									if (window.nectarLove.mapApiKey.length > 0) {
										$.getScript('https://maps.google.com/maps/api/js?sensor=false&key=' + window.nectarLove.mapApiKey + '&callback=mapAPI_Loaded');
									}
								}

							}, 100);
						}


						stickySidebarInit();


						if (typeof window.Waypoint != 'undefined') {
							Waypoint.destroyAll();
							waypoints();
						}

					});

				}








				/**
				* Page transitions and waypoint triggering
				*
				* @since 10.5
				*/
				function pageTransitionInit() {

					var mobileDisabledCondition = false;

					if( $('body[data-ajax-transitions="true"]').length > 0 &&
					    $('#ajax-loading-screen[data-disable-mobile="1"]').length > 0 &&
				       nectarDOMInfo.winW < 1000 ) {

						mobileDisabledCondition = true;

					}

					if ($('body[data-ajax-transitions="true"]').length > 0 &&
					$('#ajax-loading-screen[data-method="standard"]').length > 0 &&
					mobileDisabledCondition == false) {

						$('html').addClass('page-trans-loaded');

						// Fade loading animation
						if ($('#ajax-loading-screen[data-effect="standard"]').length > 0) {

							if ($('.nectar-particles').length == 0) {

								$loadingScreenEl.transition({
									'opacity': 0
								}, 500, function () {
									$(this).css({
										'display': 'none'
									});
								});
								$('#ajax-loading-screen .loading-icon').transition({
									'opacity': 0
								}, 500);

							}

							// Bind waypoints after loading screen has left
							if ($('.nectar-box-roll').length == 0) {
								setTimeout(function () {
									waypoints();
								}, 550);
							}

						}

						// Swipe loading animation
						else {

							if ($('#ajax-loading-screen[data-effect*="horizontal_swipe"]').length > 0) {
								setTimeout(function () {
									$loadingScreenEl.addClass('loaded');
								}, 60);
							}

							if ($('#page-header-wrap #page-header-bg[data-animate-in-effect="zoom-out"] .nectar-video-wrap').length == 0) {
								setTimeout(function () {
									$('#ajax-loading-screen:not(.loaded)').addClass('loaded');
									setTimeout(function () {
										$loadingScreenEl.addClass('hidden');
									}, 1000);
								}, 150);
							}


							// Bind waypoints after loading screen has left
							if ($('.nectar-box-roll').length == 0 && $('#ajax-loading-screen[data-effect*="horizontal_swipe"]').length > 0) {
								setTimeout(function () {
									waypoints();
								}, 750);
							} else if ($('.nectar-box-roll').length == 0) setTimeout(function () {
								waypoints();
							}, 350);

						}


						// BF Cache assist
						window.onpageshow = function (event) {

							if (event.persisted) {

								$('#ajax-loading-screen').stop().transition({
									'opacity': 0
								}, 200, function () {
									$(this).css({
										'display': 'none'
									});
								});
								$('#ajax-loading-screen .loading-icon').transition({
									'opacity': 0
								}, 100);

							}

						};



						// Remove excess loading images if using page transitions.
						$('.portfolio-loading, .nectar-slider-loading .loading-icon').remove();


						if ($('#ajax-loading-screen[data-disable-fade-on-click="1"]').length == 0) {

							if ($('body.using-mobile-browser #ajax-loading-screen[data-method="standard"][data-disable-mobile="1"]').length == 0) {

								var ignore_onbeforeunload = false;
								$('a[href^="mailto"], a[href^="tel"], .woocommerce-order-downloads a[class*="downloads-file"], .wpdm-cta.download-link a[data-downloadurl], .nectar-ignore-beforeunload a').on('click', function () {
									ignore_onbeforeunload = true;
								});
								window.addEventListener('beforeunload', function () {

									if (!ignore_onbeforeunload) {
										$loadingScreenEl.addClass('set-to-fade');
										transitionPage();
									}
									ignore_onbeforeunload = false;
								});
							}

						}

					}

					// No page transitions
					else {

						// Mobile disabled.
						if( mobileDisabledCondition == true ) {
							$loadingScreenEl.css({
								'opacity': '0',
								'display': 'none'
							}).addClass('loaded').addClass('hidden');
						}

						if ($('.nectar-box-roll').length == 0 && !nectarDOMInfo.usingFrontEndEditor) {

							// Waypoints.
							waypoints();


						}

					}


					function transitionPage() {

						if ($('#ajax-loading-screen[data-effect*="horizontal_swipe"]').length > 0) {
							$loadingScreenEl.removeClass('loaded');
							$loadingScreenEl.addClass('in-from-right');

							setTimeout(function () {
								$loadingScreenEl.addClass('loaded');
							}, 30);

						}
						else {
							if ($('#ajax-loading-screen[data-effect="center_mask_reveal"]').length > 0) {
								$loadingScreenEl.css('opacity', '0').css('display', 'block').transition({
									'opacity': '1'
								}, 450);
							} else {
								$loadingScreenEl.show().transition({
									'opacity': '1'
								}, 450);
							}
						}

					}

				}


			function salientNonCritical(e) {

				// Track scroll position
				if(nectarDOMInfo.usingMobileBrowser) {
					nectarDOMInfo.scrollPosRAF();
				}

				nectarLazyImageSizing();

				// Header navigation.
				initSF();
				navigationSearchInit();
				headerNavScrollInit();

				// Page builder elements.
				stickySidebarInit();
				nectarTestimonialSlidersEvents();

				// Column related.
				columnBGColors();

				// Off canvas menu
				mobileNavMegamenuCorrect();
				OCM_init();
				materialSkinOCM_Init();
				OCM_dropdownMarkup();
				clickToggleSubmenus();

				// Row related.
				fwCarouselLinkFix();
				nectarAnimateInit();

				// Media.
				lightBoxInit();


				// Scrolling
				infiniteScrollInit();
				scrollToTopInit();
				sectionDownArrowEvent();
				animatedAnchorLinks();

			}


			// Called in the domready event.
			function nectarOnWindowLoad() {

				// Set header space.
				if ( $(window).scrollTop() == 0 ) {
					headerSpace();
				}

				$('video').css('visibility', 'visible');

				// Scroll to anchor
				pageLoadHashInit();

				// Row/Column related.
				fullWidthContentColumns();

				if(!nectarDOMInfo.usingMobileBrowser) {
					parallaxRowsBGCals();
				}

			}

			// Document ready event - starting everything up.
			jQuery(document).ready(function ($) {

				nectarDOMInfo.usingFrontEndEditor = (typeof window.vc_iframe === 'undefined') ? false : true;

				// Priority calls
				nectarBoxRollInit();
				nectarFullPageInit();
				nectarLazyImageLoading();

				centeredNavBottomBarInit();
				centeredLogoHeaderInit();
				headerNavPreInit();
				headerNavOffsetInit();

				// Page builder elements.
				salientPageBuilderElInit();

				// Column related.
				vcMobileColumnsInit();

				// Row related.
				fullWidthSections();
				fwsClasses();
				fullWidthSectionsPreInit();
				firstFWSection();

				fullWidthContentColumns();
				oneFourthClasses();
				fixIeFlexbox();
				nectarFullHeightRowInit();

				parallaxScrollInit();
				parallaxRowsBGCals();

				// Media.
				audioVideoVis();
				responsiveVideoIframesInit();
				responsiveVideoIframes();
				videoBGInit();
				blogSingle();

				// Page header
				pageHeaderInit();

				// Footer.
				footerRevealInit();

				// Third party.
				wooCommerceEvents();
				fancySelectStyling();

				// Scrolling
				updatePerspectiveOriginInit();


				// Non critical
				salientNonCritical();


				// Cross browser assist.
				new NectarAccessibility();
				crossBrowserAdjust();
				bfCacheAssist();

				// Front end editing.
				wpBakeryFrontendInit();

				// Page transitions and waypoint activation.
				pageTransitionInit();

				// Main Debounced Resize Event.
				$window.off('smartresize.srInit');
				$window.on('smartresize.srInit', smartResizeInit);

				// Main Resize Event.
				$window.off('resize.srInit');
				$window.on('resize.srInit', resizeInit);

				// Orientation change.
				window.addEventListener("orientationchange", orientationChangeInit);

				// If window load has already triggered prior to the below bind.
				if( document.readyState === 'complete' ) {
					nectarOnWindowLoad();
				}

				// Window Load Event.
				$window.on('load', nectarOnWindowLoad);


			});



}(window.jQuery, window, document));
