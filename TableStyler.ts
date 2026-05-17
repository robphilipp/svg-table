import {TableData} from "./TableData";
import {CellCoordinate, ColumnCoordinate, DataFrame, RowCoordinate, type Tag, type TagValue} from "data-frame-ts";
import {failureResult, type Result, successResult} from "result-fn";
import {
    type Background,
    type Border,
    type CellStyle,
    type ColumnHeaderStyle,
    type ColumnStyle,
    defaultBorder,
    defaultCellStyle,
    defaultColumnHeaderStyle,
    defaultColumnStyle,
    defaultDimension,
    defaultFooterStyle,
    defaultRowHeaderStyle,
    defaultRowStyle,
    defaultTableBackground,
    defaultTableFont,
    defaultTableMargin,
    defaultTablePadding,
    type Dimension,
    type FooterStyle,
    Margin,
    type Padding,
    type RowHeaderStyle,
    type RowStyle,
    type Styling,
    stylingFor,
    type Stylings,
    type TableFont,
    type TableStylerProps,
    TableStyleType
} from "./stylings";

/**
 * Represents a table with applied styles.
 * Provides methods to access the styling information for different parts of the table.
 */
export class StyledTable<V> {

    private readonly dataFrame: DataFrame<V>
    private readonly font: TableFont
    private readonly border: Border
    private readonly background: Background
    private readonly dimension: Pick<Dimension, "width" | "height">
    private readonly padding: Padding
    private readonly margin: Margin

    /**
     * Creates a new StyledTable instance.
     * @param dataFrame_ The data frame containing the table data
     * @param font_ The font settings for the table
     * @param border_ The border settings for the table
     * @param background_ The background settings for the table
     * @param dimension_ The dimension settings for the table
     * @param padding_ The padding settings for the table
     * @param margin_ The margin settings for the table
     */
    constructor(
        dataFrame_: DataFrame<V>,
        font_: TableFont,
        border_: Border,
        background_: Background,
        dimension_: Pick<Dimension, "width" | "height">,
        padding_: Padding,
        margin_: Margin,
    ) {
        this.dataFrame = dataFrame_
        this.font = font_
        this.border = border_
        this.background = background_
        this.dimension = dimension_
        this.padding = padding_
        this.margin = margin_
    }

    /**
     * @return A copy of the {@link DataFrame} with all the styling and formatting tags
     */
    data(): DataFrame<V> {
        return this.dataFrame.copy()
    }

    tableData(): TableData<V> {
        // fromDataFrame makes a copy of the data frame
        return TableData.fromDataFrame(this.dataFrame)
    }

    /**
     * Returns the font settings for the table.
     * @returns A copy of the table's font settings
     */
    tableFont(): TableFont {
        return {...this.font}
    }

    /**
     * Returns the border settings for the table.
     * @returns A copy of the table's border settings
     */
    tableBorder(): Border {
        return {...this.border}
    }

    /**
     * Returns the background settings for the table.
     * @returns A copy of the table's background settings
     */
    tableBackground(): Background {
        return {...this.background}
    }

    /**
     * Returns the dimension settings for the table.
     * @returns A copy of the table's dimension settings
     */
    tableDimensions(): Pick<Dimension, "width" | "height"> {
        return {...this.dimension}
    }

    /**
     * Returns the padding settings for the table.
     * @returns A copy of the table's padding settings
     */
    tablePadding(): Padding {
        return {...this.padding}
    }

    /**
     * Returns the margin settings for the table.
     * @returns A copy of the table's margin settings
     */
    tableMargin(): Margin {
        return {...this.margin}
    }

    /**
     * Retrieves styling tags for a specific column.
     * @param columnIndex The index of the column
     * @param tagStyleType The type of style tag to retrieve
     * @returns A Result containing the tag if found, or an error message
     * @private
     */
    private columnTagsFor<T extends TagValue>(columnIndex: number, tagStyleType: TableStyleType): Result<Tag<Styling<T>, ColumnCoordinate>, string> {
        // find all the tags and type them to row-header tags
        const tags = this.dataFrame
            .columnTagsFor(columnIndex)
            .filter(tag => tag.matchesId(tagStyleType, ColumnCoordinate.of(columnIndex)))
            .map(tag => tag as Tag<Styling<T>, ColumnCoordinate>)

        if (tags.length === 0) {
            return failureResult(`(StyledTable::columnTagsFor) No matching column-style tags found for table; column_index: ${columnIndex}; tag_type: ${tagStyleType}`)
        }
        // when there are more than one tag representing the row-header style, then sort based on priority and
        // take the first one
        if (tags.length > 1) {
            tags.sort((tagA, tagB) => tagB.value.priority - tagA.value.priority)
        }
        return successResult(tags[0])
    }

