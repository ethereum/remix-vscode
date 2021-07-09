import { Plugin } from '@remixproject/engine';
export declare class OffsetToLineColumnConverter extends Plugin {
    lineBreakPositionsByContent: {};
    sourceMappingDecoder: any;
    constructor();
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
    offsetToLineColumn(rawLocation: any, file: any, sources: any, asts: any): any;
    /**
     * Convert offset representation with line/column representation.
     * @param {{start, length}} rawLocation - offset location
     * @param {number} file - The index where to find the source in the sources parameters
     * @param {string} content - source
     */
    offsetToLineColumnWithContent(rawLocation: any, file: any, content: any): any;
    /**
     * Clear the cache
     */
    clear(): void;
    /**
     * called by plugin API
     */
    activate(): void;
}
