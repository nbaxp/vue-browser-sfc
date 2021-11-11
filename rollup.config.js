import { terser } from 'rollup-plugin-terser';
import json from '@rollup/plugin-json';

var replace = {
    name: 'replace', transform(code) {
        return code.replace('return resolveAsset(COMPONENTS, name, true, maybeSelfReference) || name;', 'return VueBrowserSfc.patchComponent(currentRenderingInstance.appContext.app, name, function () {return resolveAsset(COMPONENTS, name, true, maybeSelfReference) || name;});')
            .replace('return resolveAsset(COMPONENTS, component, false) || component;', 'return VueBrowserSfc.patchComponent(currentRenderingInstance.appContext.app, component, function () {return resolveAsset(COMPONENTS, component, false) || component;});');
    }
};

export default [
    {
        input: "src/vue.esm-browser.js",
        output: [
            {
                file: "dist/vue-esm-browser.js",
            },
            {
                file: "examples/esm/vue-esm-browser.js",
            },
            {
                file: "dist/vue-esm-browser.min.js",
                plugins: [terser()]
            }
        ],
        plugins: [replace]
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
                file: "dist/vue-browser-sfc.min.js",
                format: "iife",
                name: "VueBrowserSfc",
                plugins: [terser()]
            },
        ],
        plugins: [json()]
    },
];
