import { terser } from 'rollup-plugin-terser';
import json from '@rollup/plugin-json';

var resolveComponent = 'return resolveAsset(COMPONENTS, name, true, maybeSelfReference) || name;';
var resolveComponentReplace = `if(currentRenderingInstance.appContext.app.patchComponent){
        return currentRenderingInstance.appContext.app.patchComponent(currentRenderingInstance.appContext.app, name, function () {${resolveComponent}});
    }else{
        ${resolveComponent}
    }`;
var resolveDynamicComponent = 'return resolveAsset(COMPONENTS, component, false) || component;';
var resolveDynamicComponentReplace = `if(currentRenderingInstance.appContext.app.patchComponent){
        return currentRenderingInstance.appContext.app.patchComponent(currentRenderingInstance.appContext.app, component, function () {${resolveDynamicComponent}});
    }else{
        ${resolveDynamicComponent}
    }`;

var replace = {
    name: 'replace', transform(code) {
        return code.replace(resolveComponent, resolveComponentReplace)
            .replace(resolveDynamicComponent, resolveDynamicComponentReplace);
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
                name: "VueBrowserSfc"
            },
            {
                file: "dist/vue-browser-sfc.min.js",
                format: "iife",
                name: "VueBrowserSfc",
                plugins: [terser()]
            },
            {
                file: "dist/vue-browser-sfc.esm.js",
                format: "esm",
                name: "VueBrowserSfc"
            },
            {
                file: "dist/vue-browser-sfc.esm.min.js",
                format: "esm",
                name: "VueBrowserSfc",
                plugins: [terser()]
            },
            {
                file: "examples/script/vue-browser-sfc.js",
                format: "iife",
                name: "VueBrowserSfc"
            },
            {
                file: "examples/esm/vue-browser-sfc.esm.js",
                format: "esm",
                name: "VueBrowserSfc"
            }          
        ],
        plugins: [json()]
    }
];
