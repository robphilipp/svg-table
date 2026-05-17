import type {DataFrame} from "data-frame-ts";

/**
 * Represents a styling configuration with a priority level.
 * Higher priority styles will override lower priority styles when multiple styles are applied.
 */
export type Styling<S> = {
    style: S
    priority: number
}

/**
 * Creates a Styling object with the given style and priority.
 * @param style The style to apply
 * @param defaultStyle The default style that is used to fill in missing style attributes
 * @param priority The priority level of the style (higher values take precedence)
 * @returns A Styling object containing the style and priority
 */
export function stylingFor<S>(style: Partial<S>, defaultStyle: S, priority: number = 0): Styling<S> {
    return {style: {...defaultStyle, ...style}, priority}
}

/**
 * Enum representing different types of table styling elements.
 * Used as identifiers when tagging different parts of the table with styles.
 * Note: replaces enums to support `erasableSyntaxOnly`
 *  TS1294: This syntax is not allowed when 'erasableSyntaxOnly' is enabled.
 */
export const TableStyleType = {
    COLUMN_HEADER: "column_header_style",
    ROW_HEADER: "row_header_style",
    FOOTER: "footer_style",
    ROW: "row_style",
    COLUMN: "column_style",
    CELL: "cell_style"
} as const
export type TableStyleType = typeof TableStyleType[keyof typeof TableStyleType]

/**
 * Properties for the TableStyler class.
 * Contains all the styling information and data for a table.
 */
export type TableStylerProps<V> = {
    dataFrame: DataFrame<V>
    readonly font: TableFont
    border: Border
    background: Background
    dimension: Pick<Dimension, "width" | "height">
    padding: Padding
    margin: Margin
    readonly errors: Array<string>
}

/**
 * Defines the font properties for table text.
 */
export type TableFont = {
    size: number
    color: string
    family: string
    weight: number
}

export const defaultTableFont: TableFont = {
    size: 13,
    color: '#d2933f',
    family: 'sans-serif',
    weight: 450,
}

/**
 * Defines the background properties for table elements.
 */
export type Background = {
    color: string
    opacity: number
}
export const defaultTableBackground: Background = {color: '#fff', opacity: 0}

/**
 * Defines the padding properties for table elements.
 * Specifies the space between the content and the border.
 */
export type Padding = {
    left: number
    right: number
    top: number
    bottom: number
}
export const defaultTablePadding: Padding = {left: 0, right: 0, top: 0, bottom: 0}

/**
 * Defines the margin properties for table elements.
 * Specifies the space outside the border.
 */
export type Margin = {
    left: number
    right: number
    top: number
    bottom: number
}
export const defaultTableMargin: Margin = {left: 0, right: 0, top: 0, bottom: 0}

/**
 * Defines the border properties for table elements.
 * Controls the appearance of the border around table elements.
 */
export type BorderElement = {
    color: string
    opacity: number
    width: number
    radius: number
}
export const defaultBorderElement: BorderElement = {color: 'black', radius: 0, width: 0, opacity: 0}

/**
 * The available border locations.
 * Note: replaces enums to support `erasableSyntaxOnly`
 *  TS1294: This syntax is not allowed when 'erasableSyntaxOnly' is enabled.
 */
export const BorderLocation = {
    TOP: 'top',
    BOTTOM: 'bottom',
    LEFT: 'left',
    RIGHT: 'right'
} as const
export type BorderLocation = typeof BorderLocation[keyof typeof BorderLocation]

export type Border = {
    top: BorderElement
    bottom: BorderElement
    left: BorderElement
    right: BorderElement
}

export const defaultBorder: Border = {
    top: defaultBorderElement,
    bottom: defaultBorderElement,
    left: defaultBorderElement,
    right: defaultBorderElement,
}

/**
 * Defines the dimension properties for table elements.
 * Controls the size constraints including width and height with their minimum,
 * maximum, and default values.
 */
export type Dimension = {
    width: number
    defaultWidth: number
    minWidth: number
    maxWidth: number

    height: number
    defaultHeight: number
    minHeight: number
    maxHeight: number
}

export const defaultDimension: Dimension = {
    width: 60,
    defaultWidth: 70,
    minWidth: 50,
    maxWidth: 100,

    height: 15,
    defaultHeight: 20,
    minHeight: 10,
    maxHeight: 50
}

/**
 * The style for each column (for what is not determined by each row's style).
 */
