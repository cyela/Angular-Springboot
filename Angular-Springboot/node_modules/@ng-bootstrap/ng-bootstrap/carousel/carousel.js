import { Component, Directive, TemplateRef, ContentChildren, QueryList, Input, Output, EventEmitter } from '@angular/core';
import { NgbCarouselConfig } from './carousel-config';
var nextId = 0;
/**
 * Represents an individual slide to be used within a carousel.
 */
var NgbSlide = /** @class */ (function () {
    function NgbSlide(tplRef) {
        this.tplRef = tplRef;
        /**
           * Unique slide identifier. Must be unique for the entire document for proper accessibility support.
           * Will be auto-generated if not provided.
           */
        this.id = "ngb-slide-" + nextId++;
    }
    NgbSlide.decorators = [
        { type: Directive, args: [{ selector: 'ng-template[ngbSlide]' },] },
    ];
    /** @nocollapse */
    NgbSlide.ctorParameters = function () { return [
        { type: TemplateRef, },
    ]; };
    NgbSlide.propDecorators = {
        "id": [{ type: Input },],
    };
    return NgbSlide;
}());
export { NgbSlide };
/**
 * Directive to easily create carousels based on Bootstrap's markup.
 */
var NgbCarousel = /** @class */ (function () {
    function NgbCarousel(config) {
        /**
           * A carousel slide event fired when the slide transition is completed.
           * See NgbSlideEvent for payload details
           */
        this.slide = new EventEmitter();
        this.interval = config.interval;
        this.wrap = config.wrap;
        this.keyboard = config.keyboard;
        this.pauseOnHover = config.pauseOnHover;
        this.showNavigationArrows = config.showNavigationArrows;
        this.showNavigationIndicators = config.showNavigationIndicators;
    }
    NgbCarousel.prototype.ngAfterContentChecked = function () {
        var activeSlide = this._getSlideById(this.activeId);
        this.activeId = activeSlide ? activeSlide.id : (this.slides.length ? this.slides.first.id : null);
    };
    NgbCarousel.prototype.ngOnInit = function () { this._startTimer(); };
    NgbCarousel.prototype.ngOnChanges = function (changes) {
        if ('interval' in changes && !changes['interval'].isFirstChange()) {
            this._restartTimer();
        }
    };
    NgbCarousel.prototype.ngOnDestroy = function () { clearInterval(this._slideChangeInterval); };
    /**
     * Navigate to a slide with the specified identifier.
     */
    /**
       * Navigate to a slide with the specified identifier.
       */
    NgbCarousel.prototype.select = /**
       * Navigate to a slide with the specified identifier.
       */
    function (slideId) {
        this.cycleToSelected(slideId, this.getSlideEventDirection(this.activeId, slideId));
        this._restartTimer();
    };
    /**
     * Navigate to the next slide.
     */
    /**
       * Navigate to the next slide.
       */
    NgbCarousel.prototype.prev = /**
       * Navigate to the next slide.
       */
    function () {
        this.cycleToPrev();
        this._restartTimer();
    };
    /**
     * Navigate to the next slide.
     */
    /**
       * Navigate to the next slide.
       */
    NgbCarousel.prototype.next = /**
       * Navigate to the next slide.
       */
    function () {
        this.cycleToNext();
        this._restartTimer();
    };
    /**
     * Stops the carousel from cycling through items.
     */
    /**
       * Stops the carousel from cycling through items.
       */
    NgbCarousel.prototype.pause = /**
       * Stops the carousel from cycling through items.
       */
    function () { this._stopTimer(); };
    /**
     * Restarts cycling through the carousel slides from left to right.
     */
    /**
       * Restarts cycling through the carousel slides from left to right.
       */
    NgbCarousel.prototype.cycle = /**
       * Restarts cycling through the carousel slides from left to right.
       */
    function () { this._startTimer(); };
    NgbCarousel.prototype.cycleToNext = function () { this.cycleToSelected(this._getNextSlide(this.activeId), NgbSlideEventDirection.LEFT); };
    NgbCarousel.prototype.cycleToPrev = function () { this.cycleToSelected(this._getPrevSlide(this.activeId), NgbSlideEventDirection.RIGHT); };
    NgbCarousel.prototype.cycleToSelected = function (slideIdx, direction) {
        var selectedSlide = this._getSlideById(slideIdx);
        if (selectedSlide) {
            if (selectedSlide.id !== this.activeId) {
                this.slide.emit({ prev: this.activeId, current: selectedSlide.id, direction: direction });
            }
            this.activeId = selectedSlide.id;
        }
    };
    NgbCarousel.prototype.getSlideEventDirection = function (currentActiveSlideId, nextActiveSlideId) {
        var currentActiveSlideIdx = this._getSlideIdxById(currentActiveSlideId);
        var nextActiveSlideIdx = this._getSlideIdxById(nextActiveSlideId);
        return currentActiveSlideIdx > nextActiveSlideIdx ? NgbSlideEventDirection.RIGHT : NgbSlideEventDirection.LEFT;
    };
    NgbCarousel.prototype.keyPrev = function () {
        if (this.keyboard) {
            this.prev();
        }
    };
    NgbCarousel.prototype.keyNext = function () {
        if (this.keyboard) {
            this.next();
        }
    };
    NgbCarousel.prototype.onMouseEnter = function () {
        if (this.pauseOnHover) {
            this.pause();
        }
    };
    NgbCarousel.prototype.onMouseLeave = function () {
        if (this.pauseOnHover) {
            this.cycle();
        }
    };
    NgbCarousel.prototype._restartTimer = function () {
        this._stopTimer();
        this._startTimer();
    };
    NgbCarousel.prototype._startTimer = function () {
        var _this = this;
        if (this.interval > 0) {
            this._slideChangeInterval = setInterval(function () { _this.cycleToNext(); }, this.interval);
        }
    };
    NgbCarousel.prototype._stopTimer = function () { clearInterval(this._slideChangeInterval); };
    NgbCarousel.prototype._getSlideById = function (slideId) {
        var slideWithId = this.slides.filter(function (slide) { return slide.id === slideId; });
        return slideWithId.length ? slideWithId[0] : null;
    };
    NgbCarousel.prototype._getSlideIdxById = function (slideId) {
        return this.slides.toArray().indexOf(this._getSlideById(slideId));
    };
    NgbCarousel.prototype._getNextSlide = function (currentSlideId) {
        var slideArr = this.slides.toArray();
        var currentSlideIdx = this._getSlideIdxById(currentSlideId);
        var isLastSlide = currentSlideIdx === slideArr.length - 1;
        return isLastSlide ? (this.wrap ? slideArr[0].id : slideArr[slideArr.length - 1].id) :
            slideArr[currentSlideIdx + 1].id;
    };
    NgbCarousel.prototype._getPrevSlide = function (currentSlideId) {
        var slideArr = this.slides.toArray();
        var currentSlideIdx = this._getSlideIdxById(currentSlideId);
        var isFirstSlide = currentSlideIdx === 0;
        return isFirstSlide ? (this.wrap ? slideArr[slideArr.length - 1].id : slideArr[0].id) :
            slideArr[currentSlideIdx - 1].id;
    };
    NgbCarousel.decorators = [
        { type: Component, args: [{
                    selector: 'ngb-carousel',
                    exportAs: 'ngbCarousel',
                    host: {
                        'class': 'carousel slide',
                        '[style.display]': '"block"',
                        'tabIndex': '0',
                        '(mouseenter)': 'onMouseEnter()',
                        '(mouseleave)': 'onMouseLeave()',
                        '(keydown.arrowLeft)': 'keyPrev()',
                        '(keydown.arrowRight)': 'keyNext()'
                    },
                    template: "\n    <ol class=\"carousel-indicators\" *ngIf=\"showNavigationIndicators\">\n      <li *ngFor=\"let slide of slides\" [id]=\"slide.id\" [class.active]=\"slide.id === activeId\"\n          (click)=\"cycleToSelected(slide.id, getSlideEventDirection(activeId, slide.id))\"></li>\n    </ol>\n    <div class=\"carousel-inner\">\n      <div *ngFor=\"let slide of slides\" class=\"carousel-item\" [class.active]=\"slide.id === activeId\">\n        <ng-template [ngTemplateOutlet]=\"slide.tplRef\"></ng-template>\n      </div>\n    </div>\n    <a class=\"carousel-control-prev\" role=\"button\" (click)=\"cycleToPrev()\" *ngIf=\"showNavigationArrows\">\n      <span class=\"carousel-control-prev-icon\" aria-hidden=\"true\"></span>\n      <span class=\"sr-only\" i18n=\"@@ngb.carousel.previous\">Previous</span>\n    </a>\n    <a class=\"carousel-control-next\" role=\"button\" (click)=\"cycleToNext()\" *ngIf=\"showNavigationArrows\">\n      <span class=\"carousel-control-next-icon\" aria-hidden=\"true\"></span>\n      <span class=\"sr-only\" i18n=\"@@ngb.carousel.next\">Next</span>\n    </a>\n    "
                },] },
    ];
    /** @nocollapse */
    NgbCarousel.ctorParameters = function () { return [
        { type: NgbCarouselConfig, },
    ]; };
    NgbCarousel.propDecorators = {
        "slides": [{ type: ContentChildren, args: [NgbSlide,] },],
        "activeId": [{ type: Input },],
        "interval": [{ type: Input },],
        "wrap": [{ type: Input },],
        "keyboard": [{ type: Input },],
        "pauseOnHover": [{ type: Input },],
        "showNavigationArrows": [{ type: Input },],
        "showNavigationIndicators": [{ type: Input },],
        "slide": [{ type: Output },],
    };
    return NgbCarousel;
}());
export { NgbCarousel };
/**
 * Enum to define the carousel slide event direction
 */
/**
 * Enum to define the carousel slide event direction
 */
export var NgbSlideEventDirection;
/**
 * Enum to define the carousel slide event direction
 */
(function (NgbSlideEventDirection) {
    NgbSlideEventDirection[NgbSlideEventDirection["LEFT"] = 'left'] = "LEFT";
    NgbSlideEventDirection[NgbSlideEventDirection["RIGHT"] = 'right'] = "RIGHT";
})(NgbSlideEventDirection || (NgbSlideEventDirection = {}));
export var NGB_CAROUSEL_DIRECTIVES = [NgbCarousel, NgbSlide];
//# sourceMappingURL=carousel.js.map