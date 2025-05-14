import { Component, Input } from '@angular/core';
var NgbModalBackdrop = /** @class */ (function () {
    function NgbModalBackdrop() {
    }
    NgbModalBackdrop.decorators = [
        { type: Component, args: [{
                    selector: 'ngb-modal-backdrop',
                    template: '',
                    host: { '[class]': '"modal-backdrop fade show" + (backdropClass ? " " + backdropClass : "")' }
                },] },
    ];
    /** @nocollapse */
    NgbModalBackdrop.propDecorators = {
        "backdropClass": [{ type: Input },],
    };
    return NgbModalBackdrop;
}());
export { NgbModalBackdrop };
//# sourceMappingURL=modal-backdrop.js.map