export type ColumnStyle = {
    alignText: TextAlignment
    verticalAlignText: VerticalTextAlignment
    dimension: Pick<Dimension, "defaultWidth" | "minWidth" | "maxWidth">
    padding: Pick<Padding, "left" | "right">
    border: Border
}

export const defaultColumnStyle: ColumnStyle = {
    alignText: "left",
    verticalAlignText: "middle",
    dimension: {...defaultDimension, defaultWidth: 60, minWidth: 40, maxWidth: 80},
    padding: {...defaultTablePadding, left: 0, right: 0},
    border: defaultBorder
}

/**
 * Note that the {@link ColumnStyle} determines the text alignment for
 * each column. Therefore, the alignment of the text in a row is determined
 * by the alignment for all the rows in the column.
 */
export type RowStyle = {
    font: TableFont
    background: Background
    dimension: Pick<Dimension, "defaultHeight" | "minHeight" | "maxHeight">
    padding: Pick<Padding, "top" | "bottom">
    border: Border
}

export const defaultRowStyle: RowStyle = {
    font: defaultTableFont,
    background: defaultTableBackground,
    dimension: {defaultHeight: 20, minHeight: 15, maxHeight: 50},
    padding: {top: 0, bottom: 0},
    border: defaultBorder
}

export type TextAlignment = "left" | "center" | "right"

export type VerticalTextAlignment = "top" | "middle" | "bottom"

export type CellStyle = {
    font: TableFont
    alignText: TextAlignment
    verticalAlignText: VerticalTextAlignment
    background: Background
    dimension: Dimension
    padding: Padding
    border: Border
}

export const defaultCellStyle: CellStyle = {
    font: defaultTableFont,
    alignText: "left",
    verticalAlignText: "middle",
    background: defaultTableBackground,
    dimension: defaultDimension,
    padding: defaultTablePadding,
    border: defaultBorder
}

/**
 * Confusing as it may be, this is the style for the **row** that holds the
 * headers for each column. The styling for this row may differ from the
 * other rows in the table.
 */
export type ColumnHeaderStyle = {
    font: TableFont
    alignText: TextAlignment
    verticalAlignText: VerticalTextAlignment
    dimension: Pick<Dimension, "height" | "maxHeight" | "minHeight">
    padding: Pick<Padding, "top" | "bottom">
    background: Background
    border: Border
}

export const defaultColumnHeaderStyle: ColumnHeaderStyle = {
    font: {...defaultTableFont, weight: 600},
    alignText: "left",
    verticalAlignText: "middle",
    dimension: {...defaultDimension, height: 20, maxHeight: 50, minHeight: 15},
    padding: {...defaultTablePadding, top: 0, bottom: 0},
    background: defaultTableBackground,
    border: defaultBorder

}

/**
 * Confusing as it may be, this is the style for the **column** that holds
 * the headers for each row. The styling for this column may differ from the
 * columns in the table.
 */
export type RowHeaderStyle = {
    font: TableFont
    alignText: TextAlignment
    verticalAlignText: VerticalTextAlignment
    dimension: Pick<Dimension, "width" | "maxWidth" | "minWidth">
    padding: Pick<Padding, "left" | "right">
    background: Background
    border: Border
}

export const defaultRowHeaderStyle: RowHeaderStyle = {
    font: defaultTableFont,
    alignText: "left",
    verticalAlignText: "middle",
    dimension: {...defaultDimension, width: 60, minWidth: 15, maxWidth: 100},
    padding: {...defaultTablePadding, left: 0, right: 0},
    background: defaultTableBackground,
    border: defaultBorder

}

/**
 * Defines the style for the footer row of the table.
 * Controls the appearance of the footer including font, text alignment,
 * height, padding, and background.
 */
export type FooterStyle = {
    font: TableFont
    alignText: TextAlignment
    verticalAlignText: VerticalTextAlignment
    dimension: Pick<Dimension, "height">
    padding: Pick<Padding, "top" | "bottom">
    background: Background
    border: Border
}

export const defaultFooterStyle: FooterStyle = {
    font: defaultTableFont,
    alignText: "left",
    verticalAlignText: "middle",
    dimension: {height: 20},
    padding: {...defaultTablePadding, top: 0, bottom: 0},
    background: defaultTableBackground,
    border: defaultBorder

}

export type Stylings = Styling<RowHeaderStyle> |
    Styling<ColumnHeaderStyle> |
    Styling<FooterStyle> |
    Styling<RowStyle> |
    Styling<ColumnStyle> |
    Styling<CellStyle>
