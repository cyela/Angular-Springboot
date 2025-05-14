import { InjectionToken, OnDestroy } from '@angular/core';
export declare type ARIA_LIVE_DELAY_TYPE = number | null;
export declare const ARIA_LIVE_DELAY: InjectionToken<number>;
export declare const DEFAULT_ARIA_LIVE_DELAY: ARIA_LIVE_DELAY_TYPE;
export declare class Live implements OnDestroy {
    private _document;
    private _delay;
    constructor(_document: any, _delay: any);
    ngOnDestroy(): void;
    say(message: string): void;
}
