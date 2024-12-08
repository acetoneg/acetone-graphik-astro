/**
 * Created by bfulop on 20/01/15.
 */

app.core.define('ScrollPager', function definition () {
    var configMap = {
        slidebottompos : 0.9,
        slidetoppos    : 0.05,
        triggerpoint   : 110
    };
    var stateMap = {
        scrollDir : 'up',
        domelemMap  : {},
        sizesMap    : {
            windowSize       : {},
            elemOffsetList   : [],
            triggerList      : [],
            scrollRangeList  : [],
            offsetYRangeList : [],
            topDockPosList   : [],
            dockBottomDist   : 0
        },
        previousMap : {
            activeElemNumber  : -1,
            elementsClassList : [],
            scrollY           : 0
        },
        activeClassMap : [
            'default',
            'active-above',
            'active-previous',
            'active-active',
            'active-moving',
            'active-following',
            'active-rest'
        ]
    };


//    saves triggerpoints, offsetpositions
    function setSizes ( element, index, array ) {

        stateMap.sizesMap.elemOffsetList[ index ] = stateMap.f.getOffsetTop( element );

        stateMap.sizesMap.triggerList[ index ]    = stateMap.sizesMap.elemOffsetList[ index ] - configMap.triggerpoint;

        if ( index === 0 ) {
            stateMap.sizesMap.scrollRangeList[ index ] = 0;
        } else {
            stateMap.sizesMap.scrollRangeList[ index ] =
                stateMap.sizesMap.elemOffsetList[ index ] - stateMap.sizesMap.elemOffsetList[ index - 1 ];
        }

        if ( index === 0 ) {
            stateMap.sizesMap.offsetYRangeList[ index ] = 0;
        } else {
            stateMap.sizesMap.offsetYRangeList[ index ] =
                stateMap.sizesMap.windowSize.windowHeight - configMap.triggerpoint - stateMap.sizesMap.dockBottomDist - (stateMap.sizesMap.triggerList[ index ] - stateMap.sizesMap.triggerList[ index - 1 ]);
//            stateMap.sizesMap.offsetYRangeList[ index ] = Math.max(stateMap.sizesMap.offsetYRangeList[ index ], 0);
        }

    }
    
    function setUpPage ( window_size_map ) {
        stateMap.sizesMap.windowSize = window_size_map;
        stateMap.sizesMap.windowSize.windowScrollY = stateMap.f.stateMap.windowScrollY;

        //        calculate all sizes and triggerpoints
        configMap.triggerpoint = stateMap.f.getOffsetTop( stateMap.domelemMap.detailslist_items[0] );

        stateMap.sizesMap.dockBottomDist = stateMap.sizesMap.windowSize.windowHeight - ( stateMap.sizesMap.windowSize.windowHeight * configMap.slidebottompos );
        stateMap.domelemMap.detailslist_items.forEach( setSizes );

        //        Add translateY to elements on startup
        stateMap.domelemMap.detailslist_items.forEach( function (element, index, array) {
            if ( index > stateMap.previousMap.activeElemNumber + 1 ) {
                var stylename = '';
                var offset_Y = stateMap.sizesMap.offsetYRangeList[ index ];
                stylename += '-webkit-transform: translateY(' + offset_Y + 'px); ';
                stylename += '-moz-transform: translateY(' + offset_Y + 'px); ';
                stylename += '-ms-transform: translateY(' + offset_Y + 'px); ';
                stylename += '-o-transform: translateY(' + offset_Y + 'px); ';
                stylename += 'transform: translateY(' + offset_Y + 'px); ';
                stateMap.f.setStyle( element, stylename );
            }
        });

        //        set up a slides
        handleScroll( {
            windowScrollY : stateMap.sizesMap.windowSize.windowScrollY
        } );


    }

    function getActiveElem ( Ypos ) {
//        find in triggerList the target active element
        var tnumber  = stateMap.sizesMap.triggerList.length;
        var iterator = 0;
        while ( iterator < tnumber ) {
            if ( Ypos < stateMap.sizesMap.triggerList[ iterator + 1 ] ) {
                return iterator;
            }
            iterator++;
        }
        return tnumber;
    }

    function setupClasses ( active_elem_number ) {
        var i,
            diff;
        for ( i = 0; i < stateMap.domelemMap.detailslist_items.length; i++ ) {
            diff = 3 - active_elem_number + i;
            diff = Math.max(Math.min(diff, 6), 1);
            var target_class_name = stateMap.activeClassMap[ diff ];
            if ( stateMap.previousMap.elementsClassList[i] === target_class_name ) {
                continue;
            }

            var target_element = stateMap.domelemMap.detailslist_items[ i ];
            stateMap.f.removeClass( target_element, stateMap.previousMap.elementsClassList[ i ] );
            stateMap.f.addClass( target_element, target_class_name );

//            clean up inline style defintion
            if ( diff === 3 || diff === 5) {
                stateMap.f.setStyle( target_element, '');
            }

//            clone to top
            if ( active_elem_number > 0 && diff === 3  ) {
                var clone_element = stateMap.f.createClone( stateMap.domelemMap.detailslist_items[ active_elem_number - 1 ] );
                stateMap.f.insertDomElem( stateMap.domelemMap.cloneholder, clone_element, true );
            }
//            but remove clone if scrolled back to the first element
            if ( diff ===4 && active_elem_number === 0) {
                stateMap.f.emptyDomElem( stateMap.domelemMap.cloneholder );
            }

            stateMap.previousMap.elementsClassList[ i ] = target_class_name;

        }
    }

    function setPosY ( active_elem_number ) {
//        add offset to following element
        var relative_pos = stateMap.sizesMap.windowSize.windowScrollY - stateMap.sizesMap.triggerList[ active_elem_number + 1 ];
        var range_pos = ( relative_pos * -1) / stateMap.sizesMap.scrollRangeList[ active_elem_number + 1 ] * stateMap.sizesMap.offsetYRangeList[ active_elem_number + 1 ];

        range_pos = Math.max(range_pos, 0);

        var stylename = '';
        stylename += '-webkit-transform: translateY(' + range_pos + 'px); ';
        stylename += '-moz-transform: translateY(' + range_pos + 'px); ';
        stylename += '-ms-transform: translateY(' + range_pos + 'px); ';
        stylename += '-o-transform: translateY(' + range_pos + 'px); ';
        stylename += 'transform: translateY(' + range_pos + 'px); ';

        stateMap.f.setStyle( stateMap.domelemMap.detailslist_items[ active_elem_number + 1 ], stylename );
    }
    
    function scrollStopped ( ) {
        if ( !stateMap.autoCenterBol ) {
             scrollToNext();
        }
    }

    function handleScroll ( scrollMap ) {
        scrollMap.windowScrollY = stateMap.f.stateMap.windowScrollY;
//        do nothing if scrolled over the last element
        if ( scrollMap.windowScrollY > stateMap.sizesMap.triggerList[stateMap.sizesMap.triggerList.length -1 ]) {
            stateMap.f.stateMap.raf_ticking = false;
            return;
        }

//        calculate scroll direction
        var scroll_dist = stateMap.previousMap.scrollY - stateMap.sizesMap.windowSize.windowScrollY;
        if(scroll_dist > 0) {
            stateMap.scrollDir = 'down';
        } else {
            stateMap.scrollDir = 'up';
        }

        stateMap.previousMap.scrollY = stateMap.sizesMap.windowSize.windowScrollY;
        stateMap.sizesMap.windowSize.windowScrollY = scrollMap.windowScrollY;

//        wait a few milliseconds and if scrolling is stopped, scroll page to nearest scroll position
        window.clearTimeout( stateMap.previousMap.centerScrollTo );
        stateMap.previousMap.centerScrollTo = false;


        var active_elem_number = getActiveElem( scrollMap.windowScrollY );

        if ( active_elem_number != stateMap.previousMap.activeElemNumber ) {
//            setupClasses( active_elem_number );
        }

        if ( active_elem_number < stateMap.domelemMap.detailslist_items.length) {
            setPosY( active_elem_number );
        }

        stateMap.previousMap.activeElemNumber = active_elem_number;
        stateMap.f.stateMap.raf_ticking = false;

    }

//    auto scroll to next slide
//    based on scroll direction
    function scrollToNext ( ) {
        stateMap.autoCenterBol = true;
        var active_elem_number = stateMap.previousMap.activeElemNumber;
//        get intended scroll direction
        var target_dist_this = Math.abs( stateMap.previousMap.scrollY - stateMap.sizesMap.triggerList[ active_elem_number ] );
        var target_dist_next = Math.abs( stateMap.previousMap.scrollY - stateMap.sizesMap.triggerList[ active_elem_number + 1 ] );
        if ( Math.min( target_dist_this, target_dist_next ) < 50 ) {
            window.setTimeout( function () {
                stateMap.autoCenterBol = false;
            }, 1000 );
            return;
        }
        var scroll_dir = 1;
        if ( stateMap.scrollDir === 'down' ) {
            scroll_dir = 0;
        }

//        scroll to next element
        var next_posy = stateMap.sizesMap.triggerList[ active_elem_number + scroll_dir ];
        var scroll_diff = next_posy - stateMap.sizesMap.windowSize.windowScrollY;

        var scroll_duration = Math.abs( scroll_diff ) * 1.2;
        stateMap.f.scrollYTo(next_posy, scroll_duration)
//        stateMap.f.animatedScroll( 0, scroll_diff, scroll_duration );
//        stateMap.f.scrollTo(0, next_posy, Math.abs( scroll_diff) * 1.2 );
        window.setTimeout( function () {
            stateMap.autoCenterBol = false;
        }, scroll_duration + 300 );


    }
    
    function getSteppers(elem) {
        return elem.classList && elem.classList.contains("step");
    }
    
    function doStep(e) {
        var elem = e.delegateTarget;
//        decide to move back or forward
        var stepdir = 0;
        var scroll_diff;
        var extrastep = 0;
        if ( elem.classList.contains( "forward" ) ) {
            stepdir = 1;
            extrastep = 1;
        }
        if ( elem.classList.contains( "back" ) ) {
            stepdir = 0;
            extrastep = -1;
        }
        stateMap.autoCenterBol = true;

        var next_elem_number = (stateMap.previousMap.activeElemNumber + stepdir);
        if (next_elem_number > stateMap.sizesMap.triggerList.length -1 ) {
            next_elem_number = stateMap.sizesMap.triggerList.length - 1;
        }
        scroll_diff = stateMap.sizesMap.triggerList[ next_elem_number ] - stateMap.sizesMap.windowSize.windowScrollY;
        if ( Math.abs( scroll_diff ) < (stateMap.sizesMap.scrollRangeList[ stateMap.sizesMap.scrollRangeList.length -1 ] / 3) ) {
            next_elem_number += extrastep;
            scroll_diff =
                stateMap.sizesMap.triggerList[ next_elem_number ] - stateMap.sizesMap.windowSize.windowScrollY;
        }
        var scroll_duration = Math.abs( scroll_diff ) * 1.3;
//        stateMap.f.animatedScroll( 0, scroll_diff, scroll_duration );
        stateMap.f.stateMap.raf_ticking = false;
        stateMap.f.scrollYTo(stateMap.sizesMap.triggerList[ next_elem_number ], scroll_duration);
        window.setTimeout( function () {
            stateMap.autoCenterBol = false;
        }, scroll_duration + 300 );
    }

    function startup( window_size_map ) {

        setUpPage( window_size_map );
        stateMap.f.listen( 'windowResize', setUpPage );
        stateMap.f.listen( 'windowScroll', handleScroll );
        stateMap.f.listen( 'stopWindowScroll', scrollStopped );
        
        stateMap.f.addEvent(stateMap.domelemMap.rootElem, 'click', stateMap.f.delegate(getSteppers, doStep));

    }


    function init(f) {
         if (navigator.userAgent.match(/(iPad|iPhone|iPod touch);.*CPU.*OS (7|6|5)_\d/i)) {
//             scrolling event not stable on older iphones
             return;
         }
        stateMap.f = f;

        stateMap.domelemMap.detailslist_items      = f.findall( '.detailslist-item' );
        stateMap.domelemMap.rootElem               = f.getRootElem();
        stateMap.sizesMap.slidestopMargin          = f.getOffsetTop( stateMap.domelemMap.rootElem );

        f.listen( 'docloaded', startup );

//        create fixed top position element clone holder
        stateMap.domelemMap.cloneholder = stateMap.f.find( '#scrollpage-cloneholder' );

    }

    return {
        init: init
    }
});

