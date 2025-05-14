import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbProgressbar } from './progressbar';
import { NgbProgressbarConfig } from './progressbar-config';
export { NgbProgressbar } from './progressbar';
export { NgbProgressbarConfig } from './progressbar-config';
var NgbProgressbarModule = /** @class */ (function () {
    function NgbProgressbarModule() {
    }
    NgbProgressbarModule.forRoot = function () { return { ngModule: NgbProgressbarModule, providers: [NgbProgressbarConfig] }; };
    NgbProgressbarModule.decorators = [
        { type: NgModule, args: [{ declarations: [NgbProgressbar], exports: [NgbProgressbar], imports: [CommonModule] },] },
    ];
    return NgbProgressbarModule;
}());
export { NgbProgressbarModule };
//# sourceMappingURL=progressbar.module.js.map