export type {
    Styling,
    TableStylerProps,
    TableFont,
    Background,
    Padding,
    Margin,
    BorderElement,
    Border,
    Dimension,
    ColumnStyle,
    RowStyle,
    TextAlignment,
    VerticalTextAlignment,
    CellStyle,
    ColumnHeaderStyle,
    RowHeaderStyle,
    FooterStyle,
    Stylings,
} from './stylings';
export {
    stylingFor,
    TableStyleType,
    defaultTableFont,
    defaultTableBackground,
    defaultTablePadding,
    defaultTableMargin,
    defaultBorderElement,
    defaultBorder,
    defaultDimension,
    defaultColumnStyle,
    defaultRowStyle,
    defaultCellStyle,
    defaultColumnHeaderStyle,
    defaultRowHeaderStyle,
    defaultFooterStyle,
} from './stylings';

export {
    TableData,
    TableTagType
} from './TableData';

export type {
    Formatter,
    Formatting,
} from './TableFormatter';

export {
    defaultFormatter,
    defaultFormatting,
    TableFormatterType,
    isFormattingTag,
    TableFormatter
} from './TableFormatter';

export {
    StyledTable,
    TableStyler
} from './TableStyler';

export type {
    ElementPlacementInfo,
    TextAnchor,
    DominantBaseline,
    CellRenderingDimensions,
    TableRenderingInfo
} from './tableSvg';

export {
    elementInfoFrom,
    createTable,
    tableId,
} from './tableSvg';

export type {
    GroupSelection,
    TextSelection,
    RectSelection,
    LineSelection,
    BorderSelection
} from './d3types';

