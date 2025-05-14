"use strict";
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@angular-devkit/core");
const fs_1 = require("fs");
const path = require("path");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const url = require("url");
const webpack = require("webpack");
const utils_1 = require("../angular-cli-files/models/webpack-configs/utils");
const check_port_1 = require("../angular-cli-files/utilities/check-port");
const stats_1 = require("../angular-cli-files/utilities/stats");
const _1 = require("../browser/");
const utils_2 = require("../utils");
const opn = require('opn');
const WebpackDevServer = require('webpack-dev-server');
class DevServerBuilder {
    constructor(context) {
        this.context = context;
    }
    run(builderConfig) {
        const options = builderConfig.options;
        const root = this.context.workspace.root;
        const projectRoot = core_1.resolve(root, builderConfig.root);
        const host = new core_1.virtualFs.AliasHost(this.context.host);
        let browserOptions;
        return check_port_1.checkPort(options.port, options.host).pipe(operators_1.tap((port) => options.port = port), operators_1.concatMap(() => this._getBrowserOptions(options)), operators_1.tap((opts) => browserOptions = opts), operators_1.concatMap(() => utils_2.addFileReplacements(root, host, browserOptions.fileReplacements)), operators_1.concatMap(() => utils_2.normalizeAssetPatterns(browserOptions.assets, host, root, projectRoot, builderConfig.sourceRoot)), 
        // Replace the assets in options with the normalized version.
        operators_1.tap((assetPatternObjects => browserOptions.assets = assetPatternObjects)), operators_1.concatMap(() => new rxjs_1.Observable(obs => {
            const browserBuilder = new _1.BrowserBuilder(this.context);
            const webpackConfig = browserBuilder.buildWebpackConfig(root, projectRoot, host, browserOptions);
            const statsConfig = utils_1.getWebpackStatsConfig(browserOptions.verbose);
            let webpackDevServerConfig;
            try {
                webpackDevServerConfig = this._buildServerConfig(root, projectRoot, options, browserOptions);
            }
            catch (err) {
                obs.error(err);
                return;
            }
            // Resolve public host and client address.
            let clientAddress = `${options.ssl ? 'https' : 'http'}://0.0.0.0:0`;
            if (options.publicHost) {
                let publicHost = options.publicHost;
                if (!/^\w+:\/\//.test(publicHost)) {
                    publicHost = `${options.ssl ? 'https' : 'http'}://${publicHost}`;
                }
                const clientUrl = url.parse(publicHost);
                options.publicHost = clientUrl.host;
                clientAddress = url.format(clientUrl);
            }
            // Resolve serve address.
            const serverAddress = url.format({
                protocol: options.ssl ? 'https' : 'http',
                hostname: options.host === '0.0.0.0' ? 'localhost' : options.host,
                port: options.port.toString(),
            });
            // Add live reload config.
            if (options.liveReload) {
                this._addLiveReload(options, browserOptions, webpackConfig, clientAddress);
            }
            else if (options.hmr) {
                this.context.logger.warn('Live reload is disabled. HMR option ignored.');
            }
            if (!options.watch) {
                // There's no option to turn off file watching in webpack-dev-server, but
                // we can override the file watcher instead.
                webpackConfig.plugins.unshift({
                    // tslint:disable-next-line:no-any
                    apply: (compiler) => {
                        compiler.hooks.afterEnvironment.tap('angular-cli', () => {
                            compiler.watchFileSystem = { watch: () => { } };
                        });
                    },
                });
            }
            if (browserOptions.optimization) {
                this.context.logger.error(core_1.tags.stripIndents `
            ****************************************************************************************
            This is a simple server for use in testing or debugging Angular applications locally.
            It hasn't been reviewed for security issues.

            DON'T USE IT FOR PRODUCTION!
            ****************************************************************************************
          `);
            }
            this.context.logger.info(core_1.tags.oneLine `
          **
          Angular Live Development Server is listening on ${options.host}:${options.port},
          open your browser on ${serverAddress}${webpackDevServerConfig.publicPath}
          **
        `);
            const webpackCompiler = webpack(webpackConfig);
            const server = new WebpackDevServer(webpackCompiler, webpackDevServerConfig);
            let first = true;
            // tslint:disable-next-line:no-any
            webpackCompiler.hooks.done.tap('angular-cli', (stats) => {
                if (!browserOptions.verbose) {
                    const json = stats.toJson(statsConfig);
                    this.context.logger.info(stats_1.statsToString(json, statsConfig));
                    if (stats.hasWarnings()) {
                        this.context.logger.info(stats_1.statsWarningsToString(json, statsConfig));
                    }
                    if (stats.hasErrors()) {
                        this.context.logger.info(stats_1.statsErrorsToString(json, statsConfig));
                    }
                }
                obs.next({ success: !stats.hasErrors() });
                if (first && options.open) {
                    first = false;
                    opn(serverAddress + webpackDevServerConfig.publicPath);
                }
            });
            const httpServer = server.listen(options.port, options.host, (err) => {
                if (err) {
                    obs.error(err);
                }
            });
            // Node 8 has a keepAliveTimeout bug which doesn't respect active connections.
            // Connections will end after ~5 seconds (arbitrary), often not letting the full download
            // of large pieces of content, such as a vendor javascript file.  This results in browsers
            // throwing a "net::ERR_CONTENT_LENGTH_MISMATCH" error.
            // https://github.com/angular/angular-cli/issues/7197
            // https://github.com/nodejs/node/issues/13391
            // https://github.com/nodejs/node/commit/2cb6f2b281eb96a7abe16d58af6ebc9ce23d2e96
            if (/^v8.\d.\d+$/.test(process.version)) {
                httpServer.keepAliveTimeout = 30000; // 30 seconds
            }
            // Teardown logic. Close the server when unsubscribed from.
            return () => server.close();
        })));
    }
    _buildServerConfig(root, projectRoot, options, browserOptions) {
        const systemRoot = core_1.getSystemPath(root);
        if (options.disableHostCheck) {
            this.context.logger.warn(core_1.tags.oneLine `
        WARNING: Running a server with --disable-host-check is a security risk.
        See https://medium.com/webpack/webpack-dev-server-middleware-security-issues-1489d950874a
        for more information.
      `);
        }
        const servePath = this._buildServePath(options, browserOptions);
        const config = {
            headers: { 'Access-Control-Allow-Origin': '*' },
            historyApiFallback: {
                index: `${servePath}/${path.basename(browserOptions.index)}`,
                disableDotRule: true,
                htmlAcceptHeaders: ['text/html', 'application/xhtml+xml'],
            },
            stats: browserOptions.verbose ? utils_1.getWebpackStatsConfig(browserOptions.verbose) : false,
            compress: browserOptions.optimization,
            watchOptions: {
                poll: browserOptions.poll,
            },
            https: options.ssl,
            overlay: {
                errors: !browserOptions.optimization,
                warnings: false,
            },
            contentBase: false,
            public: options.publicHost,
            disableHostCheck: options.disableHostCheck,
            publicPath: servePath,
            hot: options.hmr,
        };
        if (options.ssl) {
            this._addSslConfig(systemRoot, options, config);
        }
        if (options.proxyConfig) {
            this._addProxyConfig(systemRoot, options, config);
        }
        return config;
    }
    _addLiveReload(options, browserOptions, webpackConfig, // tslint:disable-line:no-any
    clientAddress) {
        // This allows for live reload of page when changes are made to repo.
        // https://webpack.js.org/configuration/dev-server/#devserver-inline
        let webpackDevServerPath;
        try {
            webpackDevServerPath = require.resolve('webpack-dev-server/client');
        }
        catch (_a) {
            throw new Error('The "webpack-dev-server" package could not be found.');
        }
        const entryPoints = [`${webpackDevServerPath}?${clientAddress}`];
        if (options.hmr) {
            const webpackHmrLink = 'https://webpack.js.org/guides/hot-module-replacement';
            this.context.logger.warn(core_1.tags.oneLine `NOTICE: Hot Module Replacement (HMR) is enabled for the dev server.`);
            const showWarning = options.hmrWarning;
            if (showWarning) {
                this.context.logger.info(core_1.tags.stripIndents `
          The project will still live reload when HMR is enabled,
          but to take advantage of HMR additional application code is required'
          (not included in an Angular CLI project by default).'
          See ${webpackHmrLink}
          for information on working with HMR for Webpack.`);
                this.context.logger.warn(core_1.tags.oneLine `To disable this warning use "hmrWarning: false" under "serve"
           options in "angular.json".`);
            }
            entryPoints.push('webpack/hot/dev-server');
            webpackConfig.plugins.push(new webpack.HotModuleReplacementPlugin());
            if (browserOptions.extractCss) {
                this.context.logger.warn(core_1.tags.oneLine `NOTICE: (HMR) does not allow for CSS hot reload
                when used together with '--extract-css'.`);
            }
        }
        if (!webpackConfig.entry.main) {
            webpackConfig.entry.main = [];
        }
        webpackConfig.entry.main.unshift(...entryPoints);
    }
    _addSslConfig(root, options, config) {
        let sslKey = undefined;
        let sslCert = undefined;
        if (options.sslKey) {
            const keyPath = path.resolve(root, options.sslKey);
            if (fs_1.existsSync(keyPath)) {
                sslKey = fs_1.readFileSync(keyPath, 'utf-8');
            }
        }
        if (options.sslCert) {
            const certPath = path.resolve(root, options.sslCert);
            if (fs_1.existsSync(certPath)) {
                sslCert = fs_1.readFileSync(certPath, 'utf-8');
            }
        }
        config.https = true;
        if (sslKey != null && sslCert != null) {
            config.key = sslKey;
            config.cert = sslCert;
        }
    }
    _addProxyConfig(root, options, config) {
        let proxyConfig = {};
        const proxyPath = path.resolve(root, options.proxyConfig);
        if (fs_1.existsSync(proxyPath)) {
            proxyConfig = require(proxyPath);
        }
        else {
            const message = 'Proxy config file ' + proxyPath + ' does not exist.';
            throw new Error(message);
        }
        config.proxy = proxyConfig;
    }
    _buildServePath(options, browserOptions) {
        let servePath = options.servePath;
        if (!servePath && servePath !== '') {
            const defaultServePath = this._findDefaultServePath(browserOptions.baseHref, browserOptions.deployUrl);
            const showWarning = options.servePathDefaultWarning;
            if (defaultServePath == null && showWarning) {
                this.context.logger.warn(core_1.tags.oneLine `
            WARNING: --deploy-url and/or --base-href contain
            unsupported values for ng serve.  Default serve path of '/' used.
            Use --serve-path to override.
          `);
            }
            servePath = defaultServePath || '';
        }
        if (servePath.endsWith('/')) {
            servePath = servePath.substr(0, servePath.length - 1);
        }
        if (!servePath.startsWith('/')) {
            servePath = `/${servePath}`;
        }
        return servePath;
    }
    _findDefaultServePath(baseHref, deployUrl) {
        if (!baseHref && !deployUrl) {
            return '';
        }
        if (/^(\w+:)?\/\//.test(baseHref || '') || /^(\w+:)?\/\//.test(deployUrl || '')) {
            // If baseHref or deployUrl is absolute, unsupported by ng serve
            return null;
        }
        // normalize baseHref
        // for ng serve the starting base is always `/` so a relative
        // and root relative value are identical
        const baseHrefParts = (baseHref || '')
            .split('/')
            .filter(part => part !== '');
        if (baseHref && !baseHref.endsWith('/')) {
            baseHrefParts.pop();
        }
        const normalizedBaseHref = baseHrefParts.length === 0 ? '/' : `/${baseHrefParts.join('/')}/`;
        if (deployUrl && deployUrl[0] === '/') {
            if (baseHref && baseHref[0] === '/' && normalizedBaseHref !== deployUrl) {
                // If baseHref and deployUrl are root relative and not equivalent, unsupported by ng serve
                return null;
            }
            return deployUrl;
        }
        // Join together baseHref and deployUrl
        return `${normalizedBaseHref}${deployUrl || ''}`;
    }
    _getBrowserOptions(options) {
        const architect = this.context.architect;
        const [project, target, configuration] = options.browserTarget.split(':');
        const overrides = Object.assign({ 
            // Override browser build watch setting.
            watch: options.watch }, (options.optimization !== undefined ? { optimization: options.optimization } : {}), (options.aot !== undefined ? { aot: options.aot } : {}), (options.sourceMap !== undefined ? { sourceMap: options.sourceMap } : {}), (options.evalSourceMap !== undefined ? { evalSourceMap: options.evalSourceMap } : {}), (options.vendorChunk !== undefined ? { vendorChunk: options.vendorChunk } : {}), (options.commonChunk !== undefined ? { commonChunk: options.commonChunk } : {}), (options.baseHref !== undefined ? { baseHref: options.baseHref } : {}), (options.progress !== undefined ? { progress: options.progress } : {}), (options.poll !== undefined ? { poll: options.poll } : {}));
        const browserTargetSpec = { project, target, configuration, overrides };
        const builderConfig = architect.getBuilderConfiguration(browserTargetSpec);
        return architect.getBuilderDescription(builderConfig).pipe(operators_1.concatMap(browserDescription => architect.validateBuilderOptions(builderConfig, browserDescription)), operators_1.map(browserConfig => browserConfig.options));
    }
}
exports.DevServerBuilder = DevServerBuilder;
exports.default = DevServerBuilder;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzIjpbInBhY2thZ2VzL2FuZ3VsYXJfZGV2a2l0L2J1aWxkX2FuZ3VsYXIvc3JjL2Rldi1zZXJ2ZXIvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7QUFRSCwrQ0FBcUY7QUFDckYsMkJBQThDO0FBRTlDLDZCQUE2QjtBQUM3QiwrQkFBa0M7QUFDbEMsOENBQXFEO0FBQ3JELDJCQUEyQjtBQUMzQixtQ0FBbUM7QUFDbkMsNkVBQTBGO0FBQzFGLDBFQUFzRTtBQUN0RSxnRUFJOEM7QUFDOUMsa0NBQTZFO0FBRTdFLG9DQUF1RTtBQUN2RSxNQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDM0IsTUFBTSxnQkFBZ0IsR0FBRyxPQUFPLENBQUMsb0JBQW9CLENBQUMsQ0FBQztBQTJEdkQ7SUFFRSxZQUFtQixPQUF1QjtRQUF2QixZQUFPLEdBQVAsT0FBTyxDQUFnQjtJQUFJLENBQUM7SUFFL0MsR0FBRyxDQUFDLGFBQTREO1FBQzlELE1BQU0sT0FBTyxHQUFHLGFBQWEsQ0FBQyxPQUFPLENBQUM7UUFDdEMsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDO1FBQ3pDLE1BQU0sV0FBVyxHQUFHLGNBQU8sQ0FBQyxJQUFJLEVBQUUsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3RELE1BQU0sSUFBSSxHQUFHLElBQUksZ0JBQVMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFnQyxDQUFDLENBQUM7UUFDcEYsSUFBSSxjQUFvQyxDQUFDO1FBRXpDLE1BQU0sQ0FBQyxzQkFBUyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FDL0MsZUFBRyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMs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RSxPQUFPLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUMvRSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUN0RSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUN0RSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUM5RCxDQUFDO1FBRUYsTUFBTSxpQkFBaUIsR0FBRyxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsYUFBYSxFQUFFLFNBQVMsRUFBRSxDQUFDO1FBQ3hFLE1BQU0sYUFBYSxHQUFHLFNBQVMsQ0FBQyx1QkFBdUIsQ0FDckQsaUJBQWlCLENBQUMsQ0FBQztRQUVyQixNQUFNLENBQUMsU0FBUyxDQUFDLHFCQUFxQixDQUFDLGFBQWEsQ0FBQyxDQUFDLElBQUksQ0FDeEQscUJBQVMsQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLENBQzdCLFNBQVMsQ0FBQyxzQkFBc0IsQ0FBQyxhQUFhLEVBQUUsa0JBQWtCLENBQUMsQ0FBQyxFQUN0RSxlQUFHLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQzVDLENBQUM7SUFDSixDQUFDO0NBQ0Y7QUFyWEQsNENBcVhDO0FBR0Qsa0JBQWUsZ0JBQWdCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7XG4gIEJ1aWxkRXZlbnQsXG4gIEJ1aWxkZXIsXG4gIEJ1aWxkZXJDb25maWd1cmF0aW9uLFxuICBCdWlsZGVyQ29udGV4dCxcbn0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L2FyY2hpdGVjdCc7XG5pbXBvcnQgeyBQYXRoLCBnZXRTeXN0ZW1QYXRoLCByZXNvbHZlLCB0YWdzLCB2aXJ0dWFsRnMgfSBmcm9tICdAYW5ndWxhci1kZXZraXQvY29yZSc7XG5pbXBvcnQgeyBleGlzdHNTeW5jLCByZWFkRmlsZVN5bmMgfSBmcm9tICdmcyc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgT2JzZXJ2YWJsZSB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgY29uY2F0TWFwLCBtYXAsIHRhcCB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCAqIGFzIHVybCBmcm9tICd1cmwnO1xuaW1wb3J0ICogYXMgd2VicGFjayBmcm9tICd3ZWJwYWNrJztcbmltcG9ydCB7IGdldFdlYnBhY2tTdGF0c0NvbmZpZyB9IGZyb20gJy4uL2FuZ3VsYXItY2xpLWZpbGVzL21vZGVscy93ZWJwYWNrLWNvbmZpZ3MvdXRpbHMnO1xuaW1wb3J0IHsgY2hlY2tQb3J0IH0gZnJvbSAnLi4vYW5ndWxhci1jbGktZmlsZXMvdXRpbGl0aWVzL2NoZWNrLXBvcnQnO1xuaW1wb3J0IHtcbiAgc3RhdHNFcnJvcnNUb1N0cmluZyxcbiAgc3RhdHNUb1N0cmluZyxcbiAgc3RhdHNXYXJuaW5nc1RvU3RyaW5nLFxufSBmcm9tICcuLi9hbmd1bGFyLWNsaS1maWxlcy91dGlsaXRpZXMvc3RhdHMnO1xuaW1wb3J0IHsgQnJvd3NlckJ1aWxkZXIsIE5vcm1hbGl6ZWRCcm93c2VyQnVpbGRlclNjaGVtYSB9IGZyb20gJy4uL2Jyb3dzZXIvJztcbmltcG9ydCB7IEJyb3dzZXJCdWlsZGVyU2NoZW1hIH0gZnJvbSAnLi4vYnJvd3Nlci9zY2hlbWEnO1xuaW1wb3J0IHsgYWRkRmlsZVJlcGxhY2VtZW50cywgbm9ybWFsaXplQXNzZXRQYXR0ZXJucyB9IGZyb20gJy4uL3V0aWxzJztcbmNvbnN0IG9wbiA9IHJlcXVpcmUoJ29wbicpO1xuY29uc3QgV2VicGFja0RldlNlcnZlciA9IHJlcXVpcmUoJ3dlYnBhY2stZGV2LXNlcnZlcicpO1xuXG5cbmV4cG9ydCBpbnRlcmZhY2UgRGV2U2VydmVyQnVpbGRlck9wdGlvbnMge1xuICBicm93c2VyVGFyZ2V0OiBzdHJpbmc7XG4gIHBvcnQ6IG51bWJlcjtcbiAgaG9zdDogc3RyaW5nO1xuICBwcm94eUNvbmZpZz86IHN0cmluZztcbiAgc3NsOiBib29sZWFuO1xuICBzc2xLZXk/OiBzdHJpbmc7XG4gIHNzbENlcnQ/OiBzdHJpbmc7XG4gIG9wZW46IGJvb2xlYW47XG4gIGxpdmVSZWxvYWQ6IGJvb2xlYW47XG4gIHB1YmxpY0hvc3Q/OiBzdHJpbmc7XG4gIHNlcnZlUGF0aD86IHN0cmluZztcbiAgZGlzYWJsZUhvc3RDaGVjazogYm9vbGVhbjtcbiAgaG1yOiBib29sZWFuO1xuICB3YXRjaDogYm9vbGVhbjtcbiAgaG1yV2FybmluZzogYm9vbGVhbjtcbiAgc2VydmVQYXRoRGVmYXVsdFdhcm5pbmc6IGJvb2xlYW47XG5cbiAgLy8gVGhlc2Ugb3B0aW9ucyBjb21lIGZyb20gdGhlIGJyb3dzZXIgYnVpbGRlciBhbmQgYXJlIHByb3ZpZGVkIGhlcmUgZm9yIGNvbnZlbmllbmNlLlxuICBvcHRpbWl6YXRpb24/OiBib29sZWFuO1xuICBhb3Q/OiBib29sZWFuO1xuICBzb3VyY2VNYXA/OiBib29sZWFuO1xuICBldmFsU291cmNlTWFwPzogYm9vbGVhbjtcbiAgdmVuZG9yQ2h1bms/OiBib29sZWFuO1xuICBjb21tb25DaHVuaz86IGJvb2xlYW47XG4gIGJhc2VIcmVmPzogc3RyaW5nO1xuICBwcm9ncmVzcz86IGJvb2xlYW47XG4gIHBvbGw/OiBudW1iZXI7XG59XG5cbmludGVyZmFjZSBXZWJwYWNrRGV2U2VydmVyQ29uZmlndXJhdGlvbk9wdGlvbnMge1xuICBjb250ZW50QmFzZT86IGJvb2xlYW4gfCBzdHJpbmcgfCBzdHJpbmdbXTtcbiAgaG90PzogYm9vbGVhbjtcbiAgaGlzdG9yeUFwaUZhbGxiYWNrPzogeyBba2V5OiBzdHJpbmddOiBhbnkgfSB8IGJvb2xlYW47IC8vIHRzbGludDpkaXNhYmxlLWxpbmU6bm8tYW55XG4gIGNvbXByZXNzPzogYm9vbGVhbjtcbiAgcHJveHk/OiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9O1xuICBzdGF0aWNPcHRpb25zPzogYW55OyAvLyB0c2xpbnQ6ZGlzYWJsZS1saW5lOm5vLWFueVxuICBxdWlldD86IGJvb2xlYW47XG4gIG5vSW5mbz86IGJvb2xlYW47XG4gIGxhenk/OiBib29sZWFuO1xuICBmaWxlbmFtZT86IHN0cmluZztcbiAgd2F0Y2hPcHRpb25zPzoge1xuICAgIGFnZ3JlZ2F0ZVRpbWVvdXQ/OiBudW1iZXI7XG4gICAgcG9sbD86IG51bWJlcjtcbiAgfTtcbiAgcHVibGljUGF0aD86IHN0cmluZztcbiAgaGVhZGVycz86IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH07XG4gIHN0YXRzPzogeyBba2V5OiBzdHJpbmddOiBib29sZWFuIH0gfCBzdHJpbmcgfCBib29sZWFuO1xuICBodHRwcz86IGJvb2xlYW47XG4gIGtleT86IHN0cmluZztcbiAgY2VydD86IHN0cmluZztcbiAgb3ZlcmxheT86IGJvb2xlYW4gfCB7IGVycm9yczogYm9vbGVhbiwgd2FybmluZ3M6IGJvb2xlYW4gfTtcbiAgcHVibGljPzogc3RyaW5nO1xuICBkaXNhYmxlSG9zdENoZWNrPzogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGNsYXNzIERldlNlcnZlckJ1aWxkZXIgaW1wbGVtZW50cyBCdWlsZGVyPERldlNlcnZlckJ1aWxkZXJPcHRpb25zPiB7XG5cbiAgY29uc3RydWN0b3IocHVibGljIGNvbnRleHQ6IEJ1aWxkZXJDb250ZXh0KSB7IH1cblxuICBydW4oYnVpbGRlckNvbmZpZzogQnVpbGRlckNvbmZpZ3VyYXRpb248RGV2U2VydmVyQnVpbGRlck9wdGlvbnM+KTogT2JzZXJ2YWJsZTxCdWlsZEV2ZW50PiB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IGJ1aWxkZXJDb25maWcub3B0aW9ucztcbiAgICBjb25zdCByb290ID0gdGhpcy5jb250ZXh0LndvcmtzcGFjZS5yb290O1xuICAgIGNvbnN0IHByb2plY3RSb290ID0gcmVzb2x2ZShyb290LCBidWlsZGVyQ29uZmlnLnJvb3QpO1xuICAgIGNvbnN0IGhvc3QgPSBuZXcgdmlydHVhbEZzLkFsaWFzSG9zdCh0aGlzLmNvbnRleHQuaG9zdCBhcyB2aXJ0dWFsRnMuSG9zdDxmcy5TdGF0cz4pO1xuICAgIGxldCBicm93c2VyT3B0aW9uczogQnJvd3NlckJ1aWxkZXJTY2hlbWE7XG5cbiAgICByZXR1cm4gY2hlY2tQb3J0KG9wdGlvbnMucG9ydCwgb3B0aW9ucy5ob3N0KS5waXBlKFxuICAgICAgdGFwKChwb3J0KSA9PiBvcHRpb25zLnBvcnQgPSBwb3J0KSxcbiAgICAgIGNvbmNhdE1hcCgoKSA9PiB0aGlzLl9nZXRCcm93c2VyT3B0aW9ucyhvcHRpb25zKSksXG4gICAgICB0YXAoKG9wdHMpID0+IGJyb3dzZXJPcHRpb25zID0gb3B0cyksXG4gICAgICBjb25jYXRNYXAoKCkgPT4gYWRkRmlsZVJlcGxhY2VtZW50cyhyb290LCBob3N0LCBicm93c2VyT3B0aW9ucy5maWxlUmVwbGFjZW1lbnRzKSksXG4gICAgICBjb25jYXRNYXAoKCkgPT4gbm9ybWFsaXplQXNzZXRQYXR0ZXJucyhcbiAgICAgICAgYnJvd3Nlck9wdGlvbnMuYXNzZXRzLCBob3N0LCByb290LCBwcm9qZWN0Um9vdCwgYnVpbGRlckNvbmZpZy5zb3VyY2VSb290KSksXG4gICAgICAvLyBSZXBsYWNlIHRoZSBhc3NldHMgaW4gb3B0aW9ucyB3aXRoIHRoZSBub3JtYWxpemVkIHZlcnNpb24uXG4gICAgICB0YXAoKGFzc2V0UGF0dGVybk9iamVjdHMgPT4gYnJvd3Nlck9wdGlvbnMuYXNzZXRzID0gYXNzZXRQYXR0ZXJuT2JqZWN0cykpLFxuICAgICAgY29uY2F0TWFwKCgpID0+IG5ldyBPYnNlcnZhYmxlKG9icyA9PiB7XG4gICAgICAgIGNvbnN0IGJyb3dzZXJCdWlsZGVyID0gbmV3IEJyb3dzZXJCdWlsZGVyKHRoaXMuY29udGV4dCk7XG4gICAgICAgIGNvbnN0IHdlYnBhY2tDb25maWcgPSBicm93c2VyQnVpbGRlci5idWlsZFdlYnBhY2tDb25maWcoXG4gICAgICAgICAgcm9vdCwgcHJvamVjdFJvb3QsIGhvc3QsIGJyb3dzZXJPcHRpb25zIGFzIE5vcm1hbGl6ZWRCcm93c2VyQnVpbGRlclNjaGVtYSk7XG4gICAgICAgIGNvbnN0IHN0YXRzQ29uZmlnID0gZ2V0V2VicGFja1N0YXRzQ29uZmlnKGJyb3dzZXJPcHRpb25zLnZlcmJvc2UpO1xuXG4gICAgICAgIGxldCB3ZWJwYWNrRGV2U2VydmVyQ29uZmlnOiBXZWJwYWNrRGV2U2VydmVyQ29uZmlndXJhdGlvbk9wdGlvbnM7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgd2VicGFja0RldlNlcnZlckNvbmZpZyA9IHRoaXMuX2J1aWxkU2VydmVyQ29uZmlnKFxuICAgICAgICAgICAgcm9vdCwgcHJvamVjdFJvb3QsIG9wdGlvbnMsIGJyb3dzZXJPcHRpb25zKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgb2JzLmVycm9yKGVycik7XG5cbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBSZXNvbHZlIHB1YmxpYyBob3N0IGFuZCBjbGllbnQgYWRkcmVzcy5cbiAgICAgICAgbGV0IGNsaWVudEFkZHJlc3MgPSBgJHtvcHRpb25zLnNzbCA/ICdodHRwcycgOiAnaHR0cCd9Oi8vMC4wLjAuMDowYDtcbiAgICAgICAgaWYgKG9wdGlvbnMucHVibGljSG9zdCkge1xuICAgICAgICAgIGxldCBwdWJsaWNIb3N0ID0gb3B0aW9ucy5wdWJsaWNIb3N0O1xuICAgICAgICAgIGlmICghL15cXHcrOlxcL1xcLy8udGVzdChwdWJsaWNIb3N0KSkge1xuICAgICAgICAgICAgcHVibGljSG9zdCA9IGAke29wdGlvbnMuc3NsID8gJ2h0dHBzJyA6ICdodHRwJ306Ly8ke3B1YmxpY0hvc3R9YDtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgY2xpZW50VXJsID0gdXJsLnBhcnNlKHB1YmxpY0hvc3QpO1xuICAgICAgICAgIG9wdGlvbnMucHVibGljSG9zdCA9IGNsaWVudFVybC5ob3N0O1xuICAgICAgICAgIGNsaWVudEFkZHJlc3MgPSB1cmwuZm9ybWF0KGNsaWVudFVybCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBSZXNvbHZlIHNlcnZlIGFkZHJlc3MuXG4gICAgICAgIGNvbnN0IHNlcnZlckFkZHJlc3MgPSB1cmwuZm9ybWF0KHtcbiAgICAgICAgICBwcm90b2NvbDogb3B0aW9ucy5zc2wgPyAnaHR0cHMnIDogJ2h0dHAnLFxuICAgICAgICAgIGhvc3RuYW1lOiBvcHRpb25zLmhvc3QgPT09ICcwLjAuMC4wJyA/ICdsb2NhbGhvc3QnIDogb3B0aW9ucy5ob3N0LFxuICAgICAgICAgIHBvcnQ6IG9wdGlvbnMucG9ydC50b1N0cmluZygpLFxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBBZGQgbGl2ZSByZWxvYWQgY29uZmlnLlxuICAgICAgICBpZiAob3B0aW9ucy5saXZlUmVsb2FkKSB7XG4gICAgICAgICAgdGhpcy5fYWRkTGl2ZVJlbG9hZChvcHRpb25zLCBicm93c2VyT3B0aW9ucywgd2VicGFja0NvbmZpZywgY2xpZW50QWRkcmVzcyk7XG4gICAgICAgIH0gZWxzZSBpZiAob3B0aW9ucy5obXIpIHtcbiAgICAgICAgICB0aGlzLmNvbnRleHQubG9nZ2VyLndhcm4oJ0xpdmUgcmVsb2FkIGlzIGRpc2FibGVkLiBITVIgb3B0aW9uIGlnbm9yZWQuJyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIW9wdGlvbnMud2F0Y2gpIHtcbiAgICAgICAgICAvLyBUaGVyZSdzIG5vIG9wdGlvbiB0byB0dXJuIG9mZiBmaWxlIHdhdGNoaW5nIGluIHdlYnBhY2stZGV2LXNlcnZlciwgYnV0XG4gICAgICAgICAgLy8gd2UgY2FuIG92ZXJyaWRlIHRoZSBmaWxlIHdhdGNoZXIgaW5zdGVhZC5cbiAgICAgICAgICB3ZWJwYWNrQ29uZmlnLnBsdWdpbnMudW5zaGlmdCh7XG4gICAgICAgICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tYW55XG4gICAgICAgICAgICBhcHBseTogKGNvbXBpbGVyOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgY29tcGlsZXIuaG9va3MuYWZ0ZXJFbnZpcm9ubWVudC50YXAoJ2FuZ3VsYXItY2xpJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbXBpbGVyLndhdGNoRmlsZVN5c3RlbSA9IHsgd2F0Y2g6ICgpID0+IHsgfSB9O1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoYnJvd3Nlck9wdGlvbnMub3B0aW1pemF0aW9uKSB7XG4gICAgICAgICAgdGhpcy5jb250ZXh0LmxvZ2dlci5lcnJvcih0YWdzLnN0cmlwSW5kZW50c2BcbiAgICAgICAgICAgICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgICAgICAgIFRoaXMgaXMgYSBzaW1wbGUgc2VydmVyIGZvciB1c2UgaW4gdGVzdGluZyBvciBkZWJ1Z2dpbmcgQW5ndWxhciBhcHBsaWNhdGlvbnMgbG9jYWxseS5cbiAgICAgICAgICAgIEl0IGhhc24ndCBiZWVuIHJldmlld2VkIGZvciBzZWN1cml0eSBpc3N1ZXMuXG5cbiAgICAgICAgICAgIERPTidUIFVTRSBJVCBGT1IgUFJPRFVDVElPTiFcbiAgICAgICAgICAgICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgICAgICBgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuY29udGV4dC5sb2dnZXIuaW5mbyh0YWdzLm9uZUxpbmVgXG4gICAgICAgICAgKipcbiAgICAgICAgICBBbmd1bGFyIExpdmUgRGV2ZWxvcG1lbnQgU2VydmVyIGlzIGxpc3RlbmluZyBvbiAke29wdGlvbnMuaG9zdH06JHtvcHRpb25zLnBvcnR9LFxuICAgICAgICAgIG9wZW4geW91ciBicm93c2VyIG9uICR7c2VydmVyQWRkcmVzc30ke3dlYnBhY2tEZXZTZXJ2ZXJDb25maWcucHVibGljUGF0aH1cbiAgICAgICAgICAqKlxuICAgICAgICBgKTtcblxuICAgICAgICBjb25zdCB3ZWJwYWNrQ29tcGlsZXIgPSB3ZWJwYWNrKHdlYnBhY2tDb25maWcpO1xuICAgICAgICBjb25zdCBzZXJ2ZXIgPSBuZXcgV2VicGFja0RldlNlcnZlcih3ZWJwYWNrQ29tcGlsZXIsIHdlYnBhY2tEZXZTZXJ2ZXJDb25maWcpO1xuXG4gICAgICAgIGxldCBmaXJzdCA9IHRydWU7XG4gICAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1hbnlcbiAgICAgICAgKHdlYnBhY2tDb21waWxlciBhcyBhbnkpLmhvb2tzLmRvbmUudGFwKCdhbmd1bGFyLWNsaScsIChzdGF0czogd2VicGFjay5TdGF0cykgPT4ge1xuICAgICAgICAgIGlmICghYnJvd3Nlck9wdGlvbnMudmVyYm9zZSkge1xuICAgICAgICAgICAgY29uc3QganNvbiA9IHN0YXRzLnRvSnNvbihzdGF0c0NvbmZpZyk7XG4gICAgICAgICAgICB0aGlzLmNvbnRleHQubG9nZ2VyLmluZm8oc3RhdHNUb1N0cmluZyhqc29uLCBzdGF0c0NvbmZpZykpO1xuICAgICAgICAgICAgaWYgKHN0YXRzLmhhc1dhcm5pbmdzKCkpIHtcbiAgICAgICAgICAgICAgdGhpcy5jb250ZXh0LmxvZ2dlci5pbmZvKHN0YXRzV2FybmluZ3NUb1N0cmluZyhqc29uLCBzdGF0c0NvbmZpZykpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHN0YXRzLmhhc0Vycm9ycygpKSB7XG4gICAgICAgICAgICAgIHRoaXMuY29udGV4dC5sb2dnZXIuaW5mbyhzdGF0c0Vycm9yc1RvU3RyaW5nKGpzb24sIHN0YXRzQ29uZmlnKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIG9icy5uZXh0KHsgc3VjY2VzczogIXN0YXRzLmhhc0Vycm9ycygpIH0pO1xuXG4gICAgICAgICAgaWYgKGZpcnN0ICYmIG9wdGlvbnMub3Blbikge1xuICAgICAgICAgICAgZmlyc3QgPSBmYWxzZTtcbiAgICAgICAgICAgIG9wbihzZXJ2ZXJBZGRyZXNzICsgd2VicGFja0RldlNlcnZlckNvbmZpZy5wdWJsaWNQYXRoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IGh0dHBTZXJ2ZXIgPSBzZXJ2ZXIubGlzdGVuKFxuICAgICAgICAgIG9wdGlvbnMucG9ydCxcbiAgICAgICAgICBvcHRpb25zLmhvc3QsXG4gICAgICAgICAgKGVycjogYW55KSA9PiB7IC8vIHRzbGludDpkaXNhYmxlLWxpbmU6bm8tYW55XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgIG9icy5lcnJvcihlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICk7XG5cbiAgICAgICAgLy8gTm9kZSA4IGhhcyBhIGtlZXBBbGl2ZVRpbWVvdXQgYnVnIHdoaWNoIGRvZXNuJ3QgcmVzcGVjdCBhY3RpdmUgY29ubmVjdGlvbnMuXG4gICAgICAgIC8vIENvbm5lY3Rpb25zIHdpbGwgZW5kIGFmdGVyIH41IHNlY29uZHMgKGFyYml0cmFyeSksIG9mdGVuIG5vdCBsZXR0aW5nIHRoZSBmdWxsIGRvd25sb2FkXG4gICAgICAgIC8vIG9mIGxhcmdlIHBpZWNlcyBvZiBjb250ZW50LCBzdWNoIGFzIGEgdmVuZG9yIGphdmFzY3JpcHQgZmlsZS4gIFRoaXMgcmVzdWx0cyBpbiBicm93c2Vyc1xuICAgICAgICAvLyB0aHJvd2luZyBhIFwibmV0OjpFUlJfQ09OVEVOVF9MRU5HVEhfTUlTTUFUQ0hcIiBlcnJvci5cbiAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci1jbGkvaXNzdWVzLzcxOTdcbiAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL25vZGVqcy9ub2RlL2lzc3Vlcy8xMzM5MVxuICAgICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vbm9kZWpzL25vZGUvY29tbWl0LzJjYjZmMmIyODFlYjk2YTdhYmUxNmQ1OGFmNmViYzljZTIzZDJlOTZcbiAgICAgICAgaWYgKC9edjguXFxkLlxcZCskLy50ZXN0KHByb2Nlc3MudmVyc2lvbikpIHtcbiAgICAgICAgICBodHRwU2VydmVyLmtlZXBBbGl2ZVRpbWVvdXQgPSAzMDAwMDsgLy8gMzAgc2Vjb25kc1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVGVhcmRvd24gbG9naWMuIENsb3NlIHRoZSBzZXJ2ZXIgd2hlbiB1bnN1YnNjcmliZWQgZnJvbS5cbiAgICAgICAgcmV0dXJuICgpID0+IHNlcnZlci5jbG9zZSgpO1xuICAgICAgfSkpKTtcbiAgfVxuXG4gIHByaXZhdGUgX2J1aWxkU2VydmVyQ29uZmlnKFxuICAgIHJvb3Q6IFBhdGgsXG4gICAgcHJvamVjdFJvb3Q6IFBhdGgsXG4gICAgb3B0aW9uczogRGV2U2VydmVyQnVpbGRlck9wdGlvbnMsXG4gICAgYnJvd3Nlck9wdGlvbnM6IEJyb3dzZXJCdWlsZGVyU2NoZW1hLFxuICApIHtcbiAgICBjb25zdCBzeXN0ZW1Sb290ID0gZ2V0U3lzdGVtUGF0aChyb290KTtcbiAgICBpZiAob3B0aW9ucy5kaXNhYmxlSG9zdENoZWNrKSB7XG4gICAgICB0aGlzLmNvbnRleHQubG9nZ2VyLndhcm4odGFncy5vbmVMaW5lYFxuICAgICAgICBXQVJOSU5HOiBSdW5uaW5nIGEgc2VydmVyIHdpdGggLS1kaXNhYmxlLWhvc3QtY2hlY2sgaXMgYSBzZWN1cml0eSByaXNrLlxuICAgICAgICBTZWUgaHR0cHM6Ly9tZWRpdW0uY29tL3dlYnBhY2svd2VicGFjay1kZXYtc2VydmVyLW1pZGRsZXdhcmUtc2VjdXJpdHktaXNzdWVzLTE0ODlkOTUwODc0YVxuICAgICAgICBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cbiAgICAgIGApO1xuICAgIH1cblxuICAgIGNvbnN0IHNlcnZlUGF0aCA9IHRoaXMuX2J1aWxkU2VydmVQYXRoKG9wdGlvbnMsIGJyb3dzZXJPcHRpb25zKTtcblxuICAgIGNvbnN0IGNvbmZpZzogV2VicGFja0RldlNlcnZlckNvbmZpZ3VyYXRpb25PcHRpb25zID0ge1xuICAgICAgaGVhZGVyczogeyAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJzogJyonIH0sXG4gICAgICBoaXN0b3J5QXBpRmFsbGJhY2s6IHtcbiAgICAgICAgaW5kZXg6IGAke3NlcnZlUGF0aH0vJHtwYXRoLmJhc2VuYW1lKGJyb3dzZXJPcHRpb25zLmluZGV4KX1gLFxuICAgICAgICBkaXNhYmxlRG90UnVsZTogdHJ1ZSxcbiAgICAgICAgaHRtbEFjY2VwdEhlYWRlcnM6IFsndGV4dC9odG1sJywgJ2FwcGxpY2F0aW9uL3hodG1sK3htbCddLFxuICAgICAgfSxcbiAgICAgIHN0YXRzOiBicm93c2VyT3B0aW9ucy52ZXJib3NlID8gZ2V0V2VicGFja1N0YXRzQ29uZmlnKGJyb3dzZXJPcHRpb25zLnZlcmJvc2UpIDogZmFsc2UsXG4gICAgICBjb21wcmVzczogYnJvd3Nlck9wdGlvbnMub3B0aW1pemF0aW9uLFxuICAgICAgd2F0Y2hPcHRpb25zOiB7XG4gICAgICAgIHBvbGw6IGJyb3dzZXJPcHRpb25zLnBvbGwsXG4gICAgICB9LFxuICAgICAgaHR0cHM6IG9wdGlvbnMuc3NsLFxuICAgICAgb3ZlcmxheToge1xuICAgICAgICBlcnJvcnM6ICFicm93c2VyT3B0aW9ucy5vcHRpbWl6YXRpb24sXG4gICAgICAgIHdhcm5pbmdzOiBmYWxzZSxcbiAgICAgIH0sXG4gICAgICBjb250ZW50QmFzZTogZmFsc2UsXG4gICAgICBwdWJsaWM6IG9wdGlvbnMucHVibGljSG9zdCxcbiAgICAgIGRpc2FibGVIb3N0Q2hlY2s6IG9wdGlvbnMuZGlzYWJsZUhvc3RDaGVjayxcbiAgICAgIHB1YmxpY1BhdGg6IHNlcnZlUGF0aCxcbiAgICAgIGhvdDogb3B0aW9ucy5obXIsXG4gICAgfTtcblxuICAgIGlmIChvcHRpb25zLnNzbCkge1xuICAgICAgdGhpcy5fYWRkU3NsQ29uZmlnKHN5c3RlbVJvb3QsIG9wdGlvbnMsIGNvbmZpZyk7XG4gICAgfVxuXG4gICAgaWYgKG9wdGlvbnMucHJveHlDb25maWcpIHtcbiAgICAgIHRoaXMuX2FkZFByb3h5Q29uZmlnKHN5c3RlbVJvb3QsIG9wdGlvbnMsIGNvbmZpZyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvbmZpZztcbiAgfVxuXG4gIHByaXZhdGUgX2FkZExpdmVSZWxvYWQoXG4gICAgb3B0aW9uczogRGV2U2VydmVyQnVpbGRlck9wdGlvbnMsXG4gICAgYnJvd3Nlck9wdGlvbnM6IEJyb3dzZXJCdWlsZGVyU2NoZW1hLFxuICAgIHdlYnBhY2tDb25maWc6IGFueSwgLy8gdHNsaW50OmRpc2FibGUtbGluZTpuby1hbnlcbiAgICBjbGllbnRBZGRyZXNzOiBzdHJpbmcsXG4gICkge1xuICAgIC8vIFRoaXMgYWxsb3dzIGZvciBsaXZlIHJlbG9hZCBvZiBwYWdlIHdoZW4gY2hhbmdlcyBhcmUgbWFkZSB0byByZXBvLlxuICAgIC8vIGh0dHBzOi8vd2VicGFjay5qcy5vcmcvY29uZmlndXJhdGlvbi9kZXYtc2VydmVyLyNkZXZzZXJ2ZXItaW5saW5lXG4gICAgbGV0IHdlYnBhY2tEZXZTZXJ2ZXJQYXRoO1xuICAgIHRyeSB7XG4gICAgICB3ZWJwYWNrRGV2U2VydmVyUGF0aCA9IHJlcXVpcmUucmVzb2x2ZSgnd2VicGFjay1kZXYtc2VydmVyL2NsaWVudCcpO1xuICAgIH0gY2F0Y2gge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdUaGUgXCJ3ZWJwYWNrLWRldi1zZXJ2ZXJcIiBwYWNrYWdlIGNvdWxkIG5vdCBiZSBmb3VuZC4nKTtcbiAgICB9XG4gICAgY29uc3QgZW50cnlQb2ludHMgPSBbYCR7d2VicGFja0RldlNlcnZlclBhdGh9PyR7Y2xpZW50QWRkcmVzc31gXTtcbiAgICBpZiAob3B0aW9ucy5obXIpIHtcbiAgICAgIGNvbnN0IHdlYnBhY2tIbXJMaW5rID0gJ2h0dHBzOi8vd2VicGFjay5qcy5vcmcvZ3VpZGVzL2hvdC1tb2R1bGUtcmVwbGFjZW1lbnQnO1xuXG4gICAgICB0aGlzLmNvbnRleHQubG9nZ2VyLndhcm4oXG4gICAgICAgIHRhZ3Mub25lTGluZWBOT1RJQ0U6IEhvdCBNb2R1bGUgUmVwbGFjZW1lbnQgKEhNUikgaXMgZW5hYmxlZCBmb3IgdGhlIGRldiBzZXJ2ZXIuYCk7XG5cbiAgICAgIGNvbnN0IHNob3dXYXJuaW5nID0gb3B0aW9ucy5obXJXYXJuaW5nO1xuICAgICAgaWYgKHNob3dXYXJuaW5nKSB7XG4gICAgICAgIHRoaXMuY29udGV4dC5sb2dnZXIuaW5mbyh0YWdzLnN0cmlwSW5kZW50c2BcbiAgICAgICAgICBUaGUgcHJvamVjdCB3aWxsIHN0aWxsIGxpdmUgcmVsb2FkIHdoZW4gSE1SIGlzIGVuYWJsZWQsXG4gICAgICAgICAgYnV0IHRvIHRha2UgYWR2YW50YWdlIG9mIEhNUiBhZGRpdGlvbmFsIGFwcGxpY2F0aW9uIGNvZGUgaXMgcmVxdWlyZWQnXG4gICAgICAgICAgKG5vdCBpbmNsdWRlZCBpbiBhbiBBbmd1bGFyIENMSSBwcm9qZWN0IGJ5IGRlZmF1bHQpLidcbiAgICAgICAgICBTZWUgJHt3ZWJwYWNrSG1yTGlua31cbiAgICAgICAgICBmb3IgaW5mb3JtYXRpb24gb24gd29ya2luZyB3aXRoIEhNUiBmb3IgV2VicGFjay5gLFxuICAgICAgICApO1xuICAgICAgICB0aGlzLmNvbnRleHQubG9nZ2VyLndhcm4oXG4gICAgICAgICAgdGFncy5vbmVMaW5lYFRvIGRpc2FibGUgdGhpcyB3YXJuaW5nIHVzZSBcImhtcldhcm5pbmc6IGZhbHNlXCIgdW5kZXIgXCJzZXJ2ZVwiXG4gICAgICAgICAgIG9wdGlvbnMgaW4gXCJhbmd1bGFyLmpzb25cIi5gLFxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgZW50cnlQb2ludHMucHVzaCgnd2VicGFjay9ob3QvZGV2LXNlcnZlcicpO1xuICAgICAgd2VicGFja0NvbmZpZy5wbHVnaW5zLnB1c2gobmV3IHdlYnBhY2suSG90TW9kdWxlUmVwbGFjZW1lbnRQbHVnaW4oKSk7XG4gICAgICBpZiAoYnJvd3Nlck9wdGlvbnMuZXh0cmFjdENzcykge1xuICAgICAgICB0aGlzLmNvbnRleHQubG9nZ2VyLndhcm4odGFncy5vbmVMaW5lYE5PVElDRTogKEhNUikgZG9lcyBub3QgYWxsb3cgZm9yIENTUyBob3QgcmVsb2FkXG4gICAgICAgICAgICAgICAgd2hlbiB1c2VkIHRvZ2V0aGVyIHdpdGggJy0tZXh0cmFjdC1jc3MnLmApO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoIXdlYnBhY2tDb25maWcuZW50cnkubWFpbikgeyB3ZWJwYWNrQ29uZmlnLmVudHJ5Lm1haW4gPSBbXTsgfVxuICAgIHdlYnBhY2tDb25maWcuZW50cnkubWFpbi51bnNoaWZ0KC4uLmVudHJ5UG9pbnRzKTtcbiAgfVxuXG4gIHByaXZhdGUgX2FkZFNzbENvbmZpZyhcbiAgICByb290OiBzdHJpbmcsXG4gICAgb3B0aW9uczogRGV2U2VydmVyQnVpbGRlck9wdGlvbnMsXG4gICAgY29uZmlnOiBXZWJwYWNrRGV2U2VydmVyQ29uZmlndXJhdGlvbk9wdGlvbnMsXG4gICkge1xuICAgIGxldCBzc2xLZXk6IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBsZXQgc3NsQ2VydDogc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIGlmIChvcHRpb25zLnNzbEtleSkge1xuICAgICAgY29uc3Qga2V5UGF0aCA9IHBhdGgucmVzb2x2ZShyb290LCBvcHRpb25zLnNzbEtleSBhcyBzdHJpbmcpO1xuICAgICAgaWYgKGV4aXN0c1N5bmMoa2V5UGF0aCkpIHtcbiAgICAgICAgc3NsS2V5ID0gcmVhZEZpbGVTeW5jKGtleVBhdGgsICd1dGYtOCcpO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAob3B0aW9ucy5zc2xDZXJ0KSB7XG4gICAgICBjb25zdCBjZXJ0UGF0aCA9IHBhdGgucmVzb2x2ZShyb290LCBvcHRpb25zLnNzbENlcnQgYXMgc3RyaW5nKTtcbiAgICAgIGlmIChleGlzdHNTeW5jKGNlcnRQYXRoKSkge1xuICAgICAgICBzc2xDZXJ0ID0gcmVhZEZpbGVTeW5jKGNlcnRQYXRoLCAndXRmLTgnKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25maWcuaHR0cHMgPSB0cnVlO1xuICAgIGlmIChzc2xLZXkgIT0gbnVsbCAmJiBzc2xDZXJ0ICE9IG51bGwpIHtcbiAgICAgIGNvbmZpZy5rZXkgPSBzc2xLZXk7XG4gICAgICBjb25maWcuY2VydCA9IHNzbENlcnQ7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfYWRkUHJveHlDb25maWcoXG4gICAgcm9vdDogc3RyaW5nLFxuICAgIG9wdGlvbnM6IERldlNlcnZlckJ1aWxkZXJPcHRpb25zLFxuICAgIGNvbmZpZzogV2VicGFja0RldlNlcnZlckNvbmZpZ3VyYXRpb25PcHRpb25zLFxuICApIHtcbiAgICBsZXQgcHJveHlDb25maWcgPSB7fTtcbiAgICBjb25zdCBwcm94eVBhdGggPSBwYXRoLnJlc29sdmUocm9vdCwgb3B0aW9ucy5wcm94eUNvbmZpZyBhcyBzdHJpbmcpO1xuICAgIGlmIChleGlzdHNTeW5jKHByb3h5UGF0aCkpIHtcbiAgICAgIHByb3h5Q29uZmlnID0gcmVxdWlyZShwcm94eVBhdGgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBtZXNzYWdlID0gJ1Byb3h5IGNvbmZpZyBmaWxlICcgKyBwcm94eVBhdGggKyAnIGRvZXMgbm90IGV4aXN0Lic7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IobWVzc2FnZSk7XG4gICAgfVxuICAgIGNvbmZpZy5wcm94eSA9IHByb3h5Q29uZmlnO1xuICB9XG5cbiAgcHJpdmF0ZSBfYnVpbGRTZXJ2ZVBhdGgob3B0aW9uczogRGV2U2VydmVyQnVpbGRlck9wdGlvbnMsIGJyb3dzZXJPcHRpb25zOiBCcm93c2VyQnVpbGRlclNjaGVtYSkge1xuICAgIGxldCBzZXJ2ZVBhdGggPSBvcHRpb25zLnNlcnZlUGF0aDtcbiAgICBpZiAoIXNlcnZlUGF0aCAmJiBzZXJ2ZVBhdGggIT09ICcnKSB7XG4gICAgICBjb25zdCBkZWZhdWx0U2VydmVQYXRoID1cbiAgICAgICAgdGhpcy5fZmluZERlZmF1bHRTZXJ2ZVBhdGgoYnJvd3Nlck9wdGlvbnMuYmFzZUhyZWYsIGJyb3dzZXJPcHRpb25zLmRlcGxveVVybCk7XG4gICAgICBjb25zdCBzaG93V2FybmluZyA9IG9wdGlvbnMuc2VydmVQYXRoRGVmYXVsdFdhcm5pbmc7XG4gICAgICBpZiAoZGVmYXVsdFNlcnZlUGF0aCA9PSBudWxsICYmIHNob3dXYXJuaW5nKSB7XG4gICAgICAgIHRoaXMuY29udGV4dC5sb2dnZXIud2Fybih0YWdzLm9uZUxpbmVgXG4gICAgICAgICAgICBXQVJOSU5HOiAtLWRlcGxveS11cmwgYW5kL29yIC0tYmFzZS1ocmVmIGNvbnRhaW5cbiAgICAgICAgICAgIHVuc3VwcG9ydGVkIHZhbHVlcyBmb3Igbmcgc2VydmUuICBEZWZhdWx0IHNlcnZlIHBhdGggb2YgJy8nIHVzZWQuXG4gICAgICAgICAgICBVc2UgLS1zZXJ2ZS1wYXRoIHRvIG92ZXJyaWRlLlxuICAgICAgICAgIGApO1xuICAgICAgfVxuICAgICAgc2VydmVQYXRoID0gZGVmYXVsdFNlcnZlUGF0aCB8fCAnJztcbiAgICB9XG4gICAgaWYgKHNlcnZlUGF0aC5lbmRzV2l0aCgnLycpKSB7XG4gICAgICBzZXJ2ZVBhdGggPSBzZXJ2ZVBhdGguc3Vic3RyKDAsIHNlcnZlUGF0aC5sZW5ndGggLSAxKTtcbiAgICB9XG4gICAgaWYgKCFzZXJ2ZVBhdGguc3RhcnRzV2l0aCgnLycpKSB7XG4gICAgICBzZXJ2ZVBhdGggPSBgLyR7c2VydmVQYXRofWA7XG4gICAgfVxuXG4gICAgcmV0dXJuIHNlcnZlUGF0aDtcbiAgfVxuXG4gIHByaXZhdGUgX2ZpbmREZWZhdWx0U2VydmVQYXRoKGJhc2VIcmVmPzogc3RyaW5nLCBkZXBsb3lVcmw/OiBzdHJpbmcpOiBzdHJpbmcgfCBudWxsIHtcbiAgICBpZiAoIWJhc2VIcmVmICYmICFkZXBsb3lVcmwpIHtcbiAgICAgIHJldHVybiAnJztcbiAgICB9XG5cbiAgICBpZiAoL14oXFx3KzopP1xcL1xcLy8udGVzdChiYXNlSHJlZiB8fCAnJykgfHwgL14oXFx3KzopP1xcL1xcLy8udGVzdChkZXBsb3lVcmwgfHwgJycpKSB7XG4gICAgICAvLyBJZiBiYXNlSHJlZiBvciBkZXBsb3lVcmwgaXMgYWJzb2x1dGUsIHVuc3VwcG9ydGVkIGJ5IG5nIHNlcnZlXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBub3JtYWxpemUgYmFzZUhyZWZcbiAgICAvLyBmb3Igbmcgc2VydmUgdGhlIHN0YXJ0aW5nIGJhc2UgaXMgYWx3YXlzIGAvYCBzbyBhIHJlbGF0aXZlXG4gICAgLy8gYW5kIHJvb3QgcmVsYXRpdmUgdmFsdWUgYXJlIGlkZW50aWNhbFxuICAgIGNvbnN0IGJhc2VIcmVmUGFydHMgPSAoYmFzZUhyZWYgfHwgJycpXG4gICAgICAuc3BsaXQoJy8nKVxuICAgICAgLmZpbHRlcihwYXJ0ID0+IHBhcnQgIT09ICcnKTtcbiAgICBpZiAoYmFzZUhyZWYgJiYgIWJhc2VIcmVmLmVuZHNXaXRoKCcvJykpIHtcbiAgICAgIGJhc2VIcmVmUGFydHMucG9wKCk7XG4gICAgfVxuICAgIGNvbnN0IG5vcm1hbGl6ZWRCYXNlSHJlZiA9IGJhc2VIcmVmUGFydHMubGVuZ3RoID09PSAwID8gJy8nIDogYC8ke2Jhc2VIcmVmUGFydHMuam9pbignLycpfS9gO1xuXG4gICAgaWYgKGRlcGxveVVybCAmJiBkZXBsb3lVcmxbMF0gPT09ICcvJykge1xuICAgICAgaWYgKGJhc2VIcmVmICYmIGJhc2VIcmVmWzBdID09PSAnLycgJiYgbm9ybWFsaXplZEJhc2VIcmVmICE9PSBkZXBsb3lVcmwpIHtcbiAgICAgICAgLy8gSWYgYmFzZUhyZWYgYW5kIGRlcGxveVVybCBhcmUgcm9vdCByZWxhdGl2ZSBhbmQgbm90IGVxdWl2YWxlbnQsIHVuc3VwcG9ydGVkIGJ5IG5nIHNlcnZlXG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZGVwbG95VXJsO1xuICAgIH1cblxuICAgIC8vIEpvaW4gdG9nZXRoZXIgYmFzZUhyZWYgYW5kIGRlcGxveVVybFxuICAgIHJldHVybiBgJHtub3JtYWxpemVkQmFzZUhyZWZ9JHtkZXBsb3lVcmwgfHwgJyd9YDtcbiAgfVxuXG4gIHByaXZhdGUgX2dldEJyb3dzZXJPcHRpb25zKG9wdGlvbnM6IERldlNlcnZlckJ1aWxkZXJPcHRpb25zKSB7XG4gICAgY29uc3QgYXJjaGl0ZWN0ID0gdGhpcy5jb250ZXh0LmFyY2hpdGVjdDtcbiAgICBjb25zdCBbcHJvamVjdCwgdGFyZ2V0LCBjb25maWd1cmF0aW9uXSA9IG9wdGlvbnMuYnJvd3NlclRhcmdldC5zcGxpdCgnOicpO1xuXG4gICAgY29uc3Qgb3ZlcnJpZGVzID0ge1xuICAgICAgLy8gT3ZlcnJpZGUgYnJvd3NlciBidWlsZCB3YXRjaCBzZXR0aW5nLlxuICAgICAgd2F0Y2g6IG9wdGlvbnMud2F0Y2gsXG5cbiAgICAgIC8vIFVwZGF0ZSB0aGUgYnJvd3NlciBvcHRpb25zIHdpdGggdGhlIHNhbWUgb3B0aW9ucyB3ZSBzdXBwb3J0IGluIHNlcnZlLCBpZiBkZWZpbmVkLlxuICAgICAgLi4uKG9wdGlvbnMub3B0aW1pemF0aW9uICE9PSB1bmRlZmluZWQgPyB7IG9wdGltaXphdGlvbjogb3B0aW9ucy5vcHRpbWl6YXRpb24gfSA6IHt9KSxcbiAgICAgIC4uLihvcHRpb25zLmFvdCAhPT0gdW5kZWZpbmVkID8geyBhb3Q6IG9wdGlvbnMuYW90IH0gOiB7fSksXG4gICAgICAuLi4ob3B0aW9ucy5zb3VyY2VNYXAgIT09IHVuZGVmaW5lZCA/IHsgc291cmNlTWFwOiBvcHRpb25zLnNvdXJjZU1hcCB9IDoge30pLFxuICAgICAgLi4uKG9wdGlvbnMuZXZhbFNvdXJjZU1hcCAhPT0gdW5kZWZpbmVkID8geyBldmFsU291cmNlTWFwOiBvcHRpb25zLmV2YWxTb3VyY2VNYXAgfSA6IHt9KSxcbiAgICAgIC4uLihvcHRpb25zLnZlbmRvckNodW5rICE9PSB1bmRlZmluZWQgPyB7IHZlbmRvckNodW5rOiBvcHRpb25zLnZlbmRvckNodW5rIH0gOiB7fSksXG4gICAgICAuLi4ob3B0aW9ucy5jb21tb25DaHVuayAhPT0gdW5kZWZpbmVkID8geyBjb21tb25DaHVuazogb3B0aW9ucy5jb21tb25DaHVuayB9IDoge30pLFxuICAgICAgLi4uKG9wdGlvbnMuYmFzZUhyZWYgIT09IHVuZGVmaW5lZCA/IHsgYmFzZUhyZWY6IG9wdGlvbnMuYmFzZUhyZWYgfSA6IHt9KSxcbiAgICAgIC4uLihvcHRpb25zLnByb2dyZXNzICE9PSB1bmRlZmluZWQgPyB7IHByb2dyZXNzOiBvcHRpb25zLnByb2dyZXNzIH0gOiB7fSksXG4gICAgICAuLi4ob3B0aW9ucy5wb2xsICE9PSB1bmRlZmluZWQgPyB7IHBvbGw6IG9wdGlvbnMucG9sbCB9IDoge30pLFxuICAgIH07XG5cbiAgICBjb25zdCBicm93c2VyVGFyZ2V0U3BlYyA9IHsgcHJvamVjdCwgdGFyZ2V0LCBjb25maWd1cmF0aW9uLCBvdmVycmlkZXMgfTtcbiAgICBjb25zdCBidWlsZGVyQ29uZmlnID0gYXJjaGl0ZWN0LmdldEJ1aWxkZXJDb25maWd1cmF0aW9uPEJyb3dzZXJCdWlsZGVyU2NoZW1hPihcbiAgICAgIGJyb3dzZXJUYXJnZXRTcGVjKTtcblxuICAgIHJldHVybiBhcmNoaXRlY3QuZ2V0QnVpbGRlckRlc2NyaXB0aW9uKGJ1aWxkZXJDb25maWcpLnBpcGUoXG4gICAgICBjb25jYXRNYXAoYnJvd3NlckRlc2NyaXB0aW9uID0+XG4gICAgICAgIGFyY2hpdGVjdC52YWxpZGF0ZUJ1aWxkZXJPcHRpb25zKGJ1aWxkZXJDb25maWcsIGJyb3dzZXJEZXNjcmlwdGlvbikpLFxuICAgICAgbWFwKGJyb3dzZXJDb25maWcgPT4gYnJvd3NlckNvbmZpZy5vcHRpb25zKSxcbiAgICApO1xuICB9XG59XG5cblxuZXhwb3J0IGRlZmF1bHQgRGV2U2VydmVyQnVpbGRlcjtcbiJdfQ==