/**
 * File: app.test.js
 * Project: hot-require
 * Created Date: 2017-09-26 20:50:57
 * Author: inu1255
 * -----
 * Last Modified: 2017-09-26 22:31:43
 * Modified By: inu1255
 * -----
 * Copyright (c) 2017 高木学习
 * 
 * 静以修身,俭以养德
 */
const express = require("express");
const hot = require("../index.js");

const app = express();

const router = hot(require.resolve("./router.js"));

app.use(function(req, res, next) {
    // 利用闭包的特性获取最新的router对象，避免app.use缓存router对象
    router()(req, res, next);
});

app.get("/restart", function(req, res) {
    hot.reloadAll();
    res.send("ok!");
});

app.listen(3000, function() {
    console.log('Listening on http://localhost:3000');
});