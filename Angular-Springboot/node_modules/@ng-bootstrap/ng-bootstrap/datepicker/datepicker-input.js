import { Directive, Input, ElementRef, ViewContainerRef, Renderer2, ComponentFactoryResolver, NgZone, TemplateRef, forwardRef, EventEmitter, Output, Inject } from '@angular/core';
import { NG_VALUE_ACCESSOR, NG_VALIDATORS } from '@angular/forms';
import { DOCUMENT } from '@angular/common';
import { NgbDate } from './ngb-date';
import { NgbDatepicker } from './datepicker';
import { NgbDateParserFormatter } from './ngb-date-parser-formatter';
import { positionElements } from '../util/positioning';
import { ngbFocusTrap } from '../util/focus-trap';
import { Key } from '../util/key';
import { NgbDateAdapter } from './adapters/ngb-date-adapter';
import { NgbCalendar } from './ngb-calendar';
import { NgbDatepickerService } from './datepicker-service';
import { Subject, fromEvent } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
var NGB_DATEPICKER_VALUE_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(function () { return NgbInputDatepicker; }),
    multi: true
};
var NGB_DATEPICKER_VALIDATOR = {
    provide: NG_VALIDATORS,
    useExisting: forwardRef(function () { return NgbInputDatepicker; }),
    multi: true
};
/**
 * A directive that makes it possible to have datepickers on input fields.
 * Manages integration with the input field itself (data entry) and ngModel (validation etc.).
 */
