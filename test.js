import test from 'ava';
import fn from './';

test('df()', async t => {
	const data = await fn();
	t.true(Array.isArray(data));
	t.truthy(data[0].filesystem.length);
	t.is(data[0].mountpoint[0], '/');
});

test('df.fs()', async t => {
	const data = await fn();
	const dataFs = await fn.fs(data[0].filesystem);
	t.truthy(dataFs.filesystem.length);
	t.is(dataFs.mountpoint[0], '/');
});

test('df.file()', async t => {
	const data = await fn.file(__dirname);
	t.truthy(data.filesystem.length);
	t.is(data.mountpoint[0], '/');
});
