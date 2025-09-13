import {fileURLToPath} from 'node:url';
import path from 'node:path';
import test from 'ava';
import {
	diskSpace,
	diskSpaceForFilesystem,
	diskSpaceForFilesystemOwningPath,
} from './index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test('diskSpace()', async t => {
	const data = await diskSpace();
	t.true(Array.isArray(data));
	t.true(data[0].filesystem.length > 0);
	// https://github.com/sindresorhus/df/issues/15
	// t.true(data[0].type.length > 0);
	t.is(data[0].mountpoint[0], '/');
});

test('diskSpaceForFilesystem()', async t => {
	const data = await diskSpace();
	const dataFs = await diskSpaceForFilesystem(data[0].filesystem);

	t.true(dataFs.filesystem.length > 0);
	// https://github.com/sindresorhus/df/issues/15
	// t.true(dataFs.type.length > 0);
	t.is(dataFs.mountpoint[0], '/');

	await t.throwsAsync(diskSpaceForFilesystem('foobar123'), {
		message: /The specified filesystem/,
	});
});

test('diskSpaceForFilesystemOwningPath()', async t => {
	const data = await diskSpaceForFilesystemOwningPath(__dirname);

	t.true(data.filesystem.length > 0);
	// https://github.com/sindresorhus/df/issues/15
	// t.true(data.type.length > 0);
	t.is(data.mountpoint[0], '/');

	await t.throwsAsync(diskSpaceForFilesystemOwningPath('foobar123'), {
		message: /The given file/,
	});
});

test('parse filesystem with spaces in name', async t => {
	const mockDfOutput = `Filesystem     1024-blocks  Used Available Capacity Mounted on
filesystem with spaces 1000000 500000 500000 50% /mnt/test`;

	const data = await diskSpace._parseOutput(mockDfOutput);

	t.is(data[0].filesystem, 'filesystem with spaces');
	t.is(data[0].size, 1_000_000 * 1024);
	t.is(data[0].used, 500_000 * 1024);
	t.is(data[0].available, 500_000 * 1024);
	t.is(data[0].capacity, 0.5);
	t.is(data[0].mountpoint, '/mnt/test');
});

test('parse long filesystem name that exceeds header width', async t => {
	// This is the exact case from issue #13
	const mockDfOutput = `Filesystem                  1024-blocks  Used    Available Capacity Mounted on
10.190.111.25:/backupdrive 1 198640150528 43008 198640107520       1% /run/xo-server/mounts/cbb36e4c-3353-4126-8588-18ba25697403`;

	const data = await diskSpace._parseOutput(mockDfOutput);

	t.is(data[0].filesystem, '10.190.111.25:/backupdrive 1');
	t.is(data[0].size, 198_640_150_528 * 1024);
	t.is(data[0].used, 43_008 * 1024);
	t.is(data[0].available, 198_640_107_520 * 1024);
	t.is(data[0].capacity, 0.01);
	t.is(data[0].mountpoint, '/run/xo-server/mounts/cbb36e4c-3353-4126-8588-18ba25697403');
});

test('parse mount point with spaces', async t => {
	const mockDfOutput = `Filesystem     1024-blocks  Used Available Capacity Mounted on
/dev/sda1 1000000 500000 500000 50% /mnt/path with spaces`;

	const data = await diskSpace._parseOutput(mockDfOutput);

	t.is(data[0].filesystem, '/dev/sda1');
	t.is(data[0].mountpoint, '/mnt/path with spaces');
});

test('parse multiple filesystems', async t => {
	const mockDfOutput = `Filesystem     1024-blocks  Used Available Capacity Mounted on
/dev/sda1 1000000 500000 500000 50% /
tmpfs 8000000 0 8000000 0% /tmp
server:/share 2000000 1900000 100000 95% /mnt/nfs`;

	const data = await diskSpace._parseOutput(mockDfOutput);

	t.is(data.length, 3);
	t.is(data[0].filesystem, '/dev/sda1');
	t.is(data[0].capacity, 0.5);
	t.is(data[1].filesystem, 'tmpfs');
	t.is(data[1].capacity, 0);
	t.is(data[2].filesystem, 'server:/share');
	t.is(data[2].capacity, 0.95);
});

