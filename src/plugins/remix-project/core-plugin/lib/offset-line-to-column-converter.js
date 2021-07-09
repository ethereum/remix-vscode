'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const engine_1 = require("@remixproject/engine");
const remix_debug_1 = require("@remix-project/remix-debug");
const profile = {
    name: 'offsetToLineColumnConverter',
    methods: ['offsetToLineColumn'],
    events: [],
    version: '0.0.1'
};
class OffsetToLineColumnConverter extends engine_1.Plugin {
    constructor() {
        super(profile);
        this.lineBreakPositionsByContent = {};
        this.sourceMappingDecoder = remix_debug_1.sourceMappingDecoder;
    }
    /**
     * Convert offset representation with line/column representation.
     * This is also used to resolve the content:
     * @arg file is the index of the file in the content sources array and content sources array does have filename as key and not index.
     * So we use the asts (which references both index and filename) to look up the actual content targeted by the @arg file index.
     * @param {{start, length}} rawLocation - offset location
     * @param {number} file - The index where to find the source in the sources parameters
     * @param {Object.<string, {content}>} sources - Map of content sources
     * @param {Object.<string, {ast, id}>} asts - Map of content sources
     */
    offsetToLineColumn(rawLocation, file, sources, asts) {
        if (!this.lineBreakPositionsByContent[file]) {
            const sourcesArray = Object.keys(sources);
            if (!asts || (file === 0 && sourcesArray.length === 1)) {
                // if we don't have ast, we process the only one available content (applicable also for compiler older than 0.4.12)
                this.lineBreakPositionsByContent[file] = this.sourceMappingDecoder.getLinebreakPositions(sources[sourcesArray[0]].content);
            }
            else {
                for (var filename in asts) {
                    const source = asts[filename];
                    if (source.id === file) {
                        this.lineBreakPositionsByContent[file] = this.sourceMappingDecoder.getLinebreakPositions(sources[filename].content);
                        break;
                    }
                }
            }
        }
        return this.sourceMappingDecoder.convertOffsetToLineColumn(rawLocation, this.lineBreakPositionsByContent[file]);
    }
    /**
     * Convert offset representation with line/column representation.
     * @param {{start, length}} rawLocation - offset location
     * @param {number} file - The index where to find the source in the sources parameters
     * @param {string} content - source
     */
    offsetToLineColumnWithContent(rawLocation, file, content) {
        this.lineBreakPositionsByContent[file] = this.sourceMappingDecoder.getLinebreakPositions(content);
        return this.sourceMappingDecoder.convertOffsetToLineColumn(rawLocation, this.lineBreakPositionsByContent[file]);
    }
    /**
     * Clear the cache
     */
    clear() {
        this.lineBreakPositionsByContent = {};
    }
    /**
     * called by plugin API
     */
    activate() {
        this.on('solidity', 'compilationFinished', () => {
            this.clear();
        });
    }
}
exports.OffsetToLineColumnConverter = OffsetToLineColumnConverter;
//# sourceMappingURL=offset-line-to-column-converter.js.map