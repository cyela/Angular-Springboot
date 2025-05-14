/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Path, schema, virtualFs } from '@angular-devkit/core';
import { SchematicEngine, workflow } from '@angular-devkit/schematics';
import { Observable, Subject } from 'rxjs';
import { NodeModulesEngineHost } from '..';
import { DryRunEvent } from '../../src/sink/dryrun';
export declare class NodeWorkflow implements workflow.Workflow {
    protected _host: virtualFs.Host;
    protected _options: {
        force?: boolean;
        dryRun?: boolean;
        root?: Path;
        packageManager?: string;
    };
    protected _engine: SchematicEngine<{}, {}>;
    protected _engineHost: NodeModulesEngineHost;
    protected _registry: schema.CoreSchemaRegistry;
    protected _reporter: Subject<DryRunEvent>;
    protected _lifeCycle: Subject<workflow.LifeCycleEvent>;
    protected _context: workflow.WorkflowExecutionContext[];
    constructor(_host: virtualFs.Host, _options: {
        force?: boolean;
        dryRun?: boolean;
        root?: Path;
        packageManager?: string;
    });
    readonly context: Readonly<workflow.WorkflowExecutionContext>;
    readonly registry: schema.SchemaRegistry;
    readonly reporter: Observable<DryRunEvent>;
    readonly lifeCycle: Observable<workflow.LifeCycleEvent>;
    execute(options: Partial<workflow.WorkflowExecutionContext> & workflow.RequiredWorkflowExecutionContext): Observable<void>;
}
