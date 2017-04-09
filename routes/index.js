var express = require("express");
var router = new express.Router();
var arrExceptions = [];

var getSome = function () {
    "use strict";

    var http = require("http");

    var options = {
        host: "onramp.400lbs.com",
        path: "/"
    };

    var callback = function (response) {
        var str = "";

        // console.log("mk2");
        //another chunk of data has been recieved, so append it to `str`
        response.on("data", function (chunk) {
            str += chunk;
        });

        //the whole response has been recieved, so we just print it out here
        response.on("end", function () {
            console.log(Date.now() + " " + str);
        });
    };

    var request = http.request(options, callback);
    request.on("error", function (err) {
        // console.log(err);
        arrExceptions.push(err);
        console.log("arrExceptions.length: " + arrExceptions.length);
    }).end();
};

router.get("/", function (req, res, next) {
    "use strict";

    console.log(parseInt(req.query.n));
    for (var i = 0; i < parseInt(req.query.n); i++) {
        // console.log(i);
        getSome();
    }
    res.setHeader("content-type", "application/json");
    res.send(JSON.stringify({version: "hello"}));
});

module.exports = router;
