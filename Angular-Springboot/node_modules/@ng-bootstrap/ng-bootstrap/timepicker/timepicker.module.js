import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbTimepicker } from './timepicker';
import { NgbTimepickerConfig } from './timepicker-config';
import { NgbTimeAdapter, NgbTimeStructAdapter } from './ngb-time-adapter';
export { NgbTimepicker } from './timepicker';
export { NgbTimepickerConfig } from './timepicker-config';
export { NgbTimeAdapter } from './ngb-time-adapter';
var NgbTimepickerModule = /** @class */ (function () {
    function NgbTimepickerModule() {
    }
    NgbTimepickerModule.forRoot = function () {
        return {
            ngModule: NgbTimepickerModule,
            providers: [NgbTimepickerConfig, { provide: NgbTimeAdapter, useClass: NgbTimeStructAdapter }]
        };
    };
    NgbTimepickerModule.decorators = [
        { type: NgModule, args: [{ declarations: [NgbTimepicker], exports: [NgbTimepicker], imports: [CommonModule] },] },
    ];
    return NgbTimepickerModule;
}());
export { NgbTimepickerModule };
//# sourceMappingURL=timepicker.module.js.map