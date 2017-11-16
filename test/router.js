/**
 * Created Date: 2017-09-26 20:52:17
 * Author: inu1255
 * E-Mail: 929909260@qq.com
 */
var express = require('express');
const fs = require("fs");
const s = require("./s.js");
const ignore = require("./ignore.js");
var router = express.Router();

router.get('/', function(req, res) {
    res.send(s);
});

router.get('/ignore', function(req, res) {
    res.send(ignore);
});

module.exports = router;