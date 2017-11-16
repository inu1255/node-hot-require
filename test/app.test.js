/**
 * Created Date: 2017-09-26 20:50:57
 * Author: inu1255
 * E-Mail: 929909260@qq.com
 */
const express = require("express");
const hot = require("../index.js");
hot.filter = function(filename) {
    if (filename.endsWith("ignore.js")) {
        return false;
    }
    return true;
};

const app = express();

const router = hot.require("./router.js");
hot.watchAll();

hot.on("reload", function(err) {
    console.log(err);
});

app.use(router);

app.get("/restart", function(req, res) {
    hot.reloadAll();
    res.send("ok!");
});

app.listen(3000, function() {
    console.log('Listening on http://localhost:3000');
});