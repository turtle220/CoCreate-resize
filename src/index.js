// "use strict";
import observer from "@cocreate/observer";
import "./style.css";

const checkArr = ['topLeft', 'leftTop', 'rightTop', 'topRight', 'bottomLeft', 'leftBottom', 'bottomRight', 'rightBottom']
const coCreateResize = {
    selector: "", //'.resize',
    resizers: [],
    resizeWidgets: [],
    init: function (handleObj) {
        for (var handleKey in handleObj) if (handleObj.hasOwnProperty(handleKey) && handleKey == "selector") this.selector = handleObj[handleKey];
        this.resizers = document.querySelectorAll(this.selector);
        var _this = this;
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
            this.addremoveListener(this.leftDrag, "mousemove touchmove", (e) => {this.checkDragCorner(e, 'leftTop', this.leftDrag, this.topDrag, this.initLeftDrag, this.initTopDrag)}, 'add');
            this.addremoveListener(this.leftDrag, "mousemove touchmove", (e) => {this.checkDragCorner(e, 'leftBottom', this.leftDrag,this.bottomDrag, this.initLeftDrag, this.initBottomDrag)}, 'add');
        }
        if (this.topDrag) {
            this.addremoveListener(this.topDrag, "mousemove touchmove", (e) => {this.checkDragCorner(e, 'topLeft', this.topDrag, this.leftDrag, this.initTopDrag, this.initLeftDrag)}, 'add');
            this.addremoveListener(this.topDrag, "mousemove touchmove", (e) => {this.checkDragCorner(e, 'topRight', this.topDrag, this.rightDrag, this.initTopDrag, this.initRightDrag)}, 'add');
        }
        if (this.rightDrag) {
            this.addremoveListener(this.rightDrag, "mousemove touchmove", (e) => {this.checkDragCorner(e, 'rightTop', this.rightDrag, this.topDrag, this.initRightDrag, this.initTopDrag)}, 'add');
            this.addremoveListener(this.rightDrag, "mousemove touchmove", (e) => {this.checkDragCorner(e, 'rightBottom', this.rightDrag, this.bottomDrag, this.initRightDrag, this.initBottomDrag)}, 'add');
        }
        if (this.bottomDrag) {
            this.addremoveListener(this.bottomDrag, "mousemove touchmove", (e) => {this.checkDragCorner(e, 'bottomLeft', this.bottomDrag, this.leftDrag, this.initBottomDrag, this.initLeftDrag)}, 'add');
            this.addremoveListener(this.bottomDrag, "mousemove touchmove", (e) => {this.checkDragCorner(e, 'bottomRight', this.bottomDrag, this.rightDrag, this.initBottomDrag, this.initRightDrag)}, 'add');
        }
    },
    initDrag: function () {
        this.processIframe();
        this.startTop = parseInt(document.defaultView.getComputedStyle(this.resizeWidget).top, 10);
        this.startHeight = parseInt(document.defaultView.getComputedStyle(this.resizeWidget).height, 10);
        this.startLeft = parseInt(document.defaultView.getComputedStyle(this.resizeWidget).left, 10);
        this.startWidth = parseInt(document.defaultView.getComputedStyle(this.resizeWidget).width, 10);
        this.addremoveListener(document.documentElement, "mouseup touchend", this.stopDrag, 'add');

    },
    initTopDrag: function (e) {
        this.initDrag();
        if (e.touches) this.startY = e.touches[0].clientY;
        else this.startY = e.clientY;
        this.addremoveListener(document.documentElement, "mousemove touchmove", this.doTopDrag, 'add');
    },
    doTopDrag: function (e) {
        if (e.touches) e = e.touches[0];
        let top = this.startTop + e.clientY - this.startY;
        let height = this.startHeight - e.clientY + this.startY;
        if (top < 10 || height < 10) return;
        this.resizeWidget.style.top = top + "px";
        this.resizeWidget.style.height = height + "px";
    },
    initBottomDrag: function (e) {
        this.initDrag();
        if (e.touches) this.startY = e.touches[0].clientY;
        else this.startY = e.clientY;
        this.addremoveListener(document.documentElement, "mousemove touchmove", this.doBottomDrag, 'add');
    },
    doBottomDrag: function (e) {
        let height = 0;
        if (e.touches) height = this.startHeight + e.touches[0].clientY - this.startY;
        else height = this.startHeight + e.clientY - this.startY;
        if (height < 10) return;
        this.resizeWidget.style.height = height + "px";
    },
    initLeftDrag: function (e) {
        this.initDrag();
        if (e.touches) this.startX = e.touches[0].clientX;
        else this.startX = e.clientX;
        this.addremoveListener(document.documentElement, "mousemove touchmove", this.doLeftDrag, 'add');
    },
    doLeftDrag: function (e) {
        let left, width;
        console.log('---left', e)
        if (e.touches) e = e.touches[0];
        left = this.startLeft + e.clientX - this.startX;
        width = this.startWidth - e.clientX + this.startX;
        if (width < 10) return;
        this.resizeWidget.style.left = left + "px";
        this.resizeWidget.style.width = width + "px";
    },
    initRightDrag: function (e) {
        this.initDrag();
        if (e.touches) this.startX = e.touches[0].clientX;
        else this.startX = e.clientX;
        this.addremoveListener(document.documentElement, "mousemove touchmove", this.doRightDrag, 'add');
    },
    doRightDrag: function (e) {
        let width = 0;
        if (e.touches) width = this.startWidth + e.touches[0].clientX - this.startX;
        else width = this.startWidth + e.clientX - this.startX;
        if (width < 10) return;
        this.resizeWidget.style.width = width + "px";
    },

    stopDrag: function (e) {
        this.resizeWidget.querySelectorAll("iframe").forEach(function (item) {
            item.style.pointerEvents = null;
        });
        this.addremoveListener(document.documentElement, "mousemove touchmove", this.doTopDrag, 'remove');
        this.addremoveListener(document.documentElement, "mousemove touchmove", this.doBottomDrag, 'remove');
        this.addremoveListener(document.documentElement, "mousemove touchmove", this.doLeftDrag, 'remove');
        this.addremoveListener(document.documentElement, "mousemove touchmove", this.doRightDrag, 'remove');
        this.addremoveListener(document.documentElement, "mouseup touchend", this.stopDrag, 'remove');
    },

    checkDragCorner: function (e, type, callFunc1, callFunc2, initDrag1, initDrag2) {
        let topLeftDrag = type === checkArr[0]
        let leftTopDrag = type === checkArr[1]
        let rightTopDrag = type === checkArr[2]
        let topRightDrag = type === checkArr[3]
        let botLeftDrag = type === checkArr[4]
        let leftBotDrag = type === checkArr[5]
        let botRightDrag = type === checkArr[6]
        let rightBotDrag = type === checkArr[7]
        let offsetPos;

        if (e.touches) e = e.touches[0];
        offsetPos = topLeftDrag ? e.clientX - this.getTopLeftDistance(this.topDrag, 1) + document.documentElement.scrollLeft : 
                    leftTopDrag ? e.clientY - this.getTopLeftDistance(this.leftDrag, 0) + document.documentElement.scrollTop :
                    topRightDrag ? this.getTopLeftDistance(this.rightDrag, 1) - e.clientX - document.documentElement.scrollLeft : 
                    rightTopDrag ? e.clientY - this.getTopLeftDistance(this.topDrag, 0) + document.documentElement.scrollTop : 
                    botLeftDrag ? e.clientX - this.getTopLeftDistance(this.bottomDrag, 1) + document.documentElement.scrollLeft : 
                    leftBotDrag || rightBotDrag? this.getTopLeftDistance(this.bottomDrag, 0) - e.clientY - document.documentElement.scrollTop : 
                    botRightDrag ? this.getTopLeftDistance(this.rightDrag, 1) - e.clientX - document.documentElement.scrollLeft : null;                    
                    
        this.addremoveListener(callFunc1, "mousedown touchstart", initDrag1, 'remove');
        this.addremoveListener(callFunc1, "mousedown touchstart", initDrag2, 'remove');
        this.addremoveListener(callFunc1, "mousedown touchstart", initDrag1, 'add');

        if (offsetPos < this.cornerSize && callFunc2) {
            this.topDrag.style.cursor = topLeftDrag ? "se-resize" : topRightDrag ? "ne-resize" : "s-resize"
            this.leftDrag.style.cursor = leftTopDrag ? "se-resize" : leftBotDrag ? "ne-resize" : "e-resize"
            this.rightDrag.style.cursor = rightTopDrag ? "ne-resize" : rightBotDrag ? "se-resize" : "e-resize"
            this.bottomDrag.style.cursor = botLeftDrag ? "ne-resize" : botRightDrag ? "se-resize" : "s-resize"
            this.addremoveListener(callFunc1, "mousedown touchstart", initDrag2, 'add');
        }
    },

    bindListeners: function () {
        this.initLeftDrag = this.initLeftDrag.bind(this);
        this.doLeftDrag = this.doLeftDrag.bind(this);
        this.initTopDrag = this.initTopDrag.bind(this);
        this.doTopDrag = this.doTopDrag.bind(this);
        this.initRightDrag = this.initRightDrag.bind(this);
        this.doRightDrag = this.doRightDrag.bind(this);
        this.initBottomDrag = this.initBottomDrag.bind(this);
        this.doBottomDrag = this.doBottomDrag.bind(this);
        this.stopDrag = this.stopDrag.bind(this);
        this.checkDragCorner = this.checkDragCorner.bind(this);
    },
    // Get an element's distance from the top of the page, type: 0 - top, 1 - left
    getTopLeftDistance: function (elem, type) {
        var location = 0;
        if (elem.offsetParent) {
            do {
                location += type === 0 ? elem.offsetTop : elem.offsetLeft;
                elem = elem.offsetParent;
            } while (elem);
        }
        return location >= 0 ? location : 0;
    },
    // Bind multiiple events to a listener
    addremoveListener: function (element, eventNames, listener, type) {
        var events = eventNames.split(" ");
        for (var i = 0, iLen = events.length; i < iLen; i++) {
            type === 'add' && element.addEventListener(events[i], listener, false)
            type === 'remove' && element.removeEventListener(events[i], listener, false)
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
