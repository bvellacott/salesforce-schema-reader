var Test = require('./tests.js');
var SchemaReader = require('../dev/schema-reader.js');

var getFileContents = function(path, cb) {
	var fs = require('fs');
    fs.stat(path, function (statErr, stats) {
        fs.open(path, "r", function (openErr, fd) {
            var buffer = new Buffer(stats.size);

            fs.read(fd, buffer, 0, buffer.length, null, function (readErr, bytesRead, buffer) {
                var data = buffer.toString("utf8", 0, buffer.length);
                fs.close(fd);
                cb(data);
            });
        });
    });
};

Test(require('tap').test, SchemaReader);
