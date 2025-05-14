import { Directive, Input } from '@angular/core';
/**
 * The NgbCollapse directive provides a simple way to hide and show an element with animations.
 */
var NgbCollapse = /** @class */ (function () {
    function NgbCollapse() {
        /**
           * A flag indicating collapsed (true) or open (false) state.
           */
        this.collapsed = false;
    }
    NgbCollapse.decorators = [
        { type: Directive, args: [{
                    selector: '[ngbCollapse]',
                    exportAs: 'ngbCollapse',
                    host: { '[class.collapse]': 'true', '[class.show]': '!collapsed' }
                },] },
    ];
    /** @nocollapse */
    NgbCollapse.propDecorators = {
        "collapsed": [{ type: Input, args: ['ngbCollapse',] },],
    };
    return NgbCollapse;
}());
export { NgbCollapse };
//# sourceMappingURL=collapse.js.map