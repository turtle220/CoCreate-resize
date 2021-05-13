import observer from "@cocreate/observer"
import "./style.css"

const arr = ['topLeft', 'leftTop', 'rightTop', 'topRight', 'botLeft', 'leftBot', 'botRight', 'rightBot']
const peak = ['left', 'right', 'top', 'bottom']
const mouseEvt = "mousemove touchmove"
const mouseStart = "mousedown touchstart"
const doc = document.documentElement
const coCreateResize = {
    selector: "",
    resizers: [],
    resizeWidgets: [],
    init: function (handleObj) {
        for (var handleKey in handleObj) if (handleObj.hasOwnProperty(handleKey) && handleKey == "selector") this.selector = handleObj[handleKey]
        this.resizers = document.querySelectorAll(this.selector)
        var _this = this
        this.resizers.forEach(function (resize, idx) {
            let resizeWidget = new CoCreateResize(resize, handleObj)
            _this.resizeWidgets[idx] = resizeWidget
        })
    },
    initElement: function (target) {
        let resizeWidget = new CoCreateResize(target, {
            dragLeft: "[data-resize_handle='left']",
            dragRight: "[data-resize_handle='right']",
            dragTop: "[data-resize_handle='top']",
            dragBottom: "[data-resize_handle='bottom']",
        })
        this.resizeWidgets[0] = resizeWidget
    },
}
function CoCreateResize(resizer, options) {
    this.resizeWidget = resizer
    this.cornerSize = 10
    this.init(options)
}
CoCreateResize.prototype = {
    init: function (handleObj) {
        if (this.resizeWidget) {
            this.leftDrag = this.resizeWidget.querySelector(handleObj["dragLeft"])
            this.rightDrag = this.resizeWidget.querySelector(handleObj["dragRight"])
            this.topDrag = this.resizeWidget.querySelector(handleObj["dragTop"])
            this.bottomDrag = this.resizeWidget.querySelector(handleObj["dragBottom"])
            this.bindListeners()
            this.initResize()
        }
    },
    initResize: function () {
        this.leftDrag && (this.addremoveList(this.leftDrag, mouseEvt, e => this.checkDragCorner(e, 'leftTop', this.leftDrag, this.topDrag, e => this.initDrag(e, 'left'), e => this.initDrag(e, 'top')), 'add'), this.addremoveList(this.leftDrag, mouseEvt, e => this.checkDragCorner(e, 'leftBot', this.leftDrag,this.bottomDrag, e => this.initDrag(e, 'left'), e => this.initDrag(e, 'bottom')), 'add'))
        this.topDrag && (this.addremoveList(this.topDrag, mouseEvt, e => this.checkDragCorner(e, 'topLeft', this.topDrag, this.leftDrag, e => this.initDrag(e, 'top'), e => this.initDrag(e, 'left')), 'add'), this.addremoveList(this.topDrag, mouseEvt, e => this.checkDragCorner(e, 'topRight', this.topDrag, this.rightDrag, e => this.initDrag(e, 'top'), e => {this.initDrag(e, 'right')}), 'add'))
        this.rightDrag && (this.addremoveList(this.rightDrag, mouseEvt, e => this.checkDragCorner(e, 'rightTop', this.rightDrag, this.topDrag, e => this.initDrag(e, 'right'), e => this.initDrag(e, 'top')), 'add'), this.addremoveList(this.rightDrag, mouseEvt, e => this.checkDragCorner(e, 'rightBot', this.rightDrag, this.bottomDrag, e => this.initDrag(e, 'right'), e => this.initDrag(e, 'bottom')), 'add'))
        this.bottomDrag && (this.addremoveList(this.bottomDrag, mouseEvt, e => this.checkDragCorner(e, 'botLeft', this.bottomDrag, this.leftDrag, e => this.initDrag(e, 'bottom'), e => this.initDrag(e, 'left')), 'add'), this.addremoveList(this.bottomDrag, mouseEvt, e => this.checkDragCorner(e, 'botRight', this.bottomDrag, this.rightDrag, e => this.initDrag(e, 'bottom'), e => this.initDrag(e, 'right')), 'add'))
    },
    initDrag: function (e, type) {
        let left = type === peak[0]
        let right = type === peak[1]
        let top = type === peak[2]
        let bot = type === peak[3]
        this.processIframe()
        this.startTop = parseInt(document.defaultView.getComputedStyle(this.resizeWidget).top, 10)
        this.startHeight = parseInt(document.defaultView.getComputedStyle(this.resizeWidget).height, 10)
        this.startLeft = parseInt(document.defaultView.getComputedStyle(this.resizeWidget).left, 10)
        this.startWidth = parseInt(document.defaultView.getComputedStyle(this.resizeWidget).width, 10)
        this.startY = e.touches && (top || bot) ? e.touches[0].clientY : e.clientY
        this.startX = e.touches && (left || right) ? e.touches[0].clientX : e.clientX
        top && this.addremoveList(doc, mouseEvt, this.doTopDrag, 'add')
        bot && this.addremoveList(doc, mouseEvt, this.doBottomDrag, 'add')
        right && this.addremoveList(doc, mouseEvt, this.doRightDrag, 'add')
        left && this.addremoveList(doc, mouseEvt, this.doLeftDrag, 'add')
        this.addremoveList(doc, "mouseup touchend", this.stopDrag, 'add')
    },
    doTopDrag: function (e) {
        if(e.touches) e = e.touches[0]
        let top = this.startTop + e.clientY - this.startY
        let height = this.startHeight - e.clientY + this.startY
        if (top < 10 || height < 10) return
        this.resizeWidget.style.top = top + "px"
        this.resizeWidget.style.height = height + "px"
    },
    doBottomDrag: function (e) {
        let height = 0
        height = e.touches ? (this.startHeight + e.touches[0].clientY - this.startY) : this.startHeight + e.clientY - this.startY
        if (height < 10) return
        this.resizeWidget.style.height = height + "px"
    },
    doLeftDrag: function (e) {
        let left, width
        if(e.touches) e = e.touches[0]
        left = this.startLeft + e.clientX - this.startX
        width = this.startWidth - e.clientX + this.startX
        if (width < 10) return
        this.resizeWidget.style.left = left + "px"
        this.resizeWidget.style.width = width + "px"
    },
    doRightDrag: function (e) {
        let width = 0
        width = e.touches ? (this.startWidth + e.touches[0].clientX - this.startX) : (this.startWidth + e.clientX - this.startX)
        if (width < 10) return
        this.resizeWidget.style.width = width + "px"
    },
    stopDrag: function () {
        this.resizeWidget.querySelectorAll("iframe").forEach(function (item) {
            item.style.pointerEvents = null
        })
        this.addremoveList(doc, mouseEvt, this.doTopDrag, 'remove')
        this.addremoveList(doc, mouseEvt, this.doBottomDrag, 'remove')
        this.addremoveList(doc, mouseEvt, this.doLeftDrag, 'remove')
        this.addremoveList(doc, mouseEvt, this.doRightDrag, 'remove')
        this.addremoveList(doc, mouseEvt, this.stopDrag, 'remove')
    },
    checkDragCorner: function (e, type, callFunc1, callFunc2, initDrag1, initDrag2) {
        let topLeft = type === arr[0]
        let leftTop = type === arr[1]
        let rightTop = type === arr[2]
        let topRight = type === arr[3]
        let botLeft = type === arr[4]
        let leftBot = type === arr[5]
        let botRight = type === arr[6]
        let rightBot = type === arr[7]
        let offsetPos
        if (e.touches) e = e.touches[0]
        offsetPos = topLeft ? e.clientX - this.getTopLeftDistance(this.topDrag, 1) + doc.scrollLeft :
                    leftTop ? e.clientY - this.getTopLeftDistance(this.leftDrag, 0) + doc.scrollTop :
                    topRight || botRight ? this.getTopLeftDistance(this.rightDrag, 1) - e.clientX - doc.scrollLeft :
                    rightTop ? e.clientY - this.getTopLeftDistance(this.topDrag, 0) + doc.scrollTop :
                    botLeft ? e.clientX - this.getTopLeftDistance(this.bottomDrag, 1) + doc.scrollLeft :
                    leftBot || rightBot? this.getTopLeftDistance(this.bottomDrag, 0) - e.clientY - doc.scrollTop : null
        this.addremoveList(callFunc1, mouseStart, initDrag1, 'remove')
        this.addremoveList(callFunc1, mouseStart, initDrag2, 'remove')
        this.addremoveList(callFunc1, mouseStart, initDrag1, 'add')
        if (offsetPos < this.cornerSize && callFunc2) {
            this.topDrag.style.cursor = topLeft ? "se-resize" : topRight ? "ne-resize" : "s-resize"
            this.leftDrag.style.cursor = leftTop ? "se-resize" : leftBot ? "ne-resize" : "e-resize"
            this.rightDrag.style.cursor = rightTop ? "ne-resize" : rightBot ? "se-resize" : "e-resize"
            this.bottomDrag.style.cursor = botLeft ? "ne-resize" : botRight ? "se-resize" : "s-resize"
            this.addremoveList(callFunc1, mouseStart, initDrag2, 'add')
        }
    },
    bindListeners: function () {
        this.initDrag = this.initDrag.bind(this)
        this.doLeftDrag = this.doLeftDrag.bind(this)
        this.doTopDrag = this.doTopDrag.bind(this)
        this.doRightDrag = this.doRightDrag.bind(this)
        this.doBottomDrag = this.doBottomDrag.bind(this)
        this.stopDrag = this.stopDrag.bind(this)
        this.checkDragCorner = this.checkDragCorner.bind(this)
    },
    // Get an element's distance from the top of the page, type: 0 - top, 1 - left
    getTopLeftDistance: function (elem, type) {
        var location = 0
        if (elem.offsetParent) {
            do {
                location += type === 0 ? elem.offsetTop : elem.offsetLeft
                elem = elem.offsetParent
            } while (elem)
        }
        return location >= 0 ? location : 0
    },
    // Bind multiiple events to a listener
    addremoveList: function (element, eventNames, listener, type) {
        var events = eventNames.split(" ")
        for (var i = 0, iLen = events.length; i < iLen; i++) {
            type === 'add' && element.addEventListener(events[i], listener, false)
            type === 'remove' && element.removeEventListener(events[i], listener, false)
        }
    },
    // style="pointer-events:none" for iframe when drag event starts
    processIframe: function () {
        this.resizeWidget.querySelectorAll("iframe").forEach(function (item) {
            item.style.pointerEvents = "none"
        })
    },
}
observer.init({
    name: "CoCreateResize",
    observe: ["subtree", "childList"],
    include: ".resize",
    callback: function (mutation) {
        coCreateResize.initElement(mutation.target)
    },
})
export default coCreateResize