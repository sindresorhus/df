declare namespace df {
	interface SpaceInfo {
		/**
		Name of the filesystem.
		*/
		readonly filesystem: string;

		/**
		Type of the filesystem.
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
}

declare const df: {
	/**
	Get free disk space info from [`df -kP`](https://en.wikipedia.org/wiki/Df_\(Unix\)).

	@returns A list of space info objects for each filesystem.

	@example
	```
	import df = require('@sindresorhus/df');

	(async () => {
		console.log(await df());
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
	})();
	```
	*/
	(): Promise<df.SpaceInfo[]>;

	/**
	@param path - Path to a filesystem device file. Example: `'/dev/disk1'`.
	@returns Space info for the given filesystem.

	@example
	```
	import df = require('@sindresorhus/df');

	(async () => {
		console.log(await df.fs('/dev/disk1'));
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
	})();
	```
	*/
	fs(path: string): Promise<df.SpaceInfo>;

	/**
	@param path - Path to a file on the filesystem to get the space info for.
	@returns Space info for the filesystem the given file is part of.

	@example
	```
	import df = require('@sindresorhus/df');

	(async () => {
		console.log(await df.file(__dirname));
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
	})();
	```
	*/
	file(path: string): Promise<df.SpaceInfo>;
};

export = df;
