import { Observable } from 'rxjs';
/**
 * Function that enforces browser focus to be trapped inside a DOM element.
 *
 * Works only for clicks inside the element and navigation with 'Tab', ignoring clicks outside of the element
 *
 * @param element The element around which focus will be trapped inside
 * @param stopFocusTrap$ The observable stream. When completed the focus trap will clean up listeners
 * and free internal resources
 */
export declare const ngbFocusTrap: (element: HTMLElement, stopFocusTrap$: Observable<any>) => void;
