import { DatePipe } from '@angular/common';
import { NgbDateStruct } from './ngb-date-struct';
/**
 * Type of the service supplying month and weekday names to to NgbDatepicker component.
 * The default implementation of this service honors the Angular locale, and uses the registered locale data,
 * as explained in the Angular i18n guide.
 * See the i18n demo for how to extend this class and define a custom provider for i18n.
 */
export declare abstract class NgbDatepickerI18n {
    /**
     * Returns the short weekday name to display in the heading of the month view.
     * With default calendar we use ISO 8601: 'weekday' is 1=Mon ... 7=Sun
     */
    abstract getWeekdayShortName(weekday: number): string;
    /**
     * Returns the short month name to display in the date picker navigation.
     * With default calendar we use ISO 8601: 'month' is 1=Jan ... 12=Dec
     */
    abstract getMonthShortName(month: number): string;
    /**
     * Returns the full month name to display in the date picker navigation.
     * With default calendar we use ISO 8601: 'month' is 1=January ... 12=December
     */
    abstract getMonthFullName(month: number): string;
    /**
     * Returns the value of the 'aria-label' attribute for a specific date
     *
     * @since 2.0.0
     */
    abstract getDayAriaLabel(date: NgbDateStruct): string;
}
export declare class NgbDatepickerI18nDefault extends NgbDatepickerI18n {
    private _locale;
    private _datePipe;
    private _weekdaysShort;
    private _monthsShort;
    private _monthsFull;
    constructor(_locale: string, _datePipe: DatePipe);
    getWeekdayShortName(weekday: number): string;
    getMonthShortName(month: number): string;
    getMonthFullName(month: number): string;
    getDayAriaLabel(date: NgbDateStruct): string;
}
