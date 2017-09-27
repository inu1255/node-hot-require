/**
 * Created Date: 2017-09-26 20:50:57
 * Author: inu1255
 * E-Mail: 929909260@qq.com
 * -----
 * Last Modified: 2017-09-27 11:10:06
 * Modified By: inu1255
 * -----
 * Copyright (c) 2017 gaomuxuexi
 */
const express = require("express");
const hot = require("../index.js");

const app = express();

const router = hot.require("./router.js");

app.use(router);

app.get("/restart", function(req, res) {
    hot.reloadAll();
    res.send("ok!");
});

app.listen(3000, function() {
    console.log('Listening on http://localhost:3000');
});