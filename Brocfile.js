// var browserify = require('broccoli-browserify')
var uglify = require('broccoli-uglify-sourcemap')
var esTranspiler = require('broccoli-babel-transpiler')
var pickFiles = require('broccoli-funnel')
var mergeTrees = require('broccoli-merge-trees')
var concat = require('broccoli-concat');
var env = require('broccoli-env').getEnv()
var rename = require('broccoli-stew').rename;

// Tests
var testsStatic = pickFiles('./tests', {
  include: ['tests.html', 'tests-min.html', 'lib/*', 'css/*', 'testCode/*'],
  destDir: '.'
});

var tests = pickFiles('./tests', {
  include: ['tests.js', 'tests.html', 'tests-min.html', 'browserTestHeader.js', 'browserTestFooter.js'],
  destDir: '.'
});

tests = esTranspiler(tests);

tests = concat(tests, {
  // header: "var module = {};",
  headerFiles: ['browserTestHeader.js'],
  outputFile: './tests.js',
  inputFiles: ['./tests.js'],
  footerFiles: ['browserTestFooter.js'],
  // footer: "module.exports(QUnit.test, $, Smack);",
  sourceMapConfig: { enabled: true },
});

var tool = pickFiles('./dev', {
  include: ['schema-reader.js'],
  destDir: '.'
});

tool = esTranspiler(tool);//new mergeTrees([tool], { overwrite: true }));
// nodeTool = pickFiles(tool, {
//   include: ['schema-reader.js'],
//   destDir: '.'
// });
nodeTool = rename(tool, 'schema-reader.js', 'schema-reader-node.js');

tool = mergeTrees([
  tool,
  pickFiles('./dev', {
    include: ['browserHeader.js', 'browserFooter.js'],
    destDir: '.'
  })
]);

tool = concat(tool, {
  header: "(function(){",
  headerFiles: ['./browserHeader.js'],
  outputFile: './schema-reader.js',
  footerFiles: ['./browserFooter.js'],
  footer: "})();",
  inputFiles: ['./schema-reader.js'],
  sourceMapConfig: { enabled: true },
});

tool = pickFiles(tool, {
  include: ['schema-reader.js', 'schema-reader.map'],
});

var toolMin = rename(tool, 'schema-reader.js', 'schema-reader-min.js');

toolMin = uglify(toolMin, {
   mangle: true,
   compress: true
});

var all = mergeTrees([
  toolMin,
  tool,
  nodeTool,
  tests,
  testsStatic
]);

module.exports = all;
