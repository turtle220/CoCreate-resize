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
    initResize: function () {
        if (this.leftDrag) {
            this.add_removeListenerMulti(this.leftDrag, "mousemove touchmove", this.checkTopDragTopCorner(e, 0), 0);
            this.add_removeListenerMulti(this.leftDrag, "mousemove touchmove", this.checkBottomDragBottomCorner(e, 0), 0);
        }
        if (this.topDrag) {
            this.add_removeListenerMulti(this.topDrag, "mousemove touchmove", this.checkTopDragTopCorner(e, 1), 0);
        }
        if (this.rightDrag) {
            this.add_removeListenerMulti(this.rightDrag, "mousemove touchmove", this.checkTopDragTopCorner(e, 2), 0);
            this.add_removeListenerMulti(this.rightDrag, "mousemove touchmove", this.checkBottomDragBottomCorner(e, 1), 0);
        }
        if (this.bottomDrag) {
            this.add_removeListenerMulti(this.bottomDrag, "mousemove touchmove", this.checkBottomDragBottomCorner(e, 2), 0);
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
        this.add_removeListenerMulti(document.documentElement, "mouseup touchend", this.stopDrag, 0);
    },
    initTopLeftDrag: function (e) {
        this.initDrag(e);
        this.add_removeListenerMulti(document.documentElement, "mousemove touchmove", this.doTopLeftDrag, 0);
    },
    doTopLeftDrag: function (e) {
        let top, height, left, width;
        if (e.touches) e = e.touches[0];
        left = this.startLeft + e.clientX - this.startX;
        top = this.startTop + e.clientY - this.startY;
        width = this.startWidth - e.clientX + this.startX;
        height = this.startHeight - e.clientY + this.startY;

        if (top < 10 || height < 10 || width < 10) return;
        this.resizeWidget.style.top = top + "px";
        this.resizeWidget.style.height = height + "px";
        this.resizeWidget.style.left = left + "px";
        this.resizeWidget.style.width = width + "px";
    },
    initBottomRightDrag: function (e) {
        this.initDrag(e);
        this.add_removeListenerMulti(document.documentElement, "mousemove touchmove", this.doBottomRightDrag, 0);
    },
    doBottomRightDrag: function (e) {
        let height = width = 0;
        if (e.touches) {
            height = this.startHeight + e.touches[0].clientY - this.startY;
            width = this.startWidth + e.touches[0].clientX - this.startX;
        } else {
            height = this.startHeight + e.clientY - this.startY;
            width = this.startWidth + e.clientX - this.startX;
        }
        if (height < 10 || width < 10) return;
        this.resizeWidget.style.height = height + "px";
        this.resizeWidget.style.width = width + "px";
    },
    stopDrag: function () {
        this.resizeWidget.querySelectorAll("iframe").forEach(function (item) {
            item.style.pointerEvents = null;
        });
        this.add_removeListenerMulti(document.documentElement, "mousemove touchmove", this.doTopLeftDrag, 1);
        this.add_removeListenerMulti(document.documentElement, "mousemove touchmove", this.doBottomRightDrag, 1);
        this.add_removeListenerMulti(document.documentElement, "mouseup touchend", this.stopDrag, 1);
    },
    initStopDrag: function () {
        this.add_removeListenerMulti(this.topDrag, "mousedown touchstart", this.initTopLeftDrag, 1);
        this.add_removeListenerMulti(this.topDrag, "mousedown touchstart", this.initBottomRightDrag, 1);
        this.add_removeListenerMulti(this.topDrag, "mousedown touchstart", this.initTopLeftDrag, 0);
        this.add_removeListenerMulti(this.rightDrag, "mousedown touchstart", this.initBottomRightDrag, 0);
    },
    checkTopDragTopCorner: function (e, type) {
        let offsetX, offsetY,
        scrollLeft = document.documentElement.scrollLeft;
        scrollTop = document.documentElement.scrollTop;
        if (e.touches) e = e.touches[0];
        offsetX = e.clientX - this.getTopLeftDistance(this.topDrag, 1) + scrollLeft;
        offsetY = e.clientY - this.getTopLeftDistance(this.leftDrag, 0) + scrollTop;

        this.initStopDrag();

        if ( type === '0' && offsetX < this.cornerSize && this.leftDrag) {
            this.topDrag.style.cursor = "se-resize";
            this.add_removeListenerMulti(this.topDrag, "mousedown touchstart", this.initTopLeftDrag, 0);
        } else this.topDrag.style.cursor = "s-resize";
    
        if ( type === '1' && this.rightDrag) {
            offsetX = this.getTopLeftDistance(this.rightDrag, 1) - e.clientX - scrollLeft;
            if (offsetX < this.cornerSize) {
                this.topDrag.style.cursor = "ne-resize";
                this.add_removeListenerMulti(this.topDrag, "mousedown touchstart", this.initBottomRightDrag, 0);
            } else if (!this.leftDrag) {
                this.topDrag.style.cursor = "s-resize";
            }
        }
        if ( type === '2' && this.topDrag) {
            offsetY = e.clientY - this.getTopLeftDistance(this.topDrag, 0) + scrollTop;
            if (offsetY < this.cornerSize) {
                this.rightDrag.style.cursor = "ne-resize";
                this.add_removeListenerMulti(this.rightDrag, "mousedown touchstart", this.initTopLeftDrag, 0);
            } else this.rightDrag.style.cursor = "e-resize";
        }
        
    },
    checkBottomDragBottomCorner: function (e, type) {
        let offsetX, offsetY,
            scrollLeft = document.documentElement.scrollLeft;
            scrollTop = document.documentElement.scrollTop;
        if (e.touches) e = e.touches[0];
        offsetX = e.clientX - this.getTopLeftDistance(this.bottomDrag, 1) + scrollLeft;
        this.initStopDrag();
        if (type === '0' && offsetX < this.cornerSize && this.leftDrag) {
            this.bottomDrag.style.cursor = "ne-resize";
            this.add_removeListenerMulti(this.bottomDrag, "mousedown touchstart", this.initTopLeftDrag, 0);
        } else this.bottomDrag.style.cursor = "s-resize";
        if (type === '1' && this.bottomDrag) {
            offsetY = this.getTopLeftDistance(this.bottomDrag, 0) - e.clientY - scrollTop;
            if (offsetY < this.cornerSize) {
                this.leftDrag.style.cursor = "ne-resize";
                this.add_removeListenerMulti(this.leftDrag, "mousedown touchstart", this.initBottomRightDrag, 0);
            } else if (!this.topDrag) {
                this.leftDrag.style.cursor = "e-resize";
            }
        }
        if (type === '2' && this.rightDrag) {
            offsetX = this.getTopLeftDistance(this.rightDrag, 1) - e.clientX - scrollLeft;
            if (offsetX < this.cornerSize) {
                this.bottomDrag.style.cursor = "se-resize";
                this.add_removeListenerMulti(this.bottomDrag, "mousedown touchstart", this.initBottomRightDrag, 0);
            } else if (!this.leftDrag) {
                this.bottomDrag.style.cursor = "s-resize";
            }
        }
    },
    bindListeners: function () {
        this.initTopLeftDrag = this.initTopLeftDrag.bind(this);
        this.doTopLeftDrag = this.doTopLeftDrag.bind(this);
        this.initBottomRightDrag = this.initBottomRightDrag.bind(this);
        this.doBottomRightDrag = this.doBottomRightDrag.bind(this);
        this.stopDrag = this.stopDrag.bind(this);
        this.initDrag = this.initDrag.bind(this);
        this.initStopDrag = this.initStopDrag.bind(this);
        this.checkTopDragTopCorner = this.checkTopDragTopCorner.bind(this);
        this.checkBottomDragBottomCorner = this.checkBottomDragBottomCorner.bind(this);
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
    add_removeListenerMulti: function (element, eventNames, listener, type) {
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
