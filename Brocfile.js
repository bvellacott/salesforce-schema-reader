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
  include: ['browserTestHeader.js', 'browserTestFooter.js', 'schema-reader.js', 'browserEntry.js'],
  destDir: './dev'
});

tool = esTranspiler(tool);//new mergeTrees([tool], { overwrite: true }));

// tool = browserify(tool, {
//   entries: ['./dev/browserEntry.js'],
//   debug: true
// });

tool = concat(tool, {
  headerFiles: ['./dev/browserTestHeader.js'],
  outputFile: './schema-reader.js',
  footerFiles: ['./dev/browserTestFooter.js'],
  inputFiles: ['./dev/browserEntry.js', './dev/schema-reader.js'],
  sourceMapConfig: { enabled: true },
});

tool = pickFiles(tool, {
  include: ['schema-reader.js', 'schema-reader.map'],
});

var toolMin = rename(tool, 'schema-reader.js', 'smack-compiler-min.js');

toolMin = uglify(toolMin, {
   mangle: true,
   compress: true
});

var all = mergeTrees([
  toolMin,
  tool,
  tests,
  testsStatic
]);

module.exports = all;
