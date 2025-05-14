(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core')) :
	typeof define === 'function' && define.amd ? define(['exports', '@angular/core'], factory) :
	(factory((global.angularWebstorageService = global.angularWebstorageService || {}),global.ng.core));
}(this, (function (exports,_angular_core) { 'use strict';

/**
 * An implementation of `StorageService` interface that uses an underlying (web) `Storage` object, such as `localStorage` and
 * `sessionStorage`, as backing data store. This class basically wraps the `Storage` object so it can be accessed through the
 * `StorageService` interface.
 */
var WebStorageService = (function () {
    /**
     * Creates a new `WebStorageService` instance that uses the specified (web) storage object as underlying backing storage.
     *
     * @param storage Storage object which is to be wrapped in a class that implements the `StorageService` interface.
     */
    function WebStorageService(storage) {
        this.storage = storage;
    }
    /**
     * Retrieves the value stored for the entry that is associated with the specified key. If no such entry exists or if the service for
     * some reason is unable to fetch the value of the entry then `null` will be returned.
     *
     * @param   key Identifier of the entry whose value is to be retrieved.
     * @returns     Value of the entry that is identified by the specified key or `null` if the entry does not exist or cannot be loaded.
     */
    WebStorageService.prototype.get = function (key) {
        try {
            return JSON.parse(this.storage.getItem(key));
        }
        catch (error) {
            return null;
        }
    };
    /**
     * Creates or updates the entry identified by the specified key with the given value. Storing a value into the storage service will
     * ensure that an equivalent of the value can be read back, i.e. the data and structure of the value will be the same. It, however, does
     * not necessarily return the same value, i.e. the same reference.
     *
     * @param key   Identifier of the entry which is to be created or updated.
     * @param value Value which is to be stored.
     */
    WebStorageService.prototype.set = function (key, value) {
        this.storage.setItem(key, JSON.stringify(value));
    };
    /**
     * Removes the entry that is identified by the specified key. Attempting to remove an entry for an unknown key will have no effect.
     * Attempting to retrieve an entry via the `get` method after it has been removed will result in `null`.
     *
     * @param key Identifier of the entry which is to be removed.
     */
    WebStorageService.prototype.remove = function (key) {
        this.storage.removeItem(key);
    };
    return WebStorageService;
}());
/**
 * Checks whether the specified (web) storage is available and functional. This might not be the case for older browsers. However even
 * certain browsers that do support the web storage API can, under some circumstances, have non functional storage objects. For example,
 * Safari is known to have `localStorage` and `sessionStorage` throw exceptions in private mode.
 *
 * @param storage Storage object which is to be tested for availability.
 */
function isStorageAvailable(storage) {
    // Check if storage is available.
    if (!storage) {
        return false;
    }
    // Check if the storage can actually be accessed.
    try {
        var now = Date.now();
        var testItemKey = "storage-test-entry-" + now;
        var testItemValue = "storage-test-value-" + now;
        storage.setItem(testItemKey, testItemValue);
        var retrievedItemValue = storage.getItem(testItemKey);
        storage.removeItem(testItemKey);
        return retrievedItemValue === testItemValue;
    }
    catch (error) {
        return false;
    }
}

/**
 * A volatile `StorageService` implementation. This service guarantees that data stored will remain available as long as the application
 * instance is active. After the application is terminated all data will be lost.
 */
var InMemoryStorageService = (function () {
    function InMemoryStorageService() {
        this.storage = new Map();
    }
    /**
     * Retrieves the value stored for the entry that is associated with the specified key. If no such entry exists or if the service for
     * some reason is unable to fetch the value of the entry then `null` will be returned.
     *
     * @param   key Identifier of the entry whose value is to be retrieved.
     * @returns     Value of the entry that is identified by the specified key or `null` if the entry does not exist or cannot be loaded.
     */
    InMemoryStorageService.prototype.get = function (key) {
        if (!this.storage.has(key)) {
            return null;
        }
        return this.storage.get(key);
    };
    /**
     * Creates or updates the entry identified by the specified key with the given value. Storing a value into the storage service will
     * ensure that an equivalent of the value can be read back, i.e. the data and structure of the value will be the same. It, however, does
     * not necessarily return the same value, i.e. the same reference.
     *
     * @param key   Identifier of the entry which is to be created or updated.
     * @param value Value which is to be stored.
     */
    InMemoryStorageService.prototype.set = function (key, value) {
        this.storage.set(key, value);
    };
    /**
     * Removes the entry that is identified by the specified key. Attempting to remove an entry for an unknown key will have no effect.
     * Attempting to retrieve an entry via the `get` method after it has been removed will result in `null`.
     *
     * @param key Identifier of the entry which is to be removed.
     */
    InMemoryStorageService.prototype.remove = function (key) {
        this.storage.delete(key);
    };
    return InMemoryStorageService;
}());

/** Injection token for the session storage service. */
var SESSION_STORAGE = new _angular_core.InjectionToken('SESSION_STORAGE');
/** Injection token for the local storage service. */
var LOCAL_STORAGE = new _angular_core.InjectionToken('LOCAL_STORAGE');
function sessionStorageFactory() {
    if (!isStorageAvailable(sessionStorage)) {
        return new InMemoryStorageService();
    }
    return new WebStorageService(sessionStorage);
}
function localStorageFactory() {
    if (!isStorageAvailable(localStorage)) {
        return new InMemoryStorageService();
    }
    return new WebStorageService(localStorage);
}
var StorageServiceModule = (function () {
    function StorageServiceModule() {
    }
    return StorageServiceModule;
}());
StorageServiceModule.decorators = [
    { type: _angular_core.NgModule, args: [{
                providers: [
                    { provide: SESSION_STORAGE, useFactory: sessionStorageFactory },
                    { provide: LOCAL_STORAGE, useFactory: localStorageFactory }
                ]
            },] },
];
/** @nocollapse */
StorageServiceModule.ctorParameters = function () { return []; };

exports.WebStorageService = WebStorageService;
exports.isStorageAvailable = isStorageAvailable;
exports.InMemoryStorageService = InMemoryStorageService;
exports.SESSION_STORAGE = SESSION_STORAGE;
exports.LOCAL_STORAGE = LOCAL_STORAGE;
exports.sessionStorageFactory = sessionStorageFactory;
exports.localStorageFactory = localStorageFactory;
exports.StorageServiceModule = StorageServiceModule;

Object.defineProperty(exports, '__esModule', { value: true });

})));
