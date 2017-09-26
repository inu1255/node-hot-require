/**
 * File: test.js
 * Project: hot-require
 * Created Date: 2017-09-26 20:45:55
 * Author: inu1255
 * -----
 * Last Modified: 2017-09-26 22:31:37
 * Modified By: inu1255
 * -----
 * Copyright (c) 2017 高木学习
 * 
 * 静以修身,俭以养德
 */
const hot = require("../index");
const fs = require("fs");

fs.writeFileSync("./s.js", "module.exports='abc'");

const s = hot(require.resolve("./s.js"));

console.log(s());

fs.writeFileSync("./s.js", "module.exports='123'");

hot.reloadAll();

console.log(s());

fs.unlinkSync("./s.js");