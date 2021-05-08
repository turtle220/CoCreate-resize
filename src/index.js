// "use strict";
import observer from "@cocreate/observer";
import "./style.css";

const coCreateResize = {
    selector: "", //'.resize',
    resizers: [],
    resizeWidgets: [],
    init: function (handleObj) {
        for (let handleKey in handleObj) if (handleObj.hasOwnProperty(handleKey) && handleKey == "selector") this.selector = handleObj[handleKey];
        this.resizers = document.querySelectorAll(this.selector);
        let _this = this;
        this.resizers.forEach(function (resize, idx) {
            let resizeWidget = new CoCreateResize(resize, handleObj);
            _this.resizeWidgets[idx] = resizeWidget;
        });
    },
    initElement: function (target) {
        let resizeWidget = new CoCreateResize(target, {
            dragLeft: "[data-resize_handle='left']",
            dragRight: "[data-resize_handle='right']",
            dragTop: "[data-resize_handle='top']",
            dragBottom: "[data-resize_handle='bottom']",
        });
        this.resizeWidgets[0] = resizeWidget;
    },
};
function CoCreateResize(resizer, options) {
    this.resizeWidget = resizer;
    this.cornerSize = 10;
    this.init(options);
}
CoCreateResize.prototype = {
    init: function (handleObj) {
        if (this.resizeWidget) {
            this.leftDrag = this.resizeWidget.querySelector(handleObj["dragLeft"]);
            this.rightDrag = this.resizeWidget.querySelector(handleObj["dragRight"]);
            this.topDrag = this.resizeWidget.querySelector(handleObj["dragTop"]);
            this.bottomDrag = this.resizeWidget.querySelector(handleObj["dragBottom"]);
            this.bindListeners();
            this.initResize();
        }
    },
    initResize: function (e) {
        if (this.leftDrag) {
            this.add_removeListener(this.leftDrag, "mousemove touchmove", this.checkDragCorner('TopLeft'), 0);
            this.add_removeListener(this.leftDrag, "mousemove touchmove", this.checkDragCorner('BottomLeft'), 0);
        }
        if (this.topDrag) {
            this.add_removeListener(this.topDrag, "mousemove touchmove", this.checkDragCorner('TopRight'), 0);
        }
        if (this.rightDrag) {
            this.add_removeListener(this.rightDrag, "mousemove touchmove", this.checkDragCorner( 'Top'), 0);
            this.add_removeListener(this.rightDrag, "mousemove touchmove", this.checkDragCorner( 'Bottom'), 0);
        }
        if (this.bottomDrag) {
            this.add_removeListener(this.bottomDrag, "mousemove touchmove", this.checkDragCorner( 'BottomRight'), 0);
        }
    },
    initDrag: function (e) {
        this.processIframe();
        this.startTop = parseInt(document.defaultView.getComputedStyle(this.resizeWidget).top, 10);
        this.startHeight = parseInt(document.defaultView.getComputedStyle(this.resizeWidget).height, 10);
        if (e.touches)  {
            this.startY = e.touches[0].clientY;
            this.startX = e.touches[0].clientX;
        }
        else {
            this.startY = e.clientY;
            this.startX = e.clientX;
        }
        this.add_removeListener(document.documentElement, "mouseup touchend", this.stopDrag, 0);
    },
    initTopLeftDrag: function (e) {
        this.initDrag(e);
        this.add_removeListener(document.documentElement, "mousemove touchmove", this.doDrag, 0);
    },
    doDrag: function (e, type) {
        let top, height, left, width;
        if (e.touches) e = e.touches[0];
        if (type === 'top') {
            top = this.startTop + e.clientY - this.startY;
            height = this.startHeight - e.clientY + this.startY;
        }
        if (type === 'left') {
            left = this.startLeft + e.clientX - this.startX;
            width = this.startWidth - e.clientX + this.startX;
        }
        type === 'bottom' && e.touches ? height = this.startHeight + e.touches[0].clientY - this.startY : type === 'right' ? width = this.startWidth + e.touches[0].clientX - this.startX : null

        if (top < 10 || height < 10 || width < 10) return;
        this.resizeWidget.style.top = top + "px";
        this.resizeWidget.style.height = height + "px";
        this.resizeWidget.style.left = left + "px";
        this.resizeWidget.style.width = width + "px";
    },
    initBottomRightDrag: function (e) {
        this.initDrag(e);
        this.add_removeListener(document.documentElement, "mousemove touchmove", this.doBottomRightDrag, 0);
    },

    stopDrag: function () {
        this.resizeWidget.querySelectorAll("iframe").forEach(function (item) {
            item.style.pointerEvents = null;
        });
        this.add_removeListener(document.documentElement, "mousemove touchmove", this.doDrag('top'), 1);
        this.add_removeListener(document.documentElement, "mousemove touchmove", this.doDrag('right'), 1);
        this.add_removeListener(document.documentElement, "mousemove touchmove", this.doDrag('left'), 1);
        this.add_removeListener(document.documentElement, "mousemove touchmove", this.doDrag('bottom'), 1);
        this.add_removeListener(document.documentElement, "mouseup touchend", this.stopDrag, 1);
    },
    initStopDrag: function () {
        this.add_removeListener(this.topDrag, "mousedown touchstart", this.initTopLeftDrag, 1);
        this.add_removeListener(this.topDrag, "mousedown touchstart", this.initBottomRightDrag, 1);
        this.add_removeListener(this.topDrag, "mousedown touchstart", this.initTopLeftDrag, 0);
        this.add_removeListener(this.rightDrag, "mousedown touchstart", this.initBottomRightDrag, 0);
    },
    checkDragCorner: function (e, type) {
        let offsetX, offsetY,
        scrollLeft = document.documentElement.scrollLeft;
        if (e.touches) e = e.touches[0];
        offsetX = e.clientX - this.getTopLeftDistance(this.topDrag, 1) + scrollLeft;
        if(type === 'Top' || type === 'Bottom') {
            scrollTop = document.documentElement.scrollTop;
            offsetY = e.clientY - this.getTopLeftDistance(this.leftDrag, 0) + scrollTop;
        }
        this.initStopDrag();
        if ( type === 'TopLeft' && offsetX < this.cornerSize && this.leftDrag) {
            this.topDrag.style.cursor = "se-resize";
            this.add_removeListener(this.topDrag, "mousedown touchstart", this.initTopLeftDrag, 0);
        } else this.topDrag.style.cursor = "s-resize";
    
        if ( type === 'Topright' && this.rightDrag) {
            offsetX = this.getTopLeftDistance(this.rightDrag, 1) - e.clientX - scrollLeft;
            if (offsetX < this.cornerSize) {
                this.topDrag.style.cursor = "ne-resize";
                this.add_removeListener(this.topDrag, "mousedown touchstart", this.initBottomRightDrag, 0);
            } else if (!this.leftDrag) {
                this.topDrag.style.cursor = "s-resize";
            }
        }
        if ( type === 'Top' && this.topDrag) {
            offsetY = e.clientY - this.getTopLeftDistance(this.topDrag, 0) + scrollTop;
            if (offsetY < this.cornerSize) {
                this.rightDrag.style.cursor = "ne-resize";
                this.add_removeListener(this.rightDrag, "mousedown touchstart", this.initTopLeftDrag, 0);
            } else this.rightDrag.style.cursor = "e-resize";
        }
        if (type === 'BottomLeft' && offsetX < this.cornerSize && this.leftDrag) {
            this.bottomDrag.style.cursor = "ne-resize";
            this.add_removeListener(this.bottomDrag, "mousedown touchstart", this.initTopLeftDrag, 0);
        } else this.bottomDrag.style.cursor = "s-resize";
        if (type === 'Bottom' && this.bottomDrag) {
            offsetY = this.getTopLeftDistance(this.bottomDrag, 0) - e.clientY - scrollTop;
            if (offsetY < this.cornerSize) {
                this.leftDrag.style.cursor = "ne-resize";
                this.add_removeListener(this.leftDrag, "mousedown touchstart", this.initBottomRightDrag, 0);
            } else if (!this.topDrag) {
                this.leftDrag.style.cursor = "e-resize";
            }
        }
        if (type === 'BottomRight' && this.rightDrag) {
            offsetX = this.getTopLeftDistance(this.rightDrag, 1) - e.clientX - scrollLeft;
            if (offsetX < this.cornerSize) {
                this.bottomDrag.style.cursor = "se-resize";
                this.add_removeListener(this.bottomDrag, "mousedown touchstart", this.initBottomRightDrag, 0);
            } else if (!this.leftDrag) {
                this.bottomDrag.style.cursor = "s-resize";
            }
        }
    },
    bindListeners: function () {
        this.initTopLeftDrag = this.initTopLeftDrag.bind(this);
        this.doDrag = this.doDrag.bind(this);
        this.initBottomRightDrag = this.initBottomRightDrag.bind(this);
        this.stopDrag = this.stopDrag.bind(this);
        this.initDrag = this.initDrag.bind(this);
        this.initStopDrag = this.initStopDrag.bind(this);
        this.checkDragCorner = this.checkDragCorner.bind(this);
    },
    // Get an element's distance from the top of the page, type: 0 - top, 1 - left
    getTopLeftDistance: function (elem, type) {
        let location = 0;
        if (elem.offsetParent) {
            do {
                location += type === 0 ? elem.offsetTop : elem.offsetLeft;
                elem = elem.offsetParent;
            } while (elem);
        }
        return location >= 0 ? location : 0;
    },
    // Bind multiiple events to a listener
    add_removeListener: function (element, eventNames, listener, type) {
        let events = eventNames.split(" ");
        for (let i = 0, iLen = events.length; i < iLen; i++) {
            type === '0' ? element.addEventListener(events[i], listener, false) : element.removeEventListener(events[i], listener, false);
        }
    },
    // style="pointer-events:none" for iframe when drag event starts
    processIframe: function () {
        this.resizeWidget.querySelectorAll("iframe").forEach(function (item) {
            item.style.pointerEvents = "none";
        });
    },
};
observer.init({
    name: "CoCreateResize",
    observe: ["subtree", "childList"],
    include: ".resize",
    callback: function (mutation) {
        coCreateResize.initElement(mutation.target);
    },
});
export default coCreateResize;