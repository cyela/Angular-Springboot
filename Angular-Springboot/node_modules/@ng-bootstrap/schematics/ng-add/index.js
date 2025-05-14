"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schematics_1 = require("@angular-devkit/schematics");
const tasks_1 = require("@angular-devkit/schematics/tasks");
const package_1 = require("./../utils/package");
const ast_1 = require("./../utils/ast");
const config_1 = require("./../utils/config");
// TODO(PK): hard-code for now, will query npm repo to get this info in the future
const ngBootstrapVersion = '2.0.0-alpha.0';
const bootstrapVersion = '4.0.0';
function addNgBootstrapToPackageJson() {
    return (host) => {
        package_1.addPackageToPackageJson(host, 'dependencies', '@ng-bootstrap/ng-bootstrap', `^${ngBootstrapVersion}`);
        return host;
    };
}
function addNgBootstrapModuleToAppModule() {
    return (host) => {
        ast_1.addModuleImportToRootModule(host, 'NgbModule.forRoot()', '@ng-bootstrap/ng-bootstrap');
        return host;
    };
}
function addBootstrapToPackageJson() {
    return (host) => {
        package_1.addPackageToPackageJson(host, 'dependencies', 'bootstrap', `^${bootstrapVersion}`);
        return host;
    };
}
function addBootstrapCSS() {
    return (host) => {
        config_1.addStyle(host, './node_modules/bootstrap/dist/css/bootstrap.css');
        return host;
    };
}
function installNodeDeps() {
    return (host, context) => {
        context.addTask(new tasks_1.NodePackageInstallTask());
    };
}
function ngAdd() {
    return schematics_1.chain([
        // ng-bootstrap part
        addNgBootstrapToPackageJson(),
        addNgBootstrapModuleToAppModule(),
        // Bootstrap CSS part
        addBootstrapToPackageJson(),
        addBootstrapCSS(),
        // install freshly added dependencies
        installNodeDeps()
    ]);
}
exports.default = ngAdd;
//# sourceMappingURL=index.js.map