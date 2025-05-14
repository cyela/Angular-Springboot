import { EventEmitter, ElementRef, Renderer2, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
export declare class NgbModalWindow implements OnInit, AfterViewInit, OnDestroy {
    private _elRef;
    private _renderer;
    private _document;
    private _elWithFocus;
    ariaLabelledBy: string;
    backdrop: boolean | string;
    centered: string;
    keyboard: boolean;
    size: string;
    windowClass: string;
    dismissEvent: EventEmitter<{}>;
    constructor(document: any, _elRef: ElementRef<HTMLElement>, _renderer: Renderer2);
    backdropClick($event: any): void;
    escKey($event: any): void;
    dismiss(reason: any): void;
    ngOnInit(): void;
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
}