test('parse edge case capacities', async t => {
	const mockDfOutput = `Filesystem     1024-blocks  Used Available Capacity Mounted on
/dev/empty 1000 1000 0 100% /full
tmpfs 8000000 0 8000000 0% /empty`;

	const data = await diskSpace._parseOutput(mockDfOutput);

	t.is(data[0].capacity, 1);
	t.is(data[1].capacity, 0);
});

test('parse very large numbers', async t => {
	const mockDfOutput = `Filesystem     1024-blocks  Used Available Capacity Mounted on
/dev/huge 999999999999 500000000000 499999999999 50% /huge`;

	const data = await diskSpace._parseOutput(mockDfOutput);

	t.is(data[0].size, 999_999_999_999 * 1024);
	t.is(data[0].used, 500_000_000_000 * 1024);
	t.is(data[0].available, 499_999_999_999 * 1024);
});

test('throws on invalid format', async t => {
	const mockDfOutput = `Filesystem     1024-blocks  Used Available Capacity Mounted on
invalid line without proper structure`;

	await t.throwsAsync(
		async () => diskSpace._parseOutput(mockDfOutput),
		{message: /Unable to parse df output line/},
	);
});

// Disabled because of https://github.com/sindresorhus/df/issues/15

// test('parse long output', async t => {
// 	const data = await diskSpace._parseOutput(`
// Filesystem                           Type 1024-blocks      Used Available Capacity Mounted on
// /dev/sda0123456789012345678901234567 ext4   243617788 137765660 105852128      57% /media/foobarbazfoobarbazfoobarbazfoobarbaz
// 	`);

// 	t.is(data[0].filesystem, '/dev/sda0123456789012345678901234567');
// 	// // https://github.com/sindresorhus/df/issues/15
// 	// t.is(data[0].type, 'ext4');
// 	// t.is(data[0].size, 249_464_614_912);
// 	t.is(data[0].used, 141_072_035_840);
// 	t.is(data[0].available, 108_392_579_072);
// 	t.is(data[0].capacity, 0.57);
// 	t.is(data[0].mountpoint, '/media/foobarbazfoobarbazfoobarbazfoobarbaz');
// });

// test('parse output with spaces', async t => {
// 	const data = await diskSpace._parseOutput(`
// Filesystem                           Type 1024-blocks      Used Available Capacity Mounted on
// /dev/sda1 2 3 4 5 999                ext4   243617788 137765660 105852128      57% /media/foo1 2 3 4 5 999
// 	`);

// 	t.is(data[0].filesystem, '/dev/sda1 2 3 4 5 999');
// 	// // https://github.com/sindresorhus/df/issues/15
// 	// t.is(data[0].type, 'ext4');
// 	// t.is(data[0].size, 249_464_614_912);
// 	t.is(data[0].used, 141_072_035_840);
// 	t.is(data[0].available, 108_392_579_072);
// 	t.is(data[0].capacity, 0.57);
// 	t.is(data[0].mountpoint, '/media/foo1 2 3 4 5 999');
// });

// test('parse crammed output', async t => {
// 	const data = await diskSpace._parseOutput(`
// Filesystem                           Type 1024-blocks      Used Available Capacity Mounted on
// /dev/sda1 2 3 4 5 6 7 8 9 0 12345678 ext4 24361778812 137765660 105852128 0000057% /media/foo1 2 3 4 5 999
// 	`);

// 	t.is(data[0].filesystem, '/dev/sda1 2 3 4 5 6 7 8 9 0 12345678');
// 	// // https://github.com/sindresorhus/df/issues/15
// 	// t.is(data[0].type, 'ext4');
// 	t.is(data[0].size, 24_946_461_503_488);
// 	t.is(data[0].used, 141_072_035_840);
// 	t.is(data[0].available, 108_392_579_072);
// 	t.is(data[0].capacity, 0.57);
// 	t.is(data[0].mountpoint, '/media/foo1 2 3 4 5 999');
// });
