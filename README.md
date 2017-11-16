# node-hot-require

## features

1. hot require one,reload all module required by it
2. ignore all module in node_modules and system module
3. custom filter function witch file will be reload or not

``` js
// app.js
const express = require("express");
const hot = require("node-hot-require");
// after version 1.0.6,filter witch file will be reload
hot.filter = function(filename) {
    if (filename.endsWith("ignore.js")) {
        return false;
    }
    return true;
};
const app = express();

const router = hot.require("./router.js");

app.use(router);

app.get("/upgrade", function(req, res) {
    hot.reloadAll();
    res.send("ok!");
});

app.listen(3000, function() {
    console.log('Listening on http://localhost:3000');
});
```

``` js
// router.js
var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
    res.send('change me!');
});

module.exports = router;
```

open [http://localhost:3000](http://localhost:3000)

you will get `change me!`

edit `router.js` change `res.send('hello world')`

open [http://localhost:3000/upgrade](http://localhost:3000/upgrade) to reload `router.js`

open [http://localhost:3000/](http://localhost:3000/) 

you will get `hello world`
