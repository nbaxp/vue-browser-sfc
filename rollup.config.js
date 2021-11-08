import { terser } from "rollup-plugin-terser";

export default [
    {
        input: "src/vue.esm-browser.js",
        output: [
            {
                plugins: [terser()],
                file: "dist/vue-esm-browser.min.js",
            },
        ],
    },
    {
        input: "src/vue-sfc-browser.js",
        output: [
            {
                file: "dist/vue-sfc-browser.js",
                format: "iife",
                name: "MyVueExt",
            },
            {
                plugins: [terser()],
                file: "dist/vue-sfc-browser.min.js",
                format: "iife",
                name: "MyVueExt",
            },
        ],
    },
];
