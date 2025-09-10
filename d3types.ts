// the axis-element type return when calling the ".call(axis)" function
import type {Selection} from "d3";

export type GroupSelection = Selection<SVGGElement, any, null, undefined>
export type TextSelection = Selection<SVGTextElement, any, null, undefined>
export type RectSelection = Selection<SVGRectElement, any, null, undefined>
export type LineSelection = Selection<SVGLineElement, any, null, undefined>

export type BorderSelection = {
    top?: LineSelection
    bottom?: LineSelection
    left?: LineSelection
    right?: LineSelection
}



