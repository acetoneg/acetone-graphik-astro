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