    /**
     * Retrieves styling tags for a specific row.
     * @param rowIndex The index of the row
     * @param tagStyleType The type of style tag to retrieve (can be more than one)
     * @returns A Result containing the tag if found, or an error message
     * @private
     */
    private rowTagsFor<S extends TagValue>(rowIndex: number, ...tagStyleType: Array<TableStyleType>): Result<Tag<Styling<S>, RowCoordinate>, string> {
        // find all the tags and type them to column-header tags
        const tags = this.dataFrame
            .rowTagsFor(rowIndex)
            .filter(tag => tagStyleType.filter(styleType => tag.matchesId(styleType, RowCoordinate.of(rowIndex))).length > 0)
            .map(tag => tag as Tag<Styling<S>, RowCoordinate>)

        if (tags.length === 0) {
            return failureResult(`(StyledTable::rowTagsFor) No matching row-style tags found for table; row_index: ${rowIndex}; tag_type: ${tagStyleType}`)
        }
        // when there are more than one tag representing the column-header, the sort based on the priority and
        // take the first one
        if (tags.length > 1) {
            tags.sort((tagA, tagB) => tagB.value.priority - tagA.value.priority)
        }
        return successResult(tags[0])
    }

    /**
     * Checks if the table has a row header.
     * @returns `true` if the table has a row header, `false` otherwise
     */
    hasRowHeader(): boolean {
        return TableData.hasRowHeader(this.dataFrame)
    }

    /**
     * Checks if the table has a column header.
     * @returns `true` if the table has a row header, `false` otherwise
     */
    hasColumnHeader(): boolean {
        return TableData.hasColumnHeader(this.dataFrame)
    }

    /**
     * Checks if the table has a footer header.
     * @returns `true` if the table has a row header, `false` otherwise
     */
    hasFooter(): boolean {
        return TableData.hasFooter(this.dataFrame)
    }

    /**
     * Gets the style for the row header.
     * @returns A Result containing the row header style if found, or an error message
     */
    rowHeaderStyle(): Result<Styling<RowHeaderStyle>, string> {
        if (!TableData.hasRowHeader(this.dataFrame)) {
            return failureResult("(StyledTable::rowHeaderStyle) The table data does not have a row header")
        }
        return this
            .columnTagsFor<RowHeaderStyle>(0, TableStyleType.ROW_HEADER)
            .map(tag => tag.value as Styling<RowHeaderStyle>)
    }

    /**
     * Gets the style for the column header.
     * @returns A Result containing the column header style if found, or an error message
     */
    columnHeaderStyle(): Result<Styling<ColumnHeaderStyle>, string> {
        if (!TableData.hasColumnHeader(this.dataFrame)) {
            return failureResult("(StyledTable::columnHeaderStyle) The table data does not have a column header")
        }
        return this
            .rowTagsFor<ColumnHeaderStyle>(0, TableStyleType.COLUMN_HEADER)
            .map(tag => tag.value as Styling<ColumnHeaderStyle>)
    }

    /**
     * Gets the style for the footer.
     * @returns A Result containing the footer style if found, or an error message
     */
    footerStyle(): Result<Styling<FooterStyle>, string> {
        if (!TableData.hasFooter(this.dataFrame)) {
            return failureResult("(StyledTable::footerStyle) The table data does not have a footer")
        }
        return this
            .rowTagsFor<FooterStyle>(this.dataFrame.rowCount() - 1, TableStyleType.FOOTER)
            .map(tag => tag.value as Styling<FooterStyle>)
    }

    /**
     * Gets the style for a specific row.
     * @param rowIndex The index of the row
     * @returns A Result containing the row style if found, or an error message
     */
    rowStyleFor(rowIndex: number): Result<Styling<RowStyle>, string> {
        return this
            .rowTagsFor<RowStyle>(rowIndex, TableStyleType.ROW)
            .map(tag => tag.value as Styling<RowStyle>)
    }

