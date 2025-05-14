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
const schematics_1 = require("@angular-devkit/schematics"); // tslint:disable-line:no-implicit-dependencies
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/internal/operators");
const operators_2 = require("rxjs/operators");
const __1 = require("..");
const node_1 = require("../../tasks/node");
class NodeWorkflow {
    constructor(_host, _options) {
        this._host = _host;
        this._options = _options;
        this._reporter = new rxjs_1.Subject();
        this._lifeCycle = new rxjs_1.Subject();
        /**
         * Create the SchematicEngine, which is used by the Schematic library as callbacks to load a
         * Collection or a Schematic.
         */
        this._engineHost = new __1.NodeModulesEngineHost();
        this._engine = new schematics_1.SchematicEngine(this._engineHost, this);
        // Add support for schemaJson.
        this._registry = new core_1.schema.CoreSchemaRegistry(schematics_1.formats.standardFormats);
        this._engineHost.registerOptionsTransform(__1.validateOptionsWithSchema(this._registry));
        this._engineHost.registerTaskExecutor(node_1.BuiltinTaskExecutor.NodePackage, {
            allowPackageManagerOverride: true,
            packageManager: this._options.packageManager,
            rootDirectory: this._options.root,
        });
        this._engineHost.registerTaskExecutor(node_1.BuiltinTaskExecutor.RepositoryInitializer, {
            rootDirectory: this._options.root,
        });
        this._engineHost.registerTaskExecutor(node_1.BuiltinTaskExecutor.RunSchematic);
        this._engineHost.registerTaskExecutor(node_1.BuiltinTaskExecutor.TslintFix);
        this._context = [];
    }
    get context() {
        const maybeContext = this._context[this._context.length - 1];
        if (!maybeContext) {
            throw new Error('Cannot get context when workflow is not executing...');
        }
        return maybeContext;
    }
    get registry() {
        return this._registry;
    }
    get reporter() {
        return this._reporter.asObservable();
    }
    get lifeCycle() {
        return this._lifeCycle.asObservable();
    }
    execute(options) {
        const parentContext = this._context[this._context.length - 1];
        if (!parentContext) {
            this._lifeCycle.next({ kind: 'start' });
        }
        /** Create the collection and the schematic. */
        const collection = this._engine.createCollection(options.collection);
        // Only allow private schematics if called from the same collection.
        const allowPrivate = options.allowPrivate
            || (parentContext && parentContext.collection === options.collection);
        const schematic = collection.createSchematic(options.schematic, allowPrivate);
        // We need two sinks if we want to output what will happen, and actually do the work.
        // Note that fsSink is technically not used if `--dry-run` is passed, but creating the Sink
        // does not have any side effect.
        const dryRunSink = new schematics_1.DryRunSink(this._host, this._options.force);
        const fsSink = new schematics_1.HostSink(this._host, this._options.force);
        let error = false;
        const dryRunSubscriber = dryRunSink.reporter.subscribe(event => {
            this._reporter.next(event);
            error = error || (event.kind == 'error');
        });
        this._lifeCycle.next({ kind: 'workflow-start' });
        const context = Object.assign({}, options, { debug: options.debug || false, logger: options.logger || (parentContext && parentContext.logger) || new core_1.logging.NullLogger(), parentContext });
        this._context.push(context);
        return rxjs_1.concat(schematic.call(options.options, rxjs_1.of(new schematics_1.HostTree(this._host)), {
            logger: context.logger,
        }).pipe(operators_2.map(tree => schematics_1.Tree.optimize(tree)), operators_2.concatMap((tree) => {
            return rxjs_1.concat(dryRunSink.commit(tree).pipe(operators_2.ignoreElements()), rxjs_1.of(tree));
        }), operators_2.concatMap((tree) => {
            dryRunSubscriber.unsubscribe();
            if (error) {
                return rxjs_1.throwError(new schematics_1.UnsuccessfulWorkflowExecution());
            }
            if (this._options.dryRun) {
                return rxjs_1.EMPTY;
            }
            return fsSink.commit(tree);
        })), rxjs_1.concat(new rxjs_1.Observable(obs => {
            if (!this._options.dryRun) {
                this._lifeCycle.next({ kind: 'post-tasks-start' });
                this._engine.executePostTasks()
                    .pipe(operators_1.reduce(() => { }), operators_1.tap(() => this._lifeCycle.next({ kind: 'post-tasks-end' })))
                    .subscribe(obs);
            }
            else {
                obs.complete();
            }
        })), rxjs_1.concat(new rxjs_1.Observable(obs => {
            this._lifeCycle.next({ kind: 'workflow-end' });
            this._context.pop();
            if (this._context.length == 0) {
                this._lifeCycle.next({ kind: 'end' });
            }
            obs.complete();
        }))).pipe(operators_1.reduce(() => { }));
    }
}
exports.NodeWorkflow = NodeWorkflow;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9kZS13b3JrZmxvdy5qcyIsInNvdXJjZVJvb3QiOiIuLyIsInNvdXJjZXMiOlsicGFja2FnZXMvYW5ndWxhcl9kZXZraXQvc2NoZW1hdGljcy90b29scy93b3JrZmxvdy9ub2RlLXdvcmtmbG93LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7OztHQU1HO0FBQ0gsK0NBQXdFO0FBQ3hFLDJEQVNvQyxDQUFFLCtDQUErQztBQUNyRiwrQkFBMEU7QUFDMUUsdURBQXNEO0FBQ3RELDhDQUFnRTtBQUNoRSwwQkFBc0U7QUFFdEUsMkNBQXVEO0FBRXZEO0lBVUUsWUFDWSxLQUFxQixFQUNyQixRQUtUO1FBTlMsVUFBSyxHQUFMLEtBQUssQ0FBZ0I7UUFDckIsYUFBUSxHQUFSLFFBQVEsQ0FLakI7UUFaTyxjQUFTLEdBQXlCLElBQUksY0FBTyxFQUFFLENBQUM7UUFDaEQsZUFBVSxHQUFxQyxJQUFJLGNBQU8sRUFBRSxDQUFDO1FBYXJFOzs7V0FHRztRQUNILElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSx5QkFBcUIsRUFBRSxDQUFDO1FBQy9DLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSw0QkFBZSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFM0QsOEJBQThCO1FBQzlCLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxhQUFNLENBQUMsa0JBQWtCLENBQUMsb0JBQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUN4RSxJQUFJLENBQUMsV0FBVyxDQUFDLHdCQUF3QixDQUFDLDZCQUF5QixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1FBRXJGLElBQUksQ0FBQyxXQUFXLENBQUMsb0JBQW9CLENBQ25DLDBCQUFtQixDQUFDLFdBQVcsRUFDL0I7WUFDRSwyQkFBMkIsRUFBRSxJQUFJO1lBQ2pDLGNBQWMsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLGNBQWM7WUFDNUMsYUFBYSxFQUFFLElBQUksQ0FBQyxR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RSxJQUFJLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztZQUN4QyxDQUFDO1lBRUQsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ2pCLENBQUMsQ0FBQyxDQUFDLENBQ0osQ0FBQyxJQUFJLENBQUMsa0JBQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzVCLENBQUM7Q0FDRjtBQTVKRCxvQ0E0SkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQgeyBQYXRoLCBsb2dnaW5nLCBzY2hlbWEsIHZpcnR1YWxGcyB9IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9jb3JlJztcbmltcG9ydCB7XG4gIERyeVJ1blNpbmssXG4gIEhvc3RTaW5rLFxuICBIb3N0VHJlZSxcbiAgU2NoZW1hdGljRW5naW5lLFxuICBUcmVlLFxuICBVbnN1Y2Nlc3NmdWxXb3JrZmxvd0V4ZWN1dGlvbixcbiAgZm9ybWF0cyxcbiAgd29ya2Zsb3csXG59IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9zY2hlbWF0aWNzJzsgIC8vIHRzbGludDpkaXNhYmxlLWxpbmU6bm8taW1wbGljaXQtZGVwZW5kZW5jaWVzXG5pbXBvcnQgeyBFTVBUWSwgT2JzZXJ2YWJsZSwgU3ViamVjdCwgY29uY2F0LCBvZiwgdGhyb3dFcnJvciB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgcmVkdWNlLCB0YXAgfSBmcm9tICdyeGpzL2ludGVybmFsL29wZXJhdG9ycyc7XG5pbXBvcnQgeyBjb25jYXRNYXAsIGlnbm9yZUVsZW1lbnRzLCBtYXAgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5pbXBvcnQgeyBOb2RlTW9kdWxlc0VuZ2luZUhvc3QsIHZhbGlkYXRlT3B0aW9uc1dpdGhTY2hlbWEgfSBmcm9tICcuLic7XG5pbXBvcnQgeyBEcnlSdW5FdmVudCB9IGZyb20gJy4uLy4uL3NyYy9zaW5rL2RyeXJ1bic7XG5pbXBvcnQgeyBCdWlsdGluVGFza0V4ZWN1dG9yIH0gZnJvbSAnLi4vLi4vdGFza3Mvbm9kZSc7XG5cbmV4cG9ydCBjbGFzcyBOb2RlV29ya2Zsb3cgaW1wbGVtZW50cyB3b3JrZmxvdy5Xb3JrZmxvdyB7XG4gIHByb3RlY3RlZCBfZW5naW5lOiBTY2hlbWF0aWNFbmdpbmU8e30sIHt9PjtcbiAgcHJvdGVjdGVkIF9lbmdpbmVIb3N0OiBOb2RlTW9kdWxlc0VuZ2luZUhvc3Q7XG4gIHByb3RlY3RlZCBfcmVnaXN0cnk6IHNjaGVtYS5Db3JlU2NoZW1hUmVnaXN0cnk7XG5cbiAgcHJvdGVjdGVkIF9yZXBvcnRlcjogU3ViamVjdDxEcnlSdW5FdmVudD4gPSBuZXcgU3ViamVjdCgpO1xuICBwcm90ZWN0ZWQgX2xpZmVDeWNsZTogU3ViamVjdDx3b3JrZmxvdy5MaWZlQ3ljbGVFdmVudD4gPSBuZXcgU3ViamVjdCgpO1xuXG4gIHByb3RlY3RlZCBfY29udGV4dDogd29ya2Zsb3cuV29ya2Zsb3dFeGVjdXRpb25Db250ZXh0W107XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJvdGVjdGVkIF9ob3N0OiB2aXJ0dWFsRnMuSG9zdCxcbiAgICBwcm90ZWN0ZWQgX29wdGlvbnM6IHtcbiAgICAgIGZvcmNlPzogYm9vbGVhbjtcbiAgICAgIGRyeVJ1bj86IGJvb2xlYW47XG4gICAgICByb290PzogUGF0aCxcbiAgICAgIHBhY2thZ2VNYW5hZ2VyPzogc3RyaW5nO1xuICAgIH0sXG4gICkge1xuICAgIC8qKlxuICAgICAqIENyZWF0ZSB0aGUgU2NoZW1hdGljRW5naW5lLCB3aGljaCBpcyB1c2VkIGJ5IHRoZSBTY2hlbWF0aWMgbGlicmFyeSBhcyBjYWxsYmFja3MgdG8gbG9hZCBhXG4gICAgICogQ29sbGVjdGlvbiBvciBhIFNjaGVtYXRpYy5cbiAgICAgKi9cbiAgICB0aGlzLl9lbmdpbmVIb3N0ID0gbmV3IE5vZGVNb2R1bGVzRW5naW5lSG9zdCgpO1xuICAgIHRoaXMuX2VuZ2luZSA9IG5ldyBTY2hlbWF0aWNFbmdpbmUodGhpcy5fZW5naW5lSG9zdCwgdGhpcyk7XG5cbiAgICAvLyBBZGQgc3VwcG9ydCBmb3Igc2NoZW1hSnNvbi5cbiAgICB0aGlzLl9yZWdpc3RyeSA9IG5ldyBzY2hlbWEuQ29yZVNjaGVtYVJlZ2lzdHJ5KGZvcm1hdHMuc3RhbmRhcmRGb3JtYXRzKTtcbiAgICB0aGlzLl9lbmdpbmVIb3N0LnJlZ2lzdGVyT3B0aW9uc1RyYW5zZm9ybSh2YWxpZGF0ZU9wdGlvbnNXaXRoU2NoZW1hKHRoaXMuX3JlZ2lzdHJ5KSk7XG5cbiAgICB0aGlzLl9lbmdpbmVIb3N0LnJlZ2lzdGVyVGFza0V4ZWN1dG9yKFxuICAgICAgQnVpbHRpblRhc2tFeGVjdXRvci5Ob2RlUGFja2FnZSxcbiAgICAgIHtcbiAgICAgICAgYWxsb3dQYWNrYWdlTWFuYWdlck92ZXJyaWRlOiB0cnVlLFxuICAgICAgICBwYWNrYWdlTWFuYWdlcjogdGhpcy5fb3B0aW9ucy5wYWNrYWdlTWFuYWdlcixcbiAgICAgICAgcm9vdERpcmVjdG9yeTogdGhpcy5fb3B0aW9ucy5yb290LFxuICAgICAgfSxcbiAgICApO1xuICAgIHRoaXMuX2VuZ2luZUhvc3QucmVnaXN0ZXJUYXNrRXhlY3V0b3IoXG4gICAgICBCdWlsdGluVGFza0V4ZWN1dG9yLlJlcG9zaXRvcnlJbml0aWFsaXplcixcbiAgICAgIHtcbiAgICAgICAgcm9vdERpcmVjdG9yeTogdGhpcy5fb3B0aW9ucy5yb290LFxuICAgICAgfSxcbiAgICApO1xuICAgIHRoaXMuX2VuZ2luZUhvc3QucmVnaXN0ZXJUYXNrRXhlY3V0b3IoQnVpbHRpblRhc2tFeGVjdXRvci5SdW5TY2hlbWF0aWMpO1xuICAgIHRoaXMuX2VuZ2luZUhvc3QucmVnaXN0ZXJUYXNrRXhlY3V0b3IoQnVpbHRpblRhc2tFeGVjdXRvci5Uc2xpbnRGaXgpO1xuXG4gICAgdGhpcy5fY29udGV4dCA9IFtdO1xuICB9XG5cbiAgZ2V0IGNvbnRleHQoKTogUmVhZG9ubHk8d29ya2Zsb3cuV29ya2Zsb3dFeGVjdXRpb25Db250ZXh0PiB7XG4gICAgY29uc3QgbWF5YmVDb250ZXh0ID0gdGhpcy5fY29udGV4dFt0aGlzLl9jb250ZXh0Lmxlbmd0aCAtIDFdO1xuICAgIGlmICghbWF5YmVDb250ZXh0KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBnZXQgY29udGV4dCB3aGVuIHdvcmtmbG93IGlzIG5vdCBleGVjdXRpbmcuLi4nKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbWF5YmVDb250ZXh0O1xuICB9XG4gIGdldCByZWdpc3RyeSgpOiBzY2hlbWEuU2NoZW1hUmVnaXN0cnkge1xuICAgIHJldHVybiB0aGlzLl9yZWdpc3RyeTtcbiAgfVxuICBnZXQgcmVwb3J0ZXIoKTogT2JzZXJ2YWJsZTxEcnlSdW5FdmVudD4ge1xuICAgIHJldHVybiB0aGlzLl9yZXBvcnRlci5hc09ic2VydmFibGUoKTtcbiAgfVxuICBnZXQgbGlmZUN5Y2xlKCk6IE9ic2VydmFibGU8d29ya2Zsb3cuTGlmZUN5Y2xlRXZlbnQ+IHtcbiAgICByZXR1cm4gdGhpcy5fbGlmZUN5Y2xlLmFzT2JzZXJ2YWJsZSgpO1xuICB9XG5cbiAgZXhlY3V0ZShcbiAgICBvcHRpb25zOiBQYXJ0aWFsPHdvcmtmbG93LldvcmtmbG93RXhlY3V0aW9uQ29udGV4dD4gJiB3b3JrZmxvdy5SZXF1aXJlZFdvcmtmbG93RXhlY3V0aW9uQ29udGV4dCxcbiAgKTogT2JzZXJ2YWJsZTx2b2lkPiB7XG4gICAgY29uc3QgcGFyZW50Q29udGV4dCA9IHRoaXMuX2NvbnRleHRbdGhpcy5fY29udGV4dC5sZW5ndGggLSAxXTtcblxuICAgIGlmICghcGFyZW50Q29udGV4dCkge1xuICAgICAgdGhpcy5fbGlmZUN5Y2xlLm5leHQoeyBraW5kOiAnc3RhcnQnIH0pO1xuICAgIH1cblxuICAgIC8qKiBDcmVhdGUgdGhlIGNvbGxlY3Rpb24gYW5kIHRoZSBzY2hlbWF0aWMuICovXG4gICAgY29uc3QgY29sbGVjdGlvbiA9IHRoaXMuX2VuZ2luZS5jcmVhdGVDb2xsZWN0aW9uKG9wdGlvbnMuY29sbGVjdGlvbik7XG4gICAgLy8gT25seSBhbGxvdyBwcml2YXRlIHNjaGVtYXRpY3MgaWYgY2FsbGVkIGZyb20gdGhlIHNhbWUgY29sbGVjdGlvbi5cbiAgICBjb25zdCBhbGxvd1ByaXZhdGUgPSBvcHRpb25zLmFsbG93UHJpdmF0ZVxuICAgICAgICAgICAgICAgICAgICAgICAgIHx8IChwYXJlbnRDb250ZXh0ICYmIHBhcmVudENvbnRleHQuY29sbGVjdGlvbiA9PT0gb3B0aW9ucy5jb2xsZWN0aW9uKTtcbiAgICBjb25zdCBzY2hlbWF0aWMgPSBjb2xsZWN0aW9uLmNyZWF0ZVNjaGVtYXRpYyhvcHRpb25zLnNjaGVtYXRpYywgYWxsb3dQcml2YXRlKTtcblxuICAgIC8vIFdlIG5lZWQgdHdvIHNpbmtzIGlmIHdlIHdhbnQgdG8gb3V0cHV0IHdoYXQgd2lsbCBoYXBwZW4sIGFuZCBhY3R1YWxseSBkbyB0aGUgd29yay5cbiAgICAvLyBOb3RlIHRoYXQgZnNTaW5rIGlzIHRlY2huaWNhbGx5IG5vdCB1c2VkIGlmIGAtLWRyeS1ydW5gIGlzIHBhc3NlZCwgYnV0IGNyZWF0aW5nIHRoZSBTaW5rXG4gICAgLy8gZG9lcyBub3QgaGF2ZSBhbnkgc2lkZSBlZmZlY3QuXG4gICAgY29uc3QgZHJ5UnVuU2luayA9IG5ldyBEcnlSdW5TaW5rKHRoaXMuX2hvc3QsIHRoaXMuX29wdGlvbnMuZm9yY2UpO1xuICAgIGNvbnN0IGZzU2luayA9IG5ldyBIb3N0U2luayh0aGlzLl9ob3N0LCB0aGlzLl9vcHRpb25zLmZvcmNlKTtcblxuICAgIGxldCBlcnJvciA9IGZhbHNlO1xuICAgIGNvbnN0IGRyeVJ1blN1YnNjcmliZXIgPSBkcnlSdW5TaW5rLnJlcG9ydGVyLnN1YnNjcmliZShldmVudCA9PiB7XG4gICAgICB0aGlzLl9yZXBvcnRlci5uZXh0KGV2ZW50KTtcbiAgICAgIGVycm9yID0gZXJyb3IgfHwgKGV2ZW50LmtpbmQgPT0gJ2Vycm9yJyk7XG4gICAgfSk7XG5cbiAgICB0aGlzLl9saWZlQ3ljbGUubmV4dCh7IGtpbmQ6ICd3b3JrZmxvdy1zdGFydCcgfSk7XG5cbiAgICBjb25zdCBjb250ZXh0ID0ge1xuICAgICAgLi4ub3B0aW9ucyxcbiAgICAgIGRlYnVnOiBvcHRpb25zLmRlYnVnIHx8IGZhbHNlLFxuICAgICAgbG9nZ2VyOiBvcHRpb25zLmxvZ2dlciB8fCAocGFyZW50Q29udGV4dCAmJiBwYXJlbnRDb250ZXh0LmxvZ2dlcikgfHwgbmV3IGxvZ2dpbmcuTnVsbExvZ2dlcigpLFxuICAgICAgcGFyZW50Q29udGV4dCxcbiAgICB9O1xuICAgIHRoaXMuX2NvbnRleHQucHVzaChjb250ZXh0KTtcblxuICAgIHJldHVybiBjb25jYXQoXG4gICAgICBzY2hlbWF0aWMuY2FsbChvcHRpb25zLm9wdGlvbnMsIG9mKG5ldyBIb3N0VHJlZSh0aGlzLl9ob3N0KSksIHtcbiAgICAgICAgbG9nZ2VyOiBjb250ZXh0LmxvZ2dlcixcbiAgICAgIH0pLnBpcGUoXG4gICAgICAgIG1hcCh0cmVlID0+IFRyZWUub3B0aW1pemUodHJlZSkpLFxuICAgICAgICBjb25jYXRNYXAoKHRyZWU6IFRyZWUpID0+IHtcbiAgICAgICAgICByZXR1cm4gY29uY2F0KFxuICAgICAgICAgICAgZHJ5UnVuU2luay5jb21taXQodHJlZSkucGlwZShcbiAgICAgICAgICAgICAgaWdub3JlRWxlbWVudHMoKSxcbiAgICAgICAgICAgICksXG4gICAgICAgICAgICBvZih0cmVlKSxcbiAgICAgICAgICApO1xuICAgICAgICB9KSxcbiAgICAgICAgY29uY2F0TWFwKCh0cmVlOiBUcmVlKSA9PiB7XG4gICAgICAgICAgZHJ5UnVuU3Vic2NyaWJlci51bnN1YnNjcmliZSgpO1xuICAgICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgICAgcmV0dXJuIHRocm93RXJyb3IobmV3IFVuc3VjY2Vzc2Z1bFdvcmtmbG93RXhlY3V0aW9uKCkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAodGhpcy5fb3B0aW9ucy5kcnlSdW4pIHtcbiAgICAgICAgICAgIHJldHVybiBFTVBUWTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4gZnNTaW5rLmNvbW1pdCh0cmVlKTtcbiAgICAgICAgfSksXG4gICAgICApLFxuICAgICAgY29uY2F0KG5ldyBPYnNlcnZhYmxlPHZvaWQ+KG9icyA9PiB7XG4gICAgICAgIGlmICghdGhpcy5fb3B0aW9ucy5kcnlSdW4pIHtcbiAgICAgICAgICB0aGlzLl9saWZlQ3ljbGUubmV4dCh7IGtpbmQ6ICdwb3N0LXRhc2tzLXN0YXJ0JyB9KTtcbiAgICAgICAgICB0aGlzLl9lbmdpbmUuZXhlY3V0ZVBvc3RUYXNrcygpXG4gICAgICAgICAgICAucGlwZShcbiAgICAgICAgICAgICAgcmVkdWNlKCgpID0+IHt9KSxcbiAgICAgICAgICAgICAgdGFwKCgpID0+IHRoaXMuX2xpZmVDeWNsZS5uZXh0KHsga2luZDogJ3Bvc3QtdGFza3MtZW5kJyB9KSksXG4gICAgICAgICAgICApXG4gICAgICAgICAgICAuc3Vic2NyaWJlKG9icyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgb2JzLmNvbXBsZXRlKCk7XG4gICAgICAgIH1cbiAgICAgIH0pKSxcbiAgICAgIGNvbmNhdChuZXcgT2JzZXJ2YWJsZShvYnMgPT4ge1xuICAgICAgICB0aGlzLl9saWZlQ3ljbGUubmV4dCh7IGtpbmQ6ICd3b3JrZmxvdy1lbmQnIH0pO1xuICAgICAgICB0aGlzLl9jb250ZXh0LnBvcCgpO1xuXG4gICAgICAgIGlmICh0aGlzLl9jb250ZXh0Lmxlbmd0aCA9PSAwKSB7XG4gICAgICAgICAgdGhpcy5fbGlmZUN5Y2xlLm5leHQoeyBraW5kOiAnZW5kJyB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIG9icy5jb21wbGV0ZSgpO1xuICAgICAgfSkpLFxuICAgICkucGlwZShyZWR1Y2UoKCkgPT4geyB9KSk7XG4gIH1cbn1cbiJdfQ==