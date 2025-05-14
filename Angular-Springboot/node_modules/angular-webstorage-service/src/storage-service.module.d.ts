import { InjectionToken } from '@angular/core';
import { StorageService } from './storage.service';
/** Injection token for the session storage service. */
export declare const SESSION_STORAGE: InjectionToken<StorageService>;
/** Injection token for the local storage service. */
export declare const LOCAL_STORAGE: InjectionToken<StorageService>;
export declare function sessionStorageFactory(): StorageService;
export declare function localStorageFactory(): StorageService;
export declare class StorageServiceModule {
}
