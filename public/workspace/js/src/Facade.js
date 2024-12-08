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




