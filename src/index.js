import observer from "@cocreate/observer"
import "./style.css"

let mouseET = "mousemove touchmove"
let mouseST = "mousedown touchstart"
let doc = document.documentElement
let docStyle = document.defaultView.getComputedStyle
let size
const coCreateResize = {
    selector: "",
    resizers: [],
    resizeWidgets: [],
    init: function (handleObj) {
        for (let handleKey in handleObj) if (handleObj.hasOwnProperty(handleKey) && handleKey == "selector") this.selector = handleObj[handleKey]
        this.resizers = document.querySelectorAll(this.selector)
        let _this = this
        this.resizers.forEach(function (resize, idx) {
            let resizeWidget = new CoCreateResize(resize, handleObj)
            _this.resizeWidgets[idx] = resizeWidget
        })
    },
    initElement: function (target) {
        let resizeWidget = new CoCreateResize(target, {dragLeft: "[data-resize_handle='left']", dragRight: "[data-resize_handle='right']", dragTop: "[data-resize_handle='top']", dragBottom: "[data-resize_handle='bottom']"})
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
            size = this.resizeWidget
            this.leftDrag = size.querySelector(handleObj["dragLeft"])
            this.rightDrag = size.querySelector(handleObj["dragRight"])
            this.topDrag = size.querySelector(handleObj["dragTop"])
            this.bottomDrag = size.querySelector(handleObj["dragBottom"])
            this.bindListeners()
            this.initResize()
        }
    },
    initResize: function() {
        this.leftDrag && (this.add_remList(this.leftDrag, mouseET, e => this.checkDragCorner(e, 'leftTop', this.leftDrag, this.topDrag, e => this.initDrag(e, 'left'), e => this.initDrag(e, 'top')), 0), 
                        this.add_remList(this.leftDrag, mouseET, e => this.checkDragCorner(e, 'leftBot', this.leftDrag,this.bottomDrag, e => this.initDrag(e, 'left'), e => this.initDrag(e, 'bot')), 0))
        this.topDrag && (this.add_remList(this.topDrag, mouseET, e => this.checkDragCorner(e, 'topLeft', this.topDrag, this.leftDrag, e => this.initDrag(e, 'top'), e => this.initDrag(e, 'left')), 0), 
                        this.add_remList(this.topDrag, mouseET, e => this.checkDragCorner(e, 'topRight', this.topDrag, this.rightDrag, e => this.initDrag(e, 'top'), e => {this.initDrag(e, 'right')}), 0))
        this.rightDrag && (this.add_remList(this.rightDrag, mouseET, e => this.checkDragCorner(e, 'rightTop', this.rightDrag, this.topDrag, e => this.initDrag(e, 'right'), e => this.initDrag(e, 'top')), 0),
                        this.add_remList(this.rightDrag, mouseET, e => this.checkDragCorner(e, 'rightBot', this.rightDrag, this.bottomDrag, e => this.initDrag(e, 'right'), e => this.initDrag(e, 'bot')), 0))
        this.bottomDrag && (this.add_remList(this.bottomDrag, mouseET, e => this.checkDragCorner(e, 'botLeft', this.bottomDrag, this.leftDrag, e => this.initDrag(e, 'bot'), e => this.initDrag(e, 'left')), 0),
                        this.add_remList(this.bottomDrag, mouseET, e => this.checkDragCorner(e, 'botRight', this.bottomDrag, this.rightDrag, e => this.initDrag(e, 'bot'), e => this.initDrag(e, 'right')), 0))
    },
    initDrag: function (e, type) {
        let left = type === 'left', right = type === 'right', top = type === 'top', bot = type === 'bot'
        this.processIframe()
        this.startTop = parseInt(docStyle(size).top, 10)
        this.startHeight = parseInt(docStyle(size).height, 10)
        this.startLeft = parseInt(docStyle(size).left, 10)
        this.startWidth = parseInt(docStyle(size).width, 10)
        this.startY = e.touches && (top || bot) ? e.touches[0].clientY : e.clientY
        this.startX = e.touches && (left || right) ? e.touches[0].clientX : e.clientX
        top && this.add_remList(doc, mouseET, this.doTopDrag, 0)
        bot && this.add_remList(doc, mouseET, this.doBotDrag, 0)
        right && this.add_remList(doc, mouseET, this.doRightDrag, 0)
        left && this.add_remList(doc, mouseET, this.doLeftDrag, 0)
        this.add_remList(doc, "mouseup touchend", this.stopDrag, 0)
    },
    doTopDrag: function (e) {
        e.touches && (e = e.touches[0])
        let top = this.startTop + e.clientY - this.startY, height = this.startHeight - e.clientY + this.startY
        if (top < 10 || height < 10) return
        size.style.top = top + "px"
        size.style.height = height + "px"
    },
    doBotDrag: function (e) {
        let height = e.touches ? this.startHeight + e.touches[0].clientY - this.startY : this.startHeight + e.clientY - this.startY
        if (height < 10) return
        size.style.height = height + "px"
    },
    doLeftDrag: function (e) {
        if(e.touches) e = e.touches[0]
        let left = this.startLeft + e.clientX - this.startX, width = this.startWidth - e.clientX + this.startX
        if (width < 10) return
        size.style.left = left + "px"
        size.style.width = width + "px"
    },
    doRightDrag: function (e) {
        let width = e.touches ? this.startWidth + e.touches[0].clientX - this.startX : this.startWidth + e.clientX - this.startX
        if (width < 10) return
        size.style.width = width + "px"
    },
    stopDrag: function () {
        size.querySelectorAll("iframe").forEach(function (item) { item.style.pointerEvents = null })
        this.add_remList(doc, mouseET, this.doTopDrag, 1)
        this.add_remList(doc, mouseET, this.doBotDrag, 1)
        this.add_remList(doc, mouseET, this.doLeftDrag, 1)
        this.add_remList(doc, mouseET, this.doRightDrag, 1)
        this.add_remList(doc, mouseET, this.stopDrag, 1)
        this.add_remList(doc, "mouseup touchend", this.stopDrag, 0)
    },
    checkDragCorner: function (e, type, call, com, initDrag1, initDrag2) {
        let topLeft = type === 'topLeft', leftTop = type === 'leftTop', rightTop = type === 'rightTop', topRight = type === 'topRight', botLeft = type === 'botLeft', leftBot = type === 'leftBot', botRight = type === 'botRight', rightBot = type === 'rightBot'
        let offsetPos = topLeft ? e.clientX - this.getTLDistance(this.topDrag, 1) + doc.scrollLeft : leftTop ? e.clientY - this.getTLDistance(this.leftDrag, 0) + doc.scrollTop : (topRight || botRight) ? this.getTLDistance(this.rightDrag, 1) - e.clientX - doc.scrollLeft : rightTop ? e.clientY - this.getTLDistance(this.topDrag, 0) + doc.scrollTop :
                        botLeft ? e.clientX - this.getTLDistance(this.bottomDrag, 1) + doc.scrollLeft : (leftBot || rightBot) ? this.getTLDistance(this.bottomDrag, 0) - e.clientY - doc.scrollTop : null
        if (e.touches) e = e.touches[0]
        this.add_remList(call, mouseST, initDrag1, 1)
        this.add_remList(call, mouseST, initDrag2, 1)
        this.add_remList(call, mouseST, initDrag1, 0)
        if (offsetPos < this.cornerSize && com) {
            this.topDrag.style.cursor = topLeft ? "se-resize" : topRight ? "ne-resize" : "s-resize"
            this.leftDrag.style.cursor = leftTop ? "se-resize" : leftBot ? "ne-resize" : "e-resize"
            this.rightDrag.style.cursor = rightTop ? "ne-resize" : rightBot ? "se-resize" : "e-resize"
            this.bottomDrag.style.cursor = botLeft ? "ne-resize" : botRight ? "se-resize" : "s-resize"
            this.add_remList(call, mouseST, initDrag2, 0)
        }
    },
    bindListeners: function () {
        this.initDrag = this.initDrag.bind(this)
        this.doLeftDrag = this.doLeftDrag.bind(this)
        this.doTopDrag = this.doTopDrag.bind(this)
        this.doRightDrag = this.doRightDrag.bind(this)
        this.doBotDrag = this.doBotDrag.bind(this)
        this.stopDrag = this.stopDrag.bind(this)
        this.checkDragCorner = this.checkDragCorner.bind(this)
    },
    getTLDistance: function (ele, type) {
        let location = 0
        if (ele.offsetParent) {
            do {
                location += type === 0 ? ele.offsetTop : ele.offsetLeft
                ele = ele.offsetParent
            } while (ele)
        }
        return location >= 0 ? location : 0
    },
    add_remList: function (ele, evtNames, listener, type) {
        let evts = evtNames.split(" ")
        for (let i = 0, iLen = evts.length; i < iLen; i++) {
            type === 0 && ele.addEventListener(evts[i], listener, false)
            type === 1 && ele.removeEventListener(evts[i], listener, false)
        }
    },
    processIframe: function () {
        size.querySelectorAll("iframe").forEach(function (item) { item.style.pointerEvents = "none" })
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