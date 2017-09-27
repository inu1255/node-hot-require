/**
 * Created Date: 2017-09-26 20:52:17
 * Author: inu1255
 * E-Mail: 929909260@qq.com
 * -----
 * Last Modified: 2017-09-27 11:22:29
 * Modified By: inu1255
 * -----
 * Copyright (c) 2017 gaomuxuexi
 */
var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
    res.send('change me!');
});

module.exports = router;