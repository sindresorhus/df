export interface SpaceInfo {
	/**
	Name of the filesystem.
	*/
	readonly filesystem: string;

	/**
	Type of the filesystem.

	_(Not available on macOS)_
	*/
	readonly type: string;

	/**
	Total size in bytes.
	*/
	readonly size: number;

	/**
	Used size in bytes.
	*/
	readonly used: number;

	/**
	Available size in bytes.
	*/
	readonly available: number;

	/**
	Capacity as a float from `0` to `1`.
	*/
	readonly capacity: number;

	/**
	Disk mount location.
	*/
	readonly mountpoint: string;
}

/**
Get free disk space info from [`df -kP`](https://en.wikipedia.org/wiki/Df_\(Unix\)).

@returns A list of space info objects for each filesystem.

@example
```
import {diskSpace} from '@sindresorhus/df';

console.log(await diskSpace());
// [
// 	{
// 		filesystem: '/dev/disk1',
// 		type: 'ext4',
// 		size: 499046809600,
// 		used: 443222245376,
// 		available: 55562420224,
// 		capacity: 0.89,
// 		mountpoint: '/'
// 	},
// 	…
// ]
```
*/
export function diskSpace(): Promise<SpaceInfo[]>;

/**
Get free disk space info for the given filesystem.

@param pathToDeviceFile - A path to a filesystem device file. Example: `'/dev/disk1'`.
@returns Space info for the given filesystem.

@example
```
import {diskSpaceForFilesystem} from '@sindresorhus/df';

console.log(await diskSpaceForFilesystem('/dev/disk1'));
// {
// 	filesystem: '/dev/disk1',
// 	type: 'ext4',
// 	size: 499046809600,
// 	used: 443222245376,
// 	available: 55562420224,
// 	capacity: 0.89,
// 	mountpoint: '/'
// }
```
*/
export function diskSpaceForFilesystem(pathToDeviceFile: string): Promise<SpaceInfo>;

/**
@param path - A path to a file/directory on the filesystem to get the space info for.
@returns Space info for the filesystem the given path is part of.

@example
```
import {diskSpaceForFilesystemOwningPath} from '@sindresorhus/df';

console.log(await diskSpaceForFilesystemOwningPath('.'));
// {
// 	filesystem: '/dev/disk1',
// 	type: 'ext4',
// 	size: 499046809600,
// 	used: 443222245376,
// 	available: 55562420224,
// 	capacity: 0.89,
// 	mountpoint: '/'
// }
```
*/
export function diskSpaceForFilesystemOwningPath(path: string): Promise<SpaceInfo>;
