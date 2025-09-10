# SVG Table

A tiny TypeScript library to turn tabular data into a styled SVG table. It separates three concerns:
- Data: describe your table structure (data, headers, footer) with TableData.
- Formatting: convert raw values into display strings with TableFormatter.
- Styling + Rendering: define look-and-feel with TableStyler and render into an SVG via createTable.

SVG Table is framework-agnostic and works with any environment where you can access an <svg> element (vanilla JS/TS, React, Svelte, etc.).

## Table of Contents
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Core Concepts](#core-concepts)
  - [TableData](#tabledata)
  - [TableFormatter](#tableformatter)
  - [TableStyler](#tablestyler)
  - [Rendering to SVG](#rendering-to-svg)
- [Examples](#examples)
  - [1) Data with a column header](#1-data-with-a-column-header)
  - [2) Column + row headers, custom formatters](#2-column--row-headers-custom-formatters)
  - [3) Overriding specific cells](#3-overriding-specific-cells)
  - [4) Styling the table](#4-styling-the-table)
- [API Surface (high level)](#api-surface-high-level)
- [FAQ](#faq)
- [License](#license)


## Installation

[(toc)](#table-of-contents)

Install from npm. TypeScript types are included.

- npm: npm install svg-table d3 data-frame-ts
- pnpm: pnpm add svg-table d3 data-frame-ts
- yarn: yarn add svg-table d3 data-frame-ts

Peer libraries used in examples:
- data-frame-ts: Simple immutable 2D data container with tagging.
- d3: Only the selection utilities are used when you need them; the renderer accepts a native SVG element.

## Quick Start

[(toc)](#table-of-contents)

This example builds a small table, formats numbers and dates, styles it, and renders into an existing <svg id="app"> element.

```ts
// 1) Raw data (mixed types)
const data = DataFrame.from<(string | number | Date)>([
  [new Date(2021, 1, 1, 1), 12345, 'gnm-f234', 123.45, 4],
  [new Date(2021, 1, 2, 2), 23456, 'gnm-g234', 23.45, 5],
]).getOrThrow()

const columnHeader = ['Date-Time', 'Customer ID', 'Product ID', 'Purchase Price', 'Amount']

// 2) Describe the table structure
const withHeader = TableData.fromDataFrame(data)
  .withColumnHeader(columnHeader)
  .getOrThrow()

// 3) Format values for display
const formatted = TableFormatter.fromTableData(withHeader)
  // ensure the header row uses the default formatter (highest priority)
  .addRowFormatter(0, defaultFormatter, Infinity)
  // column-wise formatters (note column indexes refer to the table, not just data)
  .flatMap(tf => tf.addColumnFormatter(0, v => (v as Date).toLocaleDateString()))
  .flatMap(tf => tf.addColumnFormatter(1, v => defaultFormatter(v)))
  .flatMap(tf => tf.addColumnFormatter(3, v => `$ ${(v as number).toFixed(2)}`))
  .flatMap(tf => tf.addColumnFormatter(4, v => `${(v as number).toFixed(0)}`))
  .flatMap(tf => tf.formatTable())
  .getOrThrow()

// 4) Style the table (use defaults or customize)
const styled = TableStyler.fromTableData(formatted)
  .withDimensions(600, 200)
  .styleTable()
  .getOrThrow()

// 5) Render to SVG at position (x=20, y=20)
const svg = document.getElementById('app') as unknown as SVGSVGElement
createTable(styled, svg, 'example-1', (w, h) => [20, 20])
  .getOrThrow()
```


## Core Concepts

[(toc)](#table-of-contents)

### TableData

[(toc)](#table-of-contents)

Represents your table’s structure over a DataFrame:
- Add column and row headers, and footers
- Ask for counts and sections of the table (data, headers, footer)

Key methods (return a Result so you can chain with .flatMap and finish with .getOrThrow()):
- TableData.fromDataFrame(df)
- withColumnHeader(header: string[], formatting = defaultFormatting)
- withRowHeader(header: (string|number)[], formatting = defaultFormatting, columnHeaderProvider?, footerProvider?)
- withFooter(footer: (string|number)[], formatting = defaultFormatting, rowHeaderProvider?)
- hasColumnHeader(), hasRowHeader(), hasFooter()
- tableRowCount(), tableColumnCount()
- data(), columnHeader(), rowHeader(), footer()

### TableFormatter

[(toc)](#table-of-contents)

Transforms raw cell values into display strings. You assign formatters at different scopes with optional priorities. Higher priority wins for a given cell.

Scopes:
- Row-level: addRowFormatter(rowIndex, formatter, priority?)
- Column-level: addColumnFormatter(columnIndex, formatter, priority?)
- Cell-level: addCellFormatter(rowIndex, columnIndex, formatter, priority?)

Utilities:
- defaultFormatter: converts anything to string sensibly
- formatTable(): Result<TableData<string>, string>

Tip: When both row and column headers exist, remember that indexes are for the full table including headers.

### TableStyler

[(toc)](#table-of-contents)

Assigns visual styles (font, padding, margins, borders, per-row/per-column/per-cell styles). Styling is also priority-based internally so the most specific style wins.

Useful entry points:
- TableStyler.fromTableData(tableData)
- withTableFont(font), withTableBackground(bg), withBorder(border)
- withDimensions(width, height), withPadding({top,left,bottom,right}), withMargin(...)
- withRowStyle(i, style, priority?), withColumnStyle(j, style, priority?), withCellStyle(i, j, style, priority?)
- withCellStyleWhen(predicate, style, priority?)
- withColumnHeaderStyle(style, priority?), withRowHeaderStyle(style, priority?), withFooterStyle(style, priority?)
- styleTable(): Result<StyledTable, string>

### Rendering to SVG

[(toc)](#table-of-contents)

Use createTable(styledTable, svgElement, uniqueTableId, coordinates)

- styledTable: result of TableStyler.styleTable().getOrThrow()
- svgElement: an existing SVGSVGElement
- uniqueTableId: used to generate element ids
- coordinates: either a fixed [x, y] or a function (width, height) => [x, y]

Helper:
- tableId(uniqueTableId) -> the id of the root <g> group added to your svg


## Examples

[(toc)](#table-of-contents)

### 1) Data with a column header

[(toc)](#table-of-contents)

```ts
const data = DataFrame.from<number | string>([
  ['Widget A', 12.34],
  ['Widget B', 56.7],
]).getOrThrow()

const td = TableData.fromDataFrame(data)
  .withColumnHeader(['Product', 'Price'])
  .getOrThrow()
```

### 2) Column + row headers, custom formatters

[(toc)](#table-of-contents)

```ts
const df = DataFrame.from<(string | number | Date)>([
  [new Date(2021, 1, 1), 12345, 123.45],
  [new Date(2021, 1, 2), 23456, 23.45],
]).getOrThrow()

const tableData = TableData.fromDataFrame(df)
  .withColumnHeader(['Date', 'Customer', 'Price'])
  .flatMap(td => td.withRowHeader([1, 2]))
  .getOrThrow()

const formatted = TableFormatter.fromTableData(tableData)
  .addRowFormatters([0], defaultFormatter, Infinity)
  .flatMap(tf => tf.addColumnFormatter(1, v => v.toString()))
  .flatMap(tf => tf.addColumnFormatter(2, v => `$ ${(v as number).toFixed(2)}`))
  .flatMap(tf => tf.formatTable())
  .getOrThrow()
```

### 3) Overriding specific cells

[(toc)](#table-of-contents)

```ts
const overridden = TableFormatter.fromTableData(formatted)
  .addCellFormatter(1, 2, v => `${(v as number).toFixed(2)}`, 1000) // strong override
  .flatMap(tf => tf.formatTable())
  .getOrThrow()
```

### 4) Styling the table

[(toc)](#table-of-contents)

```ts
const styled = TableStyler.fromTableData(overridden)
  .withTableFont({ ...defaultTableFont(), size: '12px', weight: '600' })
  .withTableBackground({ color: '#fff' })
  .withPadding({ ...defaultTablePadding(), top: 8, left: 8, right: 8, bottom: 8 })
  .withBorder({ ...defaultBorder(), color: '#999', width: 1 })
  .withDimensions(480, 160)
  .withRowStyle(0, { backgroundColor: '#f5f5f5' }) // header row, if present
  .styleTable()
  .getOrThrow()

// Render at (x, y) = (24, 24)
const svg = document.querySelector('svg#app') as unknown as SVGSVGElement
createTable(styled, svg, 'styled-demo', (w, h) => [24, 24])
  .getOrThrow()
```


## API Surface (high level)

[(toc)](#table-of-contents)

This package re-exports the primary types and helpers from index.ts:

- TableData, TableTagType
- TableFormatter, defaultFormatter, isFormattingTag, defaultFormatting, TableFormatterType
- TableStyler, StyledTable
- createTable, elementInfoFrom, tableId
- Styling primitives and defaults: Styling, TableStylerProps, TableFont, Background, Padding, Margin,
  BorderElement, Border, Dimension, ColumnStyle, RowStyle, CellStyle, ColumnHeaderStyle, RowHeaderStyle, FooterStyle,
  TextAlignment, VerticalTextAlignment, Stylings, and their default* functions
- d3 type aliases: GroupSelection, TextSelection, RectSelection, LineSelection, BorderSelection

Use your editor’s type hints for full details, or read the source files:
- TableData.ts
- TableFormatter.ts
- TableStyler.ts
- tableSvg.ts
- stylings.ts


## FAQ

[(toc)](#table-of-contents)

- Why Results? Methods return Result<T, string> so you can safely compose operations (.map/.flatMap) and collect errors instead of throwing immediately. Finish a chain with .getOrThrow() when you want to surface errors.
- Do I need d3 to render? createTable accepts a native SVGSVGElement. d3 is only used internally for convenient selection/manipulation; you don’t have to use d3 elsewhere in your app.
- How are indexes counted when headers exist? Row/column indexes are for the full table including headers. For example, if you add a row header, data columns shift by one in TableFormatter.


## License

MIT License. See LICENSE for details.