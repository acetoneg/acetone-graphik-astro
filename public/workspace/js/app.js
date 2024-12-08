/**
 * Created by bfulop on 03/02/15.
 */

var app = (function app() {
    'use strict';
    // var startApp = function () {
    //    app.core.startAll();
    // };
    //
    // return { startApp: startApp }
});




/**
 * Created by bfulop on 20/01/15.
 */

app.facade =  {

//    stateMap
    stateMap : {
        windowScrollY : 0,
        raf_ticking : false
    },

    init : function (module_name) {
        this.moduleName = module_name;
        this.rootElem = document.getElementById(module_name.toLowerCase());
    },
//    DOM methods

    getRootElem : function () {
        return this.rootElem;
    },

    find : function ( query ) {
        return this.rootElem.querySelector(query);
    },

    findall : function ( query ) {
        var node_list = this.rootElem.querySelectorAll( query );
        var node_array = Array.prototype.slice.call(node_list); // converts NodeList to Array
        return node_array;
    },

    addEvent : function ( targetelem, eventname, callback) {
        targetelem.addEventListener(eventname, callback, false);
    },

    delegate : function ( criteria, listener  ) {
        return function ( e ) {
            var el = e.target;
            do {
                if (!criteria(el)) {
                    continue;
                }
                e.delegateTarget = el;
                listener.apply(this, arguments);
                return;
            } while ( el = el.parentNode);
        }
    },
    
    appendSingleElem : function ( targetelem, sourcelem_map ) {
        var newelem = document.createElement( sourcelem_map.tag_name );
        newelem = text (newelem, sourcelem_map.txt );

        function text ( node, txt ) {
            node.appendChild( document.createTextNode( txt ) );
            return node;
        }

        var targetelem_node = this.find( targetelem );

        targetelem_node.appendChild(newelem);

    },

    emptyDomElem : function ( targetelem ) {
        var targetelem_node;
        if ( typeof targetelem === 'string' ) {
            targetelem_node = this.find ( targetelem );
        } else {
            targetelem_node = targetelem;
        }
        var children_list = targetelem_node.childNodes;
        var i;
        for ( i = 0; i < children_list.length; i++ ) {
            targetelem_node.removeChild( children_list[ i ] );

        }
    },

    insertDomElem : function ( targetelem, domelem, replacing ) {
        var targetelem_node;
        if ( typeof targetelem === 'string' ) {
            targetelem_node = this.find( targetelem );
        } else {
            targetelem_node = targetelem;
        }
        if ( replacing ) {
            this.emptyDomElem( targetelem );
        }
        targetelem_node.appendChild( domelem );

    },

    animatedScroll : function ( distance_x, distance_y, duration ) {
//        aiming for 50 fps = every 16ms
        var stepbyms     = distance_y / duration;
        var startvalue   = null;
        var lastvalue    = null;
        var target_posY  = window.pageYOffset + distance_y;

        function step ( timestamp ) {
            if ( !startvalue ) {
                startvalue = timestamp;
                lastvalue  = timestamp;
            }

            var progress = timestamp - startvalue;
            var elapsedtime = timestamp - lastvalue;
            lastvalue        = timestamp;
            window.scrollBy( 0, stepbyms * elapsedtime );
            if ( progress < duration ) {
                window.requestAnimationFrame( step );
            }
            else {
                window.setTimeout( function () {
                    window.scrollTo( 0, target_posY );
                }, 50 );
            }
        }

        window.requestAnimationFrame( step );
    },

//    animation easing
    /*
     * Easing Functions - inspired from http://gizma.com/easing/
     * only considering the t value for the range [0, 1] => [0, 1]
     */

    easeInOutCubic : function ( t ) {
        if ( t < .5 ) {
            return 4 * t * t * t
        } else {
            return (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
        }
    },

    scrollYTo : function ( y_pos, duration ) {
        var start_y_pos            = window.pageYOffset;
        var y_dist                 = y_pos - window.pageYOffset;
        var go_down_bol            = ( y_dist > 0 );
        var starttime              = null;
        var elapsedtime            = null;
        var easeInOutCubic         = this.easeInOutCubic;

        function step ( timestamp ) {

            if ( !starttime ) {
                starttime = timestamp;
            }

            elapsedtime = timestamp - starttime;

            var target_y_pos = start_y_pos + y_dist * easeInOutCubic( elapsedtime / duration );

            if ( go_down_bol ) {
                target_y_pos = Math.min(target_y_pos, y_pos);
            }
            if ( !go_down_bol ) {
                target_y_pos = Math.max( target_y_pos, y_pos );
            }

            if ( target_y_pos ) {
                window.scrollTo( 0, target_y_pos );
            }

            if ( go_down_bol && target_y_pos < y_pos ) {
                window.requestAnimationFrame( step );
            }
            if ( !go_down_bol && target_y_pos > y_pos ) {
                window.requestAnimationFrame( step );
            }

        }

        window.requestAnimationFrame( step );

    },

    scrollYToTemp : function ( y_pos, duration ) {
        var current_y_pos          = window.pageYOffset;
        var y_dist                 = y_pos - window.pageYOffset;
        var stepbyms               = y_dist / duration * 16;
        var stepbyms_orig          = stepbyms;
        var stepbyms_ease          = 0;
        var total_dist             = 0;
        var go_down                = (stepbyms > 0);
        this.stateMap.raf_ticking  = false;
        var raf_ticking            = this.stateMap.raf_ticking;
        var starttime              = null;
        var elapsedtime            = null;
        var easeInOutCubic         = this.easeInOutCubic;

        function step ( timestamp ) {
            if ( !starttime ) {
                starttime = timestamp;
            }
            if ( raf_ticking ) {
                window.requestAnimationFrame( step );
                return;
            }
            elapsedtime = timestamp - starttime;

            var eased_value = (0 - Math.abs( -0.5 + easeInOutCubic( Math.min( elapsedtime / duration, 1 ) ) )) * 2;
            stepbyms = (stepbyms_orig * 1.3 + stepbyms_orig * eased_value) * 1.7;

            total_dist += stepbyms;
            current_y_pos += stepbyms;

            if ( go_down && current_y_pos > y_pos ) {
                current_y_pos = y_pos;
            }
            if ( !go_down && current_y_pos < y_pos ) {
                current_y_pos = y_pos;
            }

            if ( current_y_pos ) {
                window.scrollTo( 0, current_y_pos );
            }

            if ( Math.abs( total_dist ) < Math.abs( y_dist ) ) {
                window.requestAnimationFrame( step );
            }
        }

        window.requestAnimationFrame( step );

    },

    getHeight : function ( targetelem ) {
        return targetelem.offsetHeight;
    },

    getOffsetTop : function ( targetelem ) {
        return targetelem.offsetTop
    },

    createClone : function ( targetelem ) {
        return targetelem.cloneNode( true );
    },

    addClass : function ( targetelem, class_name ) {
        targetelem.classList.add( class_name );
    },

    removeClass : function ( targetelem, class_name ) {
        targetelem.classList.remove( class_name );
    },

    setStyle : function ( targetelem, cssstyle ) {
       targetelem.setAttribute("style", cssstyle);
    },


//    event handling

    listen : function (event_name, callback) {
        app.core.registerEvent(this.moduleName, event_name ,callback);
    },

    emit : function (event_name, data) {
        app.core.emitMessage(this.moduleName, event_name, data);
    }

};




/**
 * Created by bfulop on 20/01/15.
 */

// This is the mediator / Application Core
app.core = (function appcore() {
    var configMap = {

        //    allowed events by module
        emitMap : {
            SizesHandler  : {
                windowResize : true
            },
            mediator      : {
                docloaded : true
            }
        },

        listenMap : {
            sliderModule : {
                windowResize     : true
            }
        }
    };

    var stateMap = {};

//    define modules
    stateMap.modules = {};

    function define(name, impl) {
        stateMap.modules[name] = impl.apply(impl);
    }

    function getme(module_name) {
        return stateMap.modules[module_name];
    }

    function startModule(module_name) {
        var facade = Object.create(app.facade);
        facade.init(module_name);
        stateMap.modules[module_name].init(facade);
    }

    function emit_docloaded () {
            emitMessage( 'mediator', 'docloaded', {
                windowHeight  : window.innerHeight,
                windowWidth   : window.innerWidth,
                windowScrollY : window.pageYOffset
            } );
    }

    // start up the modules
    function startAll() {
        var moduleid;
        for (moduleid in stateMap.modules) {
            if (document.getElementById(moduleid.toLowerCase())){
//            only start module if DOM container exists
                startModule(moduleid);
            }
        }
//        notify modules when full document is loaded
        addLoadEvent( emit_docloaded );
    }


    // Events handling
    stateMap.events = {};

    function registerEvent(module_name, event_name, callback) {
        if (!stateMap.events[module_name]) {
            stateMap.events[module_name] = {};
        }
        stateMap.events[module_name][event_name] = callback;
    }

    function emitMessage(module_name, event_name, data) {
        if (!configMap.emitMap[module_name]) {
            console.log("module not allowed to emit messages");
            return false;
        }
        // check if module can emit this message
        if (!configMap.emitMap[module_name][event_name]) {
            console.log("message rejected: ", event_name, data);
            return false;
        }
        var amodule;
        for (amodule in stateMap.events) {
            if (!configMap.listenMap[amodule]) {
                console.log("module not allowed to receive messages");
                return false;
            }
            if (stateMap.events[amodule][event_name]) {
                // check if module can receive the message
                if (!configMap.listenMap[amodule][event_name]) {
                    console.log("module not allowed to receive message", event_name, data);
                    return false;
                }
                stateMap.events[amodule][event_name](data);
            }
        }
        return true;
    }


    // return public functions
    return {
        //return module related methods
        define: define,
        startall: startAll,
        startModule: startModule,
        get: getme,

        //    return event handling methods
        registerEvent: registerEvent,
        emitMessage: emitMessage
    }


}());


// Manage pub/sub by modules


// Start and stop modules





/**
 * Created by bfulop on 01/06/16.
 */

app.core.define('sliderModule', function definition() {
    var configMap = {};

    var stateMap = {
        activeSlide: 0,
        domelemMap:  {},
        windowWidth: window.innerWidth,
        activePage:  {
            page_number: 0,
            set:         function (page_number) {
                this.page_number = page_number;
                this.emit(this.get())
            },
            get:         function () {
                return this.page_number;
            },
            listeners:   [],
            emit:        function (emit_value) {
                var i = 0;
                for (i; i < this.listeners.length; i++) {
                    this.listeners[i](emit_value);
                }
            },
            listen:      function (cb) {
                this.listeners.push(cb);
            }
        }
    };

    function scrollEnd() {
        var active_page = Math.round(Math.abs(stateMap.scroller.x) / stateMap.windowWidth);
        stateMap.activePage.set(active_page);
    }

    function isSliderButton(elem) {
        return elem.tagName === "A";
    }

    function sliderButtonClick(event) {
        var target_slide = event.target.id.replace(/slide-/, '');
        stateMap.scroller.scrollToElement(stateMap.domelemMap.items[target_slide - 1]);
        updateButtons(target_slide - 1);
        clearTimeout(stateMap.nextPageTimeout);
    }

    function updateButtons(page_number) {
        for (var i = 0; i < stateMap.domelemMap.buttons.length; i++) {
            var elem = stateMap.domelemMap.buttons[i];
            if (page_number === i) {
                stateMap.f.addClass(elem, 's--active');
            } else {
                stateMap.f.removeClass(elem, 's--active');
            }
        }
    }

    function gotoNextPage() {
        var next_page = stateMap.activePage.get() + 1;
        if (next_page >= stateMap.domelemMap.buttons.length) {
            next_page = 0;
        }
        stateMap.scroller.scrollToElement(stateMap.domelemMap.items[next_page]);
        stateMap.nextPageTimeout = setTimeout(gotoNextPage, 6000);
    }

    function handleWindowResize(sizesObj) {
        stateMap.windowWidth = sizesObj.windowWidth;
        setupScroller();

    }

    function setupScroller() {
        stateMap.f.getRootElem().style.width = stateMap.windowWidth + "px";
        for (var i = 0; i < stateMap.domelemMap.items.length; ++i) {
            stateMap.domelemMap.items[i].style.width = stateMap.windowWidth + "px";
        }
        stateMap.f.getRootElem().querySelector('.m-slider').style.width = stateMap.windowWidth * stateMap.domelemMap.items.length + 20 + "px";
        if (stateMap.scroller) {
            setTimeout(function () {
                stateMap.scroller.refresh();
                scrollEnd();
            }, 0);
        }
    }

    function init(f) {
        stateMap.f                       = f;
        stateMap.domelemMap.items        = stateMap.f.getRootElem().querySelectorAll('li');
        stateMap.domelemMap.buttonsblock = document.getElementById('sliderbuttons');
        stateMap.domelemMap.buttons      = stateMap.domelemMap.buttonsblock.querySelectorAll('li');
        setupScroller();
        stateMap.scroller = new IScroll("#slidermodule", {
            scrollX:          true,
            scrollY:          false,
            mouseWheel:       false,
            eventPassthrough: true,
            snap:             true
        });
        stateMap.activePage.listen(updateButtons);

        stateMap.nextPageTimeout = setTimeout(gotoNextPage, 5000);

        f.listen('windowResize', handleWindowResize);
        stateMap.scroller.on("scrollEnd", scrollEnd);
        stateMap.scroller.on("flick", function () {
            clearTimeout(stateMap.nextPageTimeout);
        });

        stateMap.domelemMap.buttonsblock.addEventListener("click", f.delegate(isSliderButton, sliderButtonClick));

    }

    return {
        init: init
    }
});
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


//# sourceMappingURL=app.js.map