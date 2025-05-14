import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbTabset, NgbTab, NgbTabContent, NgbTabTitle } from './tabset';
import { NgbTabsetConfig } from './tabset-config';
export { NgbTabset, NgbTab, NgbTabContent, NgbTabTitle } from './tabset';
export { NgbTabsetConfig } from './tabset-config';
var NGB_TABSET_DIRECTIVES = [NgbTabset, NgbTab, NgbTabContent, NgbTabTitle];
var NgbTabsetModule = /** @class */ (function () {
    function NgbTabsetModule() {
    }
    NgbTabsetModule.forRoot = function () { return { ngModule: NgbTabsetModule, providers: [NgbTabsetConfig] }; };
    NgbTabsetModule.decorators = [
        { type: NgModule, args: [{ declarations: NGB_TABSET_DIRECTIVES, exports: NGB_TABSET_DIRECTIVES, imports: [CommonModule] },] },
    ];
    return NgbTabsetModule;
}());
export { NgbTabsetModule };
//# sourceMappingURL=tabset.module.js.map