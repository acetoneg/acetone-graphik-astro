/**
 * Created by bfulop on 20/01/15.
 */

app.core.define('ScrollHandler', function definition () {
    var configMap = {
        scrollStopTolerance: 300
    };
    var stateMap = {
        domelemMap : {},
        scrolling_idto : undefined
    };


    function handlescroll () {
//        stateMap.f.stateMap.raf_ticking = false;
        stateMap.f.emit('windowScroll', {
            windowScrollY : stateMap.f.stateMap.windowScrollY,
            windowScrollX  : window.pageXOffset
        });
    }

    function throttlescroll () {
//        save window position
        stateMap.f.stateMap.windowScrollY = window.pageYOffset;
//        prepare to send scroll stop even
        window.clearTimeout( stateMap.scrolling_idto );
        stateMap.scrolling_idto = window.setTimeout( function () {
            stateMap.f.emit( 'stopWindowScroll' );
        }, configMap.scrollStopTolerance );

        if ( !stateMap.f.stateMap.raf_ticking ) {
            window.requestAnimationFrame( handlescroll );
        }
        stateMap.f.stateMap.raf_ticking = true;

    }

    function init(f) {
        stateMap.f = f;

//        add on scrollend event
        stateMap.f.addEvent(window, 'scroll', throttlescroll);

    }

    return {
        init: init
    }
});

