"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const core_1 = require("@angular-devkit/core");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const interface_1 = require("../tree/interface");
const null_1 = require("../tree/null");
const static_1 = require("../tree/static");
const collection_1 = require("./collection");
const schematic_1 = require("./schematic");
const task_1 = require("./task");
class UnknownUrlSourceProtocol extends core_1.BaseException {
    constructor(url) { super(`Unknown Protocol on url "${url}".`); }
}
exports.UnknownUrlSourceProtocol = UnknownUrlSourceProtocol;
class UnknownCollectionException extends core_1.BaseException {
    constructor(name) { super(`Unknown collection "${name}".`); }
}
exports.UnknownCollectionException = UnknownCollectionException;
class CircularCollectionException extends core_1.BaseException {
    constructor(name) {
        super(`Circular collection reference "${name}".`);
    }
}
exports.CircularCollectionException = CircularCollectionException;
class UnknownSchematicException extends core_1.BaseException {
    constructor(name, collection) {
        super(`Schematic "${name}" not found in collection "${collection.name}".`);
    }
}
exports.UnknownSchematicException = UnknownSchematicException;
class PrivateSchematicException extends core_1.BaseException {
    constructor(name, collection) {
        super(`Schematic "${name}" not found in collection "${collection.name}".`);
    }
}
exports.PrivateSchematicException = PrivateSchematicException;
class SchematicEngineConflictingException extends core_1.BaseException {
    constructor() { super(`A schematic was called from a different engine as its parent.`); }
}
exports.SchematicEngineConflictingException = SchematicEngineConflictingException;
class UnregisteredTaskException extends core_1.BaseException {
    constructor(name, schematic) {
        const addendum = schematic ? ` in schematic "${schematic.name}"` : '';
        super(`Unregistered task "${name}"${addendum}.`);
    }
}
exports.UnregisteredTaskException = UnregisteredTaskException;
class SchematicEngine {
    constructor(_host, _workflow) {
        this._host = _host;
        this._workflow = _workflow;
        this._collectionCache = new Map();
        this._schematicCache = new Map();
        this._taskSchedulers = new Array();
    }
    get workflow() { return this._workflow || null; }
    get defaultMergeStrategy() { return this._host.defaultMergeStrategy || interface_1.MergeStrategy.Default; }
    createCollection(name) {
        let collection = this._collectionCache.get(name);
        if (collection) {
            return collection;
        }
        const [description, bases] = this._createCollectionDescription(name);
        collection = new collection_1.CollectionImpl(description, this, bases);
        this._collectionCache.set(name, collection);
        this._schematicCache.set(name, new Map());
        return collection;
    }
    _createCollectionDescription(name, parentNames) {
        const description = this._host.createCollectionDescription(name);
        if (!description) {
            throw new UnknownCollectionException(name);
        }
        if (parentNames && parentNames.has(description.name)) {
            throw new CircularCollectionException(name);
        }
        const bases = new Array();
        if (description.extends) {
            parentNames = (parentNames || new Set()).add(description.name);
            for (const baseName of description.extends) {
                const [base, baseBases] = this._createCollectionDescription(baseName, new Set(parentNames));
                bases.unshift(base, ...baseBases);
            }
        }
        return [description, bases];
    }
    createContext(schematic, parent) {
        // Check for inconsistencies.
        if (parent && parent.engine && parent.engine !== this) {
            throw new SchematicEngineConflictingException();
        }
        let context = {
            debug: parent && parent.debug || false,
            engine: this,
            logger: (parent && parent.logger && parent.logger.createChild(schematic.description.name))
                || new core_1.logging.NullLogger(),
            schematic,
            strategy: (parent && parent.strategy !== undefined)
                ? parent.strategy : this.defaultMergeStrategy,
            addTask,
        };
        const maybeNewContext = this._host.transformContext(context);
        if (maybeNewContext) {
            context = maybeNewContext;
        }
        const taskScheduler = new task_1.TaskScheduler(context);
        const host = this._host;
        this._taskSchedulers.push(taskScheduler);
        function addTask(task, dependencies) {
            const config = task.toConfiguration();
            if (!host.hasTaskExecutor(config.name)) {
                throw new UnregisteredTaskException(config.name, schematic.description);
            }
            config.dependencies = config.dependencies || [];
            if (dependencies) {
                config.dependencies.unshift(...dependencies);
            }
            return taskScheduler.schedule(config);
        }
        return context;
    }
    createSchematic(name, collection, allowPrivate = false) {
        const collectionImpl = this._collectionCache.get(collection.description.name);
        const schematicMap = this._schematicCache.get(collection.description.name);
        if (!collectionImpl || !schematicMap || collectionImpl !== collection) {
            // This is weird, maybe the collection was created by another engine?
            throw new UnknownCollectionException(collection.description.name);
        }
        let schematic = schematicMap.get(name);
        if (schematic) {
            return schematic;
        }
        let collectionDescription = collection.description;
        let description = this._host.createSchematicDescription(name, collection.description);
        if (!description) {
            if (collection.baseDescriptions) {
                for (const base of collection.baseDescriptions) {
                    description = this._host.createSchematicDescription(name, base);
                    if (description) {
                        collectionDescription = base;
                        break;
                    }
                }
            }
            if (!description) {
                // Report the error for the top level schematic collection
                throw new UnknownSchematicException(name, collection.description);
            }
        }
        if (description.private && !allowPrivate) {
            throw new PrivateSchematicException(name, collection.description);
        }
        const factory = this._host.getSchematicRuleFactory(description, collectionDescription);
        schematic = new schematic_1.SchematicImpl(description, factory, collection, this);
        schematicMap.set(name, schematic);
        return schematic;
    }
    listSchematicNames(collection) {
        const names = this._host.listSchematicNames(collection.description);
        if (collection.baseDescriptions) {
            for (const base of collection.baseDescriptions) {
                names.push(...this._host.listSchematicNames(base));
            }
        }
        // remove duplicates
        return [...new Set(names)];
    }
    transformOptions(schematic, options) {
        return this._host.transformOptions(schematic.description, options);
    }
    createSourceFromUrl(url, context) {
        switch (url.protocol) {
            case 'null:': return () => new null_1.NullTree();
            case 'empty:': return () => static_1.empty();
            default:
                const hostSource = this._host.createSourceFromUrl(url, context);
                if (!hostSource) {
                    throw new UnknownUrlSourceProtocol(url.toString());
                }
                return hostSource;
        }
    }
    executePostTasks() {
        const executors = new Map();
        const taskObservable = rxjs_1.from(this._taskSchedulers)
            .pipe(operators_1.concatMap(scheduler => scheduler.finalize()), operators_1.concatMap(task => {
            const { name, options } = task.configuration;
            const executor = executors.get(name);
            if (executor) {
                return executor(options, task.context);
            }
            return this._host.createTaskExecutor(name)
                .pipe(operators_1.concatMap(executor => {
                executors.set(name, executor);
                return executor(options, task.context);
            }));
        }));
        return taskObservable;
    }
}
exports.SchematicEngine = SchematicEngine;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW5naW5lLmpzIiwic291cmNlUm9vdCI6Ii4vIiwic291cmNlcyI6WyJwYWNrYWdlcy9hbmd1bGFyX2RldmtpdC9zY2hlbWF0aWNzL3NyYy9lbmdpbmUvZW5naW5lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7OztHQU1HO0FBQ0gsK0NBQThEO0FBQzlELCtCQUEwRDtBQUMxRCw4Q0FBMkM7QUFFM0MsaURBQWtEO0FBQ2xELHVDQUF3QztBQUN4QywyQ0FBdUM7QUFFdkMsNkNBQThDO0FBVzlDLDJDQUE0QztBQUM1QyxpQ0FLZ0I7QUFHaEIsOEJBQXNDLFNBQVEsb0JBQWE7SUFDekQsWUFBWSxHQUFXLElBQUksS0FBSyxDQUFDLDRCQUE0QixHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUN6RTtBQUZELDREQUVDO0FBRUQsZ0NBQXdDLFNBQVEsb0JBQWE7SUFDM0QsWUFBWSxJQUFZLElBQUksS0FBSyxDQUFDLHVCQUF1QixJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUN0RTtBQUZELGdFQUVDO0FBRUQsaUNBQXlDLFNBQVEsb0JBQWE7SUFDNUQsWUFBWSxJQUFZO1FBQ3RCLEtBQUssQ0FBQyxrQ0FBa0MsSUFBSSxJQUFJLENBQUMsQ0FBQztJQUNwRCxDQUFDO0NBQ0Y7QUFKRCxrRUFJQztBQUVELCtCQUF1QyxTQUFRLG9CQUFhO0lBQzFELFlBQVksSUFBWSxFQUFFLFVBQXFDO1FBQzdELEtBQUssQ0FBQyxjQUFjLElBQUksOEJBQThCLFVBQVUsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDO0lBQzdFLENBQUM7Q0FDRjtBQUpELDhEQUlDO0FBRUQsK0JBQXVDLFNBQVEsb0JBQWE7SUFDMUQsWUFBWSxJQUFZLEVBQUUsVUFBcUM7UUFDN0QsS0FBSyxDQUFDLGNBQWMsSUFBSSw4QkFBOEIsVUFBVSxDQUFDLElBQUksSUFBSSxDQUFDLENBQUM7SUFDN0UsQ0FBQztDQUNGO0FBSkQsOERBSUM7QUFFRCx5Q0FBaUQsU0FBUSxv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LEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3pDLENBQUM7WUFFRCxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUM7aUJBQ3ZDLElBQUksQ0FBQyxxQkFBUyxDQUFDLFFBQVEsQ0FBQyxFQUFFO2dCQUN6QixTQUFTLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztnQkFFOUIsTUFBTSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3pDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDUixDQUFDLENBQUMsQ0FDSCxDQUFDO1FBRUosTUFBTSxDQUFDLGNBQWMsQ0FBQztJQUN4QixDQUFDO0NBQ0Y7QUFsTkQsMENBa05DIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHsgQmFzZUV4Y2VwdGlvbiwgbG9nZ2luZyB9IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9jb3JlJztcbmltcG9ydCB7IE9ic2VydmFibGUsIGZyb20gYXMgb2JzZXJ2YWJsZUZyb20gfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IGNvbmNhdE1hcCB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7IFVybCB9IGZyb20gJ3VybCc7XG5pbXBvcnQgeyBNZXJnZVN0cmF0ZWd5IH0gZnJvbSAnLi4vdHJlZS9pbnRlcmZhY2UnO1xuaW1wb3J0IHsgTnVsbFRyZWUgfSBmcm9tICcuLi90cmVlL251bGwnO1xuaW1wb3J0IHsgZW1wdHkgfSBmcm9tICcuLi90cmVlL3N0YXRpYyc7XG5pbXBvcnQgeyBXb3JrZmxvdyB9IGZyb20gJy4uL3dvcmtmbG93JztcbmltcG9ydCB7IENvbGxlY3Rpb25JbXBsIH0gZnJvbSAnLi9jb2xsZWN0aW9uJztcbmltcG9ydCB7XG4gIENvbGxlY3Rpb24sXG4gIENvbGxlY3Rpb25EZXNjcmlwdGlvbixcbiAgRW5naW5lLFxuICBFbmdpbmVIb3N0LFxuICBTY2hlbWF0aWMsXG4gIFNjaGVtYXRpY0Rlc2NyaXB0aW9uLFxuICBTb3VyY2UsXG4gIFR5cGVkU2NoZW1hdGljQ29udGV4dCxcbn0gZnJvbSAnLi9pbnRlcmZhY2UnO1xuaW1wb3J0IHsgU2NoZW1hdGljSW1wbCB9IGZyb20gJy4vc2NoZW1hdGljJztcbmltcG9ydCB7XG4gIFRhc2tDb25maWd1cmF0aW9uR2VuZXJhdG9yLFxuICBUYXNrRXhlY3V0b3IsXG4gIFRhc2tJZCxcbiAgVGFza1NjaGVkdWxlcixcbn0gZnJvbSAnLi90YXNrJztcblxuXG5leHBvcnQgY2xhc3MgVW5rbm93blVybFNvdXJjZVByb3RvY29sIGV4dGVuZHMgQmFzZUV4Y2VwdGlvbiB7XG4gIGNvbnN0cnVjdG9yKHVybDogc3RyaW5nKSB7IHN1cGVyKGBVbmtub3duIFByb3RvY29sIG9uIHVybCBcIiR7dXJsfVwiLmApOyB9XG59XG5cbmV4cG9ydCBjbGFzcyBVbmtub3duQ29sbGVjdGlvbkV4Y2VwdGlvbiBleHRlbmRzIEJhc2VFeGNlcHRpb24ge1xuICBjb25zdHJ1Y3RvcihuYW1lOiBzdHJpbmcpIHsgc3VwZXIoYFVua25vd24gY29sbGVjdGlvbiBcIiR7bmFtZX1cIi5gKTsgfVxufVxuXG5leHBvcnQgY2xhc3MgQ2lyY3VsYXJDb2xsZWN0aW9uRXhjZXB0aW9uIGV4dGVuZHMgQmFzZUV4Y2VwdGlvbiB7XG4gIGNvbnN0cnVjdG9yKG5hbWU6IHN0cmluZykge1xuICAgIHN1cGVyKGBDaXJjdWxhciBjb2xsZWN0aW9uIHJlZmVyZW5jZSBcIiR7bmFtZX1cIi5gKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgVW5rbm93blNjaGVtYXRpY0V4Y2VwdGlvbiBleHRlbmRzIEJhc2VFeGNlcHRpb24ge1xuICBjb25zdHJ1Y3RvcihuYW1lOiBzdHJpbmcsIGNvbGxlY3Rpb246IENvbGxlY3Rpb25EZXNjcmlwdGlvbjx7fT4pIHtcbiAgICBzdXBlcihgU2NoZW1hdGljIFwiJHtuYW1lfVwiIG5vdCBmb3VuZCBpbiBjb2xsZWN0aW9uIFwiJHtjb2xsZWN0aW9uLm5hbWV9XCIuYCk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFByaXZhdGVTY2hlbWF0aWNFeGNlcHRpb24gZXh0ZW5kcyBCYXNlRXhjZXB0aW9uIHtcbiAgY29uc3RydWN0b3IobmFtZTogc3RyaW5nLCBjb2xsZWN0aW9uOiBDb2xsZWN0aW9uRGVzY3JpcHRpb248e30+KSB7XG4gICAgc3VwZXIoYFNjaGVtYXRpYyBcIiR7bmFtZX1cIiBub3QgZm91bmQgaW4gY29sbGVjdGlvbiBcIiR7Y29sbGVjdGlvbi5uYW1lfVwiLmApO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBTY2hlbWF0aWNFbmdpbmVDb25mbGljdGluZ0V4Y2VwdGlvbiBleHRlbmRzIEJhc2VFeGNlcHRpb24ge1xuICBjb25zdHJ1Y3RvcigpIHsgc3VwZXIoYEEgc2NoZW1hdGljIHdhcyBjYWxsZWQgZnJvbSBhIGRpZmZlcmVudCBlbmdpbmUgYXMgaXRzIHBhcmVudC5gKTsgfVxufVxuXG5leHBvcnQgY2xhc3MgVW5yZWdpc3RlcmVkVGFza0V4Y2VwdGlvbiBleHRlbmRzIEJhc2VFeGNlcHRpb24ge1xuICBjb25zdHJ1Y3RvcihuYW1lOiBzdHJpbmcsIHNjaGVtYXRpYz86IFNjaGVtYXRpY0Rlc2NyaXB0aW9uPHt9LCB7fT4pIHtcbiAgICBjb25zdCBhZGRlbmR1bSA9IHNjaGVtYXRpYyA/IGAgaW4gc2NoZW1hdGljIFwiJHtzY2hlbWF0aWMubmFtZX1cImAgOiAnJztcbiAgICBzdXBlcihgVW5yZWdpc3RlcmVkIHRhc2sgXCIke25hbWV9XCIke2FkZGVuZHVtfS5gKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgU2NoZW1hdGljRW5naW5lPENvbGxlY3Rpb25UIGV4dGVuZHMgb2JqZWN0LCBTY2hlbWF0aWNUIGV4dGVuZHMgb2JqZWN0PlxuICAgIGltcGxlbWVudHMgRW5naW5lPENvbGxlY3Rpb25ULCBTY2hlbWF0aWNUPiB7XG5cbiAgcHJpdmF0ZSBfY29sbGVjdGlvbkNhY2hlID0gbmV3IE1hcDxzdHJpbmcsIENvbGxlY3Rpb25JbXBsPENvbGxlY3Rpb25ULCBTY2hlbWF0aWNUPj4oKTtcbiAgcHJpdmF0ZSBfc2NoZW1hdGljQ2FjaGVcbiAgICA9IG5ldyBNYXA8c3RyaW5nLCBNYXA8c3RyaW5nLCBTY2hlbWF0aWNJbXBsPENvbGxlY3Rpb25ULCBTY2hlbWF0aWNUPj4+KCk7XG4gIHByaXZhdGUgX3Rhc2tTY2hlZHVsZXJzID0gbmV3IEFycmF5PFRhc2tTY2hlZHVsZXI+KCk7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfaG9zdDogRW5naW5lSG9zdDxDb2xsZWN0aW9uVCwgU2NoZW1hdGljVD4sIHByb3RlY3RlZCBfd29ya2Zsb3c/OiBXb3JrZmxvdykge1xuICB9XG5cbiAgZ2V0IHdvcmtmbG93KCkgeyByZXR1cm4gdGhpcy5fd29ya2Zsb3cgfHwgbnVsbDsgfVxuICBnZXQgZGVmYXVsdE1lcmdlU3RyYXRlZ3koKSB7IHJldHVybiB0aGlzLl9ob3N0LmRlZmF1bHRNZXJnZVN0cmF0ZWd5IHx8IE1lcmdlU3RyYXRlZ3kuRGVmYXVsdDsgfVxuXG4gIGNyZWF0ZUNvbGxlY3Rpb24obmFtZTogc3RyaW5nKTogQ29sbGVjdGlvbjxDb2xsZWN0aW9uVCwgU2NoZW1hdGljVD4ge1xuICAgIGxldCBjb2xsZWN0aW9uID0gdGhpcy5fY29sbGVjdGlvbkNhY2hlLmdldChuYW1lKTtcbiAgICBpZiAoY29sbGVjdGlvbikge1xuICAgICAgcmV0dXJuIGNvbGxlY3Rpb247XG4gICAgfVxuXG4gICAgY29uc3QgW2Rlc2NyaXB0aW9uLCBiYXNlc10gPSB0aGlzLl9jcmVhdGVDb2xsZWN0aW9uRGVzY3JpcHRpb24obmFtZSk7XG5cbiAgICBjb2xsZWN0aW9uID0gbmV3IENvbGxlY3Rpb25JbXBsPENvbGxlY3Rpb25ULCBTY2hlbWF0aWNUPihkZXNjcmlwdGlvbiwgdGhpcywgYmFzZXMpO1xuICAgIHRoaXMuX2NvbGxlY3Rpb25DYWNoZS5zZXQobmFtZSwgY29sbGVjdGlvbik7XG4gICAgdGhpcy5fc2NoZW1hdGljQ2FjaGUuc2V0KG5hbWUsIG5ldyBNYXAoKSk7XG5cbiAgICByZXR1cm4gY29sbGVjdGlvbjtcbiAgfVxuXG4gIHByaXZhdGUgX2NyZWF0ZUNvbGxlY3Rpb25EZXNjcmlwdGlvbihcbiAgICBuYW1lOiBzdHJpbmcsXG4gICAgcGFyZW50TmFtZXM/OiBTZXQ8c3RyaW5nPixcbiAgKTogW0NvbGxlY3Rpb25EZXNjcmlwdGlvbjxDb2xsZWN0aW9uVD4sIEFycmF5PENvbGxlY3Rpb25EZXNjcmlwdGlvbjxDb2xsZWN0aW9uVD4+XSB7XG4gICAgY29uc3QgZGVzY3JpcHRpb24gPSB0aGlzLl9ob3N0LmNyZWF0ZUNvbGxlY3Rpb25EZXNjcmlwdGlvbihuYW1lKTtcbiAgICBpZiAoIWRlc2NyaXB0aW9uKSB7XG4gICAgICB0aHJvdyBuZXcgVW5rbm93bkNvbGxlY3Rpb25FeGNlcHRpb24obmFtZSk7XG4gICAgfVxuICAgIGlmIChwYXJlbnROYW1lcyAmJiBwYXJlbnROYW1lcy5oYXMoZGVzY3JpcHRpb24ubmFtZSkpIHtcbiAgICAgIHRocm93IG5ldyBDaXJjdWxhckNvbGxlY3Rpb25FeGNlcHRpb24obmFtZSk7XG4gICAgfVxuXG4gICAgY29uc3QgYmFzZXMgPSBuZXcgQXJyYXk8Q29sbGVjdGlvbkRlc2NyaXB0aW9uPENvbGxlY3Rpb25UPj4oKTtcbiAgICBpZiAoZGVzY3JpcHRpb24uZXh0ZW5kcykge1xuICAgICAgcGFyZW50TmFtZXMgPSAocGFyZW50TmFtZXMgfHwgbmV3IFNldDxzdHJpbmc+KCkpLmFkZChkZXNjcmlwdGlvbi5uYW1lKTtcbiAgICAgIGZvciAoY29uc3QgYmFzZU5hbWUgb2YgZGVzY3JpcHRpb24uZXh0ZW5kcykge1xuICAgICAgICBjb25zdCBbYmFzZSwgYmFzZUJhc2VzXSA9IHRoaXMuX2NyZWF0ZUNvbGxlY3Rpb25EZXNjcmlwdGlvbihiYXNlTmFtZSwgbmV3IFNldChwYXJlbnROYW1lcykpO1xuXG4gICAgICAgIGJhc2VzLnVuc2hpZnQoYmFzZSwgLi4uYmFzZUJhc2VzKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gW2Rlc2NyaXB0aW9uLCBiYXNlc107XG4gIH1cblxuICBjcmVhdGVDb250ZXh0KFxuICAgIHNjaGVtYXRpYzogU2NoZW1hdGljPENvbGxlY3Rpb25ULCBTY2hlbWF0aWNUPixcbiAgICBwYXJlbnQ/OiBQYXJ0aWFsPFR5cGVkU2NoZW1hdGljQ29udGV4dDxDb2xsZWN0aW9uVCwgU2NoZW1hdGljVD4+LFxuICApOiBUeXBlZFNjaGVtYXRpY0NvbnRleHQ8Q29sbGVjdGlvblQsIFNjaGVtYXRpY1Q+IHtcbiAgICAvLyBDaGVjayBmb3IgaW5jb25zaXN0ZW5jaWVzLlxuICAgIGlmIChwYXJlbnQgJiYgcGFyZW50LmVuZ2luZSAmJiBwYXJlbnQuZW5naW5lICE9PSB0aGlzKSB7XG4gICAgICB0aHJvdyBuZXcgU2NoZW1hdGljRW5naW5lQ29uZmxpY3RpbmdFeGNlcHRpb24oKTtcbiAgICB9XG5cbiAgICBsZXQgY29udGV4dDogVHlwZWRTY2hlbWF0aWNDb250ZXh0PENvbGxlY3Rpb25ULCBTY2hlbWF0aWNUPiA9IHtcbiAgICAgIGRlYnVnOiBwYXJlbnQgJiYgcGFyZW50LmRlYnVnIHx8IGZhbHNlLFxuICAgICAgZW5naW5lOiB0aGlzLFxuICAgICAgbG9nZ2VyOiAocGFyZW50ICYmIHBhcmVudC5sb2dnZXIgJiYgcGFyZW50LmxvZ2dlci5jcmVhdGVDaGlsZChzY2hlbWF0aWMuZGVzY3JpcHRpb24ubmFtZSkpXG4gICAgICAgICAgICAgIHx8IG5ldyBsb2dnaW5nLk51bGxMb2dnZXIoKSxcbiAgICAgIHNjaGVtYXRpYyxcbiAgICAgIHN0cmF0ZWd5OiAocGFyZW50ICYmIHBhcmVudC5zdHJhdGVneSAhPT0gdW5kZWZpbmVkKVxuICAgICAgICA/IHBhcmVudC5zdHJhdGVneSA6IHRoaXMuZGVmYXVsdE1lcmdlU3RyYXRlZ3ksXG4gICAgICBhZGRUYXNrLFxuICAgIH07XG5cbiAgICBjb25zdCBtYXliZU5ld0NvbnRleHQgPSB0aGlzLl9ob3N0LnRyYW5zZm9ybUNvbnRleHQoY29udGV4dCk7XG4gICAgaWYgKG1heWJlTmV3Q29udGV4dCkge1xuICAgICAgY29udGV4dCA9IG1heWJlTmV3Q29udGV4dDtcbiAgICB9XG5cbiAgICBjb25zdCB0YXNrU2NoZWR1bGVyID0gbmV3IFRhc2tTY2hlZHVsZXIoY29udGV4dCk7XG4gICAgY29uc3QgaG9zdCA9IHRoaXMuX2hvc3Q7XG4gICAgdGhpcy5fdGFza1NjaGVkdWxlcnMucHVzaCh0YXNrU2NoZWR1bGVyKTtcblxuICAgIGZ1bmN0aW9uIGFkZFRhc2s8VD4oXG4gICAgICB0YXNrOiBUYXNrQ29uZmlndXJhdGlvbkdlbmVyYXRvcjxUPixcbiAgICAgIGRlcGVuZGVuY2llcz86IEFycmF5PFRhc2tJZD4sXG4gICAgKTogVGFza0lkIHtcbiAgICAgIGNvbnN0IGNvbmZpZyA9IHRhc2sudG9Db25maWd1cmF0aW9uKCk7XG5cbiAgICAgIGlmICghaG9zdC5oYXNUYXNrRXhlY3V0b3IoY29uZmlnLm5hbWUpKSB7XG4gICAgICAgIHRocm93IG5ldyBVbnJlZ2lzdGVyZWRUYXNrRXhjZXB0aW9uKGNvbmZpZy5uYW1lLCBzY2hlbWF0aWMuZGVzY3JpcHRpb24pO1xuICAgICAgfVxuXG4gICAgICBjb25maWcuZGVwZW5kZW5jaWVzID0gY29uZmlnLmRlcGVuZGVuY2llcyB8fCBbXTtcbiAgICAgIGlmIChkZXBlbmRlbmNpZXMpIHtcbiAgICAgICAgY29uZmlnLmRlcGVuZGVuY2llcy51bnNoaWZ0KC4uLmRlcGVuZGVuY2llcyk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0YXNrU2NoZWR1bGVyLnNjaGVkdWxlKGNvbmZpZyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvbnRleHQ7XG4gIH1cblxuICBjcmVhdGVTY2hlbWF0aWMoXG4gICAgbmFtZTogc3RyaW5nLFxuICAgIGNvbGxlY3Rpb246IENvbGxlY3Rpb248Q29sbGVjdGlvblQsIFNjaGVtYXRpY1Q+LFxuICAgIGFsbG93UHJpdmF0ZSA9IGZhbHNlLFxuICApOiBTY2hlbWF0aWM8Q29sbGVjdGlvblQsIFNjaGVtYXRpY1Q+IHtcbiAgICBjb25zdCBjb2xsZWN0aW9uSW1wbCA9IHRoaXMuX2NvbGxlY3Rpb25DYWNoZS5nZXQoY29sbGVjdGlvbi5kZXNjcmlwdGlvbi5uYW1lKTtcbiAgICBjb25zdCBzY2hlbWF0aWNNYXAgPSB0aGlzLl9zY2hlbWF0aWNDYWNoZS5nZXQoY29sbGVjdGlvbi5kZXNjcmlwdGlvbi5uYW1lKTtcbiAgICBpZiAoIWNvbGxlY3Rpb25JbXBsIHx8ICFzY2hlbWF0aWNNYXAgfHwgY29sbGVjdGlvbkltcGwgIT09IGNvbGxlY3Rpb24pIHtcbiAgICAgIC8vIFRoaXMgaXMgd2VpcmQsIG1heWJlIHRoZSBjb2xsZWN0aW9uIHdhcyBjcmVhdGVkIGJ5IGFub3RoZXIgZW5naW5lP1xuICAgICAgdGhyb3cgbmV3IFVua25vd25Db2xsZWN0aW9uRXhjZXB0aW9uKGNvbGxlY3Rpb24uZGVzY3JpcHRpb24ubmFtZSk7XG4gICAgfVxuXG4gICAgbGV0IHNjaGVtYXRpYyA9IHNjaGVtYXRpY01hcC5nZXQobmFtZSk7XG4gICAgaWYgKHNjaGVtYXRpYykge1xuICAgICAgcmV0dXJuIHNjaGVtYXRpYztcbiAgICB9XG5cbiAgICBsZXQgY29sbGVjdGlvbkRlc2NyaXB0aW9uID0gY29sbGVjdGlvbi5kZXNjcmlwdGlvbjtcbiAgICBsZXQgZGVzY3JpcHRpb24gPSB0aGlzLl9ob3N0LmNyZWF0ZVNjaGVtYXRpY0Rlc2NyaXB0aW9uKG5hbWUsIGNvbGxlY3Rpb24uZGVzY3JpcHRpb24pO1xuICAgIGlmICghZGVzY3JpcHRpb24pIHtcbiAgICAgIGlmIChjb2xsZWN0aW9uLmJhc2VEZXNjcmlwdGlvbnMpIHtcbiAgICAgICAgZm9yIChjb25zdCBiYXNlIG9mIGNvbGxlY3Rpb24uYmFzZURlc2NyaXB0aW9ucykge1xuICAgICAgICAgIGRlc2NyaXB0aW9uID0gdGhpcy5faG9zdC5jcmVhdGVTY2hlbWF0aWNEZXNjcmlwdGlvbihuYW1lLCBiYXNlKTtcbiAgICAgICAgICBpZiAoZGVzY3JpcHRpb24pIHtcbiAgICAgICAgICAgIGNvbGxlY3Rpb25EZXNjcmlwdGlvbiA9IGJhc2U7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICghZGVzY3JpcHRpb24pIHtcbiAgICAgICAgLy8gUmVwb3J0IHRoZSBlcnJvciBmb3IgdGhlIHRvcCBsZXZlbCBzY2hlbWF0aWMgY29sbGVjdGlvblxuICAgICAgICB0aHJvdyBuZXcgVW5rbm93blNjaGVtYXRpY0V4Y2VwdGlvbihuYW1lLCBjb2xsZWN0aW9uLmRlc2NyaXB0aW9uKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoZGVzY3JpcHRpb24ucHJpdmF0ZSAmJiAhYWxsb3dQcml2YXRlKSB7XG4gICAgICB0aHJvdyBuZXcgUHJpdmF0ZVNjaGVtYXRpY0V4Y2VwdGlvbihuYW1lLCBjb2xsZWN0aW9uLmRlc2NyaXB0aW9uKTtcbiAgICB9XG5cbiAgICBjb25zdCBmYWN0b3J5ID0gdGhpcy5faG9zdC5nZXRTY2hlbWF0aWNSdWxlRmFjdG9yeShkZXNjcmlwdGlvbiwgY29sbGVjdGlvbkRlc2NyaXB0aW9uKTtcbiAgICBzY2hlbWF0aWMgPSBuZXcgU2NoZW1hdGljSW1wbDxDb2xsZWN0aW9uVCwgU2NoZW1hdGljVD4oZGVzY3JpcHRpb24sIGZhY3RvcnksIGNvbGxlY3Rpb24sIHRoaXMpO1xuXG4gICAgc2NoZW1hdGljTWFwLnNldChuYW1lLCBzY2hlbWF0aWMpO1xuXG4gICAgcmV0dXJuIHNjaGVtYXRpYztcbiAgfVxuXG4gIGxpc3RTY2hlbWF0aWNOYW1lcyhjb2xsZWN0aW9uOiBDb2xsZWN0aW9uPENvbGxlY3Rpb25ULCBTY2hlbWF0aWNUPik6IHN0cmluZ1tdIHtcbiAgICBjb25zdCBuYW1lcyA9IHRoaXMuX2hvc3QubGlzdFNjaGVtYXRpY05hbWVzKGNvbGxlY3Rpb24uZGVzY3JpcHRpb24pO1xuXG4gICAgaWYgKGNvbGxlY3Rpb24uYmFzZURlc2NyaXB0aW9ucykge1xuICAgICAgZm9yIChjb25zdCBiYXNlIG9mIGNvbGxlY3Rpb24uYmFzZURlc2NyaXB0aW9ucykge1xuICAgICAgICBuYW1lcy5wdXNoKC4uLnRoaXMuX2hvc3QubGlzdFNjaGVtYXRpY05hbWVzKGJhc2UpKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyByZW1vdmUgZHVwbGljYXRlc1xuICAgIHJldHVybiBbLi4ubmV3IFNldChuYW1lcyldO1xuICB9XG5cbiAgdHJhbnNmb3JtT3B0aW9uczxPcHRpb25UIGV4dGVuZHMgb2JqZWN0LCBSZXN1bHRUIGV4dGVuZHMgb2JqZWN0PihcbiAgICBzY2hlbWF0aWM6IFNjaGVtYXRpYzxDb2xsZWN0aW9uVCwgU2NoZW1hdGljVD4sXG4gICAgb3B0aW9uczogT3B0aW9uVCxcbiAgKTogT2JzZXJ2YWJsZTxSZXN1bHRUPiB7XG4gICAgcmV0dXJuIHRoaXMuX2hvc3QudHJhbnNmb3JtT3B0aW9uczxPcHRpb25ULCBSZXN1bHRUPihzY2hlbWF0aWMuZGVzY3JpcHRpb24sIG9wdGlvbnMpO1xuICB9XG5cbiAgY3JlYXRlU291cmNlRnJvbVVybCh1cmw6IFVybCwgY29udGV4dDogVHlwZWRTY2hlbWF0aWNDb250ZXh0PENvbGxlY3Rpb25ULCBTY2hlbWF0aWNUPik6IFNvdXJjZSB7XG4gICAgc3dpdGNoICh1cmwucHJvdG9jb2wpIHtcbiAgICAgIGNhc2UgJ251bGw6JzogcmV0dXJuICgpID0+IG5ldyBOdWxsVHJlZSgpO1xuICAgICAgY2FzZSAnZW1wdHk6JzogcmV0dXJuICgpID0+IGVtcHR5KCk7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICBjb25zdCBob3N0U291cmNlID0gdGhpcy5faG9zdC5jcmVhdGVTb3VyY2VGcm9tVXJsKHVybCwgY29udGV4dCk7XG4gICAgICAgIGlmICghaG9zdFNvdXJjZSkge1xuICAgICAgICAgIHRocm93IG5ldyBVbmtub3duVXJsU291cmNlUHJvdG9jb2wodXJsLnRvU3RyaW5nKCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGhvc3RTb3VyY2U7XG4gICAgfVxuICB9XG5cbiAgZXhlY3V0ZVBvc3RUYXNrcygpOiBPYnNlcnZhYmxlPHZvaWQ+IHtcbiAgICBjb25zdCBleGVjdXRvcnMgPSBuZXcgTWFwPHN0cmluZywgVGFza0V4ZWN1dG9yPigpO1xuXG4gICAgY29uc3QgdGFza09ic2VydmFibGUgPSBvYnNlcnZhYmxlRnJvbSh0aGlzLl90YXNrU2NoZWR1bGVycylcbiAgICAgIC5waXBlKFxuICAgICAgICBjb25jYXRNYXAoc2NoZWR1bGVyID0+IHNjaGVkdWxlci5maW5hbGl6ZSgpKSxcbiAgICAgICAgY29uY2F0TWFwKHRhc2sgPT4ge1xuICAgICAgICAgIGNvbnN0IHsgbmFtZSwgb3B0aW9ucyB9ID0gdGFzay5jb25maWd1cmF0aW9uO1xuXG4gICAgICAgICAgY29uc3QgZXhlY3V0b3IgPSBleGVjdXRvcnMuZ2V0KG5hbWUpO1xuICAgICAgICAgIGlmIChleGVjdXRvcikge1xuICAgICAgICAgICAgcmV0dXJuIGV4ZWN1dG9yKG9wdGlvbnMsIHRhc2suY29udGV4dCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIHRoaXMuX2hvc3QuY3JlYXRlVGFza0V4ZWN1dG9yKG5hbWUpXG4gICAgICAgICAgICAucGlwZShjb25jYXRNYXAoZXhlY3V0b3IgPT4ge1xuICAgICAgICAgICAgICBleGVjdXRvcnMuc2V0KG5hbWUsIGV4ZWN1dG9yKTtcblxuICAgICAgICAgICAgICByZXR1cm4gZXhlY3V0b3Iob3B0aW9ucywgdGFzay5jb250ZXh0KTtcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfSksXG4gICAgICApO1xuXG4gICAgcmV0dXJuIHRhc2tPYnNlcnZhYmxlO1xuICB9XG59XG4iXX0=