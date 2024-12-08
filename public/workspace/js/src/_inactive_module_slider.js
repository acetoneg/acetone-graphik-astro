/**
 * Created by bfulop on 06/05/15.
 */

app.core.define('SliderModule', function definition () {
    var configMap = {
        anim_duration : 1000
    };

    var stateMap = {
        activeSlide        : 1,
        domelemMap         : {},
        windowWidth        : window.innerWidth
    };

    function handleSlideClick ( event ) {
        var dom_elem               = event.target;
        var target_slide           = dom_elem.id.replace(/slide-/, '');

        if ( stateMap.autoscroll ) {
            window.clearInterval( stateMap.autoscroll );
            stateMap.autoscroll = undefined;
        }

        scrollToSlide( target_slide );

    }

    function scrollToSlide (target_number, duration) {
        var anim_duration = duration ? duration : configMap.anim_duration;
        var slider        = stateMap.domelemMap.slider;
        var currentPos    = function(){ return slider.scrollLeft; }();
        var targetPos     = window.innerWidth * (target_number - 1);
        var animpos       = 0;
        var slideDist     = targetPos - currentPos;
        var starttime     = null;
        var elapsedtime   = null;
        var easing        = stateMap.f.easeInOutCubic;
        var scrollEndedSubscription = null;

        stateMap.sliderScrollEventPausable.pause();

        function step ( timestamp ) {
            if ( !starttime ) {
                starttime = timestamp;
            }

            elapsedtime = timestamp - starttime;

            animpos = currentPos + (slideDist * easing(elapsedtime / anim_duration));

            slider.scrollLeft = animpos;

            if ( elapsedtime > anim_duration ) {
                slider.scrollLeft = targetPos;
                window.setTimeout(function () {
                    stateMap.sliderScrollEventPausable.resume();
                }, 100)
                return;
            }

            if (Math.abs(animpos - targetPos) > 0) {
                window.requestAnimationFrame( step );
            } else {
                window.setTimeout(function () {
                    stateMap.sliderScrollEventPausable.resume();
                }, 100)
            }

        }

        window.requestAnimationFrame( step );

        stateMap.activeSlide = target_number;

    }

    function snapToSlide ( direction ) {
        var activeslide_obj = getActiveSlider();
        var nextslide       = ( direction === 'left' ) ? 1 : 0;

        scrollToSlide( activeslide_obj.activeslider + nextslide, 400 );

    }

    function getActiveSlider () {
        var slider = stateMap.domelemMap.slider;
        var w_width = stateMap.windowWidth;
        var scrollpos_x = slider.scrollLeft;

//        get which slide is in view
        var activeslider = Math.floor(scrollpos_x / w_width) + 1;
        var slideroffset = scrollpos_x % w_width;
        var step_next    = ( slideroffset > w_width / 2  ) ? 1 : 0;

        return {
            activeslider : activeslider,
            step_next    : step_next
        }

    }


    function handleWindowResize ( sizesObj ) {
        stateMap.windowWidth = sizesObj.windowWidth;
        scrollToSlide( stateMap.activeSlide, 600 );
    }



    function init(f) {
        stateMap.f = f;

        stateMap.domelemMap.navig  = f.find('.m-slider-nav');
        stateMap.domelemMap.slider = f.find('.m-slider');
        stateMap.domelemMap.navigbuttons = f.findall('.m-slider-nav>li' );
        stateMap.domelemMap.slideNumber = stateMap.domelemMap.navigbuttons.length;

        f.listen('windowResize', handleWindowResize);

//        handle slider button clicks
        var sliderClicks = Rx.Observable.fromEvent(stateMap.domelemMap.navig, 'click' ).
            filter( function (event) {
                return event.target.tagName === "A";
            } );

        sliderClicks.forEach( function (event) {
            handleSlideClick( event );
        });

//        observe slider scroll
        var sliderScrollEvent = Rx.Observable.fromEvent(stateMap.domelemMap.slider, 'scroll' )
            .throttle( 16 );

        stateMap.sliderScrollEventPausable = sliderScrollEvent
            .pausable();


        // detect when scrolling has ended with a delay
        stateMap.scrollEnded = stateMap.sliderScrollEventPausable
            .map ( function (event) {
                return event.target.scrollLeft;
            } )
            .bufferWithCount( 2 )
            .map( function ( scrollPos ) {
//                get the direction of the scroll (left or right)
                return ( scrollPos[0] > scrollPos[1] ) ? 'right' : 'left';
            } )
            .debounce( 200 )
        ;

        stateMap.scrollEndedSubscription = stateMap.scrollEnded
            .forEach( function ( direction ) {
                stateMap.sliderScrollEventPausable.pause();
                window.setTimeout( function () {
                    snapToSlide( direction );
                } ,50);
            })
        ;

//        highlight active buttons
        var sliderButtonsManager = sliderScrollEvent.throttle(50)
            .map( function (event) {
                var active_slider = getActiveSlider();
                return active_slider.activeslider + active_slider.step_next;
            } ).
            distinctUntilChanged().
            forEach(function( result ){
                stateMap.domelemMap.navigbuttons.forEach( function (element, index) {
                    if ( index === result - 1 ) {
                        f.addClass(element, 's--active');
                    } else {
                        f.removeClass(element, 's--active')
                    }
                });
            });

//        autoscroll slides
        var autoscroll = Rx.Observable.interval( 3000 )
            .takeUntil(stateMap.scrollEnded)
            .map( function (count) {
                return count % stateMap.domelemMap.slideNumber;
            } );

        var scroller = autoscroll.forEach(function (count) {
            scrollToSlide(count + 1);
            stateMap.sliderScrollEventPausable.take(1).forEach(function () {
                scroller.dispose();
            });
        });

    }


    return {
        init: init
    }
});

