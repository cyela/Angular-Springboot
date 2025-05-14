"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CONFIG_PATH = 'angular.json';
function readConfig(host) {
    const sourceText = host.read(CONFIG_PATH).toString('utf-8');
    return JSON.parse(sourceText);
}
exports.readConfig = readConfig;
function writeConfig(host, config) {
    host.overwrite(CONFIG_PATH, JSON.stringify(config, null, 2));
}
exports.writeConfig = writeConfig;
function isAngularBrowserProject(projectConfig) {
    if (projectConfig.projectType === 'application') {
        const buildConfig = projectConfig.architect.build;
        return buildConfig.builder === '@angular-devkit/build-angular:browser';
    }
    return false;
}
function getAngularAppName(config) {
    const projects = config.projects;
    const projectNames = Object.keys(projects);
    for (let projectName of projectNames) {
        const projectConfig = projects[projectName];
        if (isAngularBrowserProject(projectConfig)) {
            return projectName;
        }
    }
    return null;
}
exports.getAngularAppName = getAngularAppName;
function getAngularAppConfig(config) {
    const projects = config.projects;
    const projectNames = Object.keys(projects);
    for (let projectName of projectNames) {
        const projectConfig = projects[projectName];
        if (isAngularBrowserProject(projectConfig)) {
            return projectConfig;
        }
    }
    return null;
}
exports.getAngularAppConfig = getAngularAppConfig;
function addStyle(host, stylePath) {
    const config = readConfig(host);
    const appConfig = getAngularAppConfig(config);
    if (appConfig) {
        appConfig.architect.build.options.styles.push({
            input: stylePath
        });
        writeConfig(host, config);
    }
    else {
        // TODO(pk): throw can't find an app
    }
}
exports.addStyle = addStyle;
//# sourceMappingURL=config.js.map