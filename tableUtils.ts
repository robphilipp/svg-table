import {type Selection} from 'd3';

/**
 * Calculates the width of an SVG text element, based on its bounding box
 * @param elem The SVG text element
 * @return The width in pixels, or 0 if SVG text element has not children
 */
export const textWidthOf =
    (elem: Selection<SVGTextElement, any, any, any>): number =>
        elem.node()?.getBBox()?.width || 0

/**
 * Calculates the height of an SVG text element, based on its bounding box
 * @param elem The SVG text element
 * @return The height in pixels, or 0 if SVG text element has not children
 */
export const textHeightOf =
    (elem: Selection<SVGTextElement, any, any, any>): number =>
        elem.node()?.getBBox()?.height || 0

