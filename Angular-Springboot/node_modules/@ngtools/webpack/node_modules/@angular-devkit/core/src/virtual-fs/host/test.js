"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const path_1 = require("../path");
const buffer_1 = require("./buffer");
const memory_1 = require("./memory");
const sync_1 = require("./sync");
class TestHost extends memory_1.SimpleMemoryHost {
    constructor(map = {}) {
        super();
        for (const filePath of Object.getOwnPropertyNames(map)) {
            this._write(path_1.normalize(filePath), buffer_1.stringToFileBuffer(map[filePath]));
        }
    }
    get files() {
        const sync = this.sync;
        function _visit(p) {
            return sync.list(p)
                .map(fragment => path_1.join(p, fragment))
                .reduce((files, path) => {
                if (sync.isDirectory(path)) {
                    return files.concat(_visit(path));
                }
                else {
                    return files.concat(path);
                }
            }, []);
        }
        return _visit(path_1.normalize('/'));
    }
    get sync() {
        if (!this._sync) {
            this._sync = new sync_1.SyncDelegateHost(this);
        }
        return this._sync;
    }
}
exports.TestHost = TestHost;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZVJvb3QiOiIuLyIsInNvdXJjZXMiOlsicGFja2FnZXMvYW5ndWxhcl9kZXZraXQvY29yZS9zcmMvdmlydHVhbC1mcy9ob3N0L3Rlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7O0dBTUc7QUFDSCxrQ0FBZ0Q7QUFDaEQscUNBQThDO0FBQzlDLHFDQUE0QztBQUM1QyxpQ0FBMEM7QUFFMUMsY0FBc0IsU0FBUSx5QkFBZ0I7SUFHNUMsWUFBWSxNQUFrQyxFQUFFO1FBQzlDLEtBQUssRUFBRSxDQUFDO1FBRVIsR0FBRyxDQUFDLENBQUMsTUFBTSxRQUFRLElBQUksTUFBTSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN2RCxJQUFJLENBQUMsTUFBTSxDQUFDLGdCQUFTLENBQUMsUUFBUSxDQUFDLEVBQUUsMkJBQWtCLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN0RSxDQUFDO0lBQ0gsQ0FBQztJQUVELElBQUksS0FBSztRQUNQLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDdkIsZ0JBQWdCLENBQU87WUFDckIsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2lCQUNoQixHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxXQUFJLENBQUMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDO2lCQUNsQyxNQUFNLENBQUMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLEVBQUU7Z0JBQ3RCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUMzQixNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDcEMsQ0FBQztnQkFBQyxJQUFJLENBQUMsQ0FBQztvQkFDTixNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDNUIsQ0FBQztZQUNILENBQUMsRUFBRSxFQUFZLENBQUMsQ0FBQztRQUNyQixDQUFDO1FBRUQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxnQkFBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDaEMsQ0FBQztJQUVELElBQUksSUFBSTtRQUNOLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDaEIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLHVCQUFnQixDQUFLLElBQUksQ0FBQyxDQUFDO1FBQzlDLENBQUM7UUFFRCxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztJQUNwQixDQUFDO0NBQ0Y7QUFuQ0QsNEJBbUNDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHsgUGF0aCwgam9pbiwgbm9ybWFsaXplIH0gZnJvbSAnLi4vcGF0aCc7XG5pbXBvcnQgeyBzdHJpbmdUb0ZpbGVCdWZmZXIgfSBmcm9tICcuL2J1ZmZlcic7XG5pbXBvcnQgeyBTaW1wbGVNZW1vcnlIb3N0IH0gZnJvbSAnLi9tZW1vcnknO1xuaW1wb3J0IHsgU3luY0RlbGVnYXRlSG9zdCB9IGZyb20gJy4vc3luYyc7XG5cbmV4cG9ydCBjbGFzcyBUZXN0SG9zdCBleHRlbmRzIFNpbXBsZU1lbW9yeUhvc3Qge1xuICBwcm90ZWN0ZWQgX3N5bmM6IFN5bmNEZWxlZ2F0ZUhvc3Q8e30+O1xuXG4gIGNvbnN0cnVjdG9yKG1hcDogeyBbcGF0aDogc3RyaW5nXTogc3RyaW5nIH0gPSB7fSkge1xuICAgIHN1cGVyKCk7XG5cbiAgICBmb3IgKGNvbnN0IGZpbGVQYXRoIG9mIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKG1hcCkpIHtcbiAgICAgIHRoaXMuX3dyaXRlKG5vcm1hbGl6ZShmaWxlUGF0aCksIHN0cmluZ1RvRmlsZUJ1ZmZlcihtYXBbZmlsZVBhdGhdKSk7XG4gICAgfVxuICB9XG5cbiAgZ2V0IGZpbGVzKCk6IFBhdGhbXSB7XG4gICAgY29uc3Qgc3luYyA9IHRoaXMuc3luYztcbiAgICBmdW5jdGlvbiBfdmlzaXQocDogUGF0aCk6IFBhdGhbXSB7XG4gICAgICByZXR1cm4gc3luYy5saXN0KHApXG4gICAgICAgIC5tYXAoZnJhZ21lbnQgPT4gam9pbihwLCBmcmFnbWVudCkpXG4gICAgICAgIC5yZWR1Y2UoKGZpbGVzLCBwYXRoKSA9PiB7XG4gICAgICAgICAgaWYgKHN5bmMuaXNEaXJlY3RvcnkocGF0aCkpIHtcbiAgICAgICAgICAgIHJldHVybiBmaWxlcy5jb25jYXQoX3Zpc2l0KHBhdGgpKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGZpbGVzLmNvbmNhdChwYXRoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sIFtdIGFzIFBhdGhbXSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIF92aXNpdChub3JtYWxpemUoJy8nKSk7XG4gIH1cblxuICBnZXQgc3luYygpIHtcbiAgICBpZiAoIXRoaXMuX3N5bmMpIHtcbiAgICAgIHRoaXMuX3N5bmMgPSBuZXcgU3luY0RlbGVnYXRlSG9zdDx7fT4odGhpcyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX3N5bmM7XG4gIH1cbn1cbiJdfQ==