    /**
     * Gets the style for a specific column.
     * @param columnIndex The index of the column
     * @returns A Result containing the column style if found, or an error message
     */
    columnStyleFor(columnIndex: number): Result<Styling<ColumnStyle>, string> {
        return this
            .columnTagsFor<ColumnStyle>(columnIndex, TableStyleType.COLUMN)
            .map(tag => tag.value as Styling<ColumnStyle>)
    }

    /**
     * Gets the style for a specific cell.
     * @param rowIndex The row index of the cell
     * @param columnIndex The column index of the cell
     * @returns A Result containing the cell style if found, or an error message
     */
    cellStyleFor(rowIndex: number, columnIndex: number): Result<Styling<CellStyle>, string> {
        // find all the tags and type them to column-header tags
        const tags = this.dataFrame
            .cellTagsFor(rowIndex, columnIndex)
            .filter(tag => tag.matchesId(TableStyleType.CELL, CellCoordinate.of(rowIndex, columnIndex)))
            .map(tag => tag as Tag<Styling<CellStyle>, CellCoordinate>)

        if (tags.length === 0) {
            return failureResult(`(StyledTable::cellStyleFor) No matching cell-style tags found for table; row_index: ${rowIndex}; column_index: ${columnIndex}`)
        }
        // when there are more than one tag representing the column-header, the sort based on the priority and
        // take the first one
        if (tags.length > 1) {
            tags.sort((tagA, tagB) => tagB.value.priority - tagA.value.priority)
        }
        return successResult(tags[0].value as Styling<CellStyle>)
    }

    /**
     * Unlike the methods that retrieve the particular styles, say for a cell, a column header,
     * and so forth, this method returns a {@link CellStyle} calculated from all the styles
     * that apply to the specified cell by using the style properties with the highest priority.
     * <p>
     * Retrieves the styles to be applied to a specific data cell in the table. This method
     * accounts for column headers, row headers, and footers. For example, regardless of whether the
     * table has a column header, a row index of 0 refers to the first row of data. And
     * regardless of whether the table has a row header, a column index of 0 refers to the
     * first column of data.
     *
     * @param rowIndex - The index of the row in the table data for which styles are required.
     * Must be within the valid row index range.
     * @param columnIndex - The index of the column in the table data for which styles are required.
     * Must be within the valid column index range.
     * @return A result object containing the cell style if the indices are valid, or an error
     * message if they are not.
     */
    stylesForDataCoordinates(rowIndex: number, columnIndex: number): Result<CellStyle, string> {
        if (
            rowIndex < 0 || rowIndex >= TableData.dataRowCount(this.dataFrame) ||
            columnIndex < 0 || columnIndex >= TableData.dataColumnCount(this.dataFrame)
        ) {
            return failureResult(
                `(StyledTable::dataCellStyles) Invalid row and/or column index for data; row_index${rowIndex}` +
                `; column_index: ${columnIndex}` +
                `; valid_row_index: [0, ${TableData.dataRowCount(this.dataFrame)})` +
                `; valid_column_index: [0, ${TableData.dataColumnCount(this.dataFrame)})` +
                `; has_column_header: ${TableData.hasColumnHeader(this.dataFrame)}` +
                `; has_row_header: ${TableData.hasRowHeader(this.dataFrame)}` +
                `; has_footer: ${TableData.hasFooter(this.dataFrame)}`
            )
        }

        const columnHeaderOffset: number = TableData.hasColumnHeader(this.dataFrame) ? 1 : 0
        const rowHeaderOffset: number = TableData.hasRowHeader(this.dataFrame) ? 1 : 0
        return this.stylesForTableCoordinates(rowIndex + columnHeaderOffset, columnIndex + rowHeaderOffset)
    }

