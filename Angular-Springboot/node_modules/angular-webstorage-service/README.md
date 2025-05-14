[![Build Status](https://api.travis-ci.org/dscheerens/ngx-webstorage-service.svg?branch=master)](https://travis-ci.org/dscheerens/ngx-webstorage-service) [![NPM Version](https://img.shields.io/npm/v/angular-webstorage-service.svg)](https://www.npmjs.com/package/angular-webstorage-service)

> **Imporant:** This package has been renamed to `ngx-webstorage-service`!

# Webstorage services for Angular 4+

This package provides service wrappers for the [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API).
Whenever your application needs to use `localStorage` or `sessionStorage`, instead of using them directly you can make use of the wrapped versions provided by this package.
Doing so has the following advantages:

* Switching from one type of storage to another is really easy.
* It provides a simple uniform interface that allows you to add other kinds of backing storage. For example you could easily create a cookie based storage implementation.
* This package comes with a built-in volatile in-memory backing storage, which can be used as a drop in replacement, e.g. for unit tests.
* Mocking storage in unit tests becomes a piece of cake.
* The `localStorage` and `sessionStorage` wrappers have built-in availability checks, that fall back to in-memory storage when they are unavailable.
  The latter can happen for example for older browsers or for browsers that disable web storage when private browsing mode is enabled.
* The storage services can be used to store any value that can be serialized as a JSON string.
  This means you do not have to serialize and deserialize non-string values yourself, which makes the use of the storage services a bit more ergonomic compared to the direct use of `localStorage` and `sessionStorage`.

## Installation

Add the module to your `package.json` file:

```
npm install --save angular-webstorage-service
```

After having installed the `angular-webstorage-service` package you might need to update your project configuration if you use tools like _SystemJS_ or _Karma_.
Usually you'll need to select the right bundle for each tool.
The `angular-webstorage-service` package provides the following bundles:

* An ECMAScript 6 bundle (used for tree shaking): `node_modules/angular-webstorage-service/bundles/angular-webstorage-service.js`
* An ECMAScript 5 bundle in ES6 module (ESM) format: `node_modules/angular-webstorage-service/bundles/angular-webstorage-service.es5.js`
* An ECMAScript 5 bundle with in universal module (UMD) format: `node_modules/angular-webstorage-service/bundles/angular-webstorage-service.umd.js`

## Usage

To make use of the (web) storage services in your application, first you need to import the `StorageServiceModule`, e.g.:

```TypeScript
import { NgModule } from '@angular/core';
import { StorageServiceModule } from 'angular-webstorage-service';

@NgModule({
    imports: [ StorageServiceModule ]
})
export class AppModule {

}
```

The next step is to inject the storage services into your own classes.
For example to make use of session storage import the `SESSION_STORAGE` injection token, together with the `StorageService` interface, and use those to inject the session storage service.
The code snippet below shows an example.

```TypeScript
import { Inject, Injectable } from '@angular/core';
import { SESSION_STORAGE, StorageService } from 'angular-webstorage-service';

const STORAGE_KEY = 'pure-awesomeness';

@Injectable()
export class MyAwesomeService {

    constructor(@Inject(SESSION_STORAGE) private storage: StorageService) {

    }

    public doSomethingAwesome(): number {
        const awesomenessLevel: number = this.storage.get(STORAGE_KEY) || 1337;
        this.storage.set(STORAGE_KEY, awesomenessLevel + 1);
        return awesomenessLevel;
    }
}
```

One thing you have to keep in mind while designing your own application or library that makes use of this package, is to think about reusability and maintainability of the classes that are going to depend on the `StorageService` interface.
Instead of directly using the `SESSION_STORAGE` or `LOCAL_STORAGE` injection tokens it might be wise to introduce your own injection token.
For the code example above you could do it like this:

```TypeScript
export const MY_AWESOME_SERVICE_STORAGE =
    new InjectionToken<StorageService>('MY_AWESOME_SERVICE_STORAGE');

@Injectable()
export class MyAwesomeService {

    constructor(
        @Inject(MY_AWESOME_SERVICE_STORAGE) private storage: StorageService
    ) {

    }

    // ...
}
```

Then, in your module definition, you can create a provider for the injection token like so:

```TypeScript
import { NgModule } from '@angular/core';
import { SESSION_STORAGE, StorageServiceModule } from 'angular-webstorage-service';

import { MY_AWESOME_SERVICE_STORAGE, MyAwesomeService } from './my-awesome-service';

@NgModule({
    imports: [ StorageServiceModule ],
    providers: [
        { provide: MY_AWESOME_SERVICE_STORAGE, useExisting: SESSION_STORAGE },
        MyAwesomeService
    ]
})
export class AwesomeModule {

}
```

By introducing your own injection token you'll give users of your API more control over what type of storage to use.
This makes it easier for the user to select the appropriate type of storage.
In general it should not matter anyway which type of storage is used from the perspective of the API you are developing (it only needs to store data).
The specific application of the API governs which type of storage is appropriate.

## API

The heart of this package is the `StorageService` interface.
This interface has the following functions:

* `get(key: string): any` -
  Retrieves the value stored for the entry that is associated with the specified key.
  If no such entry exists or if the service for some reason is unable to fetch the value of the entry then `null` will be returned.
* `set(key: string, value: any): void` -
  Creates or updates the entry identified by the specified key with the given value.
  Storing a value into the storage service will ensure that an equivalent of the value can be read back, i.e. the data and structure of the value will be the same.
  It, however, does not necessarily return the same value, i.e. the same reference.
* `remove(key: string): void` -
  Removes the entry that is identified by the specified key. Attempting to remove an entry for an unknown key will have no effect.
  Attempting to retrieve an entry via the `get` method after it has been removed will result in `null`.

Two implementations of the `StorageService` are provided by this package:

* `InMemoryStorageService` -
  A volatile `StorageService` implementation.
  This service guarantees that data stored will remain available as long as the application instance is active.
  After the application is terminated all data that is stored within the service will be lost.
* `WebStorageService` -
  This class serves as a wrapper for the `localStorage` and `sessionStorage` [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API) objects.
  You should not create an instance of this class yourself.
  Instead make use of the `LOCAL_STORAGE` and `SESSION_STORAGE` injection tokens, which are provided by the `StorageServiceModule`.
  By using these tokens instead it becomes easier to override them with another implementation, e.g. a mock version when running unit tests.
  Also these injection tokens have a fallback mechanism available that switches to the `InMemoryStorageService` when `localStorage` and `sessionStorage` are not available.

In case you want to check whether `localStorage` and `sessionStorage` are available within the current browser yourself, you can make use of the `isStorageAvailable` function.
This function accepts one parameter of type `Storage` (which is part of the HTML 5 specification) and returns a boolean that indicates whether the storage is available.
An example use of the function is shown below:

```TypeScript
import { isStorageAvailable } from 'angular-webstorage-service';

const sessionStorageAvailable = isStorageAvailable(sessionStorage);

console.log(`Session storage available: ${sessionStorageAvailable}`);
```
