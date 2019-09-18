import test from 'ava';
import df from '.';

test('df()', async t => {
	const data = await df();
	t.true(Array.isArray(data));
	t.true(data[0].filesystem.length > 0);
	t.true(data[0].type.length > 0);
	t.is(data[0].mountpoint[0], '/');
});

test('df.fs()', async t => {
	const data = await df();
	const dataFs = await df.fs(data[0].filesystem);

	t.true(dataFs.filesystem.length > 0);
	t.true(dataFs.type.length > 0);
	t.is(dataFs.mountpoint[0], '/');

	await t.throwsAsync(df.fs('foobar123'), /The specified filesystem/);
});

test('df.file()', async t => {
	const data = await df.file(__dirname);

	t.true(data.filesystem.length > 0);
	t.true(data.type.length > 0);
	t.is(data.mountpoint[0], '/');

	await t.throwsAsync(df.file('foobar123'), /The specified file/);
});

test('parse long output', async t => {
	const data = await df._parseOutput(`
Filesystem                           Type 1024-blocks      Used Available Capacity Mounted on
/dev/sda0123456789012345678901234567 ext4   243617788 137765660 105852128      57% /media/foobarbazfoobarbazfoobarbazfoobarbaz
	`);

	t.is(data[0].filesystem, '/dev/sda0123456789012345678901234567');
	t.is(data[0].type, 'ext4');
	t.is(data[0].size, 249464614912);
	t.is(data[0].used, 141072035840);
	t.is(data[0].available, 108392579072);
	t.is(data[0].capacity, 0.57);
	t.is(data[0].mountpoint, '/media/foobarbazfoobarbazfoobarbazfoobarbaz');
});

test('parse output with spaces', async t => {
	const data = await df._parseOutput(`
Filesystem                           Type 1024-blocks      Used Available Capacity Mounted on
/dev/sda1 2 3 4 5 999                ext4   243617788 137765660 105852128      57% /media/foo1 2 3 4 5 999
	`);

	t.is(data[0].filesystem, '/dev/sda1 2 3 4 5 999');
	t.is(data[0].type, 'ext4');
	t.is(data[0].size, 249464614912);
	t.is(data[0].used, 141072035840);
	t.is(data[0].available, 108392579072);
	t.is(data[0].capacity, 0.57);
	t.is(data[0].mountpoint, '/media/foo1 2 3 4 5 999');
});

test('parse crammed output', async t => {
	const data = await df._parseOutput(`
Filesystem                           Type 1024-blocks      Used Available Capacity Mounted on
/dev/sda1 2 3 4 5 6 7 8 9 0 12345678 ext4 24361778812 137765660 105852128 0000057% /media/foo1 2 3 4 5 999
	`);

	t.is(data[0].filesystem, '/dev/sda1 2 3 4 5 6 7 8 9 0 12345678');
	t.is(data[0].type, 'ext4');
	t.is(data[0].size, 24946461503488);
	t.is(data[0].used, 141072035840);
	t.is(data[0].available, 108392579072);
	t.is(data[0].capacity, 0.57);
	t.is(data[0].mountpoint, '/media/foo1 2 3 4 5 999');
});
