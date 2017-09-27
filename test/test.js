/**
 * Created Date: 2017-09-26 20:45:55
 * Author: inu1255
 * E-Mail: 929909260@qq.com
 * -----
 * Last Modified: 2017-09-27 11:16:36
 * Modified By: inu1255
 * -----
 * Copyright (c) 2017 gaomuxuexi
 */
const hot = require("../index");
const fs = require("fs");
const path = require("path");

filename = path.join(__dirname,"./s.js");
fs.writeFileSync(filename, "module.exports='abc'");

const s = hot.require("./s.js");

console.log(s());

fs.writeFileSync(filename, "module.exports='123'");

hot.reloadAll();

console.log(s());

fs.unlinkSync(filename);