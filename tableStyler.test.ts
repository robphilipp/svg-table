import {TableData} from "./TableData";
import {DataFrame} from "data-frame-ts"
import {defaultFormatter, TableFormatter} from "./TableFormatter";
import {
    type Border,
    type CellStyle,
    type ColumnHeaderStyle,
    defaultBorder,
    defaultCellStyle,
    defaultColumnHeaderStyle,
    defaultColumnStyle,
    defaultDimension,
    defaultFooterStyle,
    defaultRowHeaderStyle, defaultRowStyle,
    defaultTableFont,
    defaultTableMargin,
    defaultTablePadding,
    type FooterStyle,
    type RowHeaderStyle,
    type Styling,
} from "./stylings";
import {type StyledTable, TableStyler} from "./TableStyler";


describe('styling data tables', () => {
    function dateTimeFor(day: number, hour: number): Date {
        return new Date(2021, 1, day, hour, 0, 0, 0);
    }

    const data = DataFrame.from<string | number | Date>([
        [dateTimeFor(1, 1), 12345, 'gnm-f234', 123.45, 4],
        [dateTimeFor(2, 2), 23456, 'gnm-g234', 23.45, 5],
        [dateTimeFor(3, 3), 34567, 'gnm-h234', 3.65, 40],
        [dateTimeFor(4, 4), 45678, 'gnm-i234', 314.15, 9],
        [dateTimeFor(5, 5), 56789, 'gnm-j234', 618.3, 10],
    ]).getOrThrow()
    const columnHeader = ['Date-Time', 'Customer ID', 'Product ID', 'Purchase Price', 'Amount']
    const rowHeader = [1, 2, 3, 4, 5]
    const footer = ['A', 'B', 'C', 'D', 'E']

    describe('adding basic table styles', () => {
        const formattedTableData = TableData.fromDataFrame<string | number | Date>(data)
            .withColumnHeader(columnHeader)
            .flatMap(td => td.withRowHeader(rowHeader))
            .flatMap(td => td.withFooter(footer))
            .flatMap(td => TableFormatter.fromTableData(td)
                // add the default formatter for the column header, at the highest priority so that
                // it is the one that applies to the row representing the column header
                .addRowFormatter(0, defaultFormatter, 100)
                // formatter for the footer
                .flatMap(tf => tf.addRowFormatter(5, defaultFormatter, 100))
                .flatMap(tf => tf.addColumnFormatter(0, defaultFormatter, 100))
                // add the column formatters for each column at the default (lowest) priority
                .flatMap(tf => tf.addColumnFormatter(1, value => (value as Date).toLocaleDateString()))
                .flatMap(tf => tf.addColumnFormatter(2, value => defaultFormatter(value)))
                .flatMap(tf => tf.addColumnFormatter(4, value => `$ ${(value as number).toFixed(2)}`))
                .flatMap(tf => tf.addColumnFormatter(5, value => `${(value as number).toFixed(0)}`))
                .flatMap(tf => tf.addCellFormatter(3, 3, value => (value as string).toUpperCase(), 1))
                // format the table into a new TableData object
                .flatMap(tf => tf.formatTable())
            )
            .getOrThrow()

        describe('set and retrieve global table styles', () => {

            const styledTable: StyledTable<string> = TableStyler.fromTableData(formattedTableData)
                .withTableBackground({color: 'grey', opacity: 0.15})
                .withTableFont({color: 'blue', size: 13.5})
                .withBorder({top: {opacity: 0}} as Border)
                .withDimensions(1300, 500)
                .withPadding({top: 10})
                .withMargin({left: 10, right: 10})
                .styleTable()

            test('should be able to retrieve the background', () => {
                expect(styledTable.tableBackground()).toEqual({color: 'grey', opacity: 0.15})
            })

            test('should be able to retrieve the font', () => {
                expect(styledTable.tableFont()).toEqual({...defaultTableFont, color: 'blue', size: 13.5})
            })

            test('should be able to retrieve the border', () => {
                expect(styledTable.tableBorder()).toEqual({...defaultBorder, top: {opacity: 0}})
            })

            test('should be able to retrieve the dimensions', () => {
                expect(styledTable.tableDimensions()).toEqual({width: 1300, height: 500})
            })

            test('should be able to retrieve the padding', () => {
                expect(styledTable.tablePadding()).toEqual({...defaultTablePadding, top: 10})
            })

            test('should be able to retrieve the margin', () => {
                expect(styledTable.tableMargin()).toEqual({...defaultTableMargin, left: 10, right: 10})
            })
        })

        test('should be able to set and retrieve style for the column header', () => {
            const styledTable: StyledTable<string> = TableStyler.fromTableData(formattedTableData)
                .withColumnHeaderStyle({font: {...defaultTableFont, size: 16, weight: 800}})
                .styleTable()

            expect(styledTable.columnHeaderStyle().getOrThrow()).toEqual({
                style: {
                    ...defaultColumnHeaderStyle,
                    font: {...defaultTableFont, size: 16, weight: 800},
                },
                priority: Infinity
            } as Styling<ColumnHeaderStyle>)
        })

        test('should be able to set and retrieve style for the row header', () => {
            const styledTable: StyledTable<string> = TableStyler.fromTableData(formattedTableData)
                .withRowHeaderStyle({font: {...defaultTableFont, size: 16, weight: 800}})
                .styleTable()

            expect(styledTable.rowHeaderStyle().getOrThrow()).toEqual({
                style: {
                    ...defaultRowHeaderStyle,
                    font: {...defaultTableFont, size: 16, weight: 800},
                },
                priority: Infinity
            } as Styling<RowHeaderStyle>)
        })

        test('should be able to set and retrieve style for the footer', () => {
            const styledTable: StyledTable<string> = TableStyler.fromTableData(formattedTableData)
                .withFooterStyle({font: {...defaultTableFont, size: 16, weight: 800}})
                .styleTable()

            expect(styledTable.footerStyle().getOrThrow()).toEqual({
                style: {
                    ...defaultFooterStyle,
                    font: {...defaultTableFont, size: 16, weight: 800},
                },
                priority: Infinity
            } as Styling<FooterStyle>)
        })

        describe('retrieve the cell style with highest priority', () => {
            const styledTable: StyledTable<string> = TableStyler.fromTableData(formattedTableData)
                .withColumnHeaderStyle({font: {...defaultTableFont, size: 16, weight: 800}})
                .withCellStyle(2, 3, {font: {...defaultTableFont, size: 12, weight: 600}}, 100)
                .withRowStyle(2, {font: {...defaultTableFont, size: 14, weight: 700}}, 50)
                .withRowHeaderStyle({font: {...defaultTableFont, size: 15, weight: 650}})
                .withColumnStyle(4, {padding: {left: 1000, right: 1111}}, 75)
                .styleTable()

            function expectDefaultCellStyleFor(row: number, column: number) {
                expect(styledTable.stylesForTableCoordinates(row, column).getOrThrow()).toEqual(defaultCellStyle)
            }

            test('should get the default cell style for cells with no available style', () => {
                const unstyledRows = [1, 3, 4, 5]   // row 0 is the column header, row 2 has a row-style
                const unstyledColumns = [1, 2, 3, 5] // column 0 is the row header, column 4 has a column-style
                for (const row of unstyledRows) {
                    for (const column of unstyledColumns) {
                        expectDefaultCellStyleFor(row, column)
                    }
                }
            })

            test('should get cell style for (2, 3) is the highest priority', () => {
                expect(styledTable.stylesForTableCoordinates(2, 3).getOrThrow()).toEqual({
                    ...defaultCellStyle,
                    font: {...defaultTableFont, size: 12, weight: 600},
                } as CellStyle)
            })

            test('should get column header style for (0, 3) is the highest priority', () => {
                // column header style for (0, 3) is the highest priority
                expect(styledTable.stylesForTableCoordinates(0, 3).getOrThrow()).toEqual({
                    ...defaultCellStyle,
                    ...defaultColumnStyle,
                    // these come from the default column header style
                    dimension: {...defaultDimension, height: 20, minHeight: 15},
                    // these come from setting the column header style
                    font: {...defaultTableFont, size: 16, weight: 800},
                } as CellStyle)
            })

            test('should return a failure when getting a style for a column index that is too large', () => {
                const result = styledTable.stylesForTableCoordinates(1, 6)
                expect(result.failed).toBeTruthy()
                expect(result.error).toEqual("(StyledTable::stylesFor) Invalid row and/or column index; row_index: 1; column_index: 6; valid_row_index: [0, 7); valid_column_index: [0, 6)")
            })

            test('should return a failure when getting a style for a column index that is less than 0', () => {
                const result = styledTable.stylesForTableCoordinates(3, -1)
                expect(result.failed).toBeTruthy()
                expect(result.error).toEqual("(StyledTable::stylesFor) Invalid row and/or column index; row_index: 3; column_index: -1; valid_row_index: [0, 7); valid_column_index: [0, 6)")

            })

            test('should return a failure when getting a style for a row index that is less than 0', () => {
                const result = styledTable.stylesForTableCoordinates(-1, 3)
                expect(result.failed).toBeTruthy()
                expect(result.error).toEqual("(StyledTable::stylesFor) Invalid row and/or column index; row_index: -1; column_index: 3; valid_row_index: [0, 7); valid_column_index: [0, 6)")
            })

            test('should return a failure when getting a style for a row index that is too large', () => {
                const result = styledTable.stylesForTableCoordinates(7, 3)
                expect(result.failed).toBeTruthy()
                expect(result.error).toEqual("(StyledTable::stylesFor) Invalid row and/or column index; row_index: 7; column_index: 3; valid_row_index: [0, 7); valid_column_index: [0, 6)")
            })

            test('should get the row header style for (1, 0) because table has row header style', () => {
                expect(styledTable.stylesForTableCoordinates(1, 0).getOrThrow()).toEqual({
                    ...defaultCellStyle,
                    ...defaultRowHeaderStyle,
                    font: {...defaultTableFont, size: 15, weight: 650}
                } as CellStyle)
            })

            test('should get column header style for (0, 4) because table has column header style', () => {
                expect(styledTable.stylesForTableCoordinates(0, 4).getOrThrow()).toEqual({
                    ...defaultCellStyle,
                    // these come from the default column header style rather than the column style for
                    // the 4th column because the column header style has a higher priority
                    dimension: {...defaultDimension, height: 20, minHeight: 15},
                    // these come from setting the column header style
                    font: {...defaultTableFont, size: 16, weight: 800}
                } as CellStyle)
            })

            test('should get column style for (1, 4) because table has column style', () => {
                expect(styledTable.stylesForTableCoordinates(1, 4).getOrThrow()).toEqual({
                    ...defaultCellStyle,
                    ...defaultColumnStyle,
                    padding: {...defaultTablePadding, left: 1000, right: 1111}
                } as CellStyle)
            })

            test('should get column style for (2, 4) because table has column style with higher priority than row-style', () => {
                expect(styledTable.stylesForTableCoordinates(2, 4).getOrThrow()).toEqual({
                    // the default cell style is the base style
                    ...defaultCellStyle,
                    // the column style overwrites the row style for this cell
                    ...defaultColumnStyle,
                    // the row style sets the font (column style doesn't) have font, and so the column style
                    // that overrides the row style doesn't change the font
                    font: {...defaultTableFont, size: 14, weight: 700},
                    // and the column style sets the padding
                    padding: {...defaultTablePadding, left: 1000, right: 1111}
                } as CellStyle)
            })

            test('should get column style for (3, 4) because table has column style with higher priority than row-style', () => {
                expect(styledTable.stylesForTableCoordinates(3, 4).getOrThrow()).toEqual({
                    ...defaultCellStyle,
                    ...defaultColumnStyle,
                    padding: {...defaultTablePadding, left: 1000, right: 1111}
                } as CellStyle)
            })

            test('should be able to retrieve cell styles using data row and column indices', () => {
                // cell (2 ,3) in table coordinates translates to cell (1, 2) in data coordinates because
                // the table has a column header and a row header. in this case the data coordinates are
                // (table_row - 1, table_column - 1).
                expect(styledTable.stylesForDataCoordinates(2 - 1, 3 - 1).getOrThrow()).toEqual({
                    ...defaultCellStyle,
                    font: {...defaultTableFont, size: 12, weight: 600},
                } as CellStyle)
            })
        })

        describe('set styles for multiple rows, columns, and cells', () => {

            function expectDefaultCellStyleFor(styledTable: StyledTable<string>, row: number, column: number) {
                expect(styledTable.stylesForTableCoordinates(row, column).getOrThrow()).toEqual(defaultCellStyle)
            }

            test('should be able to set the style for multiple columns at once', () => {
                const styledColumns = [1, 3, 4]
                const styledTable: StyledTable<string> = TableStyler.fromTableData(formattedTableData)
                    .withColumnStyles(styledColumns, {padding: {left: 1000, right: 1111}}, 75)
                    .styleTable()
                const unstyledRows = [1, 3, 4, 5]
                const unstyledColumns = [0, 2, 5]
                for (const row of unstyledRows) {
                    for (const column of unstyledColumns) {
                        expectDefaultCellStyleFor(styledTable, row, column)
                    }
                }

                for (const column of styledColumns) {
                    expect(styledTable.columnStyleFor(column).map(styling => styling.style).getOrThrow())
                        .toEqual({...defaultColumnStyle, padding: {left: 1000, right: 1111}})
                }
            })

            test('should be able to set the style for all columns at once', () => {
                const styledColumns = [0, 1, 2, 3, 4, 5]
                const styledTable: StyledTable<string> = TableStyler.fromTableData(formattedTableData)
                    // an empty array means that all the columns should be styled
                    .withColumnStyles([], {padding: {left: 1000, right: 1111}}, 75)
                    .styleTable()

                for (const column of styledColumns) {
                    expect(styledTable.columnStyleFor(column).map(styling => styling.style).getOrThrow())
                        .toEqual({...defaultColumnStyle, padding: {left: 1000, right: 1111}})
                }
            })

            test('should be able to set the style for multiple rows at once', () => {
                const styledRows = [1, 3, 4]
                const styledTable: StyledTable<string> = TableStyler.fromTableData(formattedTableData)
                    .withRowStyles(styledRows, {padding: {top: 1000, bottom: 1111}}, 75)
                    .styleTable()
                const unstyledRows = [0, 2]
                const unstyledColumns = [0, 1, 2, 3, 4, 5]
                for (const row of unstyledRows) {
                    for (const column of unstyledColumns) {
                        expectDefaultCellStyleFor(styledTable, row, column)
                    }
                }

                for (const row of styledRows) {
                    expect(styledTable.rowStyleFor(row).map(styling => styling.style).getOrThrow())
                        .toEqual({...defaultRowStyle, padding: {top: 1000, bottom: 1111}})
                }
            })

            test('should be able to set the style for all rows at once', () => {
                const styledRows = [0, 1, 2, 3, 4]
                const styledTable: StyledTable<string> = TableStyler.fromTableData(formattedTableData)
                    // an empty array means that all the columns should be styled
                    .withRowStyles([], {padding: {top: 1000, bottom: 1111}}, 75)
                    .styleTable()

                for (const row of styledRows) {
                    expect(styledTable.rowStyleFor(row).map(styling => styling.style).getOrThrow())
                        .toEqual({...defaultRowStyle, padding: {top: 1000, bottom: 1111}})
                }
            })
        })

        describe('conditionally set styles for cells', () => {
            function expectDefaultCellStyleFor(styledTable: StyledTable<string>, row: number, column: number) {
                expect(styledTable.stylesForTableCoordinates(row, column).getOrThrow()).toEqual(defaultCellStyle)
            }

            test('should be able to set the style for multiple columns at once', () => {
                const styledTable: StyledTable<string> = TableStyler.fromTableData(formattedTableData)
                    .withCellStyleWhen(
                        (value, row, column) => parseInt(value) >= 45678 && column === 2,
                        {padding: {...defaultTablePadding, left: 1000, right: 1111}},
                        75
                    )
                    .styleTable()
                const unstyledColumns = [0, 1, 3, 4]
                const unstyledRows = [0, 1, 2, 3, 4, 5]
                for (const row of unstyledRows) {
                    for (const column of unstyledColumns) {
                        expectDefaultCellStyleFor(styledTable, row, column)
                    }
                }
                expectDefaultCellStyleFor(styledTable, 0, 2)
                expectDefaultCellStyleFor(styledTable, 1, 2)
                expectDefaultCellStyleFor(styledTable, 2, 2)
                expectDefaultCellStyleFor(styledTable, 3, 2)

                for (const row of [4, 5]) {
                    expect(styledTable.cellStyleFor(row, 2).map(styling => styling.style).getOrThrow())
                        .toEqual({...defaultCellStyle, padding: {...defaultTablePadding, left: 1000, right: 1111}})
                }
            })

        })
    })
})