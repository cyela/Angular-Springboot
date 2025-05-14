import { Injectable, Inject, InjectionToken } from '@angular/core';
import { DOCUMENT } from '@angular/common';
export var ARIA_LIVE_DELAY = new InjectionToken('live announcer delay');
export var DEFAULT_ARIA_LIVE_DELAY = 100;
function getLiveElement(document, lazyCreate) {
    if (lazyCreate === void 0) { lazyCreate = false; }
    var element = document.body.querySelector('#ngb-live');
    if (element == null && lazyCreate) {
        element = document.createElement('div');
        element.setAttribute('id', 'ngb-live');
        element.setAttribute('aria-live', 'polite');
        element.setAttribute('aria-atomic', 'true');
        element.classList.add('sr-only');
        document.body.appendChild(element);
    }
    return element;
}
var Live = /** @class */ (function () {
    function Live(_document, _delay) {
        this._document = _document;
        this._delay = _delay;
    }
    Live.prototype.ngOnDestroy = function () {
        var element = getLiveElement(this._document);
        if (element) {
            element.parentElement.removeChild(element);
        }
    };
    Live.prototype.say = function (message) {
        var element = getLiveElement(this._document, true);
        var delay = this._delay;
        element.textContent = '';
        var setText = function () { return element.textContent = message; };
        if (delay === null) {
            setText();
        }
        else {
            setTimeout(setText, delay);
        }
    };
    Live.decorators = [
        { type: Injectable },
    ];
    /** @nocollapse */
    Live.ctorParameters = function () { return [
        { type: undefined, decorators: [{ type: Inject, args: [DOCUMENT,] },] },
        { type: undefined, decorators: [{ type: Inject, args: [ARIA_LIVE_DELAY,] },] },
    ]; };
    return Live;
}());
export { Live };
//# sourceMappingURL=live.js.map