    /**
     * Unlike the methods that retrieve the particular styles, say for a cell, a column header,
     * and so forth, this method returns a {@link CellStyle} calculated from all the styles
     * that apply to the specified cell by using the style properties with the highest priority.
     * <p>
     * Calculates the style for the cell based on the styles applied to the table and their
     * relative priority. The row and column indexes refer to the entire table and do not account
     * for column headers, row headers, or footers.
     * @param rowIndex The index of the row in the entire table. For example, if the table has column
     * headers, then a rowIndex of 0 would be that column header.
     * @param columnIndex The index of the column in the entire table. For example, if the table has
     * row headers, then a column index of 0 would be the row header
     * @return A {@link Result} holding the {@link CellStyle}; or a failure {@link Result} if the
     * row or column indexes are out of range.
     * @see stylesForDataCoordinates
     */
    stylesForTableCoordinates(rowIndex: number, columnIndex: number): Result<CellStyle, string> {
        if (rowIndex < 0 || rowIndex >= this.dataFrame.rowCount() || columnIndex < 0 || columnIndex >= this.dataFrame.columnCount()) {
            return failureResult(
                `(StyledTable::stylesFor) Invalid row and/or column index` +
                `; row_index: ${rowIndex}` +
                `; column_index: ${columnIndex}` +
                `; valid_row_index: [0, ${this.dataFrame.rowCount()})` +
                `; valid_column_index: [0, ${this.dataFrame.columnCount()})`
            )
        }

        //
        // determine what styles may be available
        const availableStyling: Array<Stylings> = []
        if (rowIndex === 0) {
            this.columnHeaderStyle().onSuccess(styling => availableStyling.push(styling))
        }
        if (columnIndex === 0) {
            this.rowHeaderStyle().onSuccess(styling => availableStyling.push(styling))
        }
        if (rowIndex === this.dataFrame.rowCount() - 1) {
            this.footerStyle().onSuccess(styling => availableStyling.push(styling))
        }
        this.rowStyleFor(rowIndex).onSuccess(styling => availableStyling.push(styling))
        this.columnStyleFor(columnIndex).onSuccess(styling => availableStyling.push(styling))

        // the cell style is handled differently when it doesn't exist because we need a default set of
        // values for the cell style in case not all properties are found in the available styles
        this.cellStyleFor(rowIndex, columnIndex)
            .onSuccess(styling => availableStyling.push(styling))
            .onFailure(() => availableStyling.push({style: defaultCellStyle, priority: -1}))

        //
        // calculate the style for the cell based on the priorities and available styles
        const cellStyle = availableStyling
            .sort((stylingA: Stylings, stylingB: Stylings) => stylingA.priority - stylingB.priority)
            .reduce((style: CellStyle, curr: Stylings) => ({
                font:
                    (curr.style.hasOwnProperty('font') ?
                            // @ts-ignore
                            {...style.font, ...curr.style.font} as TableFont : (
                                style.hasOwnProperty('font') ? {...style.font} : defaultTableFont)
                    ),
                alignText:
                    (curr.style.hasOwnProperty('alignText') ?
                            // @ts-ignore
                            curr.style.alignText as TextAlignment : (
                                style.hasOwnProperty('alignText') ? style.alignText : defaultColumnStyle.alignText)
                    ),
                verticalAlignText:
                    (curr.style.hasOwnProperty('verticalAlignText') ?
                            // @ts-ignore
                            curr.style.verticalAlignText as VerticalTextAlignment : (
                                style.hasOwnProperty('verticalAlignText') ? style.verticalAlignText : defaultColumnStyle.verticalAlignText
                            )
                    ),
                background:
                    (curr.style.hasOwnProperty('background') ?
                            // @ts-ignore
                            {...style.background, ...curr.style.background} as Background : (
                                style.hasOwnProperty('background') ? style.background : defaultTableBackground)
                    ),
                dimension:
                    (curr.style.hasOwnProperty('dimension') ?
                            // @ts-ignore
                            {...style.dimension, ...curr.style.dimension} as Dimension : (
                                style.hasOwnProperty('dimension') ? {...style.dimension} : defaultDimension)
                    ),
                padding:
                    (curr.style.hasOwnProperty('padding') ?
                            // @ts-ignore
                            {...style.padding, ...curr.style.padding} as Padding : (
                                style.hasOwnProperty('padding') ? {...style.padding} : defaultTablePadding)
                    ),
                border:
                    (curr.style.hasOwnProperty('border') ?
                            // @ts-ignore
                            {...style.border, ...curr.style.border} as Border : (
                                style.hasOwnProperty('border') ? {...style.border} : defaultBorder)
                    ),
            }), defaultCellStyle)

        return successResult(cellStyle)
    }
}

/**
 * Builder class for creating styled tables.
 * Provides methods to configure various styling aspects of a table.
 */
export class TableStyler<V> {
    private readonly dataFrame: DataFrame<V>
    private readonly font: TableFont = defaultTableFont
    private readonly border: Border = defaultBorder
    private readonly background: Background = defaultTableBackground
    private readonly dimension: Pick<Dimension, "width" | "height"> = {width: NaN, height: NaN}
    private readonly padding: Padding = defaultTablePadding
    private readonly margin: Margin = defaultTableMargin
    private readonly errors: Array<string> = []

    /**
     * Private constructor to enforce factory method usage.
     * @param dataFrame_ The data frame containing the table data
     * @param font_ The font settings for the table
     * @param border_ The border settings for the table
     * @param background_ The background settings for the table
     * @param dimension_ The dimension settings for the table
     * @param padding_ The padding settings for the table
     * @param margin_ The margin settings for the table
     * @param errors_ Array to collect error messages during styling operations
     */
    private constructor(
        dataFrame_: DataFrame<V>,
        font_: TableFont = defaultTableFont,
        border_: Border = defaultBorder,
        background_: Background = defaultTableBackground,
        dimension_: Pick<Dimension, "width" | "height"> = {width: NaN, height: NaN},
        padding_: Padding = defaultTablePadding,
        margin_: Margin = defaultTableMargin,
        errors_: Array<string> = []
    ) {
        this.dataFrame = dataFrame_
        this.font = font_
        this.border = border_
        this.background = background_
        this.dimension = dimension_
        this.padding = padding_
        this.margin = margin_
        this.errors = errors_
    }

    /**
     * Creates a TableStyler from a TableData object.
     * @param tableData The TableData object to style
     * @returns A new TableStyler instance
     */
    static fromTableData<V>(tableData: TableData<V>): TableStyler<V> {
        return new TableStyler<V>(tableData.unwrapDataFrame())
    }

    /**
     * Creates a TableStyler from a DataFrame object.
     * @param dataFrame The DataFrame object to style
     * @returns A new TableStyler instance
     */
    static fromDataFrame<V>(dataFrame: DataFrame<V>): TableStyler<V> {
        return new TableStyler<V>(dataFrame.copy())
    }

    /**
     * Creates a copy of this TableStyler instance.
     * @returns A new TableStyler instance with the same properties
     */
    copy(): TableStyler<V> {
        return new TableStyler<V>(
            this.dataFrame,
            this.font,
            this.border,
            this.background,
            this.dimension,
            this.padding,
            this.margin,
            this.errors
        )
    }

    /**
     * Creates a new TableStyler with updated properties.
     * @param properties Partial properties to update
     * @returns A new TableStyler instance with updated properties
     */
    update(properties: Partial<TableStylerProps<V>>): TableStyler<V> {
        const {
            dataFrame = this.dataFrame,
            font = this.font,
            border = this.border,
            background = this.background,
            dimension = this.dimension,
            padding = this.padding,
            margin = this.margin,
        } = properties
        return new TableStyler<V>(
            dataFrame,
            font,
            border,
            background,
            dimension,
            padding,
            margin,
            this.errors
        )
    }

    /**
     * Applies the specified font settings for the table and returns a new {@link TableStyler}
     * instance with the updated font configuration.
     *
     * @param font - The font configuration to be applied. This object can include partial
     * properties of the TableFont.
     * @return A new {@link TableStyler} instance with the updated font settings.
     */
    withTableFont(font: Partial<TableFont>): TableStyler<V> {
        return this.update({font: {...defaultTableFont, ...font}})
    }

    /**
     * Sets the background for the table.
     * @param background The background settings to apply
     * @returns A new TableStyler instance with the updated background
     */
    withTableBackground(background: Partial<Background>): TableStyler<V> {
        return this.update({background: {...this.background, ...background}})
    }

    /**
     * Sets the border for the table.
     * @param border The border settings to apply
     * @returns A new TableStyler instance with the updated border
     */
    withBorder(border: Partial<Border>): TableStyler<V> {
        return this.update({border: {...this.border, ...border}})
    }

