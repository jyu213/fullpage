/**
 * FullPage.js V1.0
 * 
 */

(function($){
	"use strict";
	var wrapperClass = 'fp-wrapper';
	
	var fp = function(options, container){
		this.options = $.extend({}, $.fn.fullpage.defaults, options || {});
		this.container = container;
		this.ac = this.options.activeSectionClass;
		this.els = $(this.options.sectionSelector);

		this.isMoving = false;
		this.options.css3 = this.options.css3 && this.support3d();

		this.init();
	};
	fp.prototype = {
		init: function(){

			this.setUI();
			this.bindUI();

			this.startSection = parseInt(this.startSection, 10);
			if( this.startSection >= this.els.length || this.options.startSection < 0 ){
				this.startSection = 0;
			}
		},
		setUI: function(){
			var _self = this;

			if( this.container.length ){
				this.container.css({
					'height': '100%',
					'position': 'relative',
					'-ms-touch-action': 'none'
				});
				// to recognize the container
				this.container.addClass(wrapperClass);
			}

			this.els.addClass('fp-section');

			if( this.options.pager || this.options.pagerAnchorBuilder ){
				this.buildPager(this.els);
			}

			// set hash 
			this.els.eq(this.options.startSection).addClass('active');

			this.setAutoScrolling(this.options.autoScrolling);
		},
		bindUI: function(){
			var opt = this.options;
			// trigger when element hover
			// !this.options.autoScrolling && $(window).on('scroll', $.proxy(this.scrollHandler,this) );
			opt.keyboardScrolling && $(document).keydown( $.proxy(this.keyHandler,this) );
			opt.autoScrolling ? this.addMouseWheelHandler() : this.removeMouseWheelHandler();

			opt.prev && $('body').on(opt.pagerEvent, opt.prev, $.proxy(this.moveSectionUp,this) );
			opt.next && $('body').on(opt.pagerEvent, opt.next, $.proxy(this.moveSectionDown,this) );

			opt.setTimeout && setInterval($.proxy(this.moveSectionDown, this), opt.setTimeout);
			
			// window.render

			// if(opt.hash){}
		},
		/**
		 * set auto scroll
		 * @param {Boolean} autoScrolling value
		 */
		setAutoScrolling: function(value){
			var element = $('.fp-section.'+ this.ac);
			this.options.autoScrolling = value;
			if(value){
				$('html, body').css({
					'overflow': 'hidden',
					'height': '100%'
				});
				if(element.length){
					this.silentScroll(element.position().top);
				}
			}else{
				$('html').css({
					'overflow': 'auto'
				});
				this.silentScroll(0);
				$('html, body').scrollTop(element.position().top);
			}
		},
		scrollHandler: function(e){
			// if(!this.options.autoScrolling){
				// @TODO; when window is scrolling
				console.log('is widow scrolling')
			// }
		},
		mouseWheelHandler: function(e){
			if( this.options.autoScrolling && !this.isMoving ){
				e = window.event || e;
				var delta = Math.max(-1, Math.min(1,
					(e.wheelDelta || -e.deltaY || -e.detail)));

					// scrollable,
					// activeSection = $('.fp-section.' + this.ac);

				// scroll down
				if(delta < 0){
					this.moveSectionDown();
				}else{
					this.moveSectionUp();
				}
			}
		},
		keyHandler: function(e){
			if( !this.isMoving ){
				switch( e.which ){
					//up
					case 38:
					case 33:
						this.moveSectionUp();
						break;

					//down
					case 40:
					case 34:
						this.moveSectionDown();
						break;

					//Home
					case 36:
						this.moveSection(1);
						break;

					//End
					case 35:
						this.moveSection( $('.fp-section').length );
						break;

					//left
					case 37:
						break;

					//right
					case 39:
						break;

					default:
						return; // exit this handler for other keys
				}
			}
		},

		moveSectionUp: function(){
			var prev = $('.fp-section.' + this.ac).prev('.fp-section');
			if( !prev.length && this.options.loop ){
				prev = $('.fp-section').last();
			}

			if( prev.length ){
				this.scrollPage(prev, null, true);
			}
		},
		moveSectionDown: function(){
			var next = $('.fp-section.' + this.ac).next('.fp-section');
			if( !next.length && this.options.loop ){
				next = $('.fp-section').first();
			}

			if( next.length ){
				this.scrollPage(next, null, true);
			}
		},
		moveSection: function(section){
			var el = $('.fp-section').eq( section -1 );
			console.log( section, $(this), arguments )
			if( el.length > 0 ){
				this.scrollPage(el);
			}
		},


		scrollPage: function(element, callback, isMovementUp){
			var _self = this,
				opt = this.options,
				dest = element.position(),
				nextSectionIndex = element.index('.fp-section'),
				currentSectionIndex = opt.startSection,
				currentSection = $('.fp-section').eq(currentSectionIndex),
				dtop = dest.top,
				cls = this.ac,
				scrollOptions = {},
				s;

			if( !dest ){
				return false;
			}

			if( opt.autoScrolling ){
				scrollOptions['top'] = -dtop;
			}else{
				scrollOptions['scrollTop'] = dtop;
			}

			this.isMoving = true;
			this.options.startSection = nextSectionIndex;

			element.addClass(cls).siblings().removeClass(cls);
			this.updateActicePagerLink( $(opt.pager), opt.startSection, opt.activePagerClass )

			$.isFunction(opt.before) && 
				opt.before.call( _self, currentSection, element );

			if( opt.css3 && opt.autoScrolling ){
				var translate3d = 'translate3d(0px, -'+ dtop +'px, 0px',
					t = this.options.setSpeed / 1000;

					this.container.toggleClass('fp-easing', true);
					$('.fp-easing').css({
						'-webkit-transition': 'all '+ t +'s ease-out', 
						'transition': 'transition: all '+ t +'s ease-out'
					});
					this.container.css(this.getTransforms(translate3d));

				var timeId = setTimeout(function(){
					$.isFunction(opt.after) 
						&& opt.after.call( _self, currentSection, element );

					var timeId2 = setTimeout(function(){
						_self.isMoving = false;	
						clearTimeout(timeId2);
						console.log('is delay, and cleartimeId2')
					}, opt.setDelay);

					clearTimeout(timeId);
					console.log('is speed, and cleartimeId')
				}, opt.setSpeed);
			}else{
				this.container.animate(
					scrollOptions, opt.setSpeed, opt.easing, function(){
						var timeId = setTimeout(function(){
							$.isFunction(opt.after) 
								&& opt.after.call( _self, currentSection, element );

							var timeId2 = setTimeout(function(){
								_self.isMoving = false;	
								clearTimeout(timeId2);
								console.log('is delay, and cleartimeId2')
							}, opt.setDelay);

							clearTimeout(timeId);
							console.log('is speed, and cleartimeId')
						}, opt.setSpeed);		
					}
				);
			}
		},
		removeMouseWheelHandler: function(){
			if (document.addEventListener) {
				document.removeEventListener('mousewheel', $.proxy(this.mouseWheelHandler,this) , false); //IE9, Chrome, Safari, Oper
				document.removeEventListener('wheel', $.proxy(this.mouseWheelHandler,this) , false); //Firefox
			} else {
				document.detachEvent("onmousewheel", $.proxy(this.mouseWheelHandler,this) ); //IE 6/7/8
			}
		},
		addMouseWheelHandler: function(){
			if (document.addEventListener) {
				document.addEventListener("mousewheel", $.proxy(this.mouseWheelHandler,this) , false); //IE9, Chrome, Safari, Oper
				document.addEventListener("wheel", $.proxy(this.mouseWheelHandler,this) , false); //Firefox
			} else {
				document.attachEvent("onmousewheel", $.proxy(this.mouseWheelHandler,this) ); //IE 6/7/8
			}
		},
		buildPager: function(els){
			var _self = this,
				opt = this.options,
				el = $(opt.pager), a;
			console.log(el, el.length)
			if( el.length ){
				el.show();
			}else{
				el = $('<div class="fp-pager"></div>');
				$('body').append(el);
			}
			$.each(els, function(i, e){
				if( $.isFunction(opt.pagerAnchorBuilder) ){
					a = opt.pagerAnchorBuilder(i, e);
				}else{
					a = '<a class="pager'+ (i+1) +'" href="javascript:;">'+ (i+1) +'</a>';
					$(a).appendTo(el);
				}

				!!a && $(a).addClass('fp-pager-sub');
			});

			this.updateActicePagerLink(el, opt.startSection, opt.activePagerClass);

			$('.fp-pager-sub').bind(opt.pagerEvent, function(event){
				event.preventDefault();
				var i = $(this).index();
				!_self.isMoving && _self.moveSection(i+1);
				return false;
			});
		},
		updateActicePagerLink: function(pager, currSlide, clsName){
			pager.each(function(){
				$(this).children().removeClass(clsName).eq(currSlide).addClass(clsName);
			});
		},
		silentScroll: function(top){
			if( this.options.css3 ){
				var translate3d = 'translate3d(0px, -'+ top +'px, 0px)';

				this.container.toggleClass('fp-easing', false);
				this.container.css(this.getTransforms(translate3d));

			}else{
				this.container.css('top', -top);
			}
		},
		/**
		 * check support translate3d
		 * @return {Boolean}
		 */
		support3d: function(){
			var el = document.createElement('p'),
				has3d,
				transforms = {
					'webkitTransform':'-webkit-transform',
					'OTransform':'-o-transform',
					'msTransform':'-ms-transform',
					'MozTransform':'-moz-transform',
					'transform':'transform'
				};

			// Add it to the body to get the computed style.
			document.body.insertBefore(el, null);

			for (var t in transforms) {
				if (el.style[t] !== undefined) {
					el.style[t] = "translate3d(1px,1px,1px)";
					has3d = window.getComputedStyle(el).getPropertyValue(transforms[t]);
				}
			}

			document.body.removeChild(el);

			return (has3d !== undefined && has3d.length > 0 && has3d !== "none");
		},
		getTransforms: function(translate3d){
			return {
				'-webkit-transform': translate3d,
				'-moz-transform': translate3d,
				'-ms-transform':translate3d,
				'transform': translate3d
			};
		}
	};

	
	var f;
	$.fn.fullpage = function(options){
		f = new fp(options, $(this));
	};
	$.fn.fullpage.moveSection = function(){
		return f.moveSection.apply(f, arguments);	
	}
	$.fn.fullpage.defaults = {
		activeSectionClass: 'active',
		activePagerClass: 'cur',
		after: null,  // transition callback: function(currentSection, nextSection, sectionIndex)
		autoScrolling: true, 
		before: null,  // transition callback: function(currentSection, nextSection, sectionIndex)
		css3: true,  // css3 animate , if false it will use jquery animations
		easing: 'swing',
		fixTop: 0,
		keyboardScrolling: true,
		loop: false,
		// resize: false,
		sectionSelector: '.section',
		setDelay: 600,
		setKeyboard: true,  // set scrolling by use the keyboard arrow keys
		setMouseWheel: true,  // set scrolling by use the mouse wheel or the trackpad
		setSpeed: 700,  // set scrolling speed
		setTimeout: 0, // set interval play time; if 0, turn off
		// setTouch: false,  // set scrolling by use touch gestures
		startSection: 0,
		pager: null,  // navigation dots
		pagerAnchorBuilder: null,  // callback fn for building anchor links : function(index, DOMelement)
		pagerEvent: 'click',
		prev: null,
		next: null
	};
})(jQuery);
/**
 * Log
 * 
 * wait to update 
 * touch event 
 * window.resize
 * location.hash
 * fix top value
 * test code 
 * 
 */