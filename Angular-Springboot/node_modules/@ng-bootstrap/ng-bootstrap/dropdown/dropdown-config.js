import { Injectable } from '@angular/core';
/**
 * Configuration service for the NgbDropdown directive.
 * You can inject this service, typically in your root component, and customize the values of its properties in
 * order to provide default values for all the dropdowns used in the application.
 */
var NgbDropdownConfig = /** @class */ (function () {
    function NgbDropdownConfig() {
        this.autoClose = true;
        this.placement = 'bottom-left';
    }
    NgbDropdownConfig.decorators = [
        { type: Injectable },
    ];
    return NgbDropdownConfig;
}());
export { NgbDropdownConfig };
//# sourceMappingURL=dropdown-config.js.map