# df

> Get free disk space info from [`df -kP`](https://en.wikipedia.org/wiki/Df_\(Unix\))

Works on any Unix-based system like macOS and Linux.

*Created because all the other `df` wrappers are terrible. This one uses simple and explicit parsing. Uses `execFile` rather than `exec`. Ensures better platform portability by using the `-P` flag. Returns sizes in bytes instead of kilobytes and the capacity as a float.*

## Install

```sh
npm install @sindresorhus/df
```

## Usage

```js
import {
	diskSpace,
	diskSpaceForFilesystem,
	diskSpaceForFilesystemOwningPath
} from '@sindresorhus/df';

console.log(await diskSpace());
/*
[
	{
		filesystem: '/dev/disk1',
		type: 'ext4',
		size: 499046809600,
		used: 443222245376,
		available: 55562420224,
		capacity: 0.89,
		mountpoint: '/'
	},
	…
]
*/

console.log(await diskSpaceForFilesystem('/dev/disk1'));
/*
{
	filesystem: '/dev/disk1',
	…
}
*/

console.log(await diskSpaceForFilesystemOwningPath('.'));
/*
{
	filesystem: '/dev/disk1',
	…
}
*/
```

## API

### diskSpace()

Returns a `Promise<object[]>` with a list of space info objects for each filesystem.

### diskSpaceForFilesystem(path)

Returns a `Promise<object>` with the space info for the given filesystem path.

- `filesystem` - Name of the filesystem.
- `type` - Type of the filesystem. *(Not available on macOS)*
- `size` - Total size in bytes.
- `used` - Used size in bytes.
- `available` - Available size in bytes.
- `capacity` - Capacity as a float from `0` to `1`.
- `mountpoint` - Disk mount location.

#### path

Type: `string`

A path to a [filesystem device file](https://en.wikipedia.org/wiki/Device_file). Example: `'/dev/disk1'`.

### diskSpaceForFilesystemOwningPath(path)

Returns a `Promise<object>` with the space info for the filesystem the given path is part of.

#### path

Type: `string`

A path to a file/directory on the filesystem to get the space info for.