    /**
     * Sets the dimensions for the table.
     * @param width The width of the table
     * @param height The height of the table
     * @returns A new TableStyler instance with the updated dimensions
     */
    withDimensions(width: number, height: number): TableStyler<V> {
        return this.update({dimension: {width, height}})
    }

    /**
     * Sets the padding for the table.
     * @param padding The padding settings to apply
     * @returns A new TableStyler instance with the updated padding
     */
    withPadding(padding: Partial<Padding>): TableStyler<V> {
        return this.update({padding: {...this.padding, ...padding}})
    }

    /**
     * Sets the margin for the table.
     * @param margin The margin settings to apply
     * @returns A new TableStyler instance with the updated margin
     */
    withMargin(margin: Partial<Margin>): TableStyler<V> {
        return this.update({margin: {...this.margin, ...margin}})
    }

    /**
     * Tags a row with a style.
     * @param rowIndex The index of the row to tag
     * @param tagStyleType The type of style to apply
     * @param style The style value to apply
     * @returns A Result containing a new TableStyler with the tagged row, or an error message
     * @private
     */
    private tagRow<S extends TagValue>(rowIndex: number, tagStyleType: TableStyleType, style: S): Result<TableStyler<V>, string> {
        return this.dataFrame.tagRow<S>(rowIndex, tagStyleType, style)
            // when successfully tagged, make an updated copy of this builder with the new data-frame
            .map(df => this.update({dataFrame: df}))
            // when failed to tag, add to the errors
            .onFailure(error => this.errors.push(error))
    }

    /**
     * Tags a column with a style.
     * @param columnIndex The index of the column to tag
     * @param tagStyleType The type of style to apply
     * @param style The style value to apply
     * @returns A Result containing a new TableStyler with the tagged column, or an error message
     * @private
     */
    private tagColumn<S extends TagValue>(columnIndex: number, tagStyleType: TableStyleType, style: S): Result<TableStyler<V>, string> {
        return this.dataFrame.tagColumn<S>(columnIndex, tagStyleType, style)
            // when successfully tagged, make an updated copy of this builder with the new data-frame
            .map(df => this.update({dataFrame: df}))
            // when failed to tag, add to the errors
            .onFailure(error => this.errors.push(error))
    }

    /**
     * Sets the style for the column header row.
     * @param columnHeaderStyle The style to apply to the column header. Style properties that are not specified
     * will be set to their default values.
     * @param [priority=Infinity] The priority of this style (higher values take precedence)
     * @returns A new TableStyler instance with the column header style applied
     */
    withColumnHeaderStyle(
        columnHeaderStyle: Partial<ColumnHeaderStyle> = defaultColumnHeaderStyle,
        priority: number = Infinity
    ): TableStyler<V> {
        if (!TableData.hasColumnHeader(this.dataFrame)) {
            this.errors.push("The column header style can only be supplied when the table data has a column header")
            return this
        }
        // tag the row as a column header style, and if it fails, then return this (unmodified) builder
        return this
            .tagRow<Styling<ColumnHeaderStyle>>(
                0,
                TableStyleType.COLUMN_HEADER,
                stylingFor(columnHeaderStyle, defaultColumnHeaderStyle, priority)
            )
            .getOrElse(this)
    }

    /**
     * Sets the style for the row header column.
     * @param rowHeaderStyle The style to apply to the row header. Style properties that are not specified
     * will be set to their default values.
     * @param priority The priority of this style (higher values take precedence)
     * @returns A new TableStyler instance with the row header style applied
     */
    withRowHeaderStyle(rowHeaderStyle: Partial<RowHeaderStyle>, priority: number = Infinity): TableStyler<V> {
        if (!TableData.hasRowHeader(this.dataFrame)) {
            this.errors.push("The row header style can only be supplied when the table data has row headers")
            return this
        }
        // tag the column with the row header style, and if it fails, then return this (unmodified) builder
        return this
            .tagColumn<Styling<RowHeaderStyle>>(0, TableStyleType.ROW_HEADER, stylingFor(rowHeaderStyle, defaultRowHeaderStyle, priority))
            .getOrElse(this)
    }

    /**
     * Sets the style for the footer row.
     * @param footerStyle The style to apply to the footer. Style properties that are not specified
     * will be set to their default values.
     * @param priority The priority of this style (higher values take precedence)
     * @returns A new TableStyler instance with the footer style applied
     */
    withFooterStyle(footerStyle: Partial<FooterStyle>, priority: number = Infinity): TableStyler<V> {
        if (!TableData.hasFooter(this.dataFrame)) {
            this.errors.push("The footer style can only be supplied when the table data has a footer")
            return this
        }
        // tag the row the footer style, and if it fails, then return this (unmodified) builder
        const footerIndex = TableData.tableRowCount(this.dataFrame) - 1
        return this
            .tagRow<Styling<FooterStyle>>(footerIndex, TableStyleType.FOOTER, stylingFor(footerStyle, defaultFooterStyle, priority))
            .getOrElse(this)
    }

    /**
     * Sets the style for a specific row.
     * @param rowIndex The index of the row to style
     * @param rowStyle The style to apply to the row. Style properties that are not specified
     * will be set to their default values.
     * @param priority The priority of this style (higher values take precedence)
     * @returns A new TableStyler instance with the row style applied
     */
    withRowStyle(rowIndex: number, rowStyle: Partial<RowStyle>, priority: number = 0): TableStyler<V> {
        if (rowIndex < 0 || rowIndex >= TableData.tableRowCount(this.dataFrame)) {
            this.errors.push(
                `The row index, when setting a row-style, must be between 0 and ${TableData.tableRowCount(this.dataFrame) - 1}`
            )
            return this
        }
        // tag the row with a style, and if it fails, then return this (unmodified) builder
        return this
            .tagRow<Styling<RowStyle>>(rowIndex, TableStyleType.ROW, stylingFor(rowStyle, defaultRowStyle, priority))
            .getOrElse(this)
    }

    /**
     * Applies specific styles to rows in a table based on the provided row indexes.
     *
     * @param rowIndexes - An array of row indexes to which the styles will be applied. If the
     * array is empty, all rows will be styled.
     * @param rowStyle - An object representing the styles to apply to the specified rows.
     * @param [priority=0] - An optional priority value for the styles. Higher priority values
     * override lower ones.
     * @return A new TableStyler instance with the specified row styles applied.
     * @see withRowStyle
     */
    withRowStyles(
        rowIndexes: Array<number>,
        rowStyle: Partial<RowStyle>,
        priority: number = 0
    ): TableStyler<V> {
        const indexes = rowIndexes.length > 0 ?
            rowIndexes :
            new Array(this.dataFrame.rowCount()).fill(0).map((_, i) => i)
        return TableStyler.withRowStyles(this, indexes, rowStyle, priority)
    }

    private static withRowStyles<V>(
        tableStyler: TableStyler<V>,
        rowIndexes: Array<number>,
        rowStyle: Partial<RowStyle>,
        priority: number = 0
    ): TableStyler<V> {
        if (rowIndexes.length > 0) {
            const rowIndex = rowIndexes.shift()
            if (rowIndex != null) {
                const styler = tableStyler.withRowStyle(rowIndex, rowStyle, priority)
                return TableStyler.withRowStyles(styler, rowIndexes, rowStyle, priority)
            }
        }
        return tableStyler
    }

    /**
     * Sets the style for a specific column.
     * @param columnIndex The index of the column to style
     * @param columnStyle The style to apply to the column. Style properties that are not specified
     * will be set to their default values.
     * @param priority The priority of this style (higher values take precedence)
     * @returns A new TableStyler instance with the column style applied
     */
    withColumnStyle(columnIndex: number, columnStyle: Partial<ColumnStyle>, priority: number = 0): TableStyler<V> {
        if (columnIndex < 0 || columnIndex >= TableData.tableColumnCount(this.dataFrame)) {
            this.errors.push(
                `The column index, when setting a column-style, must be between 0 and ${TableData.tableColumnCount(this.dataFrame) - 1}`
            )
            return this
        }
        // tag the row with a style, and if it fails, then return this (unmodified) builder
        return this
            .tagColumn<Styling<ColumnStyle>>(columnIndex, TableStyleType.COLUMN, stylingFor(columnStyle, defaultColumnStyle, priority))
            .getOrElse(this)
    }

    /**
     * Applies specified styles to the columns of a table.
     *
     * @param columnIndexes - Array of column indexes to which the style should be applied. If the array
     * is empty, styles will be applied to all columns.
     * @param columnStyle - Partial column style configuration object defining the styles to be applied.
     * @param [priority=0] - Optional priority value to determine the precedence of this style over others.
     * @return Returns an instance of TableStyler with the updated column styles applied.
     * @see withColumnStyle
     */
    withColumnStyles(
        columnIndexes: Array<number>,
        columnStyle: Partial<ColumnStyle>,
        priority: number = 0
    ): TableStyler<V> {
        const indexes = columnIndexes.length > 0 ?
            columnIndexes :
            new Array(this.dataFrame.columnCount()).fill(0).map((_, i) => i)
        return TableStyler.withColumnStyles(this, indexes, columnStyle, priority)
    }

    private static withColumnStyles<V>(
        tableStyler: TableStyler<V>,
        columnIndexes: Array<number>,
        columnStyle: Partial<ColumnStyle>,
        priority: number = 0
    ): TableStyler<V> {
        if (columnIndexes.length > 0) {
            const columnIndex = columnIndexes.shift()
            if (columnIndex != null) {
                const styler = tableStyler.withColumnStyle(columnIndex, columnStyle, priority)
                return TableStyler.withColumnStyles(styler, columnIndexes, columnStyle, priority)
            }
        }
        return tableStyler
    }

    /**
     * Sets the style for a specific cell.
     * @param rowIndex The row index of the cell to style
     * @param columnIndex The column index of the cell to style
     * @param cellStyle The style to apply to the cell. Style properties that are not specified
     * will be set to their default values.
     * @param priority The priority of this style (higher values take precedence)
     * @returns A new TableStyler instance with the cell style applied
     */
    withCellStyle(rowIndex: number, columnIndex: number, cellStyle: Partial<CellStyle>, priority: number = 0): TableStyler<V> {
        if (rowIndex < 0 || rowIndex >= TableData.tableRowCount(this.dataFrame) ||
            columnIndex < 0 || columnIndex >= TableData.tableColumnCount(this.dataFrame)) {
            this.errors.push(
                `The (row, column) indices, when setting a cell-style, must be in ` +
                `([0, ${TableData.tableRowCount(this.dataFrame)}), [0, ${TableData.tableColumnCount(this.dataFrame)}))`
            )
            return this
        }
        // tag the cell with the cell-style
        return this.dataFrame
            .tagCell<Styling<CellStyle>>(rowIndex, columnIndex, TableStyleType.CELL, stylingFor(cellStyle, defaultCellStyle, priority))
            // when successfully tagged, make an updated copy of this builder with the new data-frame
            .map(df => this.update({dataFrame: df}))
            // when failed to tag, add to the errors
            .onFailure(error => this.errors.push(error))
            // when failed, return this (unmodified) builder
            .getOrElse(this)
    }

    /**
     * Sets the style for a specific cell based on a predicate.
     * @param predicate A function that accepts the value, row-index, and column-index of the cell, and
     * returns `true` if the cell should be styled, or `false` otherwise.
     * @param cellStyle The style to apply to the cell if the predicate is `true`.
     * @param priority The style's priority. Higher priority values override lower ones.
     * @returns A new TableStyler instance with the cell style applied.
     * @see withCellStyle
     * @see withCellStyles
     */
    withCellStyleWhen(
        predicate: (value: V, rowIndex: number, columnIndex: number) => boolean,
        cellStyle: Partial<CellStyle>,
        priority: number = 0
    ): TableStyler<V> {
        return this.dataFrame
            .tagCellWhen(predicate, TableStyleType.CELL, stylingFor(cellStyle, defaultCellStyle, priority))
            // when successfully tagged, make an updated copy of this builder with the new data-frame
            .map(df => this.update({dataFrame: df}))
            // when failed to tag, add to the errors
            .onFailure(error => this.errors.push(error))
            // when failed, return this (unmodified) builder
            .getOrElse(this)
    }

    /**
     * Finalizes the styling process and creates a StyledTable instance.
     * @returns A StyledTable instance with all the applied styles
     */
    styleTable(): StyledTable<V> {
        return new StyledTable(
            this.dataFrame,

            this.font,

            this.border,
            this.background,

            this.dimension,
            this.padding,
            this.margin,
        )
    }
}
