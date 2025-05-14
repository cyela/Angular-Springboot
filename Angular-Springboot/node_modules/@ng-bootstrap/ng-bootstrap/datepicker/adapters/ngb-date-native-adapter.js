var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { Injectable } from '@angular/core';
import { NgbDateAdapter } from './ngb-date-adapter';
var NgbDateNativeAdapter = /** @class */ (function (_super) {
    __extends(NgbDateNativeAdapter, _super);
    function NgbDateNativeAdapter() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    NgbDateNativeAdapter.prototype.fromModel = function (date) {
        return (date && date.getFullYear) ? { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() } :
            null;
    };
    NgbDateNativeAdapter.prototype.toModel = function (date) {
        return date && date.year && date.month ? new Date(date.year, date.month - 1, date.day) : null;
    };
    NgbDateNativeAdapter.decorators = [
        { type: Injectable },
    ];
    return NgbDateNativeAdapter;
}(NgbDateAdapter));
export { NgbDateNativeAdapter };
//# sourceMappingURL=ngb-date-native-adapter.js.map