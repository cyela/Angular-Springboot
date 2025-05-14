import { EventEmitter, OnInit, OnDestroy, OnChanges, Injector, Renderer2, ElementRef, TemplateRef, ViewContainerRef, ComponentFactoryResolver, NgZone, SimpleChanges } from '@angular/core';
import { Placement, PlacementArray } from '../util/positioning';
import { NgbPopoverConfig } from './popover-config';
export declare class NgbPopoverWindow {
    private _element;
    private _renderer;
    placement: Placement;
    title: string;
    id: string;
    popoverClass: string;
    constructor(_element: ElementRef<HTMLElement>, _renderer: Renderer2);
    applyPlacement(_placement: Placement): void;
}
/**
 * A lightweight, extensible directive for fancy popover creation.
 */
export declare class NgbPopover implements OnInit, OnDestroy, OnChanges {
    private _elementRef;
    private _renderer;
    /**
     * Content to be displayed as popover. If title and content are empty, the popover won't open.
     */
    ngbPopover: string | TemplateRef<any>;
    /**
     * Title of a popover. If title and content are empty, the popover won't open.
     */
    popoverTitle: string;
    /**
     * Placement of a popover accepts:
     *    "top", "top-left", "top-right", "bottom", "bottom-left", "bottom-right",
     *    "left", "left-top", "left-bottom", "right", "right-top", "right-bottom"
     * and array of above values.
     */
    placement: PlacementArray;
    /**
     * Specifies events that should trigger. Supports a space separated list of event names.
     */
    triggers: string;
    /**
     * A selector specifying the element the popover should be appended to.
     * Currently only supports "body".
     */
    container: string;
    /**
     * A flag indicating if a given popover is disabled and should not be displayed.
     *
     * @since 1.1.0
     */
    disablePopover: boolean;
    /**
     * An optional class applied to ngb-popover-window
     *
     * @since 2.2.0
     */
    popoverClass: string;
    /**
     * Emits an event when the popover is shown
     */
    shown: EventEmitter<{}>;
    /**
     * Emits an event when the popover is hidden
     */
    hidden: EventEmitter<{}>;
    private _ngbPopoverWindowId;
    private _popupService;
    private _windowRef;
    private _unregisterListenersFn;
    private _zoneSubscription;
    private _isDisabled();
    constructor(_elementRef: ElementRef<HTMLElement>, _renderer: Renderer2, injector: Injector, componentFactoryResolver: ComponentFactoryResolver, viewContainerRef: ViewContainerRef, config: NgbPopoverConfig, ngZone: NgZone);
    /**
     * Opens an element’s popover. This is considered a “manual” triggering of the popover.
     * The context is an optional value to be injected into the popover template when it is created.
     */
    open(context?: any): void;
    /**
     * Closes an element’s popover. This is considered a “manual” triggering of the popover.
     */
    close(): void;
    /**
     * Toggles an element’s popover. This is considered a “manual” triggering of the popover.
     */
    toggle(): void;
    /**
     * Returns whether or not the popover is currently being shown
     */
    isOpen(): boolean;
    ngOnInit(): void;
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
}
