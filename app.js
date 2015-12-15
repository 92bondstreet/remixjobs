/* RemixJobs API */

//REQUIREMENTS
var mongoClient = require("mongodb").MongoClient;
var http = require("http");
var url = require("url");
var querystring = require("querystring");
var assert = require("assert");
var fs = require("fs");

var dbUrl = "mongodb://localhost:27017/remixjobs";
var name = "api";
var versionNumber = "1.0";
var version = "v1.0";
var nbMaxResults = 10;
var port = isNaN(parseInt(process.argv[2]))?3000:parseInt(process.argv[2]); // PORT IS FIRST GIVEN process.argv OR 3000
var collection;
var sample;

// MONGO CLIENT
mongoClient.connect(dbUrl, function (err, db) {
    assert.equal(err, null);
    console.log("Connected to MongoDB server");
    collection = db.collection('jobs');
    collection.count(function (err1, count) {
        assert.equal(err1, null);
        // (RE)LOAD THE DATASET INTO MONGODB IF "load" IS IN process.argv OR IF collection.count === 0
        if (count === 0 || ~process.argv.slice(2).indexOf("load")) {
            LoadDataSet();
        }
        // DROP DB AND LOAD THE DATASET INTO MONGODB IF "drop" IS IN process.argv
        else if (~process.argv.slice(2).indexOf("drop")) {
            collection.drop(function () {
                console.log(count + " jobs were dropped.");
                LoadDataSet();
            });
        }
        // ELSE, SHOW DB COUNT
        else {
            console.log(count + " jobs are currently stored.");
            LoadSample();
        }
    });
});

// LOAD JSON DATASET
function LoadDataSet(callback) {
    var rawDataSet = fs.readFileSync('remixjobs.json').toString();
    var dataSet = JSON.parse(rawDataSet.substring(rawDataSet.search(/[\[\{a-z0-9]/i)));
    var dataSetCount = dataSet.length;
    collection.insertMany(dataSet, function (err) {
        assert.equal(err, null);
        console.log(dataSetCount + " jobs were successfully loaded.");
        collection.count(function (err1, count) {
            assert.equal(err1, null);
            console.log(count + " jobs are currently stored.");
            LoadSample();
            if (callback) {
                callback(count);
            }
        });
    });
}

// LOAD SAMPLE
function LoadSample() {
    collection.findOne({}, function (err, doc) {
        assert.equal(err, null);
        sample = doc;
    });
}

// PROTOTYPING HTTP
http.ServerResponse.prototype.Redirect = function (redirectionUrl) {
    try { this.writeHead(302, { "Location": redirectionUrl }); }
    catch (e) { this.writeHead(404, { "Content-Type": "text/html", "charset" : "UTF-8" }); }
    finally { this.end(); }
}

http.ServerResponse.prototype.SendError = function () {
    this.writeHead(404, { "Content-Type": "text/html", "charset" : "UTF-8" });
    this.end();
}

http.ServerResponse.prototype.SendJSON = function (obj, statusCode) {
    statusCode = statusCode || 200;
    this.writeHead(statusCode, { "Content-Type": "application/json", "charset" : "UTF-8" });
    this.write(JSON.stringify(obj));
    this.end();
}

http.ServerResponse.prototype.Send = function (str, statusCode, contentType) {
    statusCode = statusCode || 200;
    this.writeHead(statusCode, { "Content-Type": contentType, "charset" : "UTF-8" });
    this.write(str);
    this.end();
}

http.ServerResponse.prototype.SendFromAPI = function (result, statusCode, contentType) {
    statusCode = statusCode || 200;
    contentType = contentType || "application/json";
    result = result.constructor.name === "Array" ? result : [result];
    var objResponse = { infos : { version : versionNumber, countResults : result.length, limitResults : nbMaxResults, fields : Object.keys(sample) }, results : result.slice(0, nbMaxResults) };
    this.writeHead(statusCode, { "Content-Type": contentType, "charset" : "UTF-8" });
    this.write(JSON.stringify(objResponse));
    this.end();
}

http.IncomingMessage.prototype.GetBody = function (callback) {
    var req = this;
    var body = "";
    req.on('data', function (chunk) {
        body += chunk.toString();
    });
    req.on('end', function () {
        callback(body);
    });
}

// SERVER
var server = http.createServer(function (req, res) {
    var method = req.method;
    var pathname = url.parse(req.url).pathname;
    var query = url.parse(req.url).query;
    var href = url.parse(req.url).href;
    var dir = pathname.substring(0, pathname.lastIndexOf("/")).replace("/", "");
    var file = pathname.substring(pathname.lastIndexOf("/")).replace("/", "");
    var params = querystring.parse(query);

    console.log(method + " " + href);
    
    var args = [req, dir, file, params, method];

    var route = findRoute.apply(routes, args);

    if (route) {
        route.apply(res, args);
    }
    else {
        res.Redirect(home);
    }
});
server.listen(port);
console.log("API running on port " + port);

// ROUTES
var place = name + "/" + version + "/";
var home = "/" + name + "/" + version + "/home";
var routes = {}
routes[name] = {};
var endPoints = routes[name][version] = {};

endPoints['home'] = {
    GET : function () {
        var res = this;
        res.write("WELCOME TO REMIXJOBS API\nPlease use the route " + place + " and one of the available endpoints : " + Object.keys(endPoints));
        res.end();
    }
};

endPoints['jobs']= {
    POST : function (req) {
        var res = this;
        req.GetBody(function (body) {
            var obj = JSON.parse(body);
            collection.insertOne(obj, function (err, result) {
                assert.equal(err, null);
                res.SendFromAPI(result);
            });
        });
    },
    GET : function (req, dir, file, params) {
        var res = this;
        collection.find(params).toArray(function (err, docs) {
            assert.equal(err, null);
            res.SendFromAPI(docs);
        });
    },
    PUT : function (req, dir, file, params) {
        var res = this;
        req.GetBody(function (body) {
            var obj = JSON.parse(body);
            collection.updateOne(params, { $set: obj }, function (err, result) {
                assert.equal(err, null);
                res.SendFromAPI(result);
            });
        });
    },
    DELETE : function (req, dir, file, params) {
        var res = this;
        collection.deleteOne(params, function (err, result) {
            assert.equal(err, null);
            res.SendFromAPI(result);
        });
    }
};

endPoints['latest'] = {
    GET : function (req, dir, file, params) {
        var res = this;
        collection.find(params, { "sort": [['jobId', 'desc'], ['title', 'asc']] }).toArray(function (err, docs) {
            assert.equal(err, null);
            if (docs[0]) {
                params['date'] = docs[0]['date'];
                collection.find(params).toArray(function (err1, docs) {
                    assert.equal(err1, null);
                    res.SendFromAPI(docs);
                });
            } else {
                res.SendFromAPI([]);
            }
        });
    }
};

endPoints['today'] = {
    GET : function ()  {
        var res = this;
        collection.find({date : {$regex : ".*heure.*"}}).toArray(function (err, docs) {
            assert.equal(err, null);
            res.SendFromAPI(docs);
        });
    }
};

endPoints['distinct'] = {
    GET : function (req, dir, file, params) {
        var res = this;
        if (params['attribute']) {
            collection.distinct(params['attribute'], function(err, items) {
                assert.equal(err, null);
                res.SendFromAPI(items);
            });
        } else {
            res.SendFromAPI([]);
        }
    }
};

// ROUTING
function findRoute(req, dir, file, params, method) {
    var route = this;
    var path = dir + "/" + file + "/" + method;
    var points = path.split("/");
    while (points.length > 0 && route) {
        route = route[points.shift()];
    }
    return route;
}