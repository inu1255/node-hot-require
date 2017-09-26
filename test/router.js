/**
 * File: router.js
 * Project: hot-require
 * Created Date: 2017-09-26 20:52:17
 * Author: inu1255
 * -----
 * Last Modified: 2017-09-26 22:31:56
 * Modified By: inu1255
 * -----
 * Copyright (c) 2017 高木学习
 * 
 * 静以修身,俭以养德
 */
var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
    res.send('change me!');
});

module.exports = router;