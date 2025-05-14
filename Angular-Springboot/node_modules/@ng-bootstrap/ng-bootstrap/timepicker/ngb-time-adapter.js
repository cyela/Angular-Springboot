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
import { isInteger } from '../util/util';
/**
 * Abstract type serving as a DI token for the service converting from your application Time model to internal
 * NgbTimeStruct model.
 * A default implementation converting from and to NgbTimeStruct is provided for retro-compatibility,
 * but you can provide another implementation to use an alternative format, ie for using with native Date Object.
 *
 * @since 2.2.0
 */
var NgbTimeAdapter = /** @class */ (function () {
    function NgbTimeAdapter() {
    }
    NgbTimeAdapter.decorators = [
        { type: Injectable },
    ];
    return NgbTimeAdapter;
}());
export { NgbTimeAdapter };
var NgbTimeStructAdapter = /** @class */ (function (_super) {
    __extends(NgbTimeStructAdapter, _super);
    function NgbTimeStructAdapter() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Converts a NgbTimeStruct value into NgbTimeStruct value
     * @param  {NgbTimeStruct} value
     * @return {NgbTimeStruct}
     */
    /**
       * Converts a NgbTimeStruct value into NgbTimeStruct value
       * @param  {NgbTimeStruct} value
       * @return {NgbTimeStruct}
       */
    NgbTimeStructAdapter.prototype.fromModel = /**
       * Converts a NgbTimeStruct value into NgbTimeStruct value
       * @param  {NgbTimeStruct} value
       * @return {NgbTimeStruct}
       */
    function (time) {
        return (time && isInteger(time.hour) && isInteger(time.minute)) ?
            { hour: time.hour, minute: time.minute, second: isInteger(time.second) ? time.second : null } :
            null;
    };
    /**
     * Converts a NgbTimeStruct value into NgbTimeStruct value
     * @param  {NgbTimeStruct} value
     * @return {NgbTimeStruct}
     */
    /**
       * Converts a NgbTimeStruct value into NgbTimeStruct value
       * @param  {NgbTimeStruct} value
       * @return {NgbTimeStruct}
       */
    NgbTimeStructAdapter.prototype.toModel = /**
       * Converts a NgbTimeStruct value into NgbTimeStruct value
       * @param  {NgbTimeStruct} value
       * @return {NgbTimeStruct}
       */
    function (time) {
        return (time && isInteger(time.hour) && isInteger(time.minute)) ?
            { hour: time.hour, minute: time.minute, second: isInteger(time.second) ? time.second : null } :
            null;
    };
    NgbTimeStructAdapter.decorators = [
        { type: Injectable },
    ];
    return NgbTimeStructAdapter;
}(NgbTimeAdapter));
export { NgbTimeStructAdapter };
//# sourceMappingURL=ngb-time-adapter.js.map