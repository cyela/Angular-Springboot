import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NGB_CAROUSEL_DIRECTIVES } from './carousel';
import { NgbCarouselConfig } from './carousel-config';
export { NgbCarousel, NgbSlide } from './carousel';
export { NgbCarouselConfig } from './carousel-config';
var NgbCarouselModule = /** @class */ (function () {
    function NgbCarouselModule() {
    }
    NgbCarouselModule.forRoot = function () { return { ngModule: NgbCarouselModule, providers: [NgbCarouselConfig] }; };
    NgbCarouselModule.decorators = [
        { type: NgModule, args: [{ declarations: NGB_CAROUSEL_DIRECTIVES, exports: NGB_CAROUSEL_DIRECTIVES, imports: [CommonModule] },] },
    ];
    return NgbCarouselModule;
}());
export { NgbCarouselModule };
//# sourceMappingURL=carousel.module.js.map