// import {TableData} from "./tableData";
// import {render, screen} from "@testing-library/react";
// import {select} from "d3";
// import {useRef} from 'react'
// import {describe, expect, test} from "vitest";
// import {DataFrame} from "data-frame-ts";
// import {textWidthFor, textWidthOf} from "./tableUtils.ts";
//
//
// // function Test(props: {callback: (container: RefObject<SVGSVGElement>) => void}): JSX.Element {
// function Test(): JSX.Element {
//     const containerRef = useRef<SVGSVGElement>(null);
//
//     // useEffect(() => {
//     //     props.callback(containerRef)
//     //     // const test = select(containerRef.current).select<SVGTextElement>("#my-text")
//     //     // const width = textWidthOf(test.selectChild())
//     // }, [containerRef, props]);
//
//     return (<svg ref={containerRef} data-testid="my-root-svg" width={300} height={300}/>)
// }
//
// describe('when creating svg-tables', () => {
//
//     describe('when creating table data without headers of footers', () => {
//
//         // const tableData = DataFrame.from([[11, 12, 13], [21, 22, 23]])
//         //     .map(df => TableData.fromDataFrame(df))
//         //     .getOrThrow()
//
//         test('test', () => {
//             // let containerRef: RefObject<HTMLDivElement>;
//             // const root = render(<Test/>)
//             const root = render(<div data-testid="my-test-div"/>)
//             const svg = select<HTMLElement | null, any>(root.container)
//                 .append('svg')
//                 .attr('data-testid', 'my-root-svg')
//                 .attr('width', 500)
//                 .attr('height', 500)
//             const text = svg
//                 .append<SVGTextElement>("text")
//                 .attr("id", "my-text-elem")
//                 .attr("data-testid", "my-text")
//                 .text(() => "this is a test")
//             // expect(root.getByTestId('my-root-svg')).toBeDefined()
//             // const text = svg.select("text").text()
//             screen.debug()
//             const p = screen.getByTestId('my-text')
//             expect(text.node()).not.toBeNull()
//             // expect(textWidthFor(text)).toBe(20)
//             expect(textWidthOf(text)).toBe(20)
//             // expect(textWidthOf(svg.select<SVGTextElement>("text"))).toBe(20)
//         })
//
//         // test('table info data with different numbers of columns should not be valid', () => {
//         //     const svgRoot = render(
//         //         <svg data-testid="my-root-svg">
//         //             <g>
//         //                 <text>This is a test</text>
//         //             </g>
//         //         </svg>
//         //     )
//         //     expect(svgRoot.getByTestId('my-root-svg')).toBeDefined()
//         //     let svg = select(svgRoot.container)//.select('#i:my-root-svg')
//         //     // expect(textWidthOf(svg)).toEqual(20)
//         // })
//     })
//
// })
