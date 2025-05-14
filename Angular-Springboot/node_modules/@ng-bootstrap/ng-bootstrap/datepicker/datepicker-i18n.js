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
import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { FormStyle, getLocaleDayNames, getLocaleMonthNames, TranslationWidth } from '@angular/common';
import { DatePipe } from '@angular/common';
/**
 * Type of the service supplying month and weekday names to to NgbDatepicker component.
 * The default implementation of this service honors the Angular locale, and uses the registered locale data,
 * as explained in the Angular i18n guide.
 * See the i18n demo for how to extend this class and define a custom provider for i18n.
 */
var NgbDatepickerI18n = /** @class */ (function () {
    function NgbDatepickerI18n() {
    }
    NgbDatepickerI18n.decorators = [
        { type: Injectable },
    ];
    return NgbDatepickerI18n;
}());
export { NgbDatepickerI18n };
var NgbDatepickerI18nDefault = /** @class */ (function (_super) {
    __extends(NgbDatepickerI18nDefault, _super);
    function NgbDatepickerI18nDefault(_locale, _datePipe) {
        var _this = _super.call(this) || this;
        _this._locale = _locale;
        _this._datePipe = _datePipe;
        var weekdaysStartingOnSunday = getLocaleDayNames(_locale, FormStyle.Standalone, TranslationWidth.Short);
        _this._weekdaysShort = weekdaysStartingOnSunday.map(function (day, index) { return weekdaysStartingOnSunday[(index + 1) % 7]; });
        _this._monthsShort = getLocaleMonthNames(_locale, FormStyle.Standalone, TranslationWidth.Abbreviated);
        _this._monthsFull = getLocaleMonthNames(_locale, FormStyle.Standalone, TranslationWidth.Wide);
        return _this;
    }
    NgbDatepickerI18nDefault.prototype.getWeekdayShortName = function (weekday) { return this._weekdaysShort[weekday - 1]; };
    NgbDatepickerI18nDefault.prototype.getMonthShortName = function (month) { return this._monthsShort[month - 1]; };
    NgbDatepickerI18nDefault.prototype.getMonthFullName = function (month) { return this._monthsFull[month - 1]; };
    NgbDatepickerI18nDefault.prototype.getDayAriaLabel = function (date) {
        var jsDate = new Date(date.year, date.month - 1, date.day);
        return this._datePipe.transform(jsDate, 'fullDate', null, this._locale);
    };
    NgbDatepickerI18nDefault.decorators = [
        { type: Injectable },
    ];
    /** @nocollapse */
    NgbDatepickerI18nDefault.ctorParameters = function () { return [
        { type: undefined, decorators: [{ type: Inject, args: [LOCALE_ID,] },] },
        { type: DatePipe, },
    ]; };
    return NgbDatepickerI18nDefault;
}(NgbDatepickerI18n));
export { NgbDatepickerI18nDefault };
//# sourceMappingURL=datepicker-i18n.js.map