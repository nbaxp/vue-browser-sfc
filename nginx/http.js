var fs = require('fs');//https://nginx.org/en/docs/njs/reference.html#njs_api_fs
var root = '/usr/share/nginx/html';
var indexFile = 'index.html';
var sep = '/';

function process(r) {
    var uri = r.uri;
    var file = root + uri;
    var data = null;
    var err = null;
    var path = uri.endsWith(sep) ? uri.substr(0, uri.length - 1) : uri;
    try {
        data = fs.readFileSync(file);
    }
    catch (e) {
        err = e.toString();
        if (uri.search(/[^//]+\.[^//]+$/) >= 0) {
            r.return(404, err);
        }
        else {
            while (true) {
                file = root + path + sep + indexFile;
                try {
                    data = fs.readFileSync(file);
                    r.headersOut['Content-Type'] = "text/html; charset=utf-8";
                    break;
                } catch (e) {
                    data = e.toString();
                }
                if (path === '') {
                    break;
                }
                path = path.substr(0, path.lastIndexOf(sep));
            }
        }
    }
    if (data) {
        var html = data.toString();
        if (html.indexOf("<base") === -1) {
            html = html.replace("<head>", '<head>\n\t<base href="' + path + sep + '" />');
        }
        r.headersOut['x-real-path'] = path + sep;
        r.return(200, html);
    }
    else {
        r.return(200, err);
    }
}

export default { process };