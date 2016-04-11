'use strict';
var test = require('ava');
var df = require('./');

test('df()', function (t) {
	t.plan(3);

	df().then(function (data) {
		t.assert(Array.isArray(data));
		t.assert(data[0].filesystem.length > 0);
		t.assert(data[0].mountpoint[0] === '/');
	});
});

test('df.fs()', function (t) {
	t.plan(2);

	df()
		.then(function (data) {
			return df.fs(data[0].filesystem);
		})
		.then(function (data) {
			t.assert(data.filesystem.length > 0);
			t.assert(data.mountpoint[0] === '/');
		});
});

test('df.file()', function (t) {
	t.plan(2);

	df.file(__dirname).then(function (data) {
		t.assert(data.filesystem.length > 0);
		t.assert(data.mountpoint[0] === '/');
	});
});
