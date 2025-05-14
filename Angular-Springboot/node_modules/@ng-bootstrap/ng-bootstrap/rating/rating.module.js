import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbRatingConfig } from './rating-config';
import { NgbRating } from './rating';
export { NgbRating } from './rating';
export { NgbRatingConfig } from './rating-config';
var NgbRatingModule = /** @class */ (function () {
    function NgbRatingModule() {
    }
    NgbRatingModule.forRoot = function () { return { ngModule: NgbRatingModule, providers: [NgbRatingConfig] }; };
    NgbRatingModule.decorators = [
        { type: NgModule, args: [{ declarations: [NgbRating], exports: [NgbRating], imports: [CommonModule] },] },
    ];
    return NgbRatingModule;
}());
export { NgbRatingModule };
//# sourceMappingURL=rating.module.js.map