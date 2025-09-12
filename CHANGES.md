# change log

## version 0.1.2

Performance optimizations: no longer add elements to the DOM that aren't needed. Specifically, when there is no background, the `rect` SVG element is not added. And when there is no border the `line` SVG elements are not added.

## version 0.1.1

Fixed bug where the offset for the row was determined by whether there was a row-header, rather than whether there was a column-header. And the offset for the column was determined by the whether there was a column-header, rather than whether there was a row-header.

## version 0.1.0

The initial release.
