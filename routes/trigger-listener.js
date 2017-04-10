var express = require("express");
var router = new express.Router();
var arrRequests = [];
var intNumRequests;
var intNumSeconds;
var strMyId;
var util = require("util");
var os = require("os");
var intEndTime;
var intRequestsSubmitted = 0;


var handleCleanup = function () {
    "use strict";

    // console.log(arrRequests.length);
    // console.log(intRequestsSubmitted);
};

var getSome = function () {
    "use strict";

    var http = require("http");

    var options = {
        host: "onramp.400lbs.com",
        path: "/"
    };

    var callbackFailure = function (err) {
        console.warn(err);
        arrRequests.push(err);
        handleCleanup();
    };

    var callback = function (response) {
        var str = "";

        response.on("data", function (chunk) {
            str += chunk;
        });

        response.on("end", function () {
            // console.log(util.inspect(response.statusCode, {showHidden: true, depth: null}));
            var obj = {
                status: response.statusCode
            };
            arrRequests.push(obj);
            handleCleanup();
        });
    };

    var request = http.request(options, callback);
    request.setTimeout(60000, callbackFailure);
    request.on("error", callbackFailure).end();
};

var begin = function () {
    "use strict";

    var i;
    var intTimeDifference;
    for (i = 0; i < parseInt(intNumRequests); i++) {
        intTimeDifference = intEndTime - Date.now();
        if (parseInt(intTimeDifference) <= 0) {
            return;
        } else {
            intRequestsSubmitted++;
            getSome();
        }
    }
};

router.get("/", function (req, res, next) {
    "use strict";

    intNumRequests = parseInt(req.query.number);
    intNumSeconds = parseInt(req.query.seconds);
    strMyId = os.hostname();
    intEndTime = Date.now() + (intNumSeconds * 1000);

    begin();

    res.setHeader("content-type", "application/json");
    res.send(JSON.stringify({status: "OK"}));
});

module.exports = router;
