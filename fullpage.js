/**
 * FullPage.js V1.0
 * 
 */

(function($){
	"use strict";
	var wrapperClass = 'fp-wrapper';
	var ua = navigator.userAgent,
		isTouchDevice = /AppleWebKit.*Mobile/i.test(ua) || (/MIDP|SymbianOS|NOKIA|SAMSUNG|LG|NEC|TCL|Alcatel|BIRD|DBTEL|Dopod|PHILIPS|HAIER|LENOVO|MOT-|Nokia|SonyEricsson|SIE-|Amoi|ZTE/.test(ua));
	
	var fp = function(options, container){
		this.options = $.extend({}, $.fn.fullpage.defaults, options || {});
		this.container = container;
		this.ac = this.options.activeSectionClass;
		this.els = $(this.options.sectionSelector);

		this.isMoving = false;
		this.options.css3 = this.options.css3 && this.support3d();

		this.touchStartY = 0;
		this.touchStartX = 0;
		this.touchEndY = 0;
		this.touchEndX = 0;

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
			if(this.options.setHash){
				var el = $('.fp-section[data-anchor="'+ location.hash.replace('#','') +'"]');
				if(el.length){
					this.startSection = el.index('.fp-section');
					this.moveSection(this.startSection + 1);
				}
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

			this.els.each(function(i){
				_self.options.setHash && 
					$(this).attr('data-anchor', 'fpSection' + (i+1) );
			});

			if( this.options.pager || this.options.pagerAnchorBuilder ){
				this.buildPager(this.els);
			}

			if(this.options.direction === 'horizontal'){
				// @REVIEW; 
				$('.fp-section').width( $(window).width() )
			}

			this.els.eq(this.options.startSection).addClass(this.options.activeSectionClass);

			this.setAutoScrolling(this.options.autoScrolling);
		},
		bindUI: function(){
			var opt = this.options;
			// trigger when element hover
			opt.setKeyboard && $(document).keydown( $.proxy(this.keyHandler,this) );
			opt.autoScrolling ? this.addMouseWheelHandler() : this.removeMouseWheelHandler();
			opt.setTouch ? this.addTouchHandler() : this.removeTouchHandler();

			opt.prev && $('body').on(opt.pagerEvent, opt.prev, $.proxy(this.moveSectionUp,this) );
			opt.next && $('body').on(opt.pagerEvent, opt.next, $.proxy(this.moveSectionDown,this) );

			opt.setTimeout && setInterval($.proxy(this.moveSectionDown, this), opt.setTimeout);
			
			// window.render

			opt.setHash && $(window).bind('hashchange', $.proxy(this.hashChangeHandle, this) );
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
		hashChangeHandle: function(){
			if( !this.isMoving ){
				console.log('hashChangeHandle')
				var value = window.location.hash.replace('#',''),
					section = $('.fp-section[data-anchor="'+value+'"]'),
					i = section.index('.fp-section');
				if( value.length && section.length ){
					this.moveSection(i + 1);
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
				dir = !(opt.direction === 'horizontal'),
				nextSectionIndex = element.index('.fp-section'),
				currentSectionIndex = opt.startSection,
				currentSection = $('.fp-section').eq(currentSectionIndex),
				anchorLink = element.data('anchor'),
				dtop = dir ? dest.top : dest.left,
				cls = this.ac,
				scrollOptions = {},
				s;

			if( !dest ){
				return false;
			}

			if( opt.autoScrolling ){
				dir ? scrollOptions['top'] = -dtop : scrollOptions['left'] = -dtop;
			}else{
				dir ? scrollOptions['scrollTop'] = dtop : scrollOptions['scrollLeft'] = dtop;
			}

			this.isMoving = true;
			this.options.startSection = nextSectionIndex;

			element.addClass(cls).siblings().removeClass(cls);
			this.updateActicePagerLink( $(opt.pager), opt.startSection, opt.activePagerClass )

			opt.setHash && (location.hash = anchorLink);
			$.isFunction(opt.before) && 
				opt.before.call( _self, currentSection, element );

			if( opt.css3 && opt.autoScrolling ){
				var translate3d = dir ? 'translate3d(0px, -'+ dtop +'px, 0px)'
										: 'translate3d(-'+ dtop +'px, 0px, 0px)',
					t = this.options.setSpeed / 1000,
					e = this.options.css3Easing;


					this.container.toggleClass('fp-easing', true);
					$('.fp-easing').css({
						'-webkit-transition': 'all '+ t +'s '+ e+'', 
						'transition': 'transition: all '+ t +'s '+ e+''
					});
					this.container.css(this.getTransforms(translate3d));

				var timeId = setTimeout(function(){
					$.isFunction(opt.after) 
						&& opt.after.call( _self, currentSection, element );

					var timeId2 = setTimeout(function(){
						_self.isMoving = false;	
						clearTimeout(timeId2);
					}, opt.setDelay);

					clearTimeout(timeId);
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
							}, opt.setDelay);

							clearTimeout(timeId);
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

		addTouchHandler: function(){
			var MSPointer = this.getMSPointer();
			$(document).off('touchstart ' +  MSPointer.down).on('touchstart ' + MSPointer.down, $.proxy(this.touchStartHandler, this) );
			$(document).off('touchmove ' + MSPointer.move).on('touchmove ' + MSPointer.move, $.proxy(this.touchMoveHandler, this) );
		},
		removeTouchHandler: function(){
			var MSPointer = this.getMSPointer();
			$(document).off('touchstart ' + MSPointer.down);
			$(document).off('touchmove ' + MSPointer.move);
		},
		getMSPointer: function(){
			var pointer;

			//IE >= 11
			if(window.PointerEvent){
				pointer = { down: "pointerdown", move: "pointermove"};
			}

			//IE < 11
			else{
				pointer = { down: "MSPointerDown", move: "MSPointerMove"};
			}

			return pointer;
		},
		getEventsPage: function(e){
			var events = new Array();
			if (window.navigator.msPointerEnabled){
				events['y'] = e.pageY;
				events['x'] = e.pageX;
			}else{
				events['y'] = e.touches[0].pageY;
				events['x'] =  e.touches[0].pageX;
			}

			return events;
		},
		touchStartHandler: function(event){
			var e = event.originalEvent;
			var touchEvents = this.getEventsPage(e);
			this.touchStartY = touchEvents['y'];
			this.touchStartX = touchEvents['x'];
		},
		touchMoveHandler: function(event){
			var e = event.originalEvent;

			if( this.options.autoScrolling ){
				// prevent the easing on IOS
				event.preventDefault();	
			}

			if( this.options.autoScrolling && !this.isMoving ){
				var touchEvents = this.getEventsPage(e);
				this.touchEndY = touchEvents['y'];
				this.touchEndX = touchEvents['x'];

				if( Math.abs( this.touchStartY - this.touchEndY ) > ($(window).height() / 100 * 5) ){
					if( this.touchStartY > this.touchEndY ){
						this.moveSectionDown();
					}else if( this.touchEndY > this.touchStartY ){
						this.moveSectionUp();
					}
				}
			}


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

		buildPager: function(els){
			var _self = this,
				opt = this.options,
				el = $(opt.pager), a;
			
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
				var translate3d = 'translate3d(0px, -'+ top +'px, 0px)',
					t = this.options.setSpeed / 1000,
					e = this.options.css3Easing;

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
	$.fn.fullpage.moveTo = function(){
		return f.moveSection.apply(f, arguments);	
	}
	$.fn.fullpage.defaults = {
		activeSectionClass: 'active',
		activePagerClass: 'cur',
		after: null,  // transition callback: function(currentSection, nextSection, sectionIndex)
		autoScrolling: true, 
		before: null,  // transition callback: function(currentSection, nextSection, sectionIndex)
		css3: true,  // css3 animate , if false it will use jquery animations
		css3Easing: 'ease-out',
		direction: 'vertical',  // vertical || horizontal
		easing: 'swing',
		fixTop: 0,
		loop: false,
		// resize: false,
		sectionSelector: '.section',
		setDelay: 600,
		setHash: false,
		setKeyboard: true,  // set scrolling by use the keyboard arrow keys
		setMouseWheel: true,  // set scrolling by use the mouse wheel or the trackpad
		setSpeed: 700,  // set scrolling speed
		setTimeout: 0, // set interval play time; if 0, turn off
		setTouch: true,  // set scrolling by use touch gestures
		startSection: 0,
		pager: null,  // navigation dots
		pagerAnchorBuilder: null,  // callback fn for building anchor links : function(index, DOMelement)
		pagerEvent: 'click',
		prev: null,
		next: null
	};
	/**
	 * Log
	 * 
	 * has sub sider
	 * window.resize
	 * fix top value
	 * test code 
	 * 
	 * touch event / wait for update; and untest for device
	 * 
	 */
})(jQuery);
