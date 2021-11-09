import { terser } from "rollup-plugin-terser";

export default [
    {
        input: "src/vue.esm-browser.js",
        output: [
            {
                plugins: [terser()],
                file: "dist/vue-esm-browser.min.js",
            },
            {
                plugins: [terser()],
                file: "examples/esm/vue-esm-browser.min.js",
            },
        ],
    },
    {
        input: "src/vue-browser-sfc.js",
        output: [
            {
                file: "dist/vue-browser-sfc.js",
                format: "iife",
                name: "VueBrowserSfc",
            },
            {
                file: "examples/script/vue-browser-sfc.js",
                format: "iife",
                name: "VueBrowserSfc",
            },
            {
                file: "examples/esm/vue-browser-sfc.js",
                format: "iife",
                name: "VueBrowserSfc",
            },
            {
                plugins: [terser()],
                file: "dist/vue-browser-sfc.min.js",
                format: "iife",
                name: "VueBrowserSfc",
            },
        ],
    },
];
