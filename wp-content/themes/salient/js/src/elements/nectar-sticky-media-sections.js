/**
 * Salient "Sticky Media Sections" script file.
 *
 * @package Salient
 * @author ThemeNectar
 */
/* global Waypoint */
/* global anime */

(function ($) {

  "use strict";

  function NectarScrollPinnedSections(el) {
    this.$el = el;
    this.sections = [];
    this.sectionEls = [...this.$el[0].querySelectorAll('.nectar-sticky-media-section__content-section')];
    this.usingFrontEndEditor = (window.nectarDOMInfo && window.nectarDOMInfo.usingFrontEndEditor) ? true : false;
    this.gap = '20px'; 
    this.activeIndex = 0;
    this.stackingEffect = false;
    this.subtractNavHeight = this.$el[0].classList.contains('subtract-nav-height');
    this.usingNavigation = false;
    this.navigationButtons = [];
    this.effect = 'default';
    this.init();
  }

  NectarScrollPinnedSections.prototype.init = function () {
    this.effectConfig();
    this.navigation();
    this.calculateGap();
    this.createTimelines();
    this.calculateOffsets();
    this.events();
    this.raf();
    this.navHighlight();
  };


  NectarScrollPinnedSections.prototype.effectConfig = function () {
    
    for (var i = 0; i < this.$el[0].classList.length; i++) {
      var match = this.$el[0].classList[i].match(/^effect-(.*)$/);
      if (match) {
        var effectName = match[1];
        this.effect = effectName;
      }
    }

    this.effects = {
      'default': {},
      'scale' : {
        scale: [1.0, 0.92]
      },
      'scale_blur' : {
        scale: [1.0, 0.92],
        filter: ['blur(0px)', 'blur(4px)']
      },
    }

    this.stackingEffect = this.$el[0].classList.contains('stacking-effect');

  };

  NectarScrollPinnedSections.prototype.navigation = function () {
    if ( this.$el[0].querySelector('.nectar-sticky-media-section__navigation') ) {
      this.usingNavigation = true;
      this.navigationButtons = [...this.$el[0].querySelectorAll('.nectar-sticky-media-section__navigation button')];
      var that = this;
      this.$el[0].querySelectorAll('.nectar-sticky-media-section__navigation button').forEach(function(el, i){
        el.addEventListener('click', function(){
          that.scrollToSection(i);
        });
      });
    }
  };

  NectarScrollPinnedSections.prototype.scrollToSection = function (index) {
    var offset = this.sections[index].offset;
    window.scrollTo({
      top: offset,
      behavior: 'smooth'
    });
  };

  NectarScrollPinnedSections.prototype.events = function () { 
    $(window).on('resize', () => {
      this.calculateGap();
      this.calculateOffsets();
    });

    $(window).on('load', () => {
      this.calculateGap();
      this.createTimelines();
      this.calculateOffsets();
    });

    this.observe();
  };


  NectarScrollPinnedSections.prototype.createTimelines = function (section) {

    const that = this;
    this.sectionEls.forEach((section, i) => {
      
      const inner = section.querySelector('.nectar-sticky-media-section__content-section__wrap');

      this.sections[i] = ({
        element: section,
        innerElement: inner,
        elementHeight: section.offsetHeight,
        timeline: anime.timeline({ 
          autoplay: false,
          update:  function(anim) {
            // Staking effect.
            if ( that.stackingEffect ) {
              if(Math.round(anim.progress) === 100 ) {
                  inner.style.transform = 'translateY(-'+ 10 +'px)';  
                  if( that.sections[i-1] ) {
                    that.sections[i-1].innerElement.style.transform = 'translateY(-'+ 20 +'px)';
                  }
              } else {
                inner.style.transform = 'translateY(0px)';
              };
            }

          } 
        }),

      });

      this.sections[i].timeline.add({
        duration: 1000, 
        easing: 'linear',
        targets: section,
        ...this.effects[this.effect]
      });

    });
  };

  NectarScrollPinnedSections.prototype.navHighlight = function() {
    // Navigation highlight active section.
    if ( this.usingNavigation ) {
                  
        this.navigationButtons.forEach(function(el, i){
          el.classList.remove('active');
        });
        this.navigationButtons[this.activeIndex].classList.add('active');
      }
  };


  NectarScrollPinnedSections.prototype.calculateGap = function() {
    const regex = /section-height-(\d+)vh/;
    const classNames = this.$el[0].classList;

    classNames.forEach(className => {
      const match = className.match(regex);
      if (match) {
          const extractedNumber = match[1];
          const percentGap = (100 - parseInt(extractedNumber))/2;

          const headerNavHeight = getComputedStyle(document.documentElement).getPropertyValue('--header-nav-height');

          if ( headerNavHeight && this.subtractNavHeight) {
            this.gap = window.nectarDOMInfo.winH * (percentGap/100) + parseInt(headerNavHeight);
          } else {
            this.gap = window.nectarDOMInfo.winH * (percentGap/100);
          }

      }
  });
  };

  NectarScrollPinnedSections.prototype.calculateOffsets = function () {


    const scrollTop = window.nectarDOMInfo && window.nectarDOMInfo.scrollTop ? window.nectarDOMInfo.scrollTop : window.scrollY;
    const sectionElOffset = this.$el[0].getBoundingClientRect().top + scrollTop;
    this.sectionEls.forEach((element, i) => {

      const elementTop = this.gap;
      element.style.top = elementTop + 'px';

      const gap = this.gap;
      const offset = sectionElOffset - this.gap + (element.offsetHeight * i);

      this.sections[i].offset = offset;
      this.sections[i].elementHeight = element.offsetHeight;
      
    });

 
  };

  NectarScrollPinnedSections.prototype.raf = function () {
    if ( !window.nectarDOMInfo.scrollTop ) {
      window.requestAnimationFrame(this.raf.bind(this));
      return;
    }

    this.sections.forEach((section, i) => {
      
      // scrub through pinning.
      // if (section.offset < window.nectarDOMInfo.scrollTop &&
      //   section.offset + section.elementHeight > window.nectarDOMInfo.scrollTop) {
      if (section.offset < window.nectarDOMInfo.scrollTop) {
        
        // skip animating the last section.
        if ( i !== this.sections.length - 1 ) {
          const offset = window.nectarDOMInfo.scrollTop - section.offset;
          const percent = offset / section.elementHeight;
          section.timeline.seek(percent * section.timeline.duration);
        }
      }
      
      if (section.offset - (section.elementHeight/2) < window.nectarDOMInfo.scrollTop &&
          section.offset + (section.elementHeight/2) > window.nectarDOMInfo.scrollTop) {
            if( this.activeIndex !== i ) {
              this.setActiveIndex(i);
            }
      }
    });

    window.requestAnimationFrame(this.raf.bind(this));
  };

  NectarScrollPinnedSections.prototype.setActiveIndex = function (i) {
    this.activeIndex = i;
    this.navHighlight();
  };

  NectarScrollPinnedSections.prototype.observe = function () {
    
    var that = this;
     this.observer = new IntersectionObserver(function (entries) {

      entries.forEach(function (entry) {
        if (entry.isIntersecting) {

         that.calculateOffsets();
          
      
          var vid = entry.target.querySelector('.nectar-sticky-media-section__media video');

          if( vid ) {
            if( vid.currentTime == 0) {
              that.playSectionVideo(vid);
            }
          }
          that.observer.unobserve(entry.target);
        }

      });

    },{
      rootMargin: '-5% 0% -5% 0%',
      threshold: 0
    });

    // Observe each section.
    this.sectionEls.forEach( (el) => {
      that.observer.observe(el);
    });
  };


  NectarScrollPinnedSections.prototype.playSectionVideo = function(video) {
    var that = this;
    if( video.readyState >= 2 ) {
      video.pause();
      video.currentTime = 0;
      video.play();
    } else {
      setTimeout(function(){
        that.playSectionVideo(video);
      }, 70);
    }
    
  };




  function NectarStickyMedia(el) {

    this.$el = el;
    this.$mediaSections = this.$el.find('.nectar-sticky-media-section__featured-media');
    this.$contentSections = this.$el.find('.nectar-sticky-media-section__content');

    this.usingFrontEndEditor = (window.nectarDOMInfo && window.nectarDOMInfo.usingFrontEndEditor) ? true : false;
    this.direction = 'down';
    this.prevScroll = 0;
    this.activeIndex = 0;
    this.prevIndex = -1;
    this.timeout = '';

    this.events();

  }

  var proto = NectarStickyMedia.prototype;

  proto.events = function () {

    if (this.usingFrontEndEditor) {
      this.rebuildMedia();
      setTimeout(this.verticallyCenter.bind(this), 1500);
      setTimeout(this.verticallyCenter.bind(this), 3000);
    }

    this.observe();

    if (!(window.nectarDOMInfo && window.nectarDOMInfo.usingMobileBrowser && window.nectarDOMInfo.winW < 1000)) {
      this.trackDirection();
      this.verticallyCenter();
      $(window).on('resize', this.verticallyCenter.bind(this));
    }

  };

  proto.verticallyCenter = function() {

    if( !window.nectarDOMInfo ) {
      return;
    }

    var navHeight = 0;

    if( $('body').is('[data-header-format="left-header"]') ||
        $('body').is('[data-hhun="1"]') ||
        $('#header-outer').length > 0 && $('#header-outer').is('[data-permanent-transparent="1"]') ||
        $('.page-template-template-no-header-footer').length > 0 ||
        $('.page-template-template-no-header').length > 0) {

      navHeight = 0;

    } else {
       navHeight = ( $('#header-space').length > 0 ) ? $('#header-space').height() : 0;
    }

    if( window.nectarDOMInfo.adminBarHeight > 0 ) {
      navHeight += window.nectarDOMInfo.adminBarHeight;
    }

    var vertCenter = (window.nectarDOMInfo.winH - this.$mediaSections.height())/2 + navHeight/2;
    this.$el[0].style.setProperty('--nectar-sticky-media-sections-vert-y', vertCenter + "px");
  };

  proto.isSafari = function() {
    if (navigator.userAgent.indexOf('Safari') != -1 && 
      navigator.userAgent.indexOf('Chrome') == -1) {
        return true;
    } 

    return false;
  };


  proto.trackDirection = function() {

    if( window.nectarDOMInfo.scrollTop == this.prevScroll ) {
      window.requestAnimationFrame(this.trackDirection.bind(this));
      return;
    }

    if (window.nectarDOMInfo.scrollTop > this.prevScroll) {
      this.direction = 'down';
    } else {
      this.direction = 'up';
    }
    
    this.prevScroll = window.nectarDOMInfo.scrollTop;

    window.requestAnimationFrame(this.trackDirection.bind(this));
  };


  proto.observe = function() {

    var that = this;

    this.sections = Array.from(this.$contentSections.find('> div'));
    
    if ('IntersectionObserver' in window) {

      if (!(window.nectarDOMInfo.usingMobileBrowser && window.nectarDOMInfo.winW < 1000)) {
        
        this.observer = new IntersectionObserver(function (entries) {

          entries.forEach(function (entry) {

            if (entry.isIntersecting ) {

                var index = $(entry.target).index();
                that.activeIndex = index;

                var $activeSection = that.$mediaSections.find('> .nectar-sticky-media-section__media-wrap:eq(' + index + ')');
                var $activeMobileSection = that.$contentSections.find('> .nectar-sticky-media-section__content-section:eq(' + index + ')');
                var $allSections = that.$mediaSections.find('> .nectar-sticky-media-section__media-wrap');

          

                if( that.activeIndex == that.prevIndex ) {
                  return;
                }

                clearTimeout(that.timeout);
                that.timeout = setTimeout(function(){
                  $allSections.removeClass('active');
                  $activeSection.addClass('active');
                }, 100);

                
                if( !$activeSection.hasClass('pause-trigger') || 
                    that.prevIndex == 1 && that.activeIndex == 0 ||
                    that.prevIndex == $allSections.length - 2 && that.activeIndex == $allSections.length - 1) {

                  if( $activeSection.find('video').length > 0 && window.nectarDOMInfo.winW > 999 ) {
                    that.playSectionVideo($activeSection.find('video')[0]);
                  }
                  if( $activeMobileSection.find('video').length > 0 && window.nectarDOMInfo.winW < 1000 ) {
                    var vid = $activeMobileSection.find('video')[0];
                    if( vid.currentTime == 0 ) {
                      that.playSectionVideo($activeMobileSection.find('video')[0]);
                    }
                    
                  }
                }
              
                // Add flag to skip retriggering of videos on first/last items when scrolled past.
                if(index == 0 || index == that.$contentSections.find('> div').length - 1) {
                  $activeSection.addClass('pause-trigger');
                } else {
                  $allSections.removeClass('pause-trigger');
                }

                that.prevIndex = index;

            }

          });

        }, {
          root: (this.isSafari()) ? null : document,
          rootMargin: '-40% 0% -40% 0%',
          threshold: 0
        });


        // Observe each section.
        this.$contentSections.find('> div').each(function () {
          that.observer.observe($(this)[0]);
        });


      } // don't trigger on mobile.

      else {
        // Mobile.
        this.mobileObserver = new IntersectionObserver(function (entries) {

          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
           
              
              var index = $(entry.target).index();
              var $activeSection = that.$contentSections.find('> .nectar-sticky-media-section__content-section:eq(' + index + ')');

              if( $activeSection.find('video').length > 0 ) {

                var vid = $activeSection.find('video')[0];
                if( vid.currentTime == 0) {
                  that.playSectionVideo($activeSection.find('video')[0]);
                }
              }
              that.mobileObserver.unobserve(entry.target);
            }

          });

        },{
          rootMargin: '-5% 0% -5% 0%',
          threshold: 0
        });

        // Observe each section.
        this.$contentSections.find('> div').each(function () {
          that.mobileObserver.observe($(this)[0]);
        });

      }

    } // if intersection observer. 
  };


  proto.playSectionVideo = function(video) {
    var that = this;
    if( video.readyState >= 2 ) {
      video.pause();
      video.currentTime = 0;
      video.play();
    } else {
      setTimeout(function(){
        that.playSectionVideo(video);
      }, 70);
    }
    
  };



  proto.shouldUpdate = function (entry) {

    if (this.direction === 'down' && !entry.isIntersecting || 
        this.direction === 'down' && entry.isIntersecting && $(entry.target).index() == 0) {
      return true;
    }

    if (this.direction === 'up' && entry.isIntersecting) {
      return true;
    }

    return false;
  }


  proto.rebuildMedia = function () {

    var that = this;
    var mediaSections = [];

    this.$contentSections.find('.nectar-sticky-media-section__content-section').each(function (i) {
      // WPBakery duplicates media so we need to reduce it back to the current latest chosen item.
      if ($(this).find('.nectar-sticky-media-content__media-wrap').length > 1) {
        $(this).find('.nectar-sticky-media-content__media-wrap').each(function (i) {
          if (i > 0) {
            $(this).remove();
          }
        });
      }
      mediaSections[i] = $(this).find('.nectar-sticky-media-content__media-wrap').clone();
      mediaSections[i].removeClass('nectar-sticky-media-content__media-wrap').addClass('nectar-sticky-media-section__media-wrap');
    });

    that.$mediaSections.html(' ');

    mediaSections.forEach(function (el) {
      that.$mediaSections.append(el);
    });

    $(window).trigger('salient-lazyloading-image-reinit');

  };


  var mediaSections = [];
  function nectarStickyMediaInit() {

    mediaSections = [];

    $('.nectar-sticky-media-sections:not(.type--scroll-pinned-sections)').each(function (i) {
      mediaSections[i] = new NectarStickyMedia($(this));
    });

    $('.nectar-sticky-media-sections.type--scroll-pinned-sections').each(function (i) {
      mediaSections[i] = new NectarScrollPinnedSections($(this));
    });


  }

  $(document).ready(function () {

    nectarStickyMediaInit();

    $(window).on('vc_reload', function () {
      setTimeout(nectarStickyMediaInit, 200);
    });

  });


})(jQuery);