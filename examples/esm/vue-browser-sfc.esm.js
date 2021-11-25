var version = "0.2.2";

var config = {};

config.debug = false;
config.basePath = "";
config.componentsPath = "/components";
config.viewsPath = "/views";
config.componentExt = ".html";
config.styleCounter = "data-component-counter";
config.routerHome = "/home";
var dac;
var isNativeTag;

function log(msg) {
    if (config.debug) {
        console.log(msg);
    }
}

function trimEnd(input, char) {
    return input.endsWith(char) ? input.substr(0, input.length - 1) : input;
}

function append(parent, html) {
    parent.insertAdjacentHTML('beforeend', html);
}

function addStyles(name, style) {
    var styleList = document.querySelectorAll("head style." + name + ",head link." + name);
    if (styleList.length > 0) {
        for (var i = 0; i < styleList.length; i++) {
            var style = styleList[i];
            var counter = parseInt(
                style.getAttribute(config.styleCounter)
            );
            style.setAttribute(config.styleCounter, counter + 1);
        }
    } else {
        if (style) {
            append(document.head, style);
        }
    }
}

function removeStyles(name) {
    var styleList = document.querySelectorAll("head style." + name + ",head link." + name);
    if (styleList.length > 0) {
        for (var i = 0; i < styleList.length; i++) {
            var style = styleList[i];
            var counter = parseInt(
                style.getAttribute(config.styleCounter)
            );
            if (counter - 1 > 0) {
                style.setAttribute(config.styleCounter, counter - 1);
            } else {
                document.head.removeChild(style);
            }
        }
    }
}

function templateToModel(html, name, url, func) {
    log({ url });
    var doc = new DOMParser().parseFromString(html, "text/html");
    var templateTag = doc.querySelector("template");
    var template = templateTag ? templateTag.innerHTML : "<template></template>";
    var scriptTag = doc.querySelector("script");
    var script = scriptTag?.innerHTML || '';
    evalByImportUriData(script, url, function (model) {
        model.template = template;
        var styleTagList = doc.querySelectorAll("style,link[rel='stylesheet']");
        if (styleTagList.length > 0) {
            model.style = "\n";
            for (var i = 0; i < styleTagList.length; i++) {
                var styleTag = styleTagList[i];
                if (styleTag) {
                    styleTag.setAttribute("class", name);
                    styleTag.setAttribute(config.styleCounter, 1);
                    model.style += styleTag.outerHTML + "\n";
                }
            }
        }
        func(model);
    });
}

function evalByImportUriData(script, url, func) {
    script = script.replaceAll('./', config.basePath + '/').trim();
    const dataUri = "data:text/javascript;charset=utf-8," + encodeURIComponent(script + '\n//@ sourceURL=' + url);
    import(dataUri).then((namespaceObject) => {
        func(namespaceObject.default ?? {});
    });
}

function addComponent(instance, name, url) {
    instance.component(
        name,
        dac(
            () =>
                new Promise((resolve, reject) => {
                    fetch(url, { cache: 'no-cache' })
                        .then(o => o.text())
                        .then(function (text) {
                            if (text) {
                                templateToModel(text, name, url, function (
                                    component
                                ) {
                                    component.created = function () {
                                        addStyles(name, component.style);
                                    };
                                    component.unmounted = function () {
                                        removeStyles(name);
                                    };
                                    resolve(component);
                                });
                            }
                        });
                })
        )
    );
}

function patchComponent(instance, name, fun) {
    var result = fun();
    if (!result || typeof result === "string") {
        if (isNativeTag(name)) {
            return name;
        }
        var url =
            config.basePath +
            config.componentsPath +
            "/" +
            name.replaceAll("_", "/") +
            config.componentExt;
        addComponent(instance, name, url);
        result = fun();
    }
    return result;
}

function configRouter(router) {
    router.beforeEach((to, from, next) => {
        var path = to.path === "/" ? config.routerHome : to.path;
        var name = path.substring(1).replaceAll("/", "_");
        var url =
            config.basePath +
            config.viewsPath +
            path +
            config.componentExt;
        if (!router.hasRoute(name)) {
            fetch(url, { cache: 'no-cache' })
                .then(o => o.text())
                .then(function (text) {
                    if (text) {
                        templateToModel(text, name, url, function (component) {
                            var route = {
                                name: name,
                                path: to.path,
                                component: component,
                                meta: component.meta,
                            };
                            router.addRoute(route);
                            router.push({ path: to.path, query: to.query });
                        });
                    }
                });
        } else {
            next();
        }
    });

    router.beforeResolve(async function (to) {
        var route = router.getRoutes().find(function (item, index) {
            return item.name === to.name;
        });
        if (route.components.default.style && !document.querySelector("head style." + to.name)) {
            append(document.head, route.components.default.style);
        }
    });

    router.afterEach(function (to, from) {
        if (from.name) {
            if (to.path !== from.path) {
                removeStyles(from.name);
            }
        }
    });
}

function install(app, defineAsyncComponent, base) {
    isNativeTag = app.config.isNativeTag;
    dac = defineAsyncComponent;
    config.basePath = document.location.protocol +
        "//" + document.location.host +
        trimEnd(base || (document.querySelector("base")?.getAttribute("href") ?? document.location.pathname), "/");
    if (window.Vue) {
        var VueResolveComponent = Vue.resolveComponent;
        Vue.resolveComponent = function (name, maybeSelfReference) {
            return patchComponent(app, name, () => VueResolveComponent(name, maybeSelfReference));
        };
        var VueResolveDynamicComponent = Vue.resolveDynamicComponent;
        Vue.resolveDynamicComponent = function (component) {
            return patchComponent(app, component, () => VueResolveDynamicComponent(component));
        };
        dac = dac || Vue.defineAsyncComponent;
    }
    else {
        app.config.globalProperties.patchComponent = patchComponent;
    }
    var router = app.config.globalProperties.$router;
    if (router) {
        configRouter(router);
    }
}

export { config, install, patchComponent, version };
