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

  function NectarPostGridStacked(el) {
    this.$el = el;
    this.sections = [];
    this.sectionEls = [...this.$el[0].querySelectorAll('.nectar-post-grid-item')];
    this.usingFrontEndEditor = (window.nectarDOMInfo && window.nectarDOMInfo.usingFrontEndEditor) ? true : false;
    this.gap = 20; 
    this.activeIndex = 0;
    this.stackingEffect = true;
    this.subtractNavHeight = this.$el[0].classList.contains('subtract-nav-height');
    this.usingNavigation = false;
    this.navigationButtons = [];
    this.startingIndex = 0;
    this.effect = 'none';
    this.init();
  
  }

  NectarPostGridStacked.prototype.init = function () {
    this.effectConfig();
    if (
      this.effect === 'none' ||
      this.effect === 'overlapping' ||
      ( $('body').hasClass('using-mobile-browser') && this.$el.hasClass('layout-stacked--disable-mobile') ) 
    ) {
      return;
    }
    this.navigation();
    this.calculateGap();
    this.createTimelines();
    this.calculateOffsets();
    this.events();
    this.raf();
    this.setStartingIndex();
    this.navHighlight();
  };

  NectarPostGridStacked.prototype.setStartingIndex = function () {
    const scrollTop = window.nectarDOMInfo && window.nectarDOMInfo.scrollTop ? window.nectarDOMInfo.scrollTop : window.scrollY;
    this.sections.forEach((section, i) => {
      if (section.offset - (section.elementHeight/2) < scrollTop &&
          section.offset + (section.elementHeight/2) > scrollTop) {
            this.startingIndex = i;
      }
    });
  };

  NectarPostGridStacked.prototype.effectConfig = function () {
    
    this.calculateGap();
    const extractedEffect = this.$el[0].getAttribute('data-stack-animation-effect');
    if ( extractedEffect ) {
      this.effect = extractedEffect;
    }

    this.effects = {
      'none': {},
      'overlapping' : {},
      'scale' : {
        scale: [1.0, 0.8]
      },
      'blurred_scale' : {
        scale: [1.0, 0.8],
        // opacity: [1, 0],
        filter: ['blur(0px)', 'blur(5px)']
      },
    }

    // Overlapping.
    if ( this.effect === 'overlapping' ) {
      this.sectionEls.forEach((element, i) => {
        const elementTop = this.gap + (16 * i);
        element.style.top = elementTop + 'px';
      });
    } 


  };

  NectarPostGridStacked.prototype.navigation = function () {
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

  NectarPostGridStacked.prototype.scrollToSection = function (index) {
    var offset = this.sections[index].offset;
    window.scrollTo({
      top: offset,
      behavior: 'smooth'
    });
  };

  NectarPostGridStacked.prototype.events = function () { 
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


  NectarPostGridStacked.prototype.createTimelines = function (section) {

    const that = this;
    this.sectionEls.forEach((section, i) => {
      
      const inner = section.querySelector(':scope > .inner');

      this.sections[i] = ({
        element: section,
        innerElement: inner,
        elementHeight: section.offsetHeight,
        timeline: anime.timeline({ 
          autoplay: false
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

  NectarPostGridStacked.prototype.navHighlight = function() {
    // Navigation highlight active section.
    if ( this.usingNavigation ) {
                  
        this.navigationButtons.forEach(function(el, i){
          el.classList.remove('active');
        });
        this.navigationButtons[this.activeIndex].classList.add('active');
      }
  };


  NectarPostGridStacked.prototype.calculateGap = function() {

      const extractedNumber = this.$el[0].getAttribute('data-grid-spacing');
      if ( extractedNumber ) {

        const windowWidth = (window.nectarDOMInfo && window.nectarDOMInfo.winW) ? window.nectarDOMInfo.winW : window.innerWidth;

        // check if percentage.
        if ( extractedNumber.includes('vw') ) {
          const percentGap = parseInt(extractedNumber);
          // calculate px value for vw based gap
          this.gap = windowWidth * (percentGap / 100);
        } else {
          // px based.
          if (extractedNumber === 'none') {
            this.gap = 0;
          } else {
            this.gap = parseInt(extractedNumber);
          }
        }
      
      }

  };

  NectarPostGridStacked.prototype.calculateOffsets = function () {

    const scrollTop = window.nectarDOMInfo && window.nectarDOMInfo.scrollTop ? window.nectarDOMInfo.scrollTop : window.scrollY;
    const sectionElOffset = this.$el[0].getBoundingClientRect().top + scrollTop;
    this.sectionEls.forEach((element, i) => {

      const elementTop = this.gap;
      element.style.top = elementTop + 'px';

      const gap = this.gap;
      const offset = sectionElOffset - this.gap + (element.offsetHeight * i) + (gap * i);

      this.sections[i].offset = offset;
      this.sections[i].elementHeight = element.offsetHeight;
      
    });

  };

  NectarPostGridStacked.prototype.raf = function () {
    const scrollTop = window.nectarDOMInfo && window.nectarDOMInfo.scrollTop ? window.nectarDOMInfo.scrollTop : window.scrollY;

    this.sections.forEach((section, i) => {
      
      // scrub through pinning.
      // if (section.offset < scrollTop &&
      //   section.offset + section.elementHeight > scrollTop) {
      // starting 300px early to ensure no jumping of the animation when scrolling faster.
      if (section.offset - 300 < scrollTop) {
        // skip animating the last section.
        if ( i !== this.sections.length - 1 ) {
          const offset = scrollTop - section.offset;
          const percent = offset / section.elementHeight;

          // When the scroll section has started at the first index, we can use a higher performance method
          // where only 2 sections are animated at a time.
          if ( this.startingIndex === 0 ) {
            if ( (i === this.activeIndex || i === this.activeIndex - 1) ) {
              section.timeline.seek(percent * section.timeline.duration);
            }
          } else {
            // if the user has started further down the page, we'll need to actively monitor all sections. 
            section.timeline.seek(percent * section.timeline.duration);
          }

        }
      }

      // set opacity to 0 for sections more than 1 behind current index
      if ( i < this.activeIndex - 1 ) {
        section.innerElement.style.visibility = 'hidden';
      } else {
        section.innerElement.style.visibility = 'visible';
      }
      
      const eleHeightHalf = section.elementHeight/2;
      if (section.offset - (eleHeightHalf) < scrollTop &&
          section.offset + (eleHeightHalf) > scrollTop) {
            if( this.activeIndex !== i ) {
              this.setActiveIndex(i);
            }
      }
    });

    window.requestAnimationFrame(this.raf.bind(this));
  };

  NectarPostGridStacked.prototype.setActiveIndex = function (i) {
    this.activeIndex = i;
    this.navHighlight();
  };

  NectarPostGridStacked.prototype.observe = function () {
    
    var that = this;
     this.observer = new IntersectionObserver(function (entries) {

      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          
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


  NectarPostGridStacked.prototype.playSectionVideo = function(video) {
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



  var stackedEls = [];
  function init() {
    stackedEls = [];
    $('.nectar-post-grid.layout-stacked').each(function (i) {
      stackedEls[i] = new NectarPostGridStacked($(this));
    });
  }

  $(document).ready(function () {
    init();
    $(window).on('vc_reload', function () {
      setTimeout(init, 200);
    });

  });

})(jQuery);
