var express = require("express");
var router = new express.Router();
var arrIter;


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
        arrIter.push(err);
        console.log("arrIter.length: " + arrIter.length);
    }).end();
};

router.get("/", function (req, res, next) {
    "use strict";

    console.log(parseInt(req.query.n));
    arrIter = new Array(req.query.n);
    arrIter.forEach(function (index) {
        console.log(index);
        getSome();
    });
    
    res.setHeader("content-type", "application/json");
    res.send(JSON.stringify({version: "hello"}));
});

module.exports = router;
