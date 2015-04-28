//Percentile
function percentileVisibleCount(obj){
	var screenWidth = $(window).width();
	for (var property in obj) {
		if (obj.hasOwnProperty(property)) {
			if(property == "full" || parseInt(property) >= screenWidth){
				return obj[property];
			}
		}
	}
}

function percentileSlideWidth(slideCount, displayCount){
	if (slideCount < displayCount){
		return 100/slideCount;
	} else {
		return 100/displayCount;
	}
}

function percentileGetWidthPercent(e){
	return ( 100 * parseFloat(e.css('width')) / parseFloat(e.parent().css('width')) ) + '%';
}

function percentileGetWidthPercentInt(e){
	//e.style.width causes undefined error... Not sure why!
	return parseInt(( 100 * parseFloat(e.css('width')) / parseFloat(e.parent().css('width'))));
}


function percentileHeightWidth(elements, options){
	return elements.each(function() {
		var slideWidth = percentileSlideWidth($(this).find(options.slides).length, percentileVisibleCount(jQuery.parseJSON(options.breakpoints)));
		$(this).find(options.slides).css('width', slideWidth+'%');
		$(this).css('height',$(this).find(options.slides).first().height());
	});
}

function percentileCreateRotate(elements, options, slideCount, displayCount){
	return elements.each(function() {
		if (slideCount > displayCount) {
			$(options.next+', '+options.prev).addClass('active');
			var slideWidth = percentileSlideWidth(slideCount, displayCount);	
			
			var i = 0;
			$(this).find(options.slides).each(function(){
				$(this).css('position', 'absolute');
				$(this).css('left', (slideWidth*i)+"%");
				i++;
			});
			
			
		} else {
			$(options.next+', '+options.prev).removeClass('active');
			$(this).find(options.slides).css('left', "auto");
			$(this).find(options.slides).css('position', "relative");
		}
	});
}

(function( $ ){
	$.fn.percentile = function(options) {

		var defaults = {
			slides: '.slide',
			breakpoints:  '{ "full": 3, "768": 2, "420": 1 }',
			next: '.slides .next',
			prev: '.slides .prev'
		}
		var options =  $.extend(defaults, options);
		var targets = this;
		var animating = false;
		
		percentileHeightWidth(targets, options);

		$(this).find(options.slides).on(
			"transitionend MSTransitionEnd webkitTransitionEnd oTransitionEnd",
			function() {
				animating = false;
				$(this).removeClass("animation");
			}
		);
		
		function progressSlides(targets, direction){
			if (animating == false) {
				targets.each(function() {
					var tar = $(this);
					tar.find(options.slides).each(function(){
						var slideWidthPercent = parseInt(this.style.width.replace('%',''));
						var slide = this;
						
						
						if (direction == "next" && parseInt(this.style.left.replace('%','')) < 0){			
							$(this).css('left',(lastSlideLeft)+'%');	
						} else if (direction != "next" && parseInt(this.style.left.replace('%','')) >= (lastSlideLeft)){
							$(this).css('left',(slideWidthPercent-(slideWidthPercent*2))+'%');				
						}
						
						setTimeout(function(){
							
							var offset = slideWidthPercent;
							if (direction == "next"){
								offset -= (offset*2);
							}
							offset += parseInt(slide.style.left.replace('%',''));
							animating = true;
							$(slide).addClass('animation');
							$(slide).css('left', offset+'%');
							$(slide).css('z-index', '0');
							
						
						}, 100);
						
						
					});
				});
			}
		}
		
		$(options.next).click(function(e){
			e.preventDefault();
			progressSlides(targets, 'next');
		});
		
		$(options.prev).click(function(e){
			e.preventDefault();
			progressSlides(targets, 'prev');
		});
		
		percentileHeightWidth(targets, options);
		percentileCreateRotate(targets, options, targets.find(options.slides).length, percentileVisibleCount(jQuery.parseJSON(options.breakpoints)));
		
		var lastSlideLeft = 0;						
		targets.find(options.slides).each(function() {
			if (parseInt(this.style.left.replace('%',''))>lastSlideLeft){
				lastSlideLeft = parseInt(this.style.left.replace('%',''));
				
			}
		});
		
		
		$(window).bind('load',$.proxy(function(){
			percentileHeightWidth(targets, options);
		}, this));
		
		
		$(window).bind('resize',$.proxy(function(){
			lastSlideLeft = 0;
			targets.find(options.slides).each(function() {
				console.log('last'+lastSlideLeft);
				if (parseInt(this.style.left.replace('%',''))>lastSlideLeft){
					lastSlideLeft = parseInt(this.style.left.replace('%',''));
					
				}
			});
			percentileHeightWidth(targets, options);
			percentileCreateRotate(targets, options, $(this).find(options.slides).length, percentileVisibleCount(jQuery.parseJSON(options.breakpoints)));
		}, this));
		
	};
})( jQuery );