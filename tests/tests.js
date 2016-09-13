module.exports = function(test, Smack) {

	test( "making sure tests run", function( t ) {
		t.ok(true, 'test run');
		if(typeof t.end === 'function') t.end();
	});
}

