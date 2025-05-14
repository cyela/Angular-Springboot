import { Component, Input, TemplateRef, Output, EventEmitter } from '@angular/core';
import { NgbDate } from './ngb-date';
import { NgbDatepickerI18n } from './datepicker-i18n';
var NgbDatepickerMonthView = /** @class */ (function () {
    function NgbDatepickerMonthView(i18n) {
        this.i18n = i18n;
        this.select = new EventEmitter();
    }
    NgbDatepickerMonthView.prototype.doSelect = function (day) {
        if (!day.context.disabled && !day.hidden) {
            this.select.emit(NgbDate.from(day.date));
        }
    };
    NgbDatepickerMonthView.decorators = [
        { type: Component, args: [{
                    selector: 'ngb-datepicker-month-view',
                    host: { 'role': 'grid' },
                    styles: ["\n    :host {\n      display: block;\n    }\n    .ngb-dp-weekday, .ngb-dp-week-number {\n      line-height: 2rem;\n      text-align: center;\n      font-style: italic;\n    }\n    .ngb-dp-weekday {\n      color: #5bc0de;\n      color: var(--info);\n    }\n    .ngb-dp-week {\n      border-radius: 0.25rem;\n      display: -ms-flexbox;\n      display: flex;\n    }\n    .ngb-dp-weekdays {\n      border-bottom: 1px solid rgba(0, 0, 0, 0.125);\n      border-radius: 0;\n    }\n    .ngb-dp-day, .ngb-dp-weekday, .ngb-dp-week-number {\n      width: 2rem;\n      height: 2rem;\n    }\n    .ngb-dp-day {\n      cursor: pointer;\n    }\n    .ngb-dp-day.disabled, .ngb-dp-day.hidden {\n      cursor: default;\n    }\n  "],
                    template: "\n    <div *ngIf=\"showWeekdays\" class=\"ngb-dp-week ngb-dp-weekdays bg-light\">\n      <div *ngIf=\"showWeekNumbers\" class=\"ngb-dp-weekday ngb-dp-showweek\"></div>\n      <div *ngFor=\"let w of month.weekdays\" class=\"ngb-dp-weekday small\">\n        {{ i18n.getWeekdayShortName(w) }}\n      </div>\n    </div>\n    <ng-template ngFor let-week [ngForOf]=\"month.weeks\">\n      <div *ngIf=\"!week.collapsed\" class=\"ngb-dp-week\" role=\"row\">\n        <div *ngIf=\"showWeekNumbers\" class=\"ngb-dp-week-number small text-muted\">{{ week.number }}</div>\n        <div *ngFor=\"let day of week.days\" (click)=\"doSelect(day)\" class=\"ngb-dp-day\" role=\"gridcell\"\n          [class.disabled]=\"day.context.disabled\"\n          [tabindex]=\"day.tabindex\"\n          [class.hidden]=\"day.hidden\"\n          [attr.aria-label]=\"day.ariaLabel\">\n          <ng-template [ngIf]=\"!day.hidden\">\n            <ng-template [ngTemplateOutlet]=\"dayTemplate\" [ngTemplateOutletContext]=\"day.context\"></ng-template>\n          </ng-template>\n        </div>\n      </div>\n    </ng-template>\n  "
                },] },
    ];
    /** @nocollapse */
    NgbDatepickerMonthView.ctorParameters = function () { return [
        { type: NgbDatepickerI18n, },
    ]; };
    NgbDatepickerMonthView.propDecorators = {
        "dayTemplate": [{ type: Input },],
        "month": [{ type: Input },],
        "showWeekdays": [{ type: Input },],
        "showWeekNumbers": [{ type: Input },],
        "select": [{ type: Output },],
    };
    return NgbDatepickerMonthView;
}());
export { NgbDatepickerMonthView };
//# sourceMappingURL=datepicker-month-view.js.map