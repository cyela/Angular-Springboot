import { NgModule } from '@angular/core';
import { NgbTooltip, NgbTooltipWindow } from './tooltip';
import { NgbTooltipConfig } from './tooltip-config';
export { NgbTooltipConfig } from './tooltip-config';
export { NgbTooltip } from './tooltip';
var NgbTooltipModule = /** @class */ (function () {
    function NgbTooltipModule() {
    }
    NgbTooltipModule.forRoot = function () { return { ngModule: NgbTooltipModule, providers: [NgbTooltipConfig] }; };
    NgbTooltipModule.decorators = [
        { type: NgModule, args: [{ declarations: [NgbTooltip, NgbTooltipWindow], exports: [NgbTooltip], entryComponents: [NgbTooltipWindow] },] },
    ];
    return NgbTooltipModule;
}());
export { NgbTooltipModule };
//# sourceMappingURL=tooltip.module.js.map