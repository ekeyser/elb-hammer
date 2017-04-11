var express = require("express");
var router = new express.Router();
var arrRequests = [];
var intNumRequests;
var intNumResponses = 0;
var intNumSeconds;
var util = require("util");
var intEndTime;
var intRequestsSubmitted = 0;
var arrEvacRequests;
var AWS = require("aws-sdk");
var common = require("../common");
var config = common.config();
AWS.config.loadFromPath(config.aws_config_path);
var s3 = new AWS.S3();
var crypto = require("crypto");
var dumpThreshold = 10000;


var evacuateResponses = function () {
    "use strict";

    console.warn("evac");
    // console.log(util.inspect(arrEvacRequests, {showHidden: true, depth: null}));
    var jsonOut = JSON.stringify(arrEvacRequests);
    var strKey = Date.now().toString();
    console.log(strKey);
    // var hashKey = crypto.createHash("sha256");
    var secret = "abcdef";
    var hashKey = crypto.createHmac("sha256", secret)
        .update(strKey)
        .digest("hex");
    // console.log(hashKey);
    var params = {
        Bucket: config.s3_bucket,
        Key: hashKey,
        Body: jsonOut
    };
    // console.log(params);
    s3.upload(params, function (err, data) {
        if (err) {
            console.warn(err, err.stack);
        } else {
            console.log(data);
        }
    });
};

var handleCleanup = function () {
    "use strict";

    console.log(intNumResponses);
    if (arrRequests.length >= dumpThreshold) {
        arrEvacRequests = arrRequests;
        arrRequests = [];
        evacuateResponses();
    }

    if (intNumResponses >= intRequestsSubmitted) {
        console.log("we are all done");
        // console.log(util.inspect(arrRequests, {showHidden: true, depth: null}));
        arrEvacRequests = arrRequests;
        arrRequests = [];
        evacuateResponses();
    }
};

var getSome = function () {
    "use strict";

    var callbackFailure = function (err) {
        // console.warn(err);
        // arrRequests.push(err);
        intNumResponses += 1;
        handleCleanup();
    };

    var callback = function (response) {
        var str = "";

        response.on("data", function (chunk) {
            str += chunk;
        });

        response.on("end", function () {
            // console.log(util.inspect(response.statusCode, {showHidden: true, depth: null}));
            // console.log(util.inspect(response.headers, {showHidden: true, depth: null}));
            var intRtt = parseInt(Date.now()) - parseInt(response.headers["x-rots"]);
            var obj = {
                status: response.statusCode,
                rtt: intRtt
            };
            // console.log(util.inspect(obj, {showHidden: true, depth: null}));
            arrRequests.push(obj);
            intNumResponses += 1;
            handleCleanup();
        });
    };

    var http = require("http");

    var strTSHeader = parseInt(Date.now());
    var objSome = {};
    objSome["x-ots"] = strTSHeader;
    // console.log(util.inspect(objSome, {showHidden: true, depth: null}));
    var options = {
        host: "onramp.400lbs.com",
        path: "/",
        headers: objSome
    };

    var request = http.request(options, callback);
    request.setTimeout(60000, callbackFailure);
    request.on("error", callbackFailure).end();
    // console.warn(request._headers);
    // blah;
};

var begin = function () {
    "use strict";

    var intTimeDifference;
    if (intNumRequests === 0) {
        intTimeDifference = intEndTime - Date.now();
        while (intTimeDifference > 0) {
            intTimeDifference = intEndTime - Date.now();
            // console.log(intTimeDifference);
            intRequestsSubmitted += 1;
            getSome();
        }
        console.log(intRequestsSubmitted);
    } else {
        var i = 0;
        var boolContinue = true;
        while (boolContinue) {
            i += 1;
            if (i > intNumRequests) {
                boolContinue = false;
            }
        // }
        // for (i = 0; i < intNumRequests; i += 1) {
            intTimeDifference = intEndTime - Date.now();
            while (intTimeDifference > 0) {
                intTimeDifference = intEndTime - Date.now();
                intRequestsSubmitted += 1;
                getSome();
            }
        }
    }
};

router.get("/", function (req, res, next) {
    "use strict";

    res.setHeader("content-type", "application/json");
    res.send(JSON.stringify({status: "OK"}));

    intNumRequests = parseInt(req.query.number);
    intNumSeconds = parseInt(req.query.seconds);
    intEndTime = Date.now() + (intNumSeconds * 1000);

    begin();

    // res.setHeader("content-type", "application/json");
    // res.send(JSON.stringify({status: "OK"}));
});

module.exports = router;
