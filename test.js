'use strict';
var test = require('ava');
var df = require('./');

test('df()', function (t) {
	t.plan(4);

	df(function (err, data) {
		t.assert(!err, err);
		t.assert(Array.isArray(data));
		t.assert(data[0].filesystem.length > 0);
		t.assert(data[0].mountpoint[0] === '/');
	});
});

test('df.fs()', function (t) {
	t.plan(4);

	df(function (err, data) {
		t.assert(!err, err);

		df.fs(data[0].filesystem, function (err, data) {
			t.assert(!err, err);
			t.assert(data.filesystem.length > 0);
			t.assert(data.mountpoint[0] === '/');
		});
	});
});

test('df.file()', function (t) {
	t.plan(3);

	df.file(__dirname, function (err, data) {
		t.assert(!err, err);
		t.assert(data.filesystem.length > 0);
		t.assert(data.mountpoint[0] === '/');
	});
});