var NgbInputDatepicker = /** @class */ (function () {
    function NgbInputDatepicker(_parserFormatter, _elRef, _vcRef, _renderer, _cfr, ngZone, _service, _calendar, _ngbDateAdapter, _document) {
        var _this = this;
        this._parserFormatter = _parserFormatter;
        this._elRef = _elRef;
        this._vcRef = _vcRef;
        this._renderer = _renderer;
        this._cfr = _cfr;
        this._service = _service;
        this._calendar = _calendar;
        this._ngbDateAdapter = _ngbDateAdapter;
        this._document = _document;
        this._closed$ = new Subject();
        this._cRef = null;
        this._disabled = false;
        /**
           * Indicates whether the datepicker popup should be closed automatically after date selection or not.
           * If the value is 'false', the popup can be closed via 'close()' or 'toggle()' methods.
           *
           * @since 1.1.0
           */
        this.autoClose = true;
        /**
           * Placement of a datepicker popup accepts:
           *    "top", "top-left", "top-right", "bottom", "bottom-left", "bottom-right",
           *    "left", "left-top", "left-bottom", "right", "right-top", "right-bottom"
           * and array of above values.
           */
        this.placement = 'bottom-left';
        /**
           * An event fired when user selects a date using keyboard or mouse.
           * The payload of the event is currently selected NgbDateStruct.
           *
           * @since 1.1.1
           */
        this.dateSelect = new EventEmitter();
        /**
           * An event fired when navigation happens and currently displayed month changes.
           * See NgbDatepickerNavigateEvent for the payload info.
           */
        this.navigate = new EventEmitter();
        this._onChange = function (_) { };
        this._onTouched = function () { };
        this._validatorChange = function () { };
        this._zoneSubscription = ngZone.onStable.subscribe(function () {
            if (_this._cRef) {
                positionElements(_this._elRef.nativeElement, _this._cRef.location.nativeElement, _this.placement, _this.container === 'body');
            }
        });
    }
    Object.defineProperty(NgbInputDatepicker.prototype, "disabled", {
        get: function () {
            return this._disabled;
        },
        set: function (value) {
            this._disabled = value === '' || (value && value !== 'false');
            if (this.isOpen()) {
                this._cRef.instance.setDisabledState(this._disabled);
            }
        },
        enumerable: true,
        configurable: true
    });
    NgbInputDatepicker.prototype.registerOnChange = function (fn) { this._onChange = fn; };
    NgbInputDatepicker.prototype.registerOnTouched = function (fn) { this._onTouched = fn; };
    NgbInputDatepicker.prototype.registerOnValidatorChange = function (fn) { this._validatorChange = fn; };
    ;
    NgbInputDatepicker.prototype.setDisabledState = function (isDisabled) { this.disabled = isDisabled; };
    NgbInputDatepicker.prototype.validate = function (c) {
        var value = c.value;
        if (value === null || value === undefined) {
            return null;
        }
        var ngbDate = this._fromDateStruct(this._ngbDateAdapter.fromModel(value));
        if (!this._calendar.isValid(ngbDate)) {
            return { 'ngbDate': { invalid: c.value } };
        }
        if (this.minDate && ngbDate.before(NgbDate.from(this.minDate))) {
            return { 'ngbDate': { requiredBefore: this.minDate } };
        }
        if (this.maxDate && ngbDate.after(NgbDate.from(this.maxDate))) {
            return { 'ngbDate': { requiredAfter: this.maxDate } };
        }
    };
    NgbInputDatepicker.prototype.writeValue = function (value) {
        this._model = this._fromDateStruct(this._ngbDateAdapter.fromModel(value));
        this._writeModelValue(this._model);
    };
    NgbInputDatepicker.prototype.manualDateChange = function (value, updateView) {
        if (updateView === void 0) { updateView = false; }
        this._model = this._fromDateStruct(this._parserFormatter.parse(value));
        this._onChange(this._model ? this._ngbDateAdapter.toModel(this._model) : (value === '' ? null : value));
        if (updateView && this._model) {
            this._writeModelValue(this._model);
        }
    };
    NgbInputDatepicker.prototype.isOpen = function () { return !!this._cRef; };
    /**
     * Opens the datepicker with the selected date indicated by the ngModel value.
     */
    /**
       * Opens the datepicker with the selected date indicated by the ngModel value.
       */
    NgbInputDatepicker.prototype.open = /**
       * Opens the datepicker with the selected date indicated by the ngModel value.
       */
    function () {
        var _this = this;
        if (!this.isOpen()) {
            var cf = this._cfr.resolveComponentFactory(NgbDatepicker);
            this._cRef = this._vcRef.createComponent(cf);
            this._applyPopupStyling(this._cRef.location.nativeElement);
            this._applyDatepickerInputs(this._cRef.instance);
            this._subscribeForDatepickerOutputs(this._cRef.instance);
            this._cRef.instance.ngOnInit();
            this._cRef.instance.writeValue(this._ngbDateAdapter.toModel(this._model));
            // date selection event handling
            this._cRef.instance.registerOnChange(function (selectedDate) {
                _this.writeValue(selectedDate);
                _this._onChange(selectedDate);
            });
            this._cRef.changeDetectorRef.detectChanges();
            this._cRef.instance.setDisabledState(this.disabled);
            if (this.container === 'body') {
                window.document.querySelector(this.container).appendChild(this._cRef.location.nativeElement);
            }
            // focus handling
            ngbFocusTrap(this._cRef.location.nativeElement, this._closed$);
            this._cRef.instance.focus();
            // closing on ESC
            fromEvent(this._document, 'keyup')
                .pipe(takeUntil(this._closed$), filter(function (e) { return e.which === Key.Escape; }))
                .subscribe(function () { return _this.close(); });
        }
    };
    /**
     * Closes the datepicker popup.
     */
    /**
       * Closes the datepicker popup.
       */
    NgbInputDatepicker.prototype.close = /**
       * Closes the datepicker popup.
       */
    function () {
        if (this.isOpen()) {
            this._vcRef.remove(this._vcRef.indexOf(this._cRef.hostView));
            this._cRef = null;
            this._closed$.next();
        }
    };
    /**
     * Toggles the datepicker popup (opens when closed and closes when opened).
     */
    /**
       * Toggles the datepicker popup (opens when closed and closes when opened).
       */
    NgbInputDatepicker.prototype.toggle = /**
       * Toggles the datepicker popup (opens when closed and closes when opened).
       */
    function () {
        if (this.isOpen()) {
            this.close();
        }
        else {
            this.open();
        }
    };
    /**
     * Navigates current view to provided date.
     * With default calendar we use ISO 8601: 'month' is 1=Jan ... 12=Dec.
     * If nothing or invalid date provided calendar will open current month.
     * Use 'startDate' input as an alternative
     */
    /**
       * Navigates current view to provided date.
       * With default calendar we use ISO 8601: 'month' is 1=Jan ... 12=Dec.
       * If nothing or invalid date provided calendar will open current month.
       * Use 'startDate' input as an alternative
       */
    NgbInputDatepicker.prototype.navigateTo = /**
       * Navigates current view to provided date.
       * With default calendar we use ISO 8601: 'month' is 1=Jan ... 12=Dec.
       * If nothing or invalid date provided calendar will open current month.
       * Use 'startDate' input as an alternative
       */
    function (date) {
        if (this.isOpen()) {
            this._cRef.instance.navigateTo(date);
        }
    };
    NgbInputDatepicker.prototype.onBlur = function () { this._onTouched(); };
    NgbInputDatepicker.prototype.ngOnChanges = function (changes) {
        if (changes['minDate'] || changes['maxDate']) {
            this._validatorChange();
        }
    };
    NgbInputDatepicker.prototype.ngOnDestroy = function () {
        this.close();
        this._zoneSubscription.unsubscribe();
    };
    NgbInputDatepicker.prototype._applyDatepickerInputs = function (datepickerInstance) {
        var _this = this;
        ['dayTemplate', 'displayMonths', 'firstDayOfWeek', 'markDisabled', 'minDate', 'maxDate', 'navigation',
            'outsideDays', 'showNavigation', 'showWeekdays', 'showWeekNumbers']
            .forEach(function (optionName) {
            if (_this[optionName] !== undefined) {
                datepickerInstance[optionName] = _this[optionName];
            }
        });
        datepickerInstance.startDate = this.startDate || this._model;
    };
    NgbInputDatepicker.prototype._applyPopupStyling = function (nativeElement) {
        this._renderer.addClass(nativeElement, 'dropdown-menu');
        this._renderer.setStyle(nativeElement, 'padding', '0');
        this._renderer.addClass(nativeElement, 'show');
    };
    NgbInputDatepicker.prototype._subscribeForDatepickerOutputs = function (datepickerInstance) {
        var _this = this;
        datepickerInstance.navigate.subscribe(function (date) { return _this.navigate.emit(date); });
        datepickerInstance.select.subscribe(function (date) {
            _this.dateSelect.emit(date);
            if (_this.autoClose) {
                _this.close();
            }
        });
    };
    NgbInputDatepicker.prototype._writeModelValue = function (model) {
        this._renderer.setProperty(this._elRef.nativeElement, 'value', this._parserFormatter.format(model));
        if (this.isOpen()) {
            this._cRef.instance.writeValue(this._ngbDateAdapter.toModel(model));
            this._onTouched();
        }
    };
    NgbInputDatepicker.prototype._fromDateStruct = function (date) {
        var ngbDate = date ? new NgbDate(date.year, date.month, date.day) : null;
        return this._calendar.isValid(ngbDate) ? ngbDate : null;
    };
    NgbInputDatepicker.decorators = [
        { type: Directive, args: [{
                    selector: 'input[ngbDatepicker]',
                    exportAs: 'ngbDatepicker',
                    host: {
                        '(input)': 'manualDateChange($event.target.value)',
                        '(change)': 'manualDateChange($event.target.value, true)',
                        '(blur)': 'onBlur()',
                        '[disabled]': 'disabled'
                    },
                    providers: [NGB_DATEPICKER_VALUE_ACCESSOR, NGB_DATEPICKER_VALIDATOR, NgbDatepickerService]
                },] },
    ];
    /** @nocollapse */
    NgbInputDatepicker.ctorParameters = function () { return [
        { type: NgbDateParserFormatter, },
        { type: ElementRef, },
        { type: ViewContainerRef, },
        { type: Renderer2, },
        { type: ComponentFactoryResolver, },
        { type: NgZone, },
        { type: NgbDatepickerService, },
        { type: NgbCalendar, },
        { type: NgbDateAdapter, },
        { type: undefined, decorators: [{ type: Inject, args: [DOCUMENT,] },] },
    ]; };
    NgbInputDatepicker.propDecorators = {
        "autoClose": [{ type: Input },],
        "dayTemplate": [{ type: Input },],
        "displayMonths": [{ type: Input },],
        "firstDayOfWeek": [{ type: Input },],
        "markDisabled": [{ type: Input },],
        "minDate": [{ type: Input },],
        "maxDate": [{ type: Input },],
        "navigation": [{ type: Input },],
        "outsideDays": [{ type: Input },],
        "placement": [{ type: Input },],
        "showWeekdays": [{ type: Input },],
        "showWeekNumbers": [{ type: Input },],
        "startDate": [{ type: Input },],
        "container": [{ type: Input },],
        "dateSelect": [{ type: Output },],
        "navigate": [{ type: Output },],
        "disabled": [{ type: Input },],
    };
    return NgbInputDatepicker;
}());
export { NgbInputDatepicker };
//# sourceMappingURL=datepicker-input.js.map