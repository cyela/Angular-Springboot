import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbDatepicker } from './datepicker';
import { NgbDatepickerMonthView } from './datepicker-month-view';
import { NgbDatepickerNavigation } from './datepicker-navigation';
import { NgbInputDatepicker } from './datepicker-input';
import { NgbDatepickerDayView } from './datepicker-day-view';
import { NgbDatepickerI18n, NgbDatepickerI18nDefault } from './datepicker-i18n';
import { NgbCalendar, NgbCalendarGregorian } from './ngb-calendar';
import { NgbDateParserFormatter, NgbDateISOParserFormatter } from './ngb-date-parser-formatter';
import { NgbDateAdapter, NgbDateStructAdapter } from './adapters/ngb-date-adapter';
import { NgbDatepickerNavigationSelect } from './datepicker-navigation-select';
import { NgbDatepickerConfig } from './datepicker-config';
export { NgbDatepicker } from './datepicker';
export { NgbInputDatepicker } from './datepicker-input';
export { NgbCalendar } from './ngb-calendar';
export { NgbCalendarIslamicCivil } from './hijri/ngb-calendar-islamic-civil';
export { NgbCalendarIslamicUmalqura } from './hijri/ngb-calendar-islamic-umalqura';
export { NgbDatepickerMonthView } from './datepicker-month-view';
export { NgbDatepickerDayView } from './datepicker-day-view';
export { NgbDatepickerNavigation } from './datepicker-navigation';
export { NgbDatepickerNavigationSelect } from './datepicker-navigation-select';
export { NgbDatepickerConfig } from './datepicker-config';
export { NgbDatepickerI18n } from './datepicker-i18n';
export { NgbDateAdapter } from './adapters/ngb-date-adapter';
export { NgbDateNativeAdapter } from './adapters/ngb-date-native-adapter';
export { NgbDateParserFormatter } from './ngb-date-parser-formatter';
var NgbDatepickerModule = /** @class */ (function () {
    function NgbDatepickerModule() {
    }
    NgbDatepickerModule.forRoot = function () {
        return {
            ngModule: NgbDatepickerModule,
            providers: [
                { provide: NgbCalendar, useClass: NgbCalendarGregorian },
                { provide: NgbDatepickerI18n, useClass: NgbDatepickerI18nDefault },
                { provide: NgbDateParserFormatter, useClass: NgbDateISOParserFormatter },
                { provide: NgbDateAdapter, useClass: NgbDateStructAdapter }, NgbDatepickerConfig, DatePipe
            ]
        };
    };
    NgbDatepickerModule.decorators = [
        { type: NgModule, args: [{
                    declarations: [
                        NgbDatepicker, NgbDatepickerMonthView, NgbDatepickerNavigation, NgbDatepickerNavigationSelect, NgbDatepickerDayView,
                        NgbInputDatepicker
                    ],
                    exports: [NgbDatepicker, NgbInputDatepicker],
                    imports: [CommonModule, FormsModule],
                    entryComponents: [NgbDatepicker]
                },] },
    ];
    return NgbDatepickerModule;
}());
export { NgbDatepickerModule };
//# sourceMappingURL=datepicker.module.js.map