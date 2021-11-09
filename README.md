# 在浏览器中使用 Vue 3 的单文件组件

[![npm](https://img.shields.io/npm/v/vue-browser-sfc.svg)](https://www.npmjs.com/package/vue-browser-sfc)

从技术上来讲，在浏览器支持了模块化和 importmap 并且 Edge 和 chrome 统一内核后，使用模块化的方式开发已经可以脱离 webpack 和 bebel 了，如果不是开发库而是开发应用，node.js 也可以不用了。

从 Vue 本身来讲，Vue 3 本身已经不支持 IE 了，因此编译打包来支持低版本已经是个伪命题了。可以扩展或修改 Vue 在找不组件时，动态去服务端加载单文件组件，解析后调用 Vue 本身支持运行时定义异步组件的功能来避免单文件组件的编译问题。

有些项目需要动态加载单文件组件的能力，比如物联网相关的项目，后端对接设备后，前端需要增加对应设备的视图，对于一个节点下的设备，又有对设备的排列和布局自定义的需求，通常要做到配置模板内容后，刷新即可浏览效果的程度，不可能每次都编译后部署。

## 实现原理

1. 使用 Vue 的 defineAsyncComponent 方法动态创建组件。
1. 使用 浏览器原生的 fetch 和 import 加载并导入远程组件。
1. 拦截 Vue 的 resolveComponent 和 resolveDynamicComponent 两个方法，在找不到组件时动态加载。

## 功能

1. 远程加载单文件组件，包括路由组件。
1. 根据组件的加载和卸载对 css 进行控制。
1. 可直接源码调试组件。 

## 缺点

1. 单文件组件内的语法只支持浏览器端原生支持的功能。
1. 不支持 css scoped。

## 使用

默认 /components 目录为组件目录；默认 /components/views 目录为路由组件目录。

### script 加载方式

不需要对 Vue 源码进行修改。

```index.html
<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>script mode</title>
</head>

<body>
    <div id="app">
        <router-view />
    </div>
    <script src="https://cdn.jsdelivr.net/npm/vue@3.2.21/dist/vue.global.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/vue-router@4.0.12/dist/vue-router.global.min.js"></script>
    <script src="vue-browser-sfc.js"></script>

    <script>
        const app = Vue.createApp({
            data() {
                return {};
            }
        });

        const router = new VueRouter.createRouter({
            history: VueRouter.createWebHashHistory(
                document.querySelector("base")?.getAttribute("href")
            ),
            routes: [],
        });

        app.use(router);
        VueBrowserSfc.config(app, router);
        app.mount("#app");
    </script>
</body>

</html>
```

### esm 方式

需要对 Vue 源码进行修改，因为无法修改 esm 方式导出的函数。

```index.html
<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>esm mode</title>
</head>

<body>
    <div id="app">
        <router-view />
    </div>
    <script src="vue-browser-sfc.js"></script>
    <script type="importmap">
        {
            "imports": {
                "vue": "./vue-esm-browser.min.js",
                "vue-router": "https://cdn.jsdelivr.net/npm/vue-router@4.0.6/dist/vue-router.esm-browser.js"
            }
        }
    </script>

    <script type="module">
        import { createApp, defineAsyncComponent } from "vue";
        import { createRouter, createWebHistory, createWebHashHistory } from "vue-router";

        const app = createApp({
            data() {
                return {};
            }
        });

        const router = new createRouter({
            history: createWebHashHistory(
                document.querySelector("base")?.getAttribute("href")
            ),
            routes: [],
        });

        app.use(router);
        VueBrowserSfc.config(app, router, defineAsyncComponent);
        app.mount("#app");
    </script>
</body>

</html>
```
