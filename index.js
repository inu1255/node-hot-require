/**
 * File: index.js
 * Project: hot-require
 * Created Date: 2017-09-26 20:43:27
 * Author: inu1255
 * -----
 * Last Modified: 2017-09-26 22:31:12
 * Modified By: inu1255
 * -----
 * Copyright (c) 2017 高木学习
 * 
 * 静以修身,俭以养德
 */
const fs = require("fs");

function dfs(data, fn) {
    if (!data) return;
    if (data instanceof Array) {
        for (var key = 0; key < data.length; key++) {
            dfs(data[key], fn);
        }
        return;
    }
    parent = fn(data);
    dfs(data.children, fn);
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
        children[item.filename] = item;
        require.cache[item.filename] = null;
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

const handles = [];
function hot(filename) {
    var mod = require(filename);
    var fw;
    const handle = function() {
        return mod;
    };
    handle.close = function() {
        fw.close();
        fw = null;
    };
    handle.watch = function() {
        if (fw) return;
        fw = fs.watch(filename, function(event) {
            if (event === "change")
                mod = reload(filename);
        });
    };
    handle.reload = function() {
        mod = reload(filename);
    };
    handles.push(handle);
    return handle;
};

hot.reloadAll = function() {
    for (let handle of handles) {
        handle.reload();
    }
};

hot.watchAll = function() {
    for (let handle of handles) {
        handle.watch();
    }
};

module.exports = hot;