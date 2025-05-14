import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbHighlight } from './highlight';
import { NgbTypeaheadWindow } from './typeahead-window';
import { NgbTypeahead } from './typeahead';
import { NgbTypeaheadConfig } from './typeahead-config';
import { Live, ARIA_LIVE_DELAY, DEFAULT_ARIA_LIVE_DELAY } from './../util/accessibility/live';
export { NgbHighlight } from './highlight';
export { NgbTypeaheadWindow } from './typeahead-window';
export { NgbTypeaheadConfig } from './typeahead-config';
export { NgbTypeahead } from './typeahead';
var NgbTypeaheadModule = /** @class */ (function () {
    function NgbTypeaheadModule() {
    }
    NgbTypeaheadModule.forRoot = function () {
        return {
            ngModule: NgbTypeaheadModule,
            providers: [Live, NgbTypeaheadConfig, { provide: ARIA_LIVE_DELAY, useValue: DEFAULT_ARIA_LIVE_DELAY }]
        };
    };
    NgbTypeaheadModule.decorators = [
        { type: NgModule, args: [{
                    declarations: [NgbTypeahead, NgbHighlight, NgbTypeaheadWindow],
                    exports: [NgbTypeahead, NgbHighlight],
                    imports: [CommonModule],
                    entryComponents: [NgbTypeaheadWindow]
                },] },
    ];
    return NgbTypeaheadModule;
}());
export { NgbTypeaheadModule };
//# sourceMappingURL=typeahead.module.js.map