/**
 * Created Date: 2017-09-26 20:43:27
 * Author: inu1255
 * E-Mail: 929909260@qq.com
 * -----
 * Last Modified: 2017-09-29 14:44:07
 * Modified By: inu1255
 * -----
 * Copyright (c) 2017 gaomuxuexi
 */
const fs = require("fs");
const callsites = require("callsites");
const path = require("path");
const Proxy = require("node-module-proxy");
const events = require('events');

const emitter = new events.EventEmitter();
const _proxys = {}; // module 代理
const _file_watchers = {};
const _cache_children = {}; // 子module

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

function cacheChild(filename) {
    var mod = require.cache[filename];
    const cache = [];
    dfs(mod.children, function(item) {
        if (item.filename.indexOf("node_modules") < 0) {
            cache.push(item);
            return true;
        }
    });
    return cache;
}

/**
 * 清空module cache 返回 roolback
 * @param {string} filename 
 */
function cleanCache(filename) {
    var mod = require.cache[filename];
    if (!mod)
        return function() {};
    // remove reference in module.parent
    if (mod.parent) {
        mod.parent.children.splice(mod.parent.children.indexOf(mod), 1);
    }
    // 清空child module
    const children = _cache_children[filename];
    for (let item of children) {
        require.cache[item.filename] = null;
    }
    require.cache[filename] = null;
    // 还原 cache
    return function rollback() {
        for (let item of children) {
            require.cache[item.filename] = item;
        }
        require.cache[filename] = mod;
        mod.parent.children.push(mod);
    };
}

/**
 * 重新require一个module
 * @param {string} filename 
 */
function reload(filename) {
    const rollback = cleanCache(filename);
    try {
        const mod = require(filename);
        _cache_children[filename] = cacheChild(filename);
        if (watching) emitter.watchAll();
        emitter.emit("reload", null, filename);
        return mod;
    } catch (ex) {
        emitter.emit("reload", ex, filename);
        rollback();
    }
    return require.cache[filename];
}

emitter.require = function(modulePath) {
    let filename = modulePath;
    if (modulePath[0] == ".") {
        const p = callsites()[1].getFileName();
        filename = path.join(path.dirname(p), modulePath);
    }
    var mod = require(filename);
    _cache_children[filename] = cacheChild(filename);
    var proxy = _proxys[filename];
    if (proxy) return proxy.value;
    proxy = new Proxy(mod);
    _proxys[filename] = proxy;
    return proxy.value;
};

emitter.reloadAll = function() {
    for (let filename in _proxys) {
        let proxy = _proxys[filename];
        let mod = reload(filename);
        proxy.use(mod);
    }
};

var watching = false;
emitter.watchAll = function() {
    watching = true;
    for (let filename in _proxys) {
        let proxy = _proxys[filename];
        if (!_file_watchers[filename]) {
            // console.log("watch", filename);
            _file_watchers[filename] = fs.watchFile(filename, function() {
                let mod = reload(filename);
                proxy.use(mod);
            });
        }
        console.log(_cache_children[filename].length);
        for (let item of _cache_children[filename]) {
            if (!_file_watchers[item.filename]) {
                // console.log("watch", item.filename);
                _file_watchers[item.filename] = fs.watchFile(item.filename, function() {
                    let mod = reload(filename);
                    proxy.use(mod);
                });
            }
        }
    }
};

emitter.stopWatchAll = function() {
    watching = false;
    for (let k in _file_watchers) {
        let v = _file_watchers[k];
        v.close();
        Reflect.deleteProperty(_file_watchers, k);
    }
};

module.exports = emitter;