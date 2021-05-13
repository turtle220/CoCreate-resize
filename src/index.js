import observer from "@cocreate/observer"
import "./style.css"

const peak = ['left', 'right', 'top', 'bottom']
const mouseEvt = "mousemove touchmove"
const mouseStart = "mousedown touchstart"
const doc = document.documentElement
const docStyle = document.defaultView.getComputedStyle(this.resizeWidget)
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
        let resizeWidget = new CoCreateResize(target, {dragLeft: "[data-resize_handle='left']", dragRight: "[data-resize_handle='right']",
                            dragTop: "[data-resize_handle='top']", dragBottom: "[data-resize_handle='bottom']",})
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
        this.leftDrag && (this.add_remList(this.leftDrag, mouseEvt, e => this.checkDragCorner(e, 'leftTop', this.leftDrag, this.topDrag, e => this.initDrag(e, 'left'), e => this.initDrag(e, 'top')), 'add'), 
                        this.add_remList(this.leftDrag, mouseEvt, e => this.checkDragCorner(e, 'leftBot', this.leftDrag,this.bottomDrag, e => this.initDrag(e, 'left'), e => this.initDrag(e, 'bottom')), 'add'))
        this.topDrag && (this.add_remList(this.topDrag, mouseEvt, e => this.checkDragCorner(e, 'topLeft', this.topDrag, this.leftDrag, e => this.initDrag(e, 'top'), e => this.initDrag(e, 'left')), 'add'), 
                        this.add_remList(this.topDrag, mouseEvt, e => this.checkDragCorner(e, 'topRight', this.topDrag, this.rightDrag, e => this.initDrag(e, 'top'), e => {this.initDrag(e, 'right')}), 'add'))
        this.rightDrag && (this.add_remList(this.rightDrag, mouseEvt, e => this.checkDragCorner(e, 'rightTop', this.rightDrag, this.topDrag, e => this.initDrag(e, 'right'), e => this.initDrag(e, 'top')), 'add'),
                        this.add_remList(this.rightDrag, mouseEvt, e => this.checkDragCorner(e, 'rightBot', this.rightDrag, this.bottomDrag, e => this.initDrag(e, 'right'), e => this.initDrag(e, 'bottom')), 'add'))
        this.bottomDrag && (this.add_remList(this.bottomDrag, mouseEvt, e => this.checkDragCorner(e, 'botLeft', this.bottomDrag, this.leftDrag, e => this.initDrag(e, 'bottom'), e => this.initDrag(e, 'left')), 'add'),
                        this.add_remList(this.bottomDrag, mouseEvt, e => this.checkDragCorner(e, 'botRight', this.bottomDrag, this.rightDrag, e => this.initDrag(e, 'bottom'), e => this.initDrag(e, 'right')), 'add'))
    },
    initDrag: function (e, type) {
        let left = type === peak[0]
        let right = type === peak[1]
        let top = type === peak[2]
        let bot = type === peak[3]
        this.processIframe()
        this.startTop = parseInt(docStyle(this.resizeWidget).top, 10)
        this.startHeight = parseInt(docStyle(this.resizeWidget).height, 10)
        this.startLeft = parseInt(docStyle(this.resizeWidget).left, 10)
        this.startWidth = parseInt(docStyle(this.resizeWidget).width, 10)
        this.startY = e.touches && (top || bot) ? e.touches[0].clientY : e.clientY
        this.startX = e.touches && (left || right) ? e.touches[0].clientX : e.clientX
        top && this.add_remList(doc, mouseEvt, this.doTopDrag, 'add')
        bot && this.add_remList(doc, mouseEvt, this.doBottomDrag, 'add')
        right && this.add_remList(doc, mouseEvt, this.doRightDrag, 'add')
        left && this.add_remList(doc, mouseEvt, this.doLeftDrag, 'add')
        this.add_remList(doc, "mouseup touchend", this.stopDrag, 'add')
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
        if(e.touches) e = e.touches[0]
        let left = this.startLeft + e.clientX - this.startX
        let width = this.startWidth - e.clientX + this.startX
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
        this.add_remList(doc, mouseEvt, this.doTopDrag, 'remove')
        this.add_remList(doc, mouseEvt, this.doBottomDrag, 'remove')
        this.add_remList(doc, mouseEvt, this.doLeftDrag, 'remove')
        this.add_remList(doc, mouseEvt, this.doRightDrag, 'remove')
        this.add_remList(doc, mouseEvt, this.stopDrag, 'remove')
    },
    checkDragCorner: function (e, type, callFunc1, callFunc2, initDrag1, initDrag2) {
        let topLeft = type === 'topLeft'
        let leftTop = type === 'leftTop'
        let rightTop = type === 'rightTop'
        let topRight = type === 'topRight'
        let botLeft = type === 'botLeft'
        let leftBot = type === 'leftBot'
        let botRight = type === 'botRight'
        let rightBot = type === 'rightBot'
        if (e.touches) e = e.touches[0]
        let offsetPos = topLeft ? e.clientX - this.getT_LDistance(this.topDrag, 1) + doc.scrollLeft :
                    leftTop ? e.clientY - this.getT_LDistance(this.leftDrag, 0) + doc.scrollTop :
                    topRight || botRight ? this.getT_LDistance(this.rightDrag, 1) - e.clientX - doc.scrollLeft :
                    rightTop ? e.clientY - this.getT_LDistance(this.topDrag, 0) + doc.scrollTop :
                    botLeft ? e.clientX - this.getT_LDistance(this.bottomDrag, 1) + doc.scrollLeft :
                    leftBot || rightBot? this.getT_LDistance(this.bottomDrag, 0) - e.clientY - doc.scrollTop : null
        this.add_remList(callFunc1, mouseStart, initDrag1, 'remove')
        this.add_remList(callFunc1, mouseStart, initDrag2, 'remove')
        this.add_remList(callFunc1, mouseStart, initDrag1, 'add')
        if (offsetPos < this.cornerSize && callFunc2) {
            this.topDrag.style.cursor = topLeft ? "se-resize" : topRight ? "ne-resize" : "s-resize"
            this.leftDrag.style.cursor = leftTop ? "se-resize" : leftBot ? "ne-resize" : "e-resize"
            this.rightDrag.style.cursor = rightTop ? "ne-resize" : rightBot ? "se-resize" : "e-resize"
            this.bottomDrag.style.cursor = botLeft ? "ne-resize" : botRight ? "se-resize" : "s-resize"
            this.add_remList(callFunc1, mouseStart, initDrag2, 'add')
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
    getT_LDistance: function (elem, type) {
        var location = 0
        if (elem.offsetParent) {
            do {
                location += type === 0 ? elem.offsetTop : elem.offsetLeft
                elem = elem.offsetParent
            } while (elem)
        }
        return location >= 0 ? location : 0
    },
    add_remList: function (element, eventNames, listener, type) {
        var events = eventNames.split(" ")
        for (var i = 0, iLen = events.length; i < iLen; i++) {
            type === 'add' && element.addEventListener(events[i], listener, false)
            type === 'remove' && element.removeEventListener(events[i], listener, false)
        }
    },
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