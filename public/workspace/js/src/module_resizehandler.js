/**
 * Created by bfulop on 07/05/15.
 */

app.core.define('SizesHandler', function definition () {
    var stateMap = {
        domelemMap : {}
    };

    function handleresize () {
        stateMap.f.emit('windowResize', {
            windowHeight  : window.innerHeight,
            windowWidth   : window.innerWidth,
            windowScrollY : window.pageYOffset
        });
    }

    function throttleresize () {
        if ( stateMap.resize_idto ) {
            return true;
        }
        handleresize();

        stateMap.resize_idto = setTimeout(
            function () {
                stateMap.resize_idto = undefined;
            },
            500
        );
    }

    function init(f) {
        stateMap.f = f;

        stateMap.f.addEvent(window, 'resize', throttleresize);
        handleresize();

    }

    return {
        init: init
    }
});

