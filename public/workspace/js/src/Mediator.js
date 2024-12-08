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





