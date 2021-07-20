export declare function formatMemory(mem: any, width: any): {};
export declare function tryConvertAsciiFormat(memorySlot: any): {
    ascii: string;
    raw: string;
};
/**
 * format @args css1, css2, css3 to css inline style
 *
 * @param {Object} css1 - css inline declaration
 * @param {Object} css2 - css inline declaration
 * @param {Object} css3 - css inline declaration
 * @param {Object} ...
 * @return {String} css inline style
 *                  if the key start with * the value is direcly appended to the inline style (which should be already inline style formatted)
 *                  used if multiple occurences of the same key is needed
 */
export declare function formatCss(css1: any, css2: any): string;
export declare function normalizeHex(hex: any): string;
export declare function normalizeHexAddress(hex: any): string;
export declare function runInBrowser(): boolean;
