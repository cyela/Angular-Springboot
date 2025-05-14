import { fromEvent } from 'rxjs';
import { filter, map, takeUntil, withLatestFrom } from 'rxjs/operators';
import { Key } from '../util/key';
var FOCUSABLE_ELEMENTS_SELECTOR = [
    'a[href]', 'button:not([disabled])', 'input:not([disabled]):not([type="hidden"])', 'select:not([disabled])',
    'textarea:not([disabled])', '[contenteditable]', '[tabindex]:not([tabindex="-1"])'
].join(', ');
/**
 * Returns first and last focusable elements inside of a given element based on specific CSS selector
 */
function getFocusableBoundaryElements(element) {
    var list = element.querySelectorAll(FOCUSABLE_ELEMENTS_SELECTOR);
    return [list[0], list[list.length - 1]];
}
/**
 * Function that enforces browser focus to be trapped inside a DOM element.
 *
 * Works only for clicks inside the element and navigation with 'Tab', ignoring clicks outside of the element
 *
 * @param element The element around which focus will be trapped inside
 * @param stopFocusTrap$ The observable stream. When completed the focus trap will clean up listeners
 * and free internal resources
 */
export var ngbFocusTrap = function (element, stopFocusTrap$) {
    // last focused element
    var lastFocusedElement$ = fromEvent(element, 'focusin').pipe(takeUntil(stopFocusTrap$), map(function (e) { return e.target; }));
    // 'tab' / 'shift+tab' stream
    fromEvent(element, 'keydown')
        .pipe(takeUntil(stopFocusTrap$), filter(function (e) { return e.which === Key.Tab; }), withLatestFrom(lastFocusedElement$))
        .subscribe(function (_a) {
        var tabEvent = _a[0], focusedElement = _a[1];
        var _b = getFocusableBoundaryElements(element), first = _b[0], last = _b[1];
        if (focusedElement === first && tabEvent.shiftKey) {
            last.focus();
            tabEvent.preventDefault();
        }
        if (focusedElement === last && !tabEvent.shiftKey) {
            first.focus();
            tabEvent.preventDefault();
        }
    });
    // inside click
    fromEvent(element, 'click')
        .pipe(takeUntil(stopFocusTrap$), withLatestFrom(lastFocusedElement$), map(function (arr) { return arr[1]; }))
        .subscribe(function (lastFocusedElement) { return lastFocusedElement.focus(); });
};
//# sourceMappingURL=focus-trap.js.map