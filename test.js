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
