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
const core = require("@angular-devkit/core/node");
const path_1 = require("path");
const tools_1 = require("../tools");
const export_ref_1 = require("./export-ref");
const file_system_engine_host_base_1 = require("./file-system-engine-host-base");
const file_system_utility_1 = require("./file-system-utility");
class NodePackageDoesNotSupportSchematics extends core_1.BaseException {
    constructor(name) {
        super(`Package ${JSON.stringify(name)} was found but does not support schematics.`);
    }
}
exports.NodePackageDoesNotSupportSchematics = NodePackageDoesNotSupportSchematics;
/**
 * A simple EngineHost that uses NodeModules to resolve collections.
 */
class NodeModulesEngineHost extends file_system_engine_host_base_1.FileSystemEngineHostBase {
    constructor() { super(); }
    _resolvePackageJson(name, basedir = process.cwd()) {
        return core.resolve(name, {
            basedir,
            checkLocal: true,
            checkGlobal: true,
            resolvePackageJson: true,
        });
    }
    _resolvePath(name, basedir = process.cwd()) {
        // Allow relative / absolute paths.
        if (name.startsWith('.') || name.startsWith('/')) {
            return path_1.resolve(basedir, name);
        }
        else {
            // If it's a file inside a package, resolve the package then return the file...
            if (name.split('/').length > (name[0] == '@' ? 2 : 1)) {
                const rest = name.split('/');
                const packageName = rest.shift() + (name[0] == '@' ? '/' + rest.shift() : '');
                return path_1.resolve(core.resolve(packageName, {
                    basedir,
                    checkLocal: true,
                    checkGlobal: true,
                    resolvePackageJson: true,
                }), '..', ...rest);
            }
            return core.resolve(name, {
                basedir,
                checkLocal: true,
                checkGlobal: true,
            });
        }
    }
    _resolveCollectionPath(name) {
        let collectionPath = undefined;
        if (name.split('/').length > (name[0] == '@' ? 2 : 1)) {
            try {
                collectionPath = this._resolvePath(name, process.cwd());
            }
            catch (_) {
            }
        }
        if (!collectionPath) {
            let packageJsonPath = this._resolvePackageJson(name, process.cwd());
            // If it's a file, use it as is. Otherwise append package.json to it.
            if (!core.fs.isFile(packageJsonPath)) {
                packageJsonPath = path_1.join(packageJsonPath, 'package.json');
            }
            const pkgJsonSchematics = require(packageJsonPath)['schematics'];
            if (!pkgJsonSchematics || typeof pkgJsonSchematics != 'string') {
                throw new NodePackageDoesNotSupportSchematics(name);
            }
            collectionPath = this._resolvePath(pkgJsonSchematics, path_1.dirname(packageJsonPath));
        }
        try {
            if (collectionPath) {
                file_system_utility_1.readJsonFile(collectionPath);
                return collectionPath;
            }
        }
        catch (e) {
        }
        throw new tools_1.CollectionCannotBeResolvedException(name);
    }
    _resolveReferenceString(refString, parentPath) {
        const ref = new export_ref_1.ExportStringRef(refString, parentPath);
        if (!ref.ref) {
            return null;
        }
        return { ref: ref.ref, path: ref.module };
    }
    _transformCollectionDescription(name, desc) {
        if (!desc.schematics || typeof desc.schematics != 'object') {
            throw new tools_1.CollectionMissingSchematicsMapException(name);
        }
        return Object.assign({}, desc, { name });
    }
    _transformSchematicDescription(name, _collection, desc) {
        if (!desc.factoryFn || !desc.path || !desc.description) {
            throw new tools_1.SchematicMissingFieldsException(name);
        }
        return desc;
    }
}
exports.NodeModulesEngineHost = NodeModulesEngineHost;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9kZS1tb2R1bGUtZW5naW5lLWhvc3QuanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzIjpbInBhY2thZ2VzL2FuZ3VsYXJfZGV2a2l0L3NjaGVtYXRpY3MvdG9vbHMvbm9kZS1tb2R1bGUtZW5naW5lLWhvc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7O0dBTUc7QUFDSCwrQ0FBcUQ7QUFDckQsa0RBQWtEO0FBQ2xELCtCQUE2RDtBQUU3RCxvQ0FJa0I7QUFLbEIsNkNBQStDO0FBQy9DLGlGQUEwRTtBQUMxRSwrREFBcUQ7QUFHckQseUNBQWlELFNBQVEsb0JBQWE7SUFDcEUsWUFBWSxJQUFZO1FBQ3RCLEtBQUssQ0FBQyxXQUFXLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLDZDQUE2QyxDQUFDLENBQUM7SUFDdEYsQ0FBQztDQUNGO0FBSkQsa0ZBSUM7QUFHRDs7R0FFRztBQUNILDJCQUFtQyxTQUFRLHVEQUF3QjtJQUNqRSxnQkFBZ0IsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBRWhCLG1CQUFtQixDQUFDLElBQVksRUFBRSxPQUFPLEdBQUcsT0FBTyxDQUFDLEdBQUcsRUFBRTtRQUNqRSxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUU7WUFDeEIsT0FBTztZQUNQLFVBQVUsRUFBRSxJQUFJO1lBQ2hCLFdBQVcsRUFBRSxJQUFJO1lBQ2pCLGtCQUFrQixFQUFFLElBQUk7U0FDekIsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVTLFlBQVksQ0FBQyxJQUFZLEVBQUUsT0FBTyxHQUFHLE9BQU8sQ0FBQyxHQUFHLEVBQUU7UUFDMUQsbUNBQW1DO1FBQ25DLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDakQsTUFBTSxDQUFDLGNBQVcsQ0FBQyxPQUFPLEVBQUUsSUFB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LENBQUM7Q0FDRjtBQTNHRCxzREEyR0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQgeyBCYXNlRXhjZXB0aW9uIH0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L2NvcmUnO1xuaW1wb3J0ICogYXMgY29yZSBmcm9tICdAYW5ndWxhci1kZXZraXQvY29yZS9ub2RlJztcbmltcG9ydCB7IGRpcm5hbWUsIGpvaW4sIHJlc29sdmUgYXMgcmVzb2x2ZVBhdGggfSBmcm9tICdwYXRoJztcbmltcG9ydCB7IFJ1bGVGYWN0b3J5IH0gZnJvbSAnLi4vc3JjJztcbmltcG9ydCB7XG4gIENvbGxlY3Rpb25DYW5ub3RCZVJlc29sdmVkRXhjZXB0aW9uLFxuICBDb2xsZWN0aW9uTWlzc2luZ1NjaGVtYXRpY3NNYXBFeGNlcHRpb24sXG4gIFNjaGVtYXRpY01pc3NpbmdGaWVsZHNFeGNlcHRpb24sXG59IGZyb20gJy4uL3Rvb2xzJztcbmltcG9ydCB7XG4gIEZpbGVTeXN0ZW1Db2xsZWN0aW9uRGVzYyxcbiAgRmlsZVN5c3RlbVNjaGVtYXRpY0Rlc2MsXG59IGZyb20gJy4vZGVzY3JpcHRpb24nO1xuaW1wb3J0IHsgRXhwb3J0U3RyaW5nUmVmIH0gZnJvbSAnLi9leHBvcnQtcmVmJztcbmltcG9ydCB7IEZpbGVTeXN0ZW1FbmdpbmVIb3N0QmFzZSB9IGZyb20gJy4vZmlsZS1zeXN0ZW0tZW5naW5lLWhvc3QtYmFzZSc7XG5pbXBvcnQgeyByZWFkSnNvbkZpbGUgfSBmcm9tICcuL2ZpbGUtc3lzdGVtLXV0aWxpdHknO1xuXG5cbmV4cG9ydCBjbGFzcyBOb2RlUGFja2FnZURvZXNOb3RTdXBwb3J0U2NoZW1hdGljcyBleHRlbmRzIEJhc2VFeGNlcHRpb24ge1xuICBjb25zdHJ1Y3RvcihuYW1lOiBzdHJpbmcpIHtcbiAgICBzdXBlcihgUGFja2FnZSAke0pTT04uc3RyaW5naWZ5KG5hbWUpfSB3YXMgZm91bmQgYnV0IGRvZXMgbm90IHN1cHBvcnQgc2NoZW1hdGljcy5gKTtcbiAgfVxufVxuXG5cbi8qKlxuICogQSBzaW1wbGUgRW5naW5lSG9zdCB0aGF0IHVzZXMgTm9kZU1vZHVsZXMgdG8gcmVzb2x2ZSBjb2xsZWN0aW9ucy5cbiAqL1xuZXhwb3J0IGNsYXNzIE5vZGVNb2R1bGVzRW5naW5lSG9zdCBleHRlbmRzIEZpbGVTeXN0ZW1FbmdpbmVIb3N0QmFzZSB7XG4gIGNvbnN0cnVjdG9yKCkgeyBzdXBlcigpOyB9XG5cbiAgcHJvdGVjdGVkIF9yZXNvbHZlUGFja2FnZUpzb24obmFtZTogc3RyaW5nLCBiYXNlZGlyID0gcHJvY2Vzcy5jd2QoKSkge1xuICAgIHJldHVybiBjb3JlLnJlc29sdmUobmFtZSwge1xuICAgICAgYmFzZWRpcixcbiAgICAgIGNoZWNrTG9jYWw6IHRydWUsXG4gICAgICBjaGVja0dsb2JhbDogdHJ1ZSxcbiAgICAgIHJlc29sdmVQYWNrYWdlSnNvbjogdHJ1ZSxcbiAgICB9KTtcbiAgfVxuXG4gIHByb3RlY3RlZCBfcmVzb2x2ZVBhdGgobmFtZTogc3RyaW5nLCBiYXNlZGlyID0gcHJvY2Vzcy5jd2QoKSkge1xuICAgIC8vIEFsbG93IHJlbGF0aXZlIC8gYWJzb2x1dGUgcGF0aHMuXG4gICAgaWYgKG5hbWUuc3RhcnRzV2l0aCgnLicpIHx8IG5hbWUuc3RhcnRzV2l0aCgnLycpKSB7XG4gICAgICByZXR1cm4gcmVzb2x2ZVBhdGgoYmFzZWRpciwgbmFtZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIElmIGl0J3MgYSBmaWxlIGluc2lkZSBhIHBhY2thZ2UsIHJlc29sdmUgdGhlIHBhY2thZ2UgdGhlbiByZXR1cm4gdGhlIGZpbGUuLi5cbiAgICAgIGlmIChuYW1lLnNwbGl0KCcvJykubGVuZ3RoID4gKG5hbWVbMF0gPT0gJ0AnID8gMiA6IDEpKSB7XG4gICAgICAgIGNvbnN0IHJlc3QgPSBuYW1lLnNwbGl0KCcvJyk7XG4gICAgICAgIGNvbnN0IHBhY2thZ2VOYW1lID0gcmVzdC5zaGlmdCgpICsgKG5hbWVbMF0gPT0gJ0AnID8gJy8nICsgcmVzdC5zaGlmdCgpIDogJycpO1xuXG4gICAgICAgIHJldHVybiByZXNvbHZlUGF0aChjb3JlLnJlc29sdmUocGFja2FnZU5hbWUsIHtcbiAgICAgICAgICBiYXNlZGlyLFxuICAgICAgICAgIGNoZWNrTG9jYWw6IHRydWUsXG4gICAgICAgICAgY2hlY2tHbG9iYWw6IHRydWUsXG4gICAgICAgICAgcmVzb2x2ZVBhY2thZ2VKc29uOiB0cnVlLFxuICAgICAgICB9KSwgJy4uJywgLi4ucmVzdCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBjb3JlLnJlc29sdmUobmFtZSwge1xuICAgICAgICBiYXNlZGlyLFxuICAgICAgICBjaGVja0xvY2FsOiB0cnVlLFxuICAgICAgICBjaGVja0dsb2JhbDogdHJ1ZSxcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIHByb3RlY3RlZCBfcmVzb2x2ZUNvbGxlY3Rpb25QYXRoKG5hbWU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgbGV0IGNvbGxlY3Rpb25QYXRoOiBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG5cbiAgICBpZiAobmFtZS5zcGxpdCgnLycpLmxlbmd0aCA+IChuYW1lWzBdID09ICdAJyA/IDIgOiAxKSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29sbGVjdGlvblBhdGggPSB0aGlzLl9yZXNvbHZlUGF0aChuYW1lLCBwcm9jZXNzLmN3ZCgpKTtcbiAgICAgIH0gY2F0Y2ggKF8pIHtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIWNvbGxlY3Rpb25QYXRoKSB7XG4gICAgICBsZXQgcGFja2FnZUpzb25QYXRoID0gdGhpcy5fcmVzb2x2ZVBhY2thZ2VKc29uKG5hbWUsIHByb2Nlc3MuY3dkKCkpO1xuICAgICAgLy8gSWYgaXQncyBhIGZpbGUsIHVzZSBpdCBhcyBpcy4gT3RoZXJ3aXNlIGFwcGVuZCBwYWNrYWdlLmpzb24gdG8gaXQuXG4gICAgICBpZiAoIWNvcmUuZnMuaXNGaWxlKHBhY2thZ2VKc29uUGF0aCkpIHtcbiAgICAgICAgcGFja2FnZUpzb25QYXRoID0gam9pbihwYWNrYWdlSnNvblBhdGgsICdwYWNrYWdlLmpzb24nKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgcGtnSnNvblNjaGVtYXRpY3MgPSByZXF1aXJlKHBhY2thZ2VKc29uUGF0aClbJ3NjaGVtYXRpY3MnXTtcbiAgICAgIGlmICghcGtnSnNvblNjaGVtYXRpY3MgfHwgdHlwZW9mIHBrZ0pzb25TY2hlbWF0aWNzICE9ICdzdHJpbmcnKSB7XG4gICAgICAgIHRocm93IG5ldyBOb2RlUGFja2FnZURvZXNOb3RTdXBwb3J0U2NoZW1hdGljcyhuYW1lKTtcbiAgICAgIH1cbiAgICAgIGNvbGxlY3Rpb25QYXRoID0gdGhpcy5fcmVzb2x2ZVBhdGgocGtnSnNvblNjaGVtYXRpY3MsIGRpcm5hbWUocGFja2FnZUpzb25QYXRoKSk7XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIGlmIChjb2xsZWN0aW9uUGF0aCkge1xuICAgICAgICByZWFkSnNvbkZpbGUoY29sbGVjdGlvblBhdGgpO1xuXG4gICAgICAgIHJldHVybiBjb2xsZWN0aW9uUGF0aDtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgfVxuICAgIHRocm93IG5ldyBDb2xsZWN0aW9uQ2Fubm90QmVSZXNvbHZlZEV4Y2VwdGlvbihuYW1lKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBfcmVzb2x2ZVJlZmVyZW5jZVN0cmluZyhyZWZTdHJpbmc6IHN0cmluZywgcGFyZW50UGF0aDogc3RyaW5nKSB7XG4gICAgY29uc3QgcmVmID0gbmV3IEV4cG9ydFN0cmluZ1JlZjxSdWxlRmFjdG9yeTx7fT4+KHJlZlN0cmluZywgcGFyZW50UGF0aCk7XG4gICAgaWYgKCFyZWYucmVmKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICByZXR1cm4geyByZWY6IHJlZi5yZWYsIHBhdGg6IHJlZi5tb2R1bGUgfTtcbiAgfVxuXG4gIHByb3RlY3RlZCBfdHJhbnNmb3JtQ29sbGVjdGlvbkRlc2NyaXB0aW9uKFxuICAgIG5hbWU6IHN0cmluZyxcbiAgICBkZXNjOiBQYXJ0aWFsPEZpbGVTeXN0ZW1Db2xsZWN0aW9uRGVzYz4sXG4gICk6IEZpbGVTeXN0ZW1Db2xsZWN0aW9uRGVzYyB7XG4gICAgaWYgKCFkZXNjLnNjaGVtYXRpY3MgfHwgdHlwZW9mIGRlc2Muc2NoZW1hdGljcyAhPSAnb2JqZWN0Jykge1xuICAgICAgdGhyb3cgbmV3IENvbGxlY3Rpb25NaXNzaW5nU2NoZW1hdGljc01hcEV4Y2VwdGlvbihuYW1lKTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgLi4uZGVzYyxcbiAgICAgIG5hbWUsXG4gICAgfSBhcyBGaWxlU3lzdGVtQ29sbGVjdGlvbkRlc2M7XG4gIH1cblxuICBwcm90ZWN0ZWQgX3RyYW5zZm9ybVNjaGVtYXRpY0Rlc2NyaXB0aW9uKFxuICAgIG5hbWU6IHN0cmluZyxcbiAgICBfY29sbGVjdGlvbjogRmlsZVN5c3RlbUNvbGxlY3Rpb25EZXNjLFxuICAgIGRlc2M6IFBhcnRpYWw8RmlsZVN5c3RlbVNjaGVtYXRpY0Rlc2M+LFxuICApOiBGaWxlU3lzdGVtU2NoZW1hdGljRGVzYyB7XG4gICAgaWYgKCFkZXNjLmZhY3RvcnlGbiB8fCAhZGVzYy5wYXRoIHx8ICFkZXNjLmRlc2NyaXB0aW9uKSB7XG4gICAgICB0aHJvdyBuZXcgU2NoZW1hdGljTWlzc2luZ0ZpZWxkc0V4Y2VwdGlvbihuYW1lKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZGVzYyBhcyBGaWxlU3lzdGVtU2NoZW1hdGljRGVzYztcbiAgfVxufVxuIl19