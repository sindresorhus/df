import test from 'ava';
import df from '.';

test('df()', async t => {
	const data = await df();
	t.true(Array.isArray(data));
	t.true(data[0].filesystem.length > 0);
	t.is(data[0].mountpoint[0], '/');
});

test('df.fs()', async t => {
	const data = await df();
	const dataFs = await df.fs(data[0].filesystem);

	t.true(dataFs.filesystem.length > 0);
	t.is(dataFs.mountpoint[0], '/');

	await t.throwsAsync(df.fs('foobar123'), /The specified filesystem/);
});

test('df.file()', async t => {
	const data = await df.file(__dirname);

	t.true(data.filesystem.length > 0);
	t.is(data.mountpoint[0], '/');

	await t.throwsAsync(df.file('foobar123'), /The specified file/);
});
