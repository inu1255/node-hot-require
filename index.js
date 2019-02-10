/**
 * Created Date: 2017-09-26 20:43:27
 * Author: inu1255
 * E-Mail: 929909260@qq.com
 */

const callsites = require("callsites");
const path = require("path");
const events = require("events");
const chokidar = require("chokidar");

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

/**
 * 获取后代模块
 * @param {string} filename
 */
function cacheChild(filename) {
    var mod = require.cache[filename];
    const cache = {};
    dfs(mod.children, function(item) {
        if (typeof emitter.filter === "function" && !emitter.filter(item.filename)) return false;
        if (item.filename.indexOf("node_modules") < 0) {
            cache[item.filename] = item;
            return true;
        }
    });
    return cache;
}

/**
 * 清空module cache 返回 roolback
 * @param {string[]} filenames
 */
function cleanCache(filenames, trigger) {
    var mods = [];
    var children = [];
    for (let filename of filenames) {
        var mod = require.cache[filename];
        if (!mod) continue;
        const cache = _cache_children[filename];
        if (trigger && !(cache[trigger] || filename == trigger)) continue;
        // remove reference in module.parent
        if (mod.parent) {
            mod.parent.children.splice(mod.parent.children.indexOf(mod), 1);
        }
        // 清空child module
        for (let filename in cache) {
            require.cache[filename] = null;
            children.push(cache[filename]);
        }
        require.cache[filename] = null;
        mods.push(mod);
    }
    return { mods, children };
}

function proxyIt(it) {
    return {
        value: new Proxy(it, {
            get(_, p) {
                return it[p];
            },
            set(_, p, value) {
                return (it[p] = value);
            },
            apply(_, thisArg, args) {
                return it.apply(thisArg, args);
            },
            construct(_, args) {
                new it(...args);
            },
            ownKeys(_) {
                return Object.keys(it);
            },
            enumerate(_) {
                return Object.keys(it);
            }
        }),
        use(m) {
            it = m;
        }
    };
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
    proxy = proxyIt(mod);
    _proxys[filename] = proxy;
    return proxy.value;
};

function watchAll() {
    if (!watchAll.watcher) {
        watchAll.watcher = chokidar.watch(".zzzq");
        watchAll.watcher.on("change", function(filename) {
            emitter.reloadAll(filename);
        });
    }
    for (let filename in _proxys) {
        if (!_file_watchers[filename]) {
            // console.log("watch", filename);
            watchAll.watcher.add(filename);
        }
        for (let name in _cache_children[filename]) {
            if (!_file_watchers[name]) {
                // console.log("watch", name);
                watchAll.watcher.add(name);
            }
        }
    }
}

/**
 * 重载module,重载所有依赖trigger的hot.require的模块
 * @param {string} [trigger] 触发文件,不传则更新全部
 */
emitter.reloadAll = function(trigger) {
    var error;
    var filenames = Object.keys(_proxys);
    const { mods, children } = cleanCache(filenames, trigger);
    try {
        for (let item of mods) {
            let filename = item.filename;
            const mod = require(filename);
            _cache_children[filename] = cacheChild(filename);
            if (watchAll.watcher) emitter.watchAll();
            let proxy = _proxys[filename];
            proxy.use(mod);
        }
    } catch (err) {
        for (let item of children) {
            require.cache[item.filename] = item;
        }
        for (let item of mods) {
            require.cache[item.filename] = item;
            item.parent.children.push(item);
        }
        emitter.emit("error", err);
    }
    emitter.emit("reload", error);
    return error;
};

emitter.watchAll = watchAll;

emitter.stopWatchAll = function() {
    if (watchAll.watcher) {
        watchAll.watcher.unwatch(watchAll.watcher.getWatched());
        watchAll.watcher.close();
        watchAll.watcher = null;
    }
};

module.exports = emitter;