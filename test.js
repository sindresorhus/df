import test from 'ava';
import m from '.';

test('df()', async t => {
	const data = await m();
	t.true(Array.isArray(data));
	t.true(data[0].filesystem.length > 0);
	t.is(data[0].mountpoint[0], '/');
});

test('df.fs()', async t => {
	const data = await m();
	const dataFs = await m.fs(data[0].filesystem);
	t.true(dataFs.filesystem.length > 0);
	t.is(dataFs.mountpoint[0], '/');
	await t.throwsAsync(() => m.fs('foobar123'), /The specified filesystem/);
});

test('df.file()', async t => {
	const data = await m.file(__dirname);
	t.true(data.filesystem.length > 0);
	t.is(data.mountpoint[0], '/');
	await t.throwsAsync(() => m.file('foobar123'), /The specified file/);
});
