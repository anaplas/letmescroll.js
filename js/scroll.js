
/*-------------------------
LetMeScroll.js
Made by: Bruno Vieira
--------------------------- */

class LetMeScroll {

    constructor(options) {

        const defaults = {
            selector : 'defaultId',
            config : {
                dimensions : {
                    width : "100%",
                    height : "500px"
                },
                scroll : {
                    bottomOffset: 0
                }
            },
            onEnd: function(){},
            onTop: function(){},
            onMove: function(){},
            onDragStart: function(){}
        };      

        // Scroll Random ID
        var randomID = Math.floor(Math.random() * (9999 - 0 + 1)) + 0;
        
        this.selector = options.selector.substring(1) || defaults.selector.substring(1);
        this.onEnd = options.onEnd || defaults.onEnd;
        this.onTop = options.onTop || defaults.onTop;
        this.onMove = options.onMove || defaults.onMove;
        this.onDragStart = options.onDragStart || defaults.onDragStart;
        this.onDragStop = options.onDragStop || defaults.onDragStop;

        // Get default dimensions
        options.config.dimensions == undefined ? options.config.dimensions = defaults.config.dimensions : options.config.dimensions
        for(var key in defaults.config.dimensions)
        { options.config.dimensions[key] == undefined ? options.config.dimensions[key] = defaults.config.dimensions[key] :  options.config.dimensions[key] = options.config.dimensions[key];}

        options.config.scroll == undefined ? options.config.scroll = defaults.config.scroll : options.config.scroll
        for(var key in defaults.config.scroll)
        { options.config.scroll[key] == undefined ? options.config.scroll[key] = defaults.config.scroll[key] :  options.config.scroll[key] = options.config.scroll[key];}

        // Global
        let _this = this;
        let scrollContainer = 0;
        let scrollContentWrapper = 0;
        let scrollContent = 0;
        let contentPosition = 0;
        let scrollerBeingDragged = false;
        let scroller = 0;
        let topPosition;
        let scrollerHeight;
        let normalizedPosition = 1;
        let reachedBottom = false;

        /*
        ** Detect OS
        */
        function androidOrIOS() {
            const userAgent = navigator.userAgent;
            if (/android/i.test(userAgent)){
                return 'android';
            }
            if (/iPad|iPhone|iPod/i.test(userAgent)){
                return 'ios';
            }
        }

        /*
        ** Calculate Scrollbar Height
        */
        var calculateScrollerHeight = this.calculateScrollerHeight = function calculateScrollerHeight(evt) {
            var visibleRatio = scrollContainer.offsetHeight / scrollContentWrapper.scrollHeight;
            return visibleRatio * scrollContainer.offsetHeight;
        }

        /*
        ** Move Scroll
        */
        var moveScroller = this.moveScroller = function moveScroller(evt) {
            
            // Move Scroll bar to top offset
            var scrollPercentage = evt.target.scrollTop / scrollContentWrapper.scrollHeight;
            topPosition = scrollPercentage * scrollContainer.offsetHeight;
            scroller.style.top = topPosition + 'px';

            // Dispatch event when movement is detected
            if (typeof _this.onMove == "function") { _this.onMove(); } 

            // Check if scroll reached end, if yes callback to function
            let bottomOffset = Number(scrollContentWrapper.scrollTopMax) - Number(options.config.scroll.bottomOffset);
            if(evt.target.scrollTop >= bottomOffset || evt.target.scrollTop == scrollContentWrapper.scrollTopMax)
            {
                if(reachedBottom == false){ if (typeof _this.onEnd == "function") { _this.onEnd(); } reachedBottom = true; }
            } else { reachedBottom = false; }

            if(evt.target.scrollTop <= 0)
            {
                if (typeof _this.onTop == "function") { _this.onTop(); }
            }

        }

        /*
        ** Start Drag Event
        */
        var startDrag = this.startDrag = function startDrag(evt) {

            normalizedPosition = evt.pageY;
            contentPosition = scrollContentWrapper.scrollTop;
            scrollerBeingDragged = true;

            // Dispatch event when drag is starting
            if (typeof _this.onDragStart == "function") { _this.onDragStart(); } 
        }

        /*
        ** Stop Drag Event
        */
        var stopDrag = this.stopDrag = function stopDrag(evt) {

            // Dispatch event when drag is stoppped
            scrollerBeingDragged = false;
        }

        /*
        ** Scrollbar Event
        */
        var scrollBarScroll = this.scrollBarScroll = function scrollBarScroll(evt) {
            if (scrollerBeingDragged === true) {
                var mouseDifferential = evt.pageY - normalizedPosition;
                var scrollEquivalent = mouseDifferential * (scrollContentWrapper.scrollHeight / scrollContainer.offsetHeight);
                scrollContentWrapper.scrollTop = contentPosition + scrollEquivalent;
            }
        }

        /*
        ** Refresh scrollbar height
        */
        var refreshScroll = this.refreshScroll = function refreshScroll(evt) {
        
            scrollerHeight = calculateScrollerHeight();
            scroller.style.height = scrollerHeight + 'px';
        }

        /*
        ** Main throttle function
        */
        function throttle (func, interval) {
            var timeout;
            return function() {
                var context = this, args = arguments;
                var later = function () {
                    timeout = false;
                };
                if (!timeout) {
                    func.apply(context, args)
                    timeout = true;
                    setTimeout(later, interval)
                }
            }
        }

        /*
        ** Scroll Structure
        */
        var SetupScroll = this.SetupScroll = function SetupScroll() {

            // Obter o element
            let selectorElement = document.getElementById(this.selector);

            selectorElement.classList.add("lms_scrollable");
            selectorElement.style.cssText = 'width:'+options.config.dimensions.width+';height:'+options.config.dimensions.height;

            let selectorElementHTML = selectorElement.innerHTML;
            selectorElement.innerHTML = "";

            // Criar uma div e colocar la todo o conteudo
            selectorElement.insertAdjacentHTML("afterbegin", "<div id='scroll_inner_"+randomID+"' class='lms_content_wrapper'></div>");
            let scrollInner = document.getElementById("scroll_inner_"+randomID);
  
            scrollInner.insertAdjacentHTML("afterbegin", "<div id='scroll_content_"+randomID+"' class='lms_content'></div>");
            let scrollContent = document.getElementById("scroll_content_"+randomID);
            scrollContent.innerHTML = selectorElementHTML;

            this.scrollElement = scrollInner;
            this.scrollContent = scrollContent;
            this.mainElement = selectorElement;

            scrollContainer = selectorElement;
            scrollContentWrapper = scrollInner;

                // Creat scrollbar div
                scroller = document.createElement("div");
                scroller.className = 'lms_scroller';
                this.scroller = scroller;

                // Calculate scrollbar height
                scrollerHeight = calculateScrollerHeight();
                
                if (scrollerHeight / scrollContainer.offsetHeight < 1){

                    // Apply scrollbar height
                    scroller.style.height = scrollerHeight + 'px';

                    // Append scroller to scrollContainer div
                    scrollContainer.appendChild(scroller);
                    
                    // Show scroll path divot
                    scrollContainer.className += ' lms_showScroll';
                    
                    // Attach related draggable listeners
                    scroller.addEventListener('mousedown', startDrag);
                    window.addEventListener('mouseup', stopDrag);
                    window.addEventListener('mousemove', scrollBarScroll);


                }
                
                // *** Listeners ***
                scrollContentWrapper.addEventListener('scroll', moveScroller);
        }

        // Init
        this.SetupScroll();

        // Refresh content
        var ResizeWindow = throttle(function() {
            refreshScroll();
        }, 10);

        // Add EventListener
        window.addEventListener('resize', ResizeWindow);
    }

    /*
    ** Methods
    */

    // Scroll to specific value
    scrollTo(value)
    {
        // Reset current scroll position
        this.scroller.style.top = "0px";
        this.scrollElement.scrollTop = 0;

        // Scroll to given value
        this.scroller.style.top = value+"px";
        this.scrollElement.scrollTop = value;
      
    }

    // Destroy scrollbar and unbind all its events
    destroy()
    {
            // Store content from inner divs
            let tempContent = this.scrollContent.innerHTML;

            // Remove all inner divs and all its events
            this.scrollContent.remove();
            this.scrollElement.remove();

            // Places content inside original div again and removes all classes associated with LetMeScroll.js
            this.mainElement.innerHTML = tempContent;
            this.mainElement.classList.remove("lms_scrollable");
            this.mainElement.classList.remove("lms_showScroll");
    }
}

// Export module to use it in browser and NodeJS
try {
   module.exports = exports = LetMeScroll;
} catch (e) {}
