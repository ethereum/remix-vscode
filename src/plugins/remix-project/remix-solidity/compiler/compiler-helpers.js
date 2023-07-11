'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const compiler_utils_1 = require("./compiler-utils");
const compiler_abstract_1 = require("./compiler-abstract");
const compiler_1 = require("./compiler");
exports.compile = (compilationTargets, settings, contentResolverCallback) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const res = yield (() => {
        return new Promise((resolve, reject) => {
            const compiler = new compiler_1.Compiler(contentResolverCallback);
            compiler.set('evmVersion', settings.evmVersion);
            compiler.set('optimize', settings.optimize);
            compiler.set('language', settings.language);
            compiler.set('runs', settings.runs);
            compiler.loadVersion(compiler_utils_1.canUseWorker(settings.version), compiler_utils_1.urlFromVersion(settings.version));
            compiler.event.register('compilationFinished', (success, compilationData, source) => {
                resolve(new compiler_abstract_1.CompilerAbstract(settings.version, compilationData, source));
            });
            compiler.event.register('compilerLoaded', _ => compiler.compile(compilationTargets, ''));
        });
    })();
    return res;
});
//# sourceMappingURL=compiler-helpers.js.map