import { NgModule } from '@angular/core';
import { NgbDropdown, NgbDropdownAnchor, NgbDropdownToggle, NgbDropdownMenu } from './dropdown';
import { NgbDropdownConfig } from './dropdown-config';
export { NgbDropdown, NgbDropdownToggle, NgbDropdownMenu } from './dropdown';
export { NgbDropdownConfig } from './dropdown-config';
var NGB_DROPDOWN_DIRECTIVES = [NgbDropdown, NgbDropdownAnchor, NgbDropdownToggle, NgbDropdownMenu];
var NgbDropdownModule = /** @class */ (function () {
    function NgbDropdownModule() {
    }
    NgbDropdownModule.forRoot = function () { return { ngModule: NgbDropdownModule, providers: [NgbDropdownConfig] }; };
    NgbDropdownModule.decorators = [
        { type: NgModule, args: [{ declarations: NGB_DROPDOWN_DIRECTIVES, exports: NGB_DROPDOWN_DIRECTIVES },] },
    ];
    return NgbDropdownModule;
}());
export { NgbDropdownModule };
//# sourceMappingURL=dropdown.module.js.map