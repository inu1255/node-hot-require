/**
 * Created Date: 2017-09-26 20:43:27
 * Author: inu1255
 * E-Mail: 929909260@qq.com
 * -----
 * Last Modified: 2017-09-27 11:19:08
 * Modified By: inu1255
 * -----
 * Copyright (c) 2017 gaomuxuexi
 */
const fs = require("fs");
const callsites = require("callsites");
const path = require("path");
const Proxy = require("node-module-proxy");

function dfs(data, fn) {
    if (!data) return;
    if (data instanceof Array) {
        for (var key = 0; key < data.length; key++) {
            dfs(data[key], fn);
        }
        return;
    }
    if (fn(data)) dfs(data.children, fn);
}

/**
 * 清空module cache 返回 roolback
 * @param {string} filename 
 */
function cleanCache(filename) {
    var module = require.cache[filename];
    if (!module)
        return function() {};
    // remove reference in module.parent
    if (module.parent) {
        module.parent.children.splice(module.parent.children.indexOf(module), 1);
    }
    var children = {};
    dfs(module.children, function(item) {
        if (item.filename.indexOf("node_modules") < 0) {
            children[item.filename] = item;
            require.cache[item.filename] = null;
            return true;
        }
    });
    require.cache[filename] = null;
    // 还原 cache
    return function rollback() {
        for (let k in children) {
            let v = children[k];
            require.cache[k] = v;
        }
        require.cache[filename] = module;
        module.parent.children.push(module);
    };
}

/**
 * 重新require一个module
 * @param {string} filename 
 */
function reload(filename) {
    const rollback = cleanCache(filename);
    try {
        return require(filename);
    } catch (ex) {
        rollback();
    }
    return require.cache[filename];
}

const _moduels = {};
const _fw = {};
exports.require = function(modulePath) {
    let filename = modulePath;
    if (modulePath[0] == ".") {
        const p = callsites()[1].getFileName();
        filename = path.join(path.dirname(p), modulePath);
    }
    var mod = require(filename);
    var proxy = _moduels[filename];
    if (proxy) return proxy.value;
    proxy = new Proxy(mod);
    _moduels[filename] = proxy;
    return proxy.value;
};

exports.reloadAll = function() {
    for (let filename in _moduels) {
        let proxy = _moduels[filename];
        let mod = reload(filename);
        proxy.use(mod);
    }
};

exports.watchAll = function() {
    for (let filename in _moduels) {
        let proxy = _moduels[filename];
        let fw = _fw[filename];
        if (!fw) {
            _fw[filename] = fs.watchFile(filename, function() {
                let mod = reload(filename);
                proxy.use(mod);
            });
        }
    }
};

exports.stopWatchAll = function() {
    for (let k in _fw) {
        let v = _fw[k];
        v.close();
        Reflect.deleteProperty(_fw, k);
    }
};