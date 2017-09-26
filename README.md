# node-hot-require

``` js
// app.js
const express = require("express");
const hot = require("hot-require");

const app = express();

const router = hot(require.resolve("./router.js"));

app.use(function(req, res, next) {
    // 利用闭包的特性获取最新的router对象，避免app.use缓存router对象
    router()(req, res, next);
});